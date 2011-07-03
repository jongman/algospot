from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden
from models import UserProfile
from forms import SettingsForm

def profile(request, user_id):
    pass

def settings(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.user != user and not request.user.is_superuser:
        return HttpResponseForbidden("Forbidden operation.")
    form = SettingsForm(data=request.POST or None, initial={"email":
        user.email, "intro": user.get_profile().intro})
    if request.method == "POST" and form.is_valid():
        form.save(user)
        return redirect(reverse("user_profile", kwargs={"user_id": user_id}))
    return render(request, "settings.html",
            {"form": form, "settings_user": user})
