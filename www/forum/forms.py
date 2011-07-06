# -*- coding: utf-8 -*-
from django import forms
from models import Category, Post

class WriteForm(forms.Form):
    category = forms.ChoiceField([(cat.id, cat.name) 
        for cat in Category.objects.all()])
    title = forms.CharField(label=u"제목",
            widget=forms.TextInput(attrs={"class": "large"}))
    text = forms.CharField(widget=forms.Textarea(attrs={"class": "large",
        "rows": "20"}))

    def save(self, user, id=None):
        if id != None:
            post = Post.objects.get(id=id)
        else:
            post = Post(user=user)

        post.category = Category.objects.get(id=self.cleaned_data["category"])
        post.title = self.cleaned_data["title"]
        post.text = self.cleaned_data["text"]
        post.save()
        return post.id

