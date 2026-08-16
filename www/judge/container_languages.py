"""Server-owned language allowlist for disposable judge containers."""

from dataclasses import dataclass
import os


DEFAULT_TOOLCHAIN_IMAGE = os.environ.get(
    'ALGOSPOT_JUDGE_TOOLCHAIN_IMAGE', 'algospot-judge-toolchain:local')


@dataclass(frozen=True)
class LanguageSpec:
    extension: str
    display_name: str
    image: str
    source_name: str
    compile_command: tuple = ()
    run_command: tuple = ()
    compile_wall_seconds: int = 30
    compile_memory_bytes: int = 1024 * 1024 * 1024
    runtime_overhead_bytes: int = 64 * 1024 * 1024
    address_space_limit: bool = True

    def format_run_command(self, memory_kb):
        values = {'memory_kb': int(memory_kb)}
        return tuple(part.format(**values) for part in self.run_command)


LANGUAGES = {
    'c': LanguageSpec(
        'c', 'C11', DEFAULT_TOOLCHAIN_IMAGE, 'submission.c',
        ('gcc', '-O3', '/work/submission.c', '-pedantic-errors', '-lm',
         '-std=c11', '-o', '/work/submission'),
        ('/work/submission',),
    ),
    'cpp': LanguageSpec(
        'cpp', 'C++11', DEFAULT_TOOLCHAIN_IMAGE, 'submission.cpp',
        ('g++', '-O3', '/work/submission.cpp', '-pedantic-errors',
         '--std=c++0x', '-o', '/work/submission'),
        ('/work/submission',),
    ),
    'go': LanguageSpec(
        'go', 'Go', DEFAULT_TOOLCHAIN_IMAGE, 'submission.go',
        ('go', 'build', '-p', '1', '-o', '/work/submission',
         '/work/submission.go'),
        ('/work/submission',),
        address_space_limit=False,
    ),
    'hs': LanguageSpec(
        'hs', 'Haskell', DEFAULT_TOOLCHAIN_IMAGE, 'Main.hs',
        ('ghc', '--make', '-O2', '/work/Main.hs', '-o', '/work/submission'),
        ('/work/submission',),
    ),
    'java': LanguageSpec(
        'java', 'Java', DEFAULT_TOOLCHAIN_IMAGE, 'Main.java',
        ('javac', '-d', '/work', '/work/Main.java'),
        ('java', '-XX:ActiveProcessorCount=1', '-Xmx{memory_kb}K',
         '-cp', '/work', 'Main'),
        runtime_overhead_bytes=128 * 1024 * 1024,
        address_space_limit=False,
    ),
    'js': LanguageSpec(
        'js', 'JavaScript', DEFAULT_TOOLCHAIN_IMAGE, 'submission.js',
        run_command=('node', '/work/submission.js'),
        address_space_limit=False,
    ),
    'lua': LanguageSpec(
        'lua', 'Lua', DEFAULT_TOOLCHAIN_IMAGE, 'submission.lua',
        ('luajit', '-b', '/work/submission.lua', '/work/submission.raw'),
        ('luajit', '/work/submission.raw'),
    ),
    'py3': LanguageSpec(
        'py3', 'Python 3', DEFAULT_TOOLCHAIN_IMAGE, 'submission.py',
        run_command=('python3', '/work/submission.py'),
    ),
    'pypy': LanguageSpec(
        'pypy', 'PyPy 3', DEFAULT_TOOLCHAIN_IMAGE, 'submission.py',
        run_command=('pypy3', '/work/submission.py'),
    ),
    'rb': LanguageSpec(
        'rb', 'Ruby', DEFAULT_TOOLCHAIN_IMAGE, 'submission.rb',
        run_command=('ruby', '/work/submission.rb'),
    ),
    'rs': LanguageSpec(
        'rs', 'Rust', DEFAULT_TOOLCHAIN_IMAGE, 'submission.rs',
        ('rustc', '-O', '/work/submission.rs', '-o', '/work/submission'),
        ('/work/submission',),
    ),
    'scala': LanguageSpec(
        'scala', 'Scala', DEFAULT_TOOLCHAIN_IMAGE, 'Main.scala',
        ('scalac', '-optimise', '-d', '/work', '/work/Main.scala'),
        ('scala', '-J-XX:ActiveProcessorCount=1', '-cp', '/work', 'Main'),
        compile_wall_seconds=45,
        runtime_overhead_bytes=128 * 1024 * 1024,
        address_space_limit=False,
    ),
}


def get_language(extension):
    try:
        return LANGUAGES[extension]
    except KeyError:
        raise ValueError('Unsupported judge language: %s' % extension)
