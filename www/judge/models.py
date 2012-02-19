# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.db.models.signals import post_save
from django.db.models import Count
from newsfeed import publish, depublish, has_activity, get_activity
from djangoutils import get_or_none
import pygooglechart as pgc
import tagging

class Problem(models.Model):
    DRAFT, PENDING_REVIEW, HIDDEN, PUBLISHED = range(4)
    STATE_CHOICES = ((DRAFT, "DRAFT"),
                     (PENDING_REVIEW, "PENDING REVIEW"),
                     (HIDDEN, "HIDDEN"),
                     (PUBLISHED, "PUBLISHED"))

    slug = models.SlugField(u"문제 ID", max_length=100, unique=True)
    updated_on = models.DateTimeField(auto_now=True)
    state = models.SmallIntegerField(u"문제 상태", default=DRAFT,
                                     choices=STATE_CHOICES,
                                     db_index=True)
    user = models.ForeignKey(User, verbose_name=u"작성자", db_index=True)
    source = models.CharField(u"출처", max_length=100, blank=True, db_index=True)
    name = models.CharField(u"이름", max_length=100, blank=True)
    description = models.TextField(u"설명", blank=True)
    input = models.TextField(u"입력 설명", blank=True)
    output = models.TextField(u"출력 설명", blank=True)
    sample_input = models.TextField(u"예제 입력", blank=True)
    sample_output = models.TextField(u"예제 출력", blank=True)
    note = models.TextField(u"노트", blank=True)
    judge_module = models.CharField(u"채점 모듈", blank=True, max_length=100)
    time_limit = models.PositiveIntegerField(u"시간 제한 (ms)", default=10000)
    memory_limit = models.PositiveIntegerField(u"메모리 제한 (kb)", default=65536)
    submissions_count = models.IntegerField(default=0)
    accepted_count = models.IntegerField(default=0)

    def __unicode__(self):
        return self.slug

    def get_state_name(self):
        return Problem.STATE_CHOICES[self.state][1]

    def was_solved_by(self, user):
        return Solver.objects.filter(problem=self, user=user,
                                     solved=True).exists()

    def get_absolute_url(self):
        return reverse("judge-problem-read", kwargs={"slug": self.slug})

tagging.register(Problem)

class Attachment(models.Model):
    problem = models.ForeignKey(Problem, db_index=True)
    file = models.FileField(max_length=1024, upload_to='/will_not_be_used/')

class Submission(models.Model):
    (RECEIVED, COMPILING, RUNNING, JUDGING, COMPILE_ERROR,
    OK, ACCEPTED, WRONG_ANSWER, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED,
    CANT_BE_JUDGED, REJUDGE_REQUESTED) = range(12)
    STATES_KOR = dict([(RECEIVED, u"수신"),
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
    STATES_ENG = dict([(RECEIVED, "RECEIVED"),
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


    JUDGED = (ACCEPTED, WRONG_ANSWER, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED,
              CANT_BE_JUDGED)
    PROGRAM_HAS_RUN = (OK, ACCEPTED, WRONG_ANSWER)
    HAS_MESSAGES = (COMPILE_ERROR, RUNTIME_ERROR)

    submitted_on = models.DateTimeField(auto_now_add=True)
    problem = models.ForeignKey(Problem, db_index=True)
    is_public = models.BooleanField(default=True)
    user = models.ForeignKey(User, db_index=True)
    language = models.TextField(max_length=100)
    state = models.SmallIntegerField(default=RECEIVED,
                                     choices=STATES_ENG.items(),
                                     db_index=True)
    length = models.IntegerField(db_index=True)
    source = models.TextField()
    message = models.TextField(blank=True, default="")
    time = models.IntegerField(null=True, db_index=True)
    memory = models.IntegerField(null=True)

    def __unicode__(self):
        return "%s: %s" % (self.problem.slug,
                           self.user.username)

    def has_run(self):
        return self.state in self.PROGRAM_HAS_RUN

    # TODO: has_messages => has_message
    def has_messages(self):
        return bool(self.message)

    def is_judged(self):
        return self.state in Submission.JUDGED

    def is_accepted(self):
        return self.state == Submission.ACCEPTED

    def name_kor(self):
        return self.STATES_KOR[self.state]

    def name_eng(self):
        return self.STATES_ENG[self.state]

    def get_absolute_url(self):
        return reverse("judge-submission-details", kwargs={"id": self.id})

    @staticmethod
    def get_verdict_distribution(queryset):
        ret = {}
        for entry in queryset.values('state').annotate(Count('state')):
            ret[entry['state']] = entry['state__count']
        return ret

    @staticmethod
    def get_verdict_distribution_graph(queryset):
        take = (Submission.ACCEPTED, Submission.WRONG_ANSWER,
                Submission.TIME_LIMIT_EXCEEDED)
        # AC, WA, TLE 이외의 것들을 하나의 카테고리로 모음
        cleaned = {-1: 0}
        for t in take: cleaned[t] = 0
        for verdict, count in Submission.get_verdict_distribution(queryset).items():
            if verdict in take:
                cleaned[verdict] = count
            else:
                cleaned[-1] += count

        # 구글 차트
        pie = pgc.PieChart2D(200, 120)
        if sum(cleaned.values()) == 0:
            pie.add_data([100])
            pie.set_legend(['NONE'])
            pie.set_colours(['999999'])
        else:
            pie.add_data([cleaned[Submission.ACCEPTED],
                          cleaned[Submission.WRONG_ANSWER],
                          cleaned[Submission.TIME_LIMIT_EXCEEDED],
                          cleaned[-1]])
        pie.set_legend(['AC', 'WA', 'TLE', 'OTHER'])
        pie.set_colours(["C02942", "53777A", "542437", "ECD078"])
        pie.fill_solid("bg", "65432100")
        return pie.get_url() + "&chp=4.712"


    @staticmethod
    def get_stat_for_user(user):
        ret = {}
        for entry in Submission.objects.filter(user=user).values('state').annotate(Count('state')):
            ret[entry['state']] = entry['state__count']
        return ret

class Solver(models.Model):
    problem = models.ForeignKey(Problem, db_index=True)
    user = models.ForeignKey(User, db_index=True)
    incorrect_tries = models.IntegerField(default=0)
    solved = models.BooleanField(default=False, db_index=True)
    fastest_submission = models.ForeignKey(Submission, null=True,
                                           related_name="+")
    shortest_submission = models.ForeignKey(Submission, null=True,
                                           related_name="+")
    when = models.DateTimeField(null=True)

    def __unicode__(self):
        return "%s: %s" % (self.problem.slug,
                           self.user.username)

    @staticmethod
    def get_incorrect_tries_chart(problem):
        solvers = Solver.objects.filter(problem=problem, solved=True)
        dist = {}
        for entry in solvers.values('incorrect_tries').annotate(Count('incorrect_tries')):
            dist[entry['incorrect_tries']] = entry['incorrect_tries__count']

        max_fails = max(dist.keys()) if dist else 0
        steps = max(1, max_fails / 20)
        chart = pgc.StackedVerticalBarChart(400, 120)
        chart.add_data([dist.get(i, 0) for i in xrange(max_fails + 1)])
        chart.set_colours(['C02942'])
        chart.set_axis_labels(pgc.Axis.BOTTOM,
                              [str(i) if i % steps == 0 else ''
                               for i in xrange(max_fails + 1)])
        chart.fill_solid("bg", "65432100")
        return chart.get_url() + '&chbh=r,3'

    @staticmethod
    def refresh(problem, user):
        # TODO: 언젠가.. 최적화한다. -_-

        # PUBLISHED 가 아니면 Solver 인스턴스는 존재하지 않는다.
        if problem.state != Problem.PUBLISHED:
            return

        # Solver 인스턴스를 찾음. 없으면 만듬.
        instance = get_or_none(Solver, problem=problem, user=user)
        if not instance:
            instance = Solver(problem=problem, user=user)
            instance.save()
        # 이 사람의 서브미션 목록을 찾는다
        submissions = Submission.objects.filter(problem=problem,
                                                is_public=True,
                                                user=user).order_by("id")
        accepted = submissions.filter(state=Submission.ACCEPTED)

        # 풀었나? 못 풀었나?
        prev_solved = instance.solved
        if accepted.count() == 0:
            instance.solved = False
            instance.incorrect_tries = submissions.count()
            instance.fastest_submission = instance.shortest_submission = None
        else:
            instance.solved = True
            first = accepted[0]
            instance.when = first.submitted_on
            incorrect = submissions.filter(id__lt=first.id)
            instance.incorrect_tries = incorrect.count()
            instance.fastest_submission = accepted.order_by("time")[0]
            instance.shortest_submission = accepted.order_by("length")[0]
        instance.save()
        if instance.solved != prev_solved:
            # 유저 프로필에 푼 문제 수 업데이트
            profile = user.get_profile()
            profile.solved_problems = Solver.objects.filter(user=user,
                                                            solved=True).count()
            profile.save()

            # 처음으로 풀었을 경우 알림을 보낸다
            id = "solved-%d-%d" % (problem.id, user.id)
            if instance.solved:
                # 풀었다!
                publish(id, "solved", "judge",
                        target=problem,
                        actor=user,
                        timestamp=instance.fastest_submission.submitted_on,
                        verb=u"%d번의 시도만에 문제 {target}를 해결했습니다." %
                        (instance.incorrect_tries + 1))
            else:
                # 리저지 등 관계로 풀었던 문제를 못푼게 됨.
                depublish(id)

            # TODO: 가장 빠른 솔루션, 가장 짧은 솔루션이 등장했을 경우
            # newsfeed entry를 보낸다
        return instance

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

def saved_submission(sender, **kwargs):
    submission = kwargs["instance"]
    if submission.state in [Submission.RECEIVED,
                            Submission.REJUDGE_REQUESTED]:
        import tasks
        tasks.judge_submission.delay(submission)

    if submission.state in Submission.JUDGED:
        if not submission.is_public: return
        profile = submission.user.get_profile()
        submissions = Submission.objects.filter(user=submission.user)
        profile.submissions = submissions.count()
        profile.accepted = submissions.filter(state=Submission.ACCEPTED).count()
        profile.save()

        Solver.refresh(submission.problem, submission.user)

post_save.connect(saved_problem, sender=Problem,
                 dispatch_uid="saved_problem")
post_save.connect(saved_submission, sender=Submission,
                  dispatch_uid="saved_submission")
