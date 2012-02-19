# -*- coding: utf-8 -*-

from django import forms
from models import Problem, Submission
from django.contrib.auth.models import User
import languages
import differs
import tagging

class ProblemEditForm(forms.ModelForm):
    tags = tagging.forms.TagField(label=u"문제 분류", required=False)
    user = forms.ModelChoiceField(label=u"작성자", queryset=User.objects.order_by("username"))
    class Meta:
        model = Problem
        exclude = ('submissions_count', 'accepted_count')
        widgets = {
            "judge_module": forms.Select(choices=[(key, key + ": " + val.DESC)
                                                  for key, val in differs.modules.iteritems()])
        }
    def __init__(self, *args, **kwargs):
        super(ProblemEditForm, self).__init__(*args, **kwargs)
        if "instance" in kwargs:
            instance = kwargs["instance"]
            self.initial["tags"] = ",".join([tag.name for tag in instance.tags])

    def save(self, commit=True):
        instance = super(ProblemEditForm, self).save(commit=False)
        instance.tags = self.cleaned_data["tags"]
        if commit:
            instance.save()
        return instance

class RestrictedProblemEditForm(forms.ModelForm):
    tags = tagging.forms.TagField(label=u"문제 분류", required=False)
    class Meta:
        model = Problem
        exclude = ('submissions_count', 'accepted_count', 'user', 'state')
        widgets = {
            "judge_module": forms.Select(choices=[(key, key + ": " + val.DESC)
                                                  for key, val in differs.modules.iteritems()])
        }
    def __init__(self, *args, **kwargs):
        super(RestrictedProblemEditForm, self).__init__(*args, **kwargs)
        if "instance" in kwargs:
            instance = kwargs["instance"]
            self.initial["tags"] = ",".join([tag.name for tag in instance.tags])

    def save(self, commit=True):
        instance = super(RestrictedProblemEditForm, self).save(commit=False)
        instance.tags = self.cleaned_data["tags"]
        if commit:
            instance.save()
        return instance

class SubmitForm(forms.Form):
    language = forms.ChoiceField([(key, "%s: %s" % (val.LANGUAGE, val.VERSION))
                                  for key, val in languages.modules.items()],
                                 label=u"사용언어")
    source = forms.CharField(widget=forms.Textarea(attrs={"class": "large",
                                                          "rows": "12"}),
                             label=u"소스코드")

    def __init__(self, *args, **kwargs):
        self.public = kwargs.get('public', True)
        if 'public' in kwargs:
            del kwargs['public']

        super(SubmitForm, self).__init__(*args, **kwargs)

    def save(self, user, problem):
        new_submission = Submission(problem=problem,
                                    user=user,
                                    is_public=self.public,
                                    language=self.cleaned_data["language"],
                                    length=len(self.cleaned_data["source"]),
                                    source=self.cleaned_data["source"])
        new_submission.save()

class AdminSubmitForm(SubmitForm):
    is_public = forms.ChoiceField([("True", u"공개"), ("False", u"비공개")],
                                  label=u"공개여부")

    def save(self, user, problem):
        new_submission = Submission(problem=problem,
                                    user=user,
                                    language=self.cleaned_data["language"],
                                    length=len(self.cleaned_data["source"]),
                                    is_public=("True" == self.cleaned_data["is_public"]),
                                    source=self.cleaned_data["source"])
        new_submission.save()
