# -*- coding: utf-8 -*-
from django import forms
from models import Post

class WriteForm(forms.ModelForm):
    class Meta:
        model = Post
        exclude = ('user',)
        fields = ('category', 'title', 'text')
