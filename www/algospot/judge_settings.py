"""Settings for the trusted judge controller; never use for the web service."""

import os

from algospot.modern_settings import *


if os.environ.get('ALGOSPOT_JUDGE_CONTROLLER_ENABLED') != '1':
    raise RuntimeError('The judge controller requires an explicit opt-in')
if os.environ.get('MODERN_ALLOW_DATABASE_WRITES') not in (
        'judge-controller', 'scratch-only'):
    raise RuntimeError('The judge controller requires database write access')
