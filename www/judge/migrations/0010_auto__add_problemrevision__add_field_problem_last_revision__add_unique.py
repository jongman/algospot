# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'ProblemRevision'
        db.create_table('judge_problemrevision', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('revision_for', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['judge.Problem'])),
            ('created_on', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('edit_summary', self.gf('django.db.models.fields.TextField')(max_length=100)),
            ('description', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('input', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('output', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('sample_input', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('sample_output', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('note', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('time_limit', self.gf('django.db.models.fields.PositiveIntegerField')(default=10000)),
            ('memory_limit', self.gf('django.db.models.fields.PositiveIntegerField')(default=65536)),
        ))
        db.send_create_signal('judge', ['ProblemRevision'])

        # Adding field 'Problem.last_revision'
        db.add_column('judge_problem', 'last_revision', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='main', null=True, to=orm['judge.ProblemRevision']), keep_default=False)

        # Adding unique constraint on 'Problem', fields ['slug']
        db.create_unique('judge_problem', ['slug'])


    def backwards(self, orm):
        
        # Removing unique constraint on 'Problem', fields ['slug']
        db.delete_unique('judge_problem', ['slug'])

        # Deleting model 'ProblemRevision'
        db.delete_table('judge_problemrevision')

        # Deleting field 'Problem.last_revision'
        db.delete_column('judge_problem', 'last_revision_id')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'judge.attachment': {
            'Meta': {'object_name': 'Attachment'},
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '1024'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'problem': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['judge.Problem']"})
        },
        'judge.problem': {
            'Meta': {'object_name': 'Problem'},
            'accepted_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'input': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'judge_module': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'last_revision': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'main'", 'null': 'True', 'to': "orm['judge.ProblemRevision']"}),
            'memory_limit': ('django.db.models.fields.PositiveIntegerField', [], {'default': '65536'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'output': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'sample_input': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'sample_output': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100', 'db_index': 'True'}),
            'source': ('django.db.models.fields.CharField', [], {'db_index': 'True', 'max_length': '100', 'blank': 'True'}),
            'state': ('django.db.models.fields.SmallIntegerField', [], {'default': '0', 'db_index': 'True'}),
            'submissions_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'time_limit': ('django.db.models.fields.PositiveIntegerField', [], {'default': '10000'}),
            'updated_on': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'judge.problemrevision': {
            'Meta': {'object_name': 'ProblemRevision'},
            'created_on': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'edit_summary': ('django.db.models.fields.TextField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'input': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'memory_limit': ('django.db.models.fields.PositiveIntegerField', [], {'default': '65536'}),
            'note': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'output': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'revision_for': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['judge.Problem']"}),
            'sample_input': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'sample_output': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'time_limit': ('django.db.models.fields.PositiveIntegerField', [], {'default': '10000'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'judge.solver': {
            'Meta': {'object_name': 'Solver'},
            'fastest_submission': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'null': 'True', 'to': "orm['judge.Submission']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'incorrect_tries': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'problem': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['judge.Problem']"}),
            'shortest_submission': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'null': 'True', 'to': "orm['judge.Submission']"}),
            'solved': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'db_index': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'when': ('django.db.models.fields.DateTimeField', [], {'null': 'True'})
        },
        'judge.submission': {
            'Meta': {'object_name': 'Submission'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_public': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'language': ('django.db.models.fields.TextField', [], {'max_length': '100'}),
            'length': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'}),
            'memory': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'message': ('django.db.models.fields.TextField', [], {'default': "''", 'blank': 'True'}),
            'problem': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['judge.Problem']"}),
            'source': ('django.db.models.fields.TextField', [], {}),
            'state': ('django.db.models.fields.SmallIntegerField', [], {'default': '0', 'db_index': 'True'}),
            'submitted_on': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'time': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'db_index': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        }
    }

    complete_apps = ['judge']
