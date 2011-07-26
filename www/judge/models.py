# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from config import JUDGE_MODULES
from django.db.models.signals import pre_save, post_save
from newsfeed import publish, depublish, has_activity, get_activity
from djangoutils import get_or_none

class Problem(models.Model):
    DRAFT, PENDING_REVIEW, HIDDEN, PUBLISHED = range(4)
    STATE_CHOICES = ((DRAFT, "DRAFT"),
            (PENDING_REVIEW, "PENDING REVIEW"),
            (HIDDEN, "HIDDEN"),
            (PUBLISHED, "PUBLISHED"))

    slug = models.SlugField(u"문제 ID", blank=True,max_length=100)
    updated_on = models.DateTimeField(auto_now=True)
    state = models.SmallIntegerField(u"문제 상태", default=DRAFT, choices=STATE_CHOICES)
    user = models.ForeignKey(User, verbose_name=u"작성자")
    source = models.CharField(u"출처", max_length=100, blank=True)
    name = models.CharField(u"이름", max_length=100, blank=True)
    description = models.TextField(u"설명", blank=True)
    input = models.TextField(u"입력 설명", blank=True)
    output = models.TextField(u"출력 설명", blank=True)
    sample_input = models.TextField(u"예제 입력", blank=True)
    sample_output = models.TextField(u"예제 출력", blank=True)
    note = models.TextField(u"노트", blank=True)
    judge_module = models.CharField(u"채점 모듈", blank=True, max_length=100,
            choices=JUDGE_MODULES.items())
    time_limit = models.PositiveIntegerField(u"시간 제한 (ms)", default=10000)
    memory_limit = models.PositiveIntegerField(u"메모리 제한 (kb)", default=65536)
    submissions_count = models.IntegerField(default=0)
    accepted_count = models.IntegerField(default=0)

    def __unicode__(self):
        return self.slug

    def get_absolute_url(self):
        return reverse("judge-problem-read", kwargs={"slug": self.slug})

class Attachment(models.Model):
    problem = models.ForeignKey(Problem)
    file = models.FileField(max_length=1024, upload_to='/will_not_be_used/')

class Submission(models.Model):
    (RECEIVED, COMPILING, RUNNING, JUDGING, COMPILE_ERROR,
    OK, ACCEPTED, WRONG_ANSWER, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED,
    CANT_BE_JUDGED, REJUDGE_REQUESTED) = range(12)
    STATES_KOR = dict([
        (RECEIVED, u"수신"),
        (COMPILING, u"컴파일중"),
        (RUNNING, u"실행중"),
        (JUDGING, u"채점중"),
        (COMPILE_ERROR, u"컴파일 실패"),
        (OK, u"수행완료"),
        (ACCEPTED, u"정답"),
        (WRONG_ANSWER, u"오답"),
        (RUNTIME_ERROR, u"런타임 오류"),
        (TIME_LIMIT_EXCEEDED, u"시간초과"),
        (CANT_BE_JUDGED, u"채점실패"),
        (REJUDGE_REQUESTED, u"재채점")])
    STATES_ENG = dict([
        (RECEIVED, "RECEIVED"),
        (COMPILING, "COMPILING"),
        (RUNNING, "RUNNING"),
        (JUDGING, "JUDGING"),
        (COMPILE_ERROR, "COMPILE_ERROR"),
        (OK, "OK"),
        (ACCEPTED, "ACCEPTED"),
        (WRONG_ANSWER, "WRONG_ANSWER"),
        (RUNTIME_ERROR, "RUNTIME_ERROR"),
        (TIME_LIMIT_EXCEEDED, "TIME_LIMIT_EXCEEDED"),
        (CANT_BE_JUDGED, "CANT_BE_JUDGED"),
        (REJUDGE_REQUESTED, "REJUDGE_REQUESTED")])


    PROGRAM_HAS_RUN = [OK, ACCEPTED, WRONG_ANSWER]
    HAS_MESSAGES = [COMPILE_ERROR, RUNTIME_ERROR]

    submitted_on = models.DateTimeField(auto_now_add=True)
    problem = models.ForeignKey(Problem)
    is_public = models.BooleanField(default=True)
    user = models.ForeignKey(User)
    language = models.TextField(max_length=100)
    state = models.SmallIntegerField(default=RECEIVED,
            choices=STATES_ENG.items())
    length = models.IntegerField()
    source = models.TextField()
    message = models.TextField(blank=True, default="")
    time = models.IntegerField(null=True)
    memory = models.IntegerField(null=True)

    def has_run(self):
        return self.state in self.PROGRAM_HAS_RUN

    def has_messages(self):
        return self.state in self.HAS_MESSAGES

    def name_kor(self):
        return self.STATES_KOR[self.state]

    def name_eng(self):
        return self.STATES_ENG[self.state]

    def get_absolute_url(self):
        return reverse("judge-submission-details", kwargs={"id": self.id})

# SIGNAL HANDLERS
def saved_problem(sender, **kwargs):
    instance = kwargs["instance"]
    if instance.state == Problem.PUBLISHED:
        id = "new-problem-%d" % instance.id
        if not has_activity(key=id):
            publish(id, "newproblem", "judge",
                    actor=instance.user,
                    action_object=instance,
                    verb=u"온라인 저지에 새 문제 {action_object}를 "
                         u"공개했습니다.")
        else:
            activity = get_activity(key=id)
            activity.actor = instance.user
            activity.save()

def solved_problem(user, problem, submission):
    accepted = Submission.objects.filter(user=user,
                                         problem=problem,
                                         state=Submission.ACCEPTED).count()
    # 이미 푼 문젤까?
    if accepted > 0: return
    # 오오 풀었당!
    subs = Submission.objects.filter(user=user,
                                     problem=problem).count()
    publish("solved-%d-%d-%d" % (user.id, problem.id, submission.id),
            "solved",
            "judge",
            target=problem,
            actor=user,
            timestamp=submission.submitted_on,
            verb=u"%d번의 시도만에 문제 {target}를 해결했습니다." % subs)
    profile = user.get_profile()
    profile.solved_problems += 1
    profile.save()

def unsolved_problem(user, problem, submission):
    activity_id = "solved-%d-%d-%d" % (user.id, problem.id, submission.id)
    # 첫 번째 AC가 없어지지 않는한 신경 안 쓴다
    if not has_activity(activity_id): return
    depublish(activity_id)
    # 이후에 AC받은 전적이 있나?
    next_accepted = get_or_none(Submission,
                                user=user,
                                problem=problem,
                                state=Submission.ACCEPTED,
                                id__gt=submission.id)
    # 그렇다면 새로 publish 하고 끝
    if next_accepted:
        subs = Submission.objects.filter(user=user,
                                         problem=problem,
                                         id__lte=next_accepted.id).count()
        publish("solved-%d-%d-%d" % (user.id, problem.id, next_accepted.id),
                "solved",
                "judge",
                target=problem,
                actor=user,
                timestamp=next_accepted.submitted_on,
                verb=u"%d번의 시도만에 문제 {target}를 해결했습니다." % subs)
    else:
        # 이제 이 문제 못풀었어요 프로필 빠빠이..
        profile = user.get_profile()
        profile.solved_profiles -= 1
        profile.save()

def will_save_submission(sender, **kwargs):
    submission = kwargs["instance"]
    if not submission.id: return
    current_sub = get_or_none(Submission, id=submission.id)
    if not current_sub: return
    old_state = current_sub.state
    if old_state == submission.state: return
    # 풀었다!
    if submission.state == Submission.ACCEPTED:
        solved_problem(submission.user, submission.problem, submission)
    # 리저지?
    elif old_state == Submission.ACCEPTED:
        unsolved_problem(submission.user, submission.problem, submission)

def saved_submission(sender, **kwargs):
    if kwargs["created"]:
        profile = kwargs["instance"].user.get_profile()
        profile.submissions += 1
        profile.save()

post_save.connect(saved_problem, sender=Problem,
                 dispatch_uid="saved_problem")
pre_save.connect(will_save_submission, sender=Submission,
                 dispatch_uid="will_save_submission")
post_save.connect(saved_submission, sender=Submission,
                  dispatch_uid="saved_submission")
