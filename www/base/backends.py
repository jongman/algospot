# -*- coding: utf-8 -*-

from django.contrib.auth.models import User
from djangoutils import get_or_none
import hashlib

BASE64 = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

def md5(s, raw=True):
    m = hashlib.md5()
    m.update(s)
    return m.digest() if raw else m.hexdigest()

def encode64(input, count):
    output = ""
    i = 0
    while True:
        value = ord(input[i]); i += 1
        output += BASE64[value & 0x3f]
        if i < count:
            value |= ord(input[i]) << 8;
        output += BASE64[(value >> 6) & 0x3f];
        if i >= count: break
        i += 1
        if i < count:
            value |= ord(input[i]) << 16
        output += BASE64[(value >> 12) & 0x3f];
        if i >= count: break
        i += 1
        output += BASE64[(value >> 18) & 0x3f];
        if i >= count: break
    return output

def get_hash(password, stored):
    password = password.encode("utf-8")
    salt = stored[4:12]
    count = 2 ** BASE64.index(stored[3])
    hash = md5(salt + password)
    for i in xrange(count):
        hash = md5(hash + password)
    return stored[:12] + encode64(hash, 16)

MAGIC = r"sha1$deadbeef$"
class LegacyBackend:
    supports_object_permissions = False
    supports_anonymous_user = False
    supports_inactive_user = False

    def get_user(self, user_id):
        return get_or_none(User, pk=user_id)

    def authenticate(self, username=None, password=None):
        if not username or not password: return None
        user = get_or_none(User, username=username)
        if not user:
            user = get_or_none(User, email=username)
        if not user: return user
        if user.password.startswith(MAGIC):
            stored = user.password[len(MAGIC):]
            if get_hash(password, stored) == stored:
                user.set_password(password)
                return user
        return None

class EmailBackend:
    def authenticate(self, username=None, password=None):
        user = get_or_none(User, email=username)
        if not user: return user
        if user.check_password(password):
            return user
        return None
