# -*- coding: utf-8 -*-
from django import forms
from models import Post, Category

class WriteForm(forms.ModelForm):
    class Meta:
        model = Post
        exclude = ('user',)
        fields = ('category', 'title', 'text')
    def __init__(self, categories, **kwargs):
        super(WriteForm, self).__init__(**kwargs)
        self.fields['category'].queryset = categories
