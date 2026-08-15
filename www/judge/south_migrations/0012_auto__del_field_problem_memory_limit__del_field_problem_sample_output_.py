# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Deleting field 'Problem.memory_limit'
        db.delete_column('judge_problem', 'memory_limit')

        # Deleting field 'Problem.sample_output'
        db.delete_column('judge_problem', 'sample_output')

        # Deleting field 'Problem.description'
        db.delete_column('judge_problem', 'description')

        # Deleting field 'Problem.time_limit'
        db.delete_column('judge_problem', 'time_limit')

        # Deleting field 'Problem.sample_input'
        db.delete_column('judge_problem', 'sample_input')

        # Deleting field 'Problem.note'
        db.delete_column('judge_problem', 'note')

        # Deleting field 'Problem.updated_on'
        db.delete_column('judge_problem', 'updated_on')

        # Deleting field 'Problem.output'
        db.delete_column('judge_problem', 'output')

        # Deleting field 'Problem.input'
        db.delete_column('judge_problem', 'input')


    def backwards(self, orm):
        
        # Adding field 'Problem.memory_limit'
        db.add_column('judge_problem', 'memory_limit', self.gf('django.db.models.fields.PositiveIntegerField')(default=65536), keep_default=False)

        # Adding field 'Problem.sample_output'
        db.add_column('judge_problem', 'sample_output', self.gf('django.db.models.fields.TextField')(default='', blank=True), keep_default=False)

        # Adding field 'Problem.description'
        db.add_column('judge_problem', 'description', self.gf('django.db.models.fields.TextField')(default='', blank=True), keep_default=False)

        # Adding field 'Problem.time_limit'
        db.add_column('judge_problem', 'time_limit', self.gf('django.db.models.fields.PositiveIntegerField')(default=10000), keep_default=False)

        # Adding field 'Problem.sample_input'
        db.add_column('judge_problem', 'sample_input', self.gf('django.db.models.fields.TextField')(default='', blank=True), keep_default=False)

        # Adding field 'Problem.note'
        db.add_column('judge_problem', 'note', self.gf('django.db.models.fields.TextField')(default='', blank=True), keep_default=False)

        # Adding field 'Problem.updated_on'
        db.add_column('judge_problem', 'updated_on', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, default=datetime.datetime(2012, 7, 8, 16, 49, 30, 479650), blank=True), keep_default=False)

        # Adding field 'Problem.output'
        db.add_column('judge_problem', 'output', self.gf('django.db.models.fields.TextField')(default='', blank=True), keep_default=False)

        # Adding field 'Problem.input'
        db.add_column('judge_problem', 'input', self.gf('django.db.models.fields.TextField')(default='', blank=True), keep_default=False)


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
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'judge_module': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'last_revision': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'main'", 'null': 'True', 'to': "orm['judge.ProblemRevision']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100', 'db_index': 'True'}),
            'source': ('django.db.models.fields.CharField', [], {'db_index': 'True', 'max_length': '100', 'blank': 'True'}),
            'state': ('django.db.models.fields.SmallIntegerField', [], {'default': '0', 'db_index': 'True'}),
            'submissions_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
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
