# -*- coding: utf-8 -*-
from django import forms
from django.contrib.auth.models import User
from models import UserProfile

class SettingsForm(forms.Form):
    email = forms.EmailField(label=u"이메일", max_length=75)
    intro = forms.CharField(label=u"자기소개", 
            widget=forms.Textarea(attrs={"class": "large",
                "rows": "5"}), required=False)

    def save(self, user):
        user.email = self.cleaned_data["email"]
        user.get_profile().intro = self.cleaned_data["intro"]
        user.save()
        user.get_profile().save()
