import hashlib
from pathlib import Path


PORT_ROOT = Path(__file__).with_name('special_checker_ports')

# Keys are SHA-256 digests of the immutable checker attachments in the
# 2026-08-14 server snapshot. Values are audited Python 3 ports with equivalent
# verdict behavior. Never execute the archived attachment directly.
CHECKER_PORTS = {
    '46441140f143ea74e4e18ba76c532362107cf39d40d9ccd01ce7f605649d112c':
        'packing.py',
    'a6c92933c6f6b4847a48f7e32287b4c91632e5f9c8cdec0615a11a18c66dad90':
        'meetingroom.py',
    'a8098eed96cd7f203054761188dad91378b83bf203dced8ab2814b4b6029d837':
        'trapcard.py',
    'b7eb1851b0df6c424ab0183b6eb9eeff8d554ea55b56e47bb0a0ddec25dcd5fa':
        'restore.py',
    'bb249572308166862f2aa95ee237ceefa9a9027f0c35655adadeae558d26b601':
        'meetingroom_legacy.py',
    'cc234dfcb7ae3382b919e9fc9f4532bf8fcca00059c995f0873b54d018ccfb66':
        'alchemy.py',
    'fdb2bef7b7751256052a1df3180d1d96cbb7a5118e280fde5cdc190d666ad448':
        'wordchain.py',
}


def checker_digest(path):
    digest = hashlib.sha256()
    with open(path, 'rb') as checker_file:
        for chunk in iter(lambda: checker_file.read(64 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_checker(path):
    digest = checker_digest(path)
    try:
        port_name = CHECKER_PORTS[digest]
    except KeyError as exc:
        raise ValueError(
            'Special checker attachment is not in the audited allowlist: %s' %
            digest) from exc
    port_path = PORT_ROOT / port_name
    if not port_path.is_file():
        raise RuntimeError('Audited special checker port is missing: %s' % port_name)
    return port_path
