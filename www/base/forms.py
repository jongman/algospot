# -*- coding: utf-8 -*-
from django import forms
from django.conf import settings
from django.utils.safestring import mark_safe
if settings.USE_AYAH:
    import ayah
from registration.forms import RegistrationForm
from registration.backends.default import DefaultBackend

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

class AreYouAHumanWidget(forms.HiddenInput):

    def render(self, name, value, attrs=None):
        # a hack :-(
        assert name == 'session_secret'
        return mark_safe(unicode(ayah.get_publisher_html()))

class AreYouAHumanField(forms.CharField):
    widget = AreYouAHumanWidget
    
    def clean(self, data):
        if not ayah.score_result(data):
            raise forms.ValidationError('Please solve the puzzle')

class AreYouAHumanForm(RegistrationForm):
    session_secret = AreYouAHumanField(label='')

class AreYouAHumanBackEnd(DefaultBackend):
    def get_form_class(self, request):
        if settings.USE_AYAH: 
            ayah.configure(settings.AYAH_PUBLISHER_KEY, settings.AYAH_SCORING_KEY)
            return AreYouAHumanForm
        return RegistrationForm
