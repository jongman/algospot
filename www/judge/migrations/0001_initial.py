# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('file', models.FileField(max_length=1024, upload_to=b'/will_not_be_used/')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Problem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('slug', models.SlugField(unique=True, max_length=100, verbose_name='\ubb38\uc81c ID')),
                ('state', models.SmallIntegerField(default=0, db_index=True, verbose_name='\ubb38\uc81c \uc0c1\ud0dc', choices=[(0, b'DRAFT'), (1, b'PENDING REVIEW'), (2, b'HIDDEN'), (3, b'PUBLISHED')])),
                ('source', models.CharField(db_index=True, max_length=100, verbose_name='\ucd9c\ucc98', blank=True)),
                ('name', models.CharField(max_length=100, verbose_name='\uc774\ub984', blank=True)),
                ('judge_module', models.CharField(max_length=100, verbose_name='\ucc44\uc810 \ubaa8\ub4c8', blank=True)),
                ('submissions_count', models.IntegerField(default=0)),
                ('accepted_count', models.IntegerField(default=0)),
            ],
            options={
                'permissions': (('read_problem', 'Can read problem always'), ('edit_problem', 'Can edit problem always')),
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ProblemRevision',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_on', models.DateTimeField(auto_now_add=True)),
                ('edit_summary', models.TextField(max_length=100, blank=True)),
                ('description', models.TextField(verbose_name='\uc124\uba85', blank=True)),
                ('input', models.TextField(verbose_name='\uc785\ub825 \uc124\uba85', blank=True)),
                ('output', models.TextField(verbose_name='\ucd9c\ub825 \uc124\uba85', blank=True)),
                ('sample_input', models.TextField(verbose_name='\uc608\uc81c \uc785\ub825', blank=True)),
                ('sample_output', models.TextField(verbose_name='\uc608\uc81c \ucd9c\ub825', blank=True)),
                ('note', models.TextField(verbose_name='\ub178\ud2b8', blank=True)),
                ('time_limit', models.PositiveIntegerField(default=10000, verbose_name='\uc2dc\uac04 \uc81c\ud55c (ms)')),
                ('memory_limit', models.PositiveIntegerField(default=65536, verbose_name='\uba54\ubaa8\ub9ac \uc81c\ud55c (kb)')),
                ('revision_for', models.ForeignKey(to='judge.Problem')),
                ('user', models.ForeignKey(verbose_name='\ud3b8\uc9d1\uc790', to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Solver',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('incorrect_tries', models.IntegerField(default=0)),
                ('solved', models.BooleanField(default=False, db_index=True)),
                ('when', models.DateTimeField(null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('submitted_on', models.DateTimeField(auto_now_add=True)),
                ('is_public', models.BooleanField(default=True)),
                ('language', models.TextField(max_length=100)),
                ('state', models.SmallIntegerField(default=0, db_index=True, choices=[(0, b'RECEIVED'), (1, b'COMPILING'), (2, b'RUNNING'), (3, b'JUDGING'), (4, b'COMPILE_ERROR'), (5, b'OK'), (6, b'ACCEPTED'), (7, b'WRONG_ANSWER'), (8, b'RUNTIME_ERROR'), (9, b'TIME_LIMIT_EXCEEDED'), (10, b'CANT_BE_JUDGED'), (11, b'REJUDGE_REQUESTED')])),
                ('length', models.IntegerField(db_index=True)),
                ('source', models.TextField()),
                ('message', models.TextField(default=b'', blank=True)),
                ('time', models.IntegerField(null=True, db_index=True)),
                ('memory', models.IntegerField(null=True)),
                ('problem', models.ForeignKey(to='judge.Problem')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='solver',
            name='fastest_submission',
            field=models.ForeignKey(related_name='+', to='judge.Submission', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='solver',
            name='problem',
            field=models.ForeignKey(to='judge.Problem'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='solver',
            name='shortest_submission',
            field=models.ForeignKey(related_name='+', to='judge.Submission', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='solver',
            name='user',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='problem',
            name='last_revision',
            field=models.ForeignKey(related_name='main', blank=True, to='judge.ProblemRevision', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='problem',
            name='user',
            field=models.ForeignKey(verbose_name='\uc791\uc131\uc790', to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='attachment',
            name='problem',
            field=models.ForeignKey(to='judge.Problem'),
            preserve_default=True,
        ),
    ]
