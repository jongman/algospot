#!/bin/sh
set -eu

# Legacy Haystack/Whoosh requires its index directory to be writable even for
# search. Modern settings use the maintained in-process backend and therefore
# do not mount the archived Python 2 index at all.
if [ -d /whoosh-archive ]; then
  mkdir -p /whoosh_index
  cp -a /whoosh-archive/. /whoosh_index/
  rm -f /whoosh_index/MAIN_WRITELOCK
fi

exec "$@"
