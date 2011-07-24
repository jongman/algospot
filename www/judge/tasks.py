from celery.decorators import task
import time

@task
def receive_submission(submission):
    time.sleep(3)
    get_judge_data.delay(submission)

@task
def get_judge_data(submission):
    time.sleep(3)

