# -*- coding: utf-8 -*-


from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('posts', models.IntegerField(default=0)),
                ('submissions', models.IntegerField(default=0)),
                ('accepted', models.IntegerField(default=0)),
                ('solved_problems', models.IntegerField(default=0)),
                ('intro', models.TextField(default=b'')),
                ('user', models.OneToOneField(
                    to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
