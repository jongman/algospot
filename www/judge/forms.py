# -*- coding: utf-8 -*-

from django import forms
from models import Problem, Submission, ProblemRevision
from django.contrib.auth.models import User
import languages
import differs
import tagging

class ProblemRevisionEditForm(forms.ModelForm):
    summary = forms.CharField(max_length=100,
                              widget=forms.TextInput(attrs={"class": "large"}),
                              required=False,
                              label=u"편집 요약")
    class Meta:
        model = ProblemRevision
        exclude = ('revision_for', 'user', 'edit_summary')
    def save(self, problem, user, summary=None, commit=True):
        instance = super(ProblemRevisionEditForm, self).save(commit=False)
        instance.edit_summary = summary or self.cleaned_data["summary"]
        instance.revision_for = problem
        instance.user = user
        if commit:
            instance.save()
            problem.last_revision = instance
            problem.save()
        return instance

class ProblemEditForm(forms.ModelForm):
    tags = tagging.forms.TagField(label=u"문제 분류", required=False)
    user = forms.ModelChoiceField(label=u"작성자", queryset=User.objects.order_by("username"))
    class Meta:
        model = Problem
        exclude = ('submissions_count', 'accepted_count', 'last_revision')
        widgets = {
            "judge_module": forms.Select(choices=[(key, key + ": " + val.__doc__)
                                                  for key, val in differs.REGISTERED.iteritems()])
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
    review = forms.BooleanField(label=u'운영진 리뷰 요청', required=False)
    class Meta:
        model = Problem
        exclude = ('submissions_count', 'accepted_count', 'user', 'state', 'last_revision')
        widgets = {
            "judge_module": forms.Select(choices=[(key, key + ": " + val.__doc__)
                                                  for key, val in
                                                  differs.REGISTERED.iteritems()]),
        }
    def __init__(self, *args, **kwargs):
        super(RestrictedProblemEditForm, self).__init__(*args, **kwargs)
        if "instance" in kwargs:
            instance = kwargs["instance"]
            self.initial["tags"] = ",".join([tag.name for tag in instance.tags])
            self.initial["review"] = instance.state != Problem.DRAFT

    def save(self, commit=True):
        instance = super(RestrictedProblemEditForm, self).save(commit=False)
        instance.tags = self.cleaned_data["tags"]
        instance.state = (Problem.PENDING_REVIEW if self.cleaned_data["review"]
                          else Problem.DRAFT)

        if commit:
            instance.save()
        return instance

class SubmitForm(forms.Form):
    language = forms.ChoiceField([(key, "%s: %s" % (val.LANGUAGE, val.VERSION))
                                  for key, val in languages.modules.items()],
                                 label=u"사용언어")
    source = forms.CharField(widget=forms.Textarea(attrs={"class": "large monospace",
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
