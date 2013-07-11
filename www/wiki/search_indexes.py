import datetime
from haystack import indexes
from models import Page

class PageIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.EdgeNgramField(document=True, use_template=True)
    date = indexes.DateTimeField(model_attr='modified_on')

    def get_model(self):
        return Page

    def index_queryset(self, using=None):
        return self.get_model().objects.filter(modified_on__lte=datetime.datetime.now())
