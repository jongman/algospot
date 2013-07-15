from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.utils.translation import ugettext_lazy as _

class MyUserCreationForm(UserCreationForm):
    username = forms.RegexField(
        label = _('username'),
        max_length = 30,
        regex = ur'^[\w\uac00-\ud7a3.@+-]+$',
        help_text = _("Required. 30 characters or fewer. Letters, digits, korean characters and @/./+/-/_ characters."),
        error_messages = {
            'invalid': _("This value must contain only letters, digits, korean characters and @/./+/-/_ characters.")})

class MyUserChangeForm(UserChangeForm):
    username = forms.RegexField(
        label = _('username'),
        max_length = 30,
        regex = ur'^[\w\uac00-\ud7a3.@+-]+$',
        help_text = _("Required. 30 characters or fewer. Letters, digits, korean characters and @/./+/-/_ characters."),
        error_messages = {
            'invalid': _("This value must contain only letters, digits, korean characters and @/./+/-/_ characters.")})


class MyUserAdmin(UserAdmin):
    list_filter = UserAdmin.list_filter + ('groups__name',)
    form = MyUserChangeForm
    add_form = MyUserCreationForm

admin.site.unregister(User)
admin.site.register(User, MyUserAdmin)
