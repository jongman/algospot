from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.test import override_settings

from judge.container_controller import JudgeController
from judge.models import Attachment, JudgeJob, Problem, ProblemRevision, Submission
from judge.special_checker_ports.packing import build_smoke_output
from judge.special_checkers import CHECKER_PORTS, checker_digest


class Command(BaseCommand):
    help = ('Exercise the full judge pipeline with controller-authored source; '
            'all database changes are rolled back')

    def add_arguments(self, parser):
        parser.add_argument('--runtime', default='runsc')
        parser.add_argument('--allow-runc', action='store_true')

    def handle(self, *args, **options):
        if settings.DATABASES['default']['NAME'] != 'algospot_native_migrate':
            raise CommandError('Pipeline smoke is restricted to the scratch database')
        runtime = options['runtime']
        if runtime == 'runc' and not options['allow_runc']:
            raise CommandError('runc requires the explicit controlled-smoke opt-in')

        original = Problem.objects.get(slug='BUS')
        attachments = {
            Path(item.file.name).name: item
            for item in Attachment.objects.filter(problem=original)
        }
        input_attachment = attachments.get('smallnoobnoob.in')
        output_attachment = attachments.get('smallnoobnoob.out')
        if input_attachment is None or output_attachment is None:
            raise CommandError('The preserved BUS smoke pair is unavailable')
        expected = Path(output_attachment.file.path).read_bytes()
        if len(expected) > 512 * 1024:
            raise CommandError('The controlled expected output is unexpectedly large')

        special_fixtures = {}
        for candidate in Problem.objects.filter(
                judge_module='special_judge').order_by('id'):
            candidate_attachments = list(
                Attachment.objects.filter(problem=candidate).order_by('id'))
            by_name = {Path(item.file.name).name: item
                       for item in candidate_attachments}
            checker = by_name.get('checker')
            if checker is None:
                continue
            digest = checker_digest(checker.file.path)
            if digest not in CHECKER_PORTS:
                raise CommandError(
                    'Special checker is not allowlisted: %s (%s)' % (
                        candidate.slug, digest))
            for name, item in sorted(by_name.items()):
                if not name.endswith('.in'):
                    continue
                wanted = by_name.get(name[:-3] + '.out')
                if wanted is not None and Path(wanted.file.path).stat().st_size <= 512 * 1024:
                    special_fixtures.setdefault(
                        digest, (candidate.slug, item, wanted, checker))
                    break
        missing_checkers = sorted(set(CHECKER_PORTS) - set(special_fixtures))
        if missing_checkers:
            raise CommandError(
                'No direct smoke fixture is available for checker(s): %s' %
                ', '.join(missing_checkers))

        restored_submission = (Submission.objects
                               .filter(problem=original)
                               .order_by('id').first())
        if restored_submission is None:
            raise CommandError('The preserved BUS submission fixture is unavailable')
        with override_settings(JUDGE_REJUDGE_ENABLED=True):
            if restored_submission.can_rejudge():
                raise CommandError(
                    'A restored submission was incorrectly made rejudgeable')

        with transaction.atomic():
            user = (get_user_model().objects
                    .filter(userprofile__isnull=False)
                    .order_by('id').first())
            if user is None:
                raise CommandError('No user profile is available for the smoke fixture')
            problem = Problem.objects.create(
                slug='__CONTAINER_PIPELINE_SMOKE__',
                state=Problem.DRAFT,
                user=user,
                name='Container pipeline smoke',
                judge_module='strict',
            )
            revision = ProblemRevision.objects.create(
                revision_for=problem,
                user=user,
                time_limit=2000,
                memory_limit=131072,
            )
            problem.last_revision = revision
            problem.save(update_fields=['last_revision'])
            Attachment.objects.create(
                problem=problem, file=input_attachment.file.name)
            Attachment.objects.create(
                problem=problem, file=output_attachment.file.name)
            source = (
                'import sys\n'
                'sys.stdin.buffer.read()\n'
                'sys.stdout.buffer.write(%r)\n' % expected
            )
            submission = Submission.objects.create(
                problem=problem,
                user=user,
                language='py3',
                length=len(source),
                source=source,
            )
            with override_settings(JUDGE_REJUDGE_ENABLED=True):
                if not submission.can_rejudge():
                    raise CommandError(
                        'A new container-toolchain submission is not rejudgeable')
            job = JudgeJob.objects.get(submission=submission)

            controller = JudgeController(
                runtime=runtime,
                allow_runc=options['allow_runc'],
                require_digest=False,
                worker_id='controlled-pipeline-smoke',
            )
            claimed_job_id = controller.claim()
            if claimed_job_id != job.id:
                raise CommandError(
                    'Controller claimed job %s instead of smoke job %s' % (
                        claimed_job_id, job.id))
            controller.process(job.id)
            submission.refresh_from_db()
            if submission.state != Submission.ACCEPTED:
                raise CommandError(
                    'Controlled pipeline verdict was %s: %s' % (
                        submission.name_eng(), submission.message))

            for index, (digest, fixture) in enumerate(
                    sorted(special_fixtures.items())):
                (fixture_slug, special_input, special_output,
                 special_checker) = fixture
                if CHECKER_PORTS[digest] == 'packing.py':
                    special_expected = build_smoke_output(
                        special_input.file.path, special_output.file.path)
                else:
                    special_expected = Path(
                        special_output.file.path).read_bytes()
                special_problem = Problem.objects.create(
                    slug='__SPECIAL_CHECKER_PIPELINE_SMOKE_%s__' % index,
                    state=Problem.DRAFT,
                    user=user,
                    name='Special checker pipeline smoke: %s' % fixture_slug,
                    judge_module='special_judge',
                )
                special_revision = ProblemRevision.objects.create(
                    revision_for=special_problem,
                    user=user,
                    time_limit=2000,
                    memory_limit=131072,
                )
                special_problem.last_revision = special_revision
                special_problem.save(update_fields=['last_revision'])
                for original_attachment in (
                        special_input, special_output, special_checker):
                    Attachment.objects.create(
                        problem=special_problem,
                        file=original_attachment.file.name,
                    )
                special_source = (
                    'import sys\n'
                    'sys.stdin.buffer.read()\n'
                    'sys.stdout.buffer.write(%r)\n' % special_expected
                )
                special_submission = Submission.objects.create(
                    problem=special_problem,
                    user=user,
                    language='py3',
                    length=len(special_source),
                    source=special_source,
                )
                special_job = JudgeJob.objects.get(submission=special_submission)
                claimed_job_id = controller.claim()
                if claimed_job_id != special_job.id:
                    raise CommandError(
                        'Controller claimed job %s instead of special smoke '
                        'job %s' % (claimed_job_id, special_job.id))
                controller.process(special_job.id)
                special_submission.refresh_from_db()
                if special_submission.state != Submission.ACCEPTED:
                    raise CommandError(
                        'Controlled special-checker %s verdict was %s: %s' % (
                            digest, special_submission.name_eng(),
                            special_submission.message))
            self.stdout.write(self.style.SUCCESS(
                'Full judge and all %s special-checker pipelines passed (%s); '
                'database changes rolled back.' % (
                    len(special_fixtures), runtime)))
            transaction.set_rollback(True)
