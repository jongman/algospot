# -*- coding: utf-8 -*-
from django import forms

class SettingsForm(forms.Form):
    password1 = forms.CharField(widget=forms.PasswordInput(render_value=False),
                                required=False, label=u"비밀번호 변경")
    password2 = forms.CharField(widget=forms.PasswordInput(render_value=False),
                                required=False, label=u"비밀번호 (확인)")

    email = forms.EmailField(label=u"이메일", max_length=75)
    intro = forms.CharField(label=u"자기소개",
                            widget=forms.Textarea(attrs={"class": "large",
                                                         "rows": "5"}), required=False)

    def clean(self):
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(u"비밀 번호가 일치하지 않습니다.")
        return self.cleaned_data

    def save(self, user):
        user.email = self.cleaned_data["email"]
        pw = self.cleaned_data['password1']
        if len(pw) > 0: user.set_password(pw)
        user.save()
        user.get_profile().intro = self.cleaned_data["intro"]
        user.get_profile().save()
