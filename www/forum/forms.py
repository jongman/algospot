# -*- coding: utf-8 -*-
from django import forms
from models import Post

class WriteForm(forms.ModelForm):
    class Meta:
        model = Post
        exclude = ('user',)
        fields = ('category', 'title', 'text')
    
    def __init__(self, *args, **kwargs):
        super(WriteForm, self).__init__(*args, **kwargs)

        self.fields['text'].widget.attrs['class'] = 'monospace'
