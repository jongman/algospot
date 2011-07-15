# -*- coding: utf-8 -*-

from django import forms
from models import Problem, Submission
from config import LANGUAGES

class SubmitForm(forms.Form):
    language = forms.ChoiceField(LANGUAGES.items(), label=u"사용언어")
    source = forms.CharField(widget=forms.Textarea(attrs={"class": "large",
        "rows": "12"}), label=u"소스코드")

    def save(self, user, problem):
        new_submission = Submission(problem=problem,
                user=user,
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
