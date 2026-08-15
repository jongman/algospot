#!/usr/bin/env python2
"""Anonymous, read-only HTTP characterization checks for the legacy site."""

from __future__ import print_function

import hashlib
import os
import sys
import urllib2


BASE_URL = os.environ.get('ALGOSPOT_SMOKE_BASE_URL', 'http://legacy-web:8000')
HOST_HEADER = os.environ.get('ALGOSPOT_SMOKE_HOST')

# These routes and structural markers were verified against production on
# 2026-08-14. Exact hashes are reported as evidence but are not asserted:
# CSRF tokens and live content make full-document hashes intentionally vary.
CHECKS = (
    ('home', '/', 200, 'text/html', 5000, '/judge/problem/list/'),
    ('login', '/accounts/login/', 200, 'text/html', 5000, 'name="username"'),
    ('forum', '/forum/all/1/', 200, 'text/html', 5000, '/forum/read/'),
    ('forum_post', '/forum/read/999/', 200, 'text/html', 5000,
     '<ul class="comments post kor">'),
    ('wiki', '/wiki/list/', 200, 'text/html', 5000, '/wiki/read/'),
    ('wiki_page', '/wiki/read/Main_Page', 200, 'text/html', 5000,
     '<div class="wiki-text">'),
    ('judge', '/judge/', 200, 'text/html', 5000, '/judge/problem/read/'),
    ('problems', '/judge/problem/list/', 200, 'text/html', 5000,
     '/judge/problem/read/'),
    ('problem', '/judge/problem/read/BUS', 200, 'text/html', 5000,
     '<section class="problem_statement">'),
    ('submissions', '/judge/submission/recent/', 200, 'text/html', 5000,
     '<table class="submission_list">'),
    ('profile', '/user/profile/1', 200, 'text/html', 5000,
     '<section class="profile">'),
    ('search', '/search/?q=BUS', 200, 'text/html', 5000,
     'name="q"'),
    ('static_css', '/static/css/style.css?v=2', 200, 'text/css', 1000,
     'body'),
)


def fetch(path):
    headers = {
        'Accept-Encoding': 'identity',
        'User-Agent': 'algospot-migration-characterization/1',
    }
    if HOST_HEADER:
        headers['Host'] = HOST_HEADER
    request = urllib2.Request(
        BASE_URL + path,
        headers=headers,
    )
    try:
        response = urllib2.urlopen(request, timeout=60)
        return response.getcode(), response.headers, response.read()
    except urllib2.HTTPError as error:
        return error.code, error.headers, error.read()


def main():
    failures = 0
    print('name|result|status|content_type|bytes|sha256')
    for name, path, expected_status, expected_type, minimum_size, marker in CHECKS:
        try:
            status, headers, body = fetch(path)
            content_type = headers.get('content-type', '')
            problems = []
            if status != expected_status:
                problems.append('status=%s' % status)
            if expected_type not in content_type.lower():
                problems.append('content-type=%s' % content_type)
            if len(body) < minimum_size:
                problems.append('bytes=%s' % len(body))
            if marker not in body:
                problems.append('missing-marker')
            result = 'PASS' if not problems else 'FAIL:' + ','.join(problems)
        except Exception as error:
            status, content_type, body = 0, '', ''
            result = 'ERROR:%s' % error.__class__.__name__
        if result != 'PASS':
            failures += 1
        digest = hashlib.sha256(body).hexdigest()
        print('%s|%s|%s|%s|%s|%s' % (
            name, result, status, content_type, len(body), digest,
        ))
    print('summary|%s|checks=%s|failures=%s' % (
        'PASS' if not failures else 'FAIL', len(CHECKS), failures,
    ))
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
