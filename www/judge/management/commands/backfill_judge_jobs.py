from django.core.management.base import BaseCommand

from judge.models import JudgeJob, Submission


class Command(BaseCommand):
    help = ('Report or enqueue only RECEIVED/REJUDGE_REQUESTED submissions. '
            'It never retries stale COMPILING/RUNNING rows automatically.')

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true')

    def handle(self, *args, **options):
        queued_states = (Submission.RECEIVED, Submission.REJUDGE_REQUESTED)
        candidates = Submission.objects.filter(
            state__in=queued_states, judge_job__isnull=True).order_by('id')
        count = candidates.count()
        stale = Submission.objects.filter(
            state__in=(Submission.COMPILING, Submission.RUNNING,
                       Submission.JUDGING)).count()
        self.stdout.write(
            'Eligible pending submissions without a job: %s' % count)
        self.stdout.write(
            'Stale in-progress submissions intentionally excluded: %s' % stale)
        if not options['apply']:
            self.stdout.write('Dry run; pass --apply to create pending jobs.')
            return
        created = 0
        for submission_id in candidates.values_list('id', flat=True).iterator():
            _, was_created = JudgeJob.objects.get_or_create(
                submission_id=submission_id,
                defaults={'state': JudgeJob.PENDING},
            )
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(
            'Created %s pending judge jobs.' % created))
