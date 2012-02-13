from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden
from django.contrib.comments.views.moderation import perform_delete
from django.contrib.comments.models import Comment
from forms import SettingsForm
from judge.models import Problem, Solver
from base.models import UserProfile

def profile(request, user_id):
    user = get_object_or_404(User, id=user_id)
    comment_count = Comment.objects.filter(user=user).count()
    problem_count = Problem.objects.filter(user=user).count()
    oj_rank = UserProfile.objects.filter(solved_problems__gt=user.get_profile().solved_problems).count() + 1
    attempted_problem_count = Solver.objects.filter(user=user).count()
    all_problems_count = Problem.objects.filter(state=Problem.PUBLISHED).count()

    return render(request, "user_profile.html",
                  {"profile_user": user,
                   "post_count": user.get_profile().posts - comment_count,
                   "problem_count": problem_count,
                   "comment_count": comment_count,
                   "oj_rank": oj_rank,
                   "attempted_problem_count": attempted_problem_count,
                   "all_problems_count": all_problems_count,
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
