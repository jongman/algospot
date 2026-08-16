from django.test import SimpleTestCase

from algospot.toolchain_metadata import (
    JUDGE_LANGUAGE_METADATA,
    TOOLCHAIN_VERSION_PROBES,
)
from judge.container_languages import LANGUAGES


class ToolchainMetadataTests(SimpleTestCase):
    def test_metadata_matches_executable_language_allowlist(self):
        metadata = {
            extension: (name, version)
            for extension, name, version in JUDGE_LANGUAGE_METADATA
        }
        self.assertEqual(set(metadata), set(LANGUAGES))
        for extension, spec in LANGUAGES.items():
            self.assertEqual(metadata[extension][0], spec.display_name)
            self.assertNotEqual(metadata[extension][1], 'isolated judge worker')

    def test_every_advertised_language_has_a_version_probe(self):
        probe_extensions = [extension for extension, _, _
                            in TOOLCHAIN_VERSION_PROBES]
        metadata_extensions = [extension for extension, _, _
                               in JUDGE_LANGUAGE_METADATA]
        self.assertEqual(probe_extensions, metadata_extensions)
