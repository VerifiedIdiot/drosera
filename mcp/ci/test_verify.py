"""Exercise the CI gate through fresh native Node reports."""

import contextlib
import io
import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import verify

# Keep fixture generation independent from the adapter under test.
REPORTER = """export default async function* (events) {
  for await (const event of events) yield JSON.stringify(event, (key, value) =>
    value instanceof Error ? {...value, message:value.message, stack:value.stack} : value) + '\\n';
}
"""


class VerifyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=os.environ.get("TMPDIR"))
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.package = self.root / "repo" / "mcp"
        (self.package / "test").mkdir(parents=True)
        self.reporter = self.root / "reporter.mjs"
        self.reporter.write_text(REPORTER)
        self.manifest = self.root / "required.json"
        required = [{"file": "test/case.mjs", "name": "required"}]
        self.manifest.write_text(json.dumps({"unit": required, "integration": required}))

    def native(self, body="test('required', () => {});"):
        fixture = self.package / "test" / "case.mjs"
        fixture.write_text("import test from 'node:test'; import assert from 'node:assert/strict';\n" + body)
        result = subprocess.run(["node", "--test", "--test-concurrency=1",
                                 f"--test-reporter={self.reporter}", str(fixture)],
                                capture_output=True, text=True, timeout=10,
                                env={key: value for key, value in os.environ.items()
                                     if key != "NODE_TEST_CONTEXT"})
        self.assertTrue(result.stdout.strip(), result.stderr)
        return result.stdout, result.returncode

    def run_gate(self, unit_output, unit_code=0, stale_output=None, build_code=0,
                 smoke_output='{"check":"native-isolation-smoke","status":"passed"}\n',
                 timeout_streams=None, smoke_stderr="", smoke_code=0):
        evidence = self.root / "evidence"
        evidence.mkdir(exist_ok=True)
        if stale_output is not None:
            (evidence / "unit.log").write_text(stale_output)
        output = io.StringIO()
        self.calls = []

        def run(command, **kwargs):
            self.calls.append((command, kwargs))
            is_test = "test" in command or "test:integration" in command or "--test" in command
            if is_test and timeout_streams is not None:
                raise subprocess.TimeoutExpired(command, kwargs['timeout'],
                                                output=timeout_streams[0], stderr=timeout_streams[1])
            code = unit_code if is_test else build_code if "build" in command else 0
            text = unit_output if is_test else smoke_output if 'ci/native-isolation-smoke.mjs' in command else ""
            is_smoke = 'ci/native-isolation-smoke.mjs' in command
            return subprocess.CompletedProcess(command, smoke_code if is_smoke else code,
                                               text, smoke_stderr if is_smoke else "")

        with patch.dict(os.environ, {"PODORI_EVIDENCE_DIR": str(evidence)}), \
                patch.object(verify, "PACKAGE", self.package, create=True), \
                patch.object(verify, "MANIFEST", self.manifest, create=True), \
                patch.object(verify.subprocess, "run", side_effect=run), \
                contextlib.redirect_stdout(output):
            try:
                verify.main()
            except SystemExit as error:
                return error.code, output.getvalue()
        return 0, output.getvalue()

    def blocked(self, report, code=0):
        result, output = self.run_gate(report, code)
        self.assertEqual(result, 2, output)
        self.assertIn('"status": "BLOCKED"', output)

    def test_unit_timeout_preserves_private_partial_streams_and_blocks(self):
        secret = 'a' * 64
        for streams in [(b'partial stdout\xff\n', b'partial stderr\xfe\n'),
                        ('partial stdout\n', 'partial stderr\n'),
                        (None, None), (None, b'partial stderr\n'),
                        (secret.encode(), '\n' + secret)]:
            with self.subTest(streams=streams):
                try:
                    result, output = self.run_gate('', timeout_streams=streams)
                except subprocess.TimeoutExpired as error:
                    self.fail(f'timeout escaped the gate: {error}')
                self.assertEqual(result, 2, output)
                records = [json.loads(line) for line in output.splitlines()
                           if line.startswith('{"check":')]
                self.assertEqual(records[-1], {'check': 'unit', 'exit_code': 2, 'status': 'BLOCKED'})
                self.assertNotIn('"status": "FAIL"', output)
                self.assertNotIn(secret, output)
                if secret.encode() in [stream for stream in streams if isinstance(stream, bytes)]:
                    self.assertIn('[REDACTED]', output)
                log = self.root / 'evidence' / 'unit.log'
                expected = b''.join(stream if isinstance(stream, bytes) else (stream or '').encode()
                                    for stream in streams)
                self.assertEqual(log.read_bytes(), expected)
                self.assertEqual(log.stat().st_mode & 0o777, 0o600)
                self.assertEqual([call[1]['timeout'] for call in self.calls], [120, 120, 180])

    def test_empty_success_is_blocked(self):
        self.blocked("")

    def test_native_pass_and_command_checks(self):
        report, code = self.native()
        result, output = self.run_gate(report, code)
        self.assertEqual(result, 0, output)
        self.assertEqual([call[1]['timeout'] for call in self.calls], [120, 120, 180, 180, 900])
        self.assertEqual(self.run_gate(report, build_code=7)[0], 7)

    def test_missing_and_renamed_required_tests(self):
        for body in ["", "test('renamed', () => {});"]:
            with self.subTest(body=body):
                report, _ = self.native(body)
                self.blocked(report)

    def test_skipped_todo_and_cancelled_required_tests(self):
        for body in ["test('required', {skip:true}, () => {});",
                     "test('required', {todo:true}, () => {});",
                     "test('required', {timeout:5}, async () => new Promise(() => {}));"]:
            with self.subTest(body=body):
                report, code = self.native(body)
                self.blocked(report, code)

    def test_malformed_duplicate_and_truncated_evidence(self):
        report, _ = self.native()
        records = [json.loads(line) for line in report.splitlines()]
        passed = next(record for record in records if record['type'] == 'test:pass')
        for bad in ["not-json", "{}\n", report + json.dumps(passed) + "\n",
                    report[:-20], '\n'.join(line for line in report.splitlines()
                                           if json.loads(line)['type'] != 'test:summary') + '\n']:
            with self.subTest(report=bad[:40]):
                self.blocked(bad)

    def test_stale_log_cannot_replace_fresh_output(self):
        report, _ = self.native()
        code, output = self.run_gate("", stale_output=report)
        self.assertEqual(code, 2, output)

    def test_unavailable_manifest_is_blocked(self):
        report, _ = self.native()
        for content in [None, 'not-json', '[]']:
            if content is None:
                self.manifest.unlink()
            else:
                self.manifest.write_text(content)
            try:
                result, output = self.run_gate(report)
            except (OSError, ValueError, AttributeError) as error:
                result, output = -1, str(error)
            with self.subTest(content=content):
                self.assertEqual(result, 2, output)

    def test_malformed_report_shapes_are_blocked(self):
        report, _ = self.native()
        for field, value in [('nesting', False), ('details', {'type': 'test', 'duration_ms': 'invalid'})]:
            records = [json.loads(line) for line in report.splitlines()]
            passed = next(record for record in records if record['type'] == 'test:pass')
            passed['data'][field] = value
            with self.subTest(field=field):
                self.blocked(''.join(json.dumps(record) + '\n' for record in records))

    def test_private_logs_and_public_redaction(self):
        secret = 'a' * 64
        report, _ = self.native(f"test('required', () => console.log('{secret}'));")
        result, output = self.run_gate(report)
        self.assertEqual(result, 0, output)
        self.assertNotIn(secret, output)
        self.assertIn('[REDACTED]', output)
        log = self.root / 'evidence' / 'unit.log'
        self.assertIn(secret, log.read_text())
        self.assertEqual(log.stat().st_mode & 0o777, 0o600)

    def test_smoke_requires_its_fresh_completion_record(self):
        report, _ = self.native()
        for missing in ['', '{}\n', '{"check":"native-isolation-smoke","status":"passed"}\n' * 2]:
            with self.subTest(smoke=missing):
                result, output = self.run_gate(report, smoke_output=missing)
                self.assertEqual(result, 2, output)

    def test_smoke_real_failure_channel_is_fail(self):
        report, _ = self.native()
        probe = '{"check":"native-isolation-probe","probe":{}}\n'
        failed = '{"check":"native-isolation-smoke","status":"failed"}\n'
        result, output = self.run_gate(report, smoke_output=probe,
                                       smoke_stderr=failed, smoke_code=1)
        self.assertEqual(result, 1, output)
        self.assertIn('"status": "FAIL"', output)
        self.assertNotIn('"status": "BLOCKED"', output)
        self.assertEqual((self.root / 'evidence' / 'native-isolation-smoke.log').read_text(),
                         probe + failed)

    def test_smoke_channels_reject_invalid_completion_evidence(self):
        report, _ = self.native()
        passed = '{"check":"native-isolation-smoke","status":"passed"}\n'
        failed = '{"check":"native-isolation-smoke","status":"failed"}\n'
        cases = [('', '', 1), ('', 'arbitrary stderr', 0),
                 (passed, 'arbitrary stderr', 0), ('', 'not-json', 1),
                 ('', '[]\n', 1), ('', failed * 2, 1),
                 (passed, passed, 0), (passed, failed, 1),
                 (failed, passed, 1), ('', passed, 0),
                 (passed, '', 1), ('', failed, 0)]
        for stdout, stderr, code in cases:
            with self.subTest(stdout=stdout, stderr=stderr, code=code):
                result, output = self.run_gate(report, smoke_output=stdout,
                                               smoke_stderr=stderr, smoke_code=code)
                self.assertEqual(result, 2, output)
                self.assertIn('"status": "BLOCKED"', output)

    def test_real_assertion_failure_is_fail_not_blocked(self):
        report, code = self.native("test('required', () => assert.equal(1, 2));")
        self.assertNotEqual(code, 0)
        result, output = self.run_gate(report, code)
        self.assertEqual(result, 1, output)
        self.assertIn('"status": "FAIL"', output)
        self.assertNotIn('"status": "BLOCKED"', output)


if __name__ == "__main__":
    unittest.main(verbosity=2)
