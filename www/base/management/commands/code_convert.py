import re
from django.core.management.base import NoArgsCommand
from django.contrib.comments.models import Comment
from django.db.models.signals import post_save
from judge.models import Problem
from wiki.models import PageRevision
from forum.models import Post

class Command(NoArgsCommand):
    pattern = re.compile(r'<code lang=([^>]+)>(.+?)</code>', re.DOTALL)
    def replace(self, match):
        lang = match.group(1).strip('"\'')
        code = match.group(2).replace("\t", "  ")
        print u'#', 
        return u'~~~ %s\n%s\n~~~' % (lang, code)

    def handle(self, **options):
        post_save.disconnect(sender=PageRevision, dispatch_uid="wiki_edit_event")
        post_save.disconnect(sender=Comment, dispatch_uid="comment_event")
        post_save.disconnect(sender=Problem, dispatch_uid="saved_problem")
        post_save.disconnect(sender=Post, dispatch_uid="forum_post_event")

        print u'Posts...', 
        for x in Post.objects.all():
        	x.text = self.pattern.sub(self.replace, x.text)
        	x.save()
        print u'\nPageRevisions...', 
        for x in PageRevision.objects.all():
        	x.text = self.pattern.sub(self.replace, x.text)
        	x.save()
        print u'\nProblems...', 
        for x in Problem.objects.all():
        	x.description = self.pattern.sub(self.replace, x.description)
        	x.input = self.pattern.sub(self.replace, x.input)
        	x.output = self.pattern.sub(self.replace, x.output)
        	x.note = self.pattern.sub(self.replace, x.note)
        	x.save()
        print u'\nComments...', 
        for x in Comment.objects.all():
        	x.comment = self.pattern.sub(self.replace, x.comment)
        	x.save()
        print u'\nDone!'

