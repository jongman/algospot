from django.core.management.base import BaseCommand

from judge.models import JudgeJob, Submission


class Command(BaseCommand):
    help = ('Audit the new queue without adopting any restored submissions. '
            'Retired-toolchain rows are never backfilled.')

    def handle(self, *args, **options):
        queued_states = (Submission.RECEIVED, Submission.REJUDGE_REQUESTED)
        queued = JudgeJob.objects.filter(
            state=JudgeJob.PENDING,
            submission__state__in=queued_states,
        ).count()
        retired_pending = Submission.objects.filter(
            state__in=queued_states,
            judge_job__isnull=True,
        ).count()
        stale = Submission.objects.filter(
            state__in=(Submission.COMPILING, Submission.RUNNING,
                       Submission.JUDGING)).count()
        self.stdout.write(
            'Container-toolchain jobs pending: %s' % queued)
        self.stdout.write(
            'Retired-toolchain pending submissions excluded: %s' %
            retired_pending)
        self.stdout.write(
            'Stale in-progress submissions intentionally excluded: %s' % stale)
        self.stdout.write('Audit only; restored submissions are never backfilled.')
