import os

from django.core.management.base import BaseCommand, CommandError

from judge.container_controller import JudgeController


class Command(BaseCommand):
    help = 'Consume leased judge jobs using gVisor-isolated sibling containers'

    def add_arguments(self, parser):
        parser.add_argument('--once', action='store_true')

    def handle(self, *args, **options):
        if os.environ.get('ALGOSPOT_JUDGE_CONTROLLER_ENABLED') != '1':
            raise CommandError(
                'Refusing to start without ALGOSPOT_JUDGE_CONTROLLER_ENABLED=1')
        controller = JudgeController()
        if options['once']:
            if not controller.run_once():
                self.stdout.write('No pending judge jobs.')
            return
        controller.run_forever()
