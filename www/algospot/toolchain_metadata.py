"""User-visible versions for the pinned Debian Bookworm judge toolchain."""


JUDGE_LANGUAGE_METADATA = (
    ('cpp', 'C++11', 'G++ 12.2.0'),
    ('java', 'Java', 'OpenJDK 17'),
    ('c', 'C11', 'GCC 12.2.0'),
    ('py3', 'Python 3', 'CPython 3.13.5'),
    ('js', 'JavaScript', 'Node.js 18'),
    ('go', 'Go', 'Go 1.19'),
    ('rb', 'Ruby', 'Ruby 3.1.2'),
    ('scala', 'Scala', 'Scala 2.11.12'),
    ('hs', 'Haskell', 'GHC 9.0.2'),
    ('rs', 'Rust', 'rustc 1.63.0'),
    ('lua', 'Lua', 'LuaJIT 2.1.0-beta3'),
)


# The controlled sandbox smoke executes these probes inside the toolchain image.
# Markers intentionally omit security-release suffixes for packages that Debian
# updates in place while retaining the advertised language/runtime generation.
TOOLCHAIN_VERSION_PROBES = (
    ('cpp', ('g++', '--version'), '12.2.0'),
    ('java', ('java', '-version'), '17.'),
    ('c', ('gcc', '--version'), '12.2.0'),
    ('py3', ('python3', '--version'), '3.13.5'),
    ('js', ('node', '--version'), 'v18.'),
    ('go', ('go', 'version'), 'go1.19.'),
    ('rb', ('ruby', '--version'), 'ruby 3.1.2'),
    ('scala', ('scala', '-version'), '2.11.12'),
    ('hs', ('ghc', '--version'), '9.0.2'),
    ('rs', ('rustc', '--version'), '1.63.0'),
    ('lua', ('luajit', '-v'), '2.1.0-beta3'),
)
