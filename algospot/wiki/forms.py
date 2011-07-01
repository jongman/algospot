# -*- coding: utf-8 -*-
from django import forms

class EditForm(forms.Form):
    text = forms.CharField(widget=forms.Textarea(attrs={"class": "large",
        "rows": "20"}))
    summary = forms.CharField(max_length=100,
            widget=forms.TextInput(attrs={"class": "large"}))

