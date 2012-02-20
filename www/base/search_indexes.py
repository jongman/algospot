import datetime
from haystack.indexes import SearchIndex, EdgeNgramField, DateTimeField
from haystack import site
from django.contrib.comments.models import Comment

class CommentIndex(SearchIndex):
    text = EdgeNgramField(document=True, model_attr='comment')
    date = DateTimeField(model_attr='submit_date')
    def index_queryset(self):
        return Comment.objects.filter(submit_date__lte=datetime.datetime.now())
    def get_updated_field(self):
        return 'submit_date'

site.register(Comment, CommentIndex)
