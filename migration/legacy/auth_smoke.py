#!/usr/bin/env python2
"""Authenticated, permission, and media checks without passwords or writes."""

from __future__ import print_function

import hashlib
import os
import sys

sys.path.insert(0, '/app/www')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'algospot.legacy_settings')

import django

if hasattr(django, 'setup'):
    django.setup()

from django.conf import settings
from django.contrib.auth import BACKEND_SESSION_KEY, SESSION_KEY
from django.contrib.auth.models import User
from django.contrib.sessions.backends.signed_cookies import SessionStore
from django.db import connection
from django.test import Client

from avatar.models import Avatar
from guardian.core import ObjectPermissionChecker
from judge.models import Attachment, Problem


NORMAL_USER_ID = 7
OTHER_USER_ID = 5
ADMIN_USER_ID = 3
PRIVATE_PROBLEM_ID = 648


def signed_client(user_id):
    session = SessionStore()
    session[SESSION_KEY] = user_id
    session[BACKEND_SESSION_KEY] = 'django.contrib.auth.backends.ModelBackend'
    session.save()
    client = Client(HTTP_HOST='legacy-web')
    client.cookies[settings.SESSION_COOKIE_NAME] = session.session_key
    return client


def check_response(name, client, path, expected_status, marker=None,
                   location_marker=None):
    response = client.get(path, follow=False, HTTP_HOST='legacy-web')
    body = response.content
    failures = []
    if response.status_code != expected_status:
        failures.append('status=%s' % response.status_code)
    if marker and marker not in body:
        failures.append('missing-marker')
    location = response.get('Location', '')
    if location_marker and location_marker not in location:
        failures.append('location')
    result = 'PASS' if not failures else 'FAIL:' + ','.join(failures)
    digest = hashlib.sha256(body).hexdigest()
    print('%s|%s|status=%s|bytes=%s|sha256=%s' % (
        name, result, response.status_code, len(body), digest,
    ))
    return not failures


def media_report():
    media_root = os.path.realpath(settings.MEDIA_ROOT)
    groups = (
        ('attachments', (
            item.file.name
            for item in Attachment.objects.only('file').iterator()
        )),
        ('avatars', (
            item.avatar.name
            for item in Avatar.objects.only('avatar').iterator()
        )),
    )
    reference_total = present_total = missing_total = unsafe_total = 0
    for label, names in groups:
        references = present = missing = unsafe = 0
        for name in names:
            references += 1
            candidate = os.path.realpath(
                os.path.join(media_root, name.lstrip('/')))
            if (candidate != media_root and
                    not candidate.startswith(media_root + os.sep)):
                unsafe += 1
            elif os.path.isfile(candidate):
                present += 1
            else:
                missing += 1
        reference_total += references
        present_total += present
        missing_total += missing
        unsafe_total += unsafe
        print('media_%s|%s|references=%s|present=%s|missing=%s|unsafe=%s' % (
            label, 'PASS' if unsafe == 0 else 'FAIL', references, present,
            missing, unsafe,
        ))

    files = total_bytes = 0
    for directory, _, names in os.walk(media_root):
        for name in names:
            path = os.path.join(directory, name)
            if os.path.isfile(path):
                files += 1
                total_bytes += os.path.getsize(path)

    passed = unsafe_total == 0 and present_total > 0 and files > 0
    print('media_references|%s|references=%s|present=%s|missing=%s|unsafe=%s' % (
        'PASS' if passed else 'FAIL', reference_total, present_total,
        missing_total, unsafe_total,
    ))
    print('media_tree|%s|files=%s|bytes=%s' % (
        'PASS' if files else 'FAIL', files, total_bytes,
    ))
    return passed


def main():
    failures = 0
    user_count_before = User.objects.count()

    anonymous = Client(HTTP_HOST='legacy-web')
    normal = signed_client(NORMAL_USER_ID)

    checks = (
        ('anonymous_settings_forbidden', anonymous,
         '/user/settings/%s' % NORMAL_USER_ID, 403, 'Forbidden operation.', None),
        ('owner_settings', normal,
         '/user/settings/%s' % NORMAL_USER_ID, 200, 'name="email"', None),
        ('other_settings_forbidden', normal,
         '/user/settings/%s' % OTHER_USER_ID, 403, 'Forbidden operation.', None),
        ('anonymous_forum_write_login', anonymous,
         '/forum/write/free/', 302, None, '/accounts/login/'),
        ('authorized_forum_write', normal,
         '/forum/write/free/', 200, '<form', None),
        ('anonymous_problem_mine_login', anonymous,
         '/judge/problem/mine/', 302, None, '/accounts/login/'),
        ('authorized_problem_mine', normal,
         '/judge/problem/mine/', 200, 'problem_list', None),
        ('anonymous_problem_edit_login', anonymous,
         '/judge/problem/edit/%s' % PRIVATE_PROBLEM_ID, 302, None,
         '/accounts/login/'),
        ('other_problem_hidden', normal,
         '/judge/problem/edit/%s' % PRIVATE_PROBLEM_ID, 404, None, None),
    )
    for args in checks:
        if not check_response(*args):
            failures += 1

    private_problem = Problem.objects.get(id=PRIVATE_PROBLEM_ID)
    normal_user = User.objects.get(id=NORMAL_USER_ID)
    admin_user = User.objects.get(id=ADMIN_USER_ID)
    permission_passed = (
        not ObjectPermissionChecker(normal_user).has_perm(
            'edit_problem', private_problem)
        and ObjectPermissionChecker(admin_user).has_perm(
            'edit_problem', private_problem)
    )
    print('problem_object_permission|%s' % (
        'PASS' if permission_passed else 'FAIL',
    ))
    if not permission_passed:
        failures += 1

    cursor = connection.cursor()
    cursor.execute('SHOW default_transaction_read_only')
    read_only = cursor.fetchone()[0] == 'on'
    print('database_read_only|%s' % ('PASS' if read_only else 'FAIL'))
    if not read_only:
        failures += 1

    if User.objects.count() == user_count_before:
        print('user_count_unchanged|PASS|count=%s' % user_count_before)
    else:
        print('user_count_unchanged|FAIL')
        failures += 1

    if not media_report():
        failures += 1

    print('summary|%s|failures=%s' % (
        'PASS' if not failures else 'FAIL', failures,
    ))
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
