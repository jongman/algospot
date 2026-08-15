#!/bin/sh
set -eu

# Haystack/Whoosh requires its index directory to be writable even for search.
# Work only on an ephemeral copy; the archived source mount remains read-only.
cp -a /whoosh-archive/. /whoosh_index/
rm -f /whoosh_index/MAIN_WRITELOCK

exec "$@"
