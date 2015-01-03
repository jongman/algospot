# -*- coding: utf-8 -*-
from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseForbidden, Http404
from django.contrib.comments.views.moderation import perform_delete
from django.contrib.comments.models import Comment
from forms import SettingsForm
from django.conf import settings as django_settings
from django.contrib.contenttypes.models import ContentType
from tagging.models import TaggedItem
from newsfeed.models import Activity
from newsfeed.utils import get_activities_for_user
from judge.models import Problem, Solver, Submission
from forum.models import Category, Post
from base.models import UserProfile
import pygooglechart as pgc
import json
from collections import defaultdict

def index(request):
    news_category = Category.objects.get(slug='news')
    recent_news = Post.objects.filter(category=news_category).order_by('-modified_on')[0]
    recent_activity = get_activities_for_user(request.user).exclude(category='solved').order_by("-timestamp")
    recent_activity = recent_activity[:10].all()
    return render(request, "index.html",
                  {'title': u'알고스팟에 오신 것을 환영합니다!',
                   'news': recent_news,
                   'actions': recent_activity,
                  })


def list_users(request):
    users = [user.username
             for user in User.objects.filter(is_active=True).order_by("username")]
    return HttpResponse(json.dumps(users))


def get_submission_chart_url(user):
    by_user = Submission.objects.filter(user=user)
    return Submission.get_verdict_distribution_graph(by_user)

# TODO: cache this function somehow
def get_category_chart(user):
    solved_problems = set()
    for s in Solver.objects.filter(user=user, solved=True):
        solved_problems.add(s.problem)
    problem_count = defaultdict(int)
    solved_count = defaultdict(int)
    # 문제/태그 쌍을 모두 순회하자.
    problem_id = ContentType.objects.get_for_model(Problem).id
    for item in TaggedItem.objects.filter(content_type=problem_id).all():
        problem, tag = item.object, item.tag
        if problem.state != Problem.PUBLISHED: continue
        problem_count[tag] += 1
        if problem in solved_problems:
            solved_count[tag] += 1
    # 문제 수가 많은 순서대로 태그들을 정렬한다
    tags_ordered = sorted([(-value, key) for key, value in problem_count.items()])
    # 문제 수가 가장 많은 n개의 태그를 고른다
    tags_display = [t for _, t in tags_ordered[:8]]
    # 나머지를 "나머지" 카테고리로 묶는다
    others_problems = others_solved = 0
    for tag in problem_count.keys():
        if tag not in tags_display:
            others_problems += problem_count[tag]
            others_solved += solved_count[tag]

    progress = [solved_count[tag] * 100 / problem_count[tag]
                for tag in tags_display]
    labels = [tag.name.encode('utf-8') for tag in tags_display]
    if others_problems > 0:
        progress.append(others_solved * 100 / others_problems)
        labels.append(u'기타'.encode('utf-8'))

    # 구글 차트
    chart = pgc.StackedVerticalBarChart(400, 120, y_range=(0, 100))
    chart.add_data(progress)
    chart.set_grid(0, 25, 5, 5)
    chart.set_colours(['C02942'])
    chart.set_axis_labels(pgc.Axis.LEFT, ["", "25", "50", "75", "100"])
    chart.set_axis_labels(pgc.Axis.BOTTOM, labels)
    chart.fill_solid("bg", "65432100")
    return chart.get_url() + "&chbh=r,3"


def profile_by_username(request, username):
    user = get_object_or_404(User, username=username)
    return get_profile(request, user)


def profile(request, user_id):
    if not user_id.isdigit(): raise Http404
    user = get_object_or_404(User, id=user_id)
    return get_profile(request, user)

def get_profile(request, user):
    comment_count = Comment.objects.filter(user=user).count()
    problem_count = Problem.objects.filter(user=user, state=Problem.PUBLISHED).count()
    attempted_problem_count = Solver.objects.filter(user=user).count()
    all_problem_count = Problem.objects.filter(state=Problem.PUBLISHED).count()
    submission_chart = get_submission_chart_url(user)
    failed_problem_count = Solver.objects.filter(user=user, solved=False).count()
    category_chart = get_category_chart(user)
    actions = get_activities_for_user(request.user).filter(actor=user).order_by("-timestamp")[:20]
    rank = UserProfile.objects.filter(solved_problems__gt=
                                      user.get_profile().solved_problems).count()



    return render(request, "user_profile.html",
                  {"profile_user": user,
                   "post_count": user.get_profile().posts - comment_count,
                   "problem_count": problem_count,
                   "comment_count": comment_count,
                   "attempted_problem_count": attempted_problem_count,
                   "all_problem_count": all_problem_count,
                   "failed_problem_count": failed_problem_count,
                   "not_attempted_problem_count": all_problem_count - attempted_problem_count,
                   "submission_chart_url": submission_chart,
                   "category_chart_url": category_chart,
                   "actions": actions,
                   "oj_rank": rank+1,
                   "oj_rank_page": (rank / django_settings.ITEMS_PER_PAGE)+1,
                  })

def settings(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user != user and not request.user.is_superuser:
        return HttpResponseForbidden("Forbidden operation.")
    form = SettingsForm(data=request.POST or None,
                        initial={"email": user.email, "intro": user.get_profile().intro})
    if request.method == "POST" and form.is_valid():
        form.save(user)
        return redirect(reverse("user_profile", kwargs={"user_id": user_id}))
    return render(request, "settings.html",
                  {"form": form, "settings_user": user})

def delete_comment(request, comment_id):
    """
    overriding default comments app's delete, so comment owners can always
    delete their comments.
    """
    comment = get_object_or_404(Comment, pk=comment_id)
    user = request.user
    if not user.is_superuser and user != comment.user:
        return HttpResponseForbidden("Forbidden operation.")

    # Delete on POST
    if request.method == 'POST':
        # Flag the comment as deleted instead of actually deleting it.
        perform_delete(request, comment)
        return redirect(request.POST["next"])

    # Render a form on GET
    else:
        return render(request, "comments/delete.html",
                      {"comment": comment,
                       "next": request.GET.get("next", "/")})

def calendar(request):
    return render(request, "calendar.html", {'title': u'알고스팟 캘린더'})


def matchup(request, username1, username2):
    user1 = get_object_or_404(User, username=username1)
    user2 = get_object_or_404(User, username=username2)

    solved_user1 = set([sol.problem for sol in Solver.objects.filter(user=user1, solved=True)])
    solved_user2 = set([sol.problem for sol in Solver.objects.filter(user=user2, solved=True)])

    solved_both = solved_user1 & solved_user2

    solved_user1_only = solved_user1 - solved_user2
    solved_user2_only = solved_user2 - solved_user1

    all_problems = len(solved_user1 | solved_user2)

    rate = [ len(solved_user1_only) * 100 / all_problems,
            len(solved_both) * 100 / all_problems,
            len(solved_user2_only) * 100 / all_problems,
            ]

    matchup_result = u"무승부!"
    if len(solved_user1_only) > len(solved_user2_only):
        matchup_result = user1.username + u"의 승리!"
    elif len(solved_user1_only) < len(solved_user2_only):
        matchup_result = user2.username + u"의 승리!"

    return render(request, "matchup.html",
                  {
                    "user1": user1,
                    "user2": user2,
                    "solved_user1": solved_user1_only,
                    "solved_user2": solved_user2_only,
                    "solved_both": solved_both,
                    "matchup_chart_url": get_matchup_chart(username1, username2, rate),
                    "matchup_result": matchup_result
                  })

def get_matchup_chart(username1, username2, rate):
    # 구글 차트
    chart = pgc.StackedHorizontalBarChart(320, 100, x_range=(0, 101))
    chart.set_bar_width(20)
    chart.set_colours(['e74c3c', 'f1c40f', '3498db'])
    chart.add_data(rate)
    chart.set_axis_labels(pgc.Axis.LEFT, [ username2, "무승부", username1])
    chart.set_axis_labels(pgc.Axis.BOTTOM, range(0,101,20))

    return chart.get_url()
