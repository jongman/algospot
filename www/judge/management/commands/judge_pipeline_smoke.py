from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from judge.container_controller import JudgeController
from judge.models import Attachment, JudgeJob, Problem, ProblemRevision, Submission


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

        special_fixture = None
        for candidate in Problem.objects.filter(
                judge_module='special_judge').order_by('id'):
            candidate_attachments = list(
                Attachment.objects.filter(problem=candidate).order_by('id'))
            by_name = {Path(item.file.name).name: item
                       for item in candidate_attachments}
            checker = by_name.get('checker')
            if checker is None:
                continue
            for name, item in sorted(by_name.items()):
                if not name.endswith('.in'):
                    continue
                wanted = by_name.get(name[:-3] + '.out')
                if wanted is not None and Path(wanted.file.path).stat().st_size <= 512 * 1024:
                    special_fixture = (item, wanted, checker)
                    break
            if special_fixture is not None:
                break
        if special_fixture is None:
            raise CommandError('No direct special-judge smoke fixture is available')

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
            job = JudgeJob.objects.get(submission=submission)
            job.state = JudgeJob.RUNNING
            job.worker_id = 'controlled-pipeline-smoke'
            job.save(update_fields=['state', 'worker_id', 'updated_at'])

            controller = JudgeController(
                runtime=runtime,
                allow_runc=options['allow_runc'],
                require_digest=False,
                worker_id='controlled-pipeline-smoke',
            )
            controller.process(job.id)
            submission.refresh_from_db()
            if submission.state != Submission.ACCEPTED:
                raise CommandError(
                    'Controlled pipeline verdict was %s: %s' % (
                        submission.name_eng(), submission.message))

            special_input, special_output, special_checker = special_fixture
            special_expected = Path(special_output.file.path).read_bytes()
            special_problem = Problem.objects.create(
                slug='__SPECIAL_CHECKER_PIPELINE_SMOKE__',
                state=Problem.DRAFT,
                user=user,
                name='Special checker pipeline smoke',
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
            special_job.state = JudgeJob.RUNNING
            special_job.worker_id = 'controlled-pipeline-smoke'
            special_job.save(update_fields=['state', 'worker_id', 'updated_at'])
            controller.process(special_job.id)
            special_submission.refresh_from_db()
            if special_submission.state != Submission.ACCEPTED:
                raise CommandError(
                    'Controlled special-checker verdict was %s: %s' % (
                        special_submission.name_eng(),
                        special_submission.message))
            self.stdout.write(self.style.SUCCESS(
                'Full judge and special-checker pipelines passed (%s); '
                'database changes rolled back.'
                % runtime))
            transaction.set_rollback(True)
