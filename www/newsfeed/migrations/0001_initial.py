# -*- coding: utf-8 -*-


from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contenttypes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('key', models.CharField(unique=True, max_length=255, db_index=True)),
                ('category', models.CharField(max_length=64, db_index=True)),
                ('type', models.CharField(max_length=64)),
                ('verb', models.CharField(max_length=255)),
                ('admin_only', models.BooleanField(default=False)),
                ('target_object_id', models.PositiveIntegerField(null=True, blank=True)),
                ('action_object_object_id', models.PositiveIntegerField(null=True, blank=True)),
                ('timestamp', models.DateTimeField(db_index=True)),
                ('action_object_content_type', models.ForeignKey(
                    related_name='action_object_content_type', blank=True,
                    to='contenttypes.ContentType', null=True,
                    on_delete=models.SET_NULL)),
                ('actor', models.ForeignKey(
                    related_name='actor', to=settings.AUTH_USER_MODEL,
                    null=True, on_delete=models.SET_NULL)),
                ('target_content_type', models.ForeignKey(
                    related_name='target_content_type', blank=True,
                    to='contenttypes.ContentType', null=True,
                    on_delete=models.SET_NULL)),
            ],
            options={
                'permissions': (('read_activity', 'Can read this activity'),),
            },
            bases=(models.Model,),
        ),
    ]
