import datetime
from haystack import indexes
from models import Post

class PostIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.EdgeNgramField(document=True, use_template=True)
    user = indexes.CharField(model_attr='user')
    date = indexes.DateTimeField(model_attr='created_on')

    def get_model(self):
        return Post

    def index_queryset(self, using=None):
        return self.get_model().objects.filter(created_on__lte=datetime.datetime.now())

    def get_updated_field(self):
        return 'modified_on'
