"""Prepare immutable problem data for the trusted judge controller."""

from dataclasses import dataclass
import math
from pathlib import Path
import shutil
import zipfile

from django.conf import settings

from .models import Attachment


MAX_ARCHIVE_MEMBERS = 10000
MAX_MEMBER_BYTES = 256 * 1024 * 1024
MAX_TOTAL_BYTES = 4 * 1024 * 1024 * 1024


class JudgeDataError(RuntimeError):
    pass


@dataclass(frozen=True)
class JudgeCase:
    name: str
    input_path: Path
    expected_path: Path


@dataclass(frozen=True)
class PreparedData:
    cases: tuple
    checker_path: Path = None


def _safe_name(name):
    basename = Path(name).name
    if not basename or basename in ('.', '..'):
        raise JudgeDataError('Invalid attachment filename')
    return basename


def _write_normalized(source, destination, expected_size=None):
    if expected_size is not None and expected_size > MAX_MEMBER_BYTES:
        raise JudgeDataError('Judge data member is too large: %s' % destination.name)
    total = 0
    pending_cr = False
    with open(destination, 'wb') as output:
        while True:
            chunk = source.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_MEMBER_BYTES:
                raise JudgeDataError(
                    'Judge data member is too large: %s' % destination.name)
            if pending_cr:
                chunk = b'\r' + chunk
                pending_cr = False
            if chunk.endswith(b'\r'):
                chunk = chunk[:-1]
                pending_cr = True
            output.write(chunk.replace(b'\r\n', b'\n'))
        if pending_cr:
            output.write(b'\r')
    destination.chmod(0o444)
    return total


def _extract_archive(archive_path, destination, used_names):
    total = 0
    with zipfile.ZipFile(str(archive_path), 'r') as archive:
        members = archive.infolist()
        if len(members) > MAX_ARCHIVE_MEMBERS:
            raise JudgeDataError('Judge archive has too many members')
        for member in members:
            if member.is_dir():
                continue
            # The high mode bits identify Unix symlinks and other special files.
            mode = member.external_attr >> 16
            if mode and (mode & 0o170000) not in (0, 0o100000):
                raise JudgeDataError('Judge archive contains a special file')
            name = _safe_name(member.filename)
            extension = Path(name).suffix.lower()
            if extension not in ('.in', '.out'):
                continue
            if name in used_names:
                raise JudgeDataError('Duplicate judge data filename: %s' % name)
            used_names.add(name)
            with archive.open(member, 'r') as source:
                total += _write_normalized(
                    source, destination / name, member.file_size)
            if total > MAX_TOTAL_BYTES:
                raise JudgeDataError('Judge archive expands beyond the data limit')
    return total


def prepare_problem_data(problem, destination):
    """Copy only the allowlisted judge attachments into a private directory."""
    destination = Path(destination)
    destination.mkdir(parents=True, mode=0o700, exist_ok=False)
    used_names = set()
    archives = []
    checker_path = None
    total = 0

    for attachment in Attachment.objects.filter(problem=problem).order_by('id'):
        name = _safe_name(attachment.file.name)
        extension = Path(name).suffix.lower()
        if name != 'checker' and extension not in ('.in', '.out', '.zip'):
            continue
        source_path = Path(attachment.file.path).resolve()
        try:
            source_path.relative_to(Path(settings.MEDIA_ROOT).resolve())
        except ValueError as exc:
            raise JudgeDataError(
                'Judge attachment escapes the media root: %s' % name) from exc
        if not source_path.is_file():
            raise JudgeDataError('Missing judge attachment: %s' % name)
        if name in used_names:
            raise JudgeDataError('Duplicate judge attachment: %s' % name)
        used_names.add(name)
        target = destination / name
        if extension == '.zip':
            shutil.copyfile(str(source_path), str(target))
            target.chmod(0o400)
            archives.append(target)
        else:
            with open(source_path, 'rb') as source:
                total += _write_normalized(source, target)
            if name == 'checker':
                checker_path = target
        if total > MAX_TOTAL_BYTES:
            raise JudgeDataError('Judge data exceeds the total data limit')

    for archive_path in archives:
        total += _extract_archive(archive_path, destination, used_names)
        archive_path.unlink()
        if total > MAX_TOTAL_BYTES:
            raise JudgeDataError('Judge data exceeds the total data limit')

    pairs = {}
    for path in destination.iterdir():
        if path.suffix.lower() not in ('.in', '.out'):
            continue
        pairs.setdefault(path.stem, {})[path.suffix.lower()] = path
    if not pairs:
        raise JudgeDataError('Judge I/O data not found')

    cases = []
    for name, pair in sorted(pairs.items()):
        if set(pair) != {'.in', '.out'}:
            raise JudgeDataError('Unmatched judge I/O pair: %s' % name)
        cases.append(JudgeCase(name, pair['.in'], pair['.out']))
    return PreparedData(tuple(cases), checker_path)


def compare_output(kind, output, expected):
    if kind == 'ignore_whitespace':
        return output.split() == expected.split()
    if kind == 'ignore_trailing_space':
        return ([line.rstrip() for line in output.splitlines()] ==
                [line.rstrip() for line in expected.splitlines()])
    if kind == 'strict':
        return output.splitlines() == expected.splitlines()
    if kind == 'relative_float':
        actual_tokens = output.split()
        expected_tokens = expected.split()
        if len(actual_tokens) != len(expected_tokens):
            return False
        for actual, wanted in zip(actual_tokens, expected_tokens):
            if actual == wanted:
                continue
            try:
                actual_float = float(actual)
                wanted_float = float(wanted)
            except ValueError:
                return False
            if not (math.isfinite(actual_float) and math.isfinite(wanted_float)):
                return False
            if abs(wanted_float - actual_float) > 1e-8 * max(abs(actual_float), 1):
                return False
        return True
    if kind == 'special_judge':
        raise JudgeDataError('Special judge must run in its own sandbox')
    raise JudgeDataError('Unsupported judge comparison module: %s' % kind)
