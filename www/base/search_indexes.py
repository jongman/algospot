import datetime
from haystack import indexes
from django.contrib.comments.models import Comment

class CommentIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.EdgeNgramField(document=True, model_attr='comment')
    date = indexes.DateTimeField(model_attr='submit_date')

    def get_model(self):
        return Comment

    def index_queryset(self, using=None):
        return self.get_model().objects.filter(submit_date__lte=datetime.datetime.now())

    def get_updated_field(self):
        return 'submit_date'
