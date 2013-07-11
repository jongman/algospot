from haystack import indexes
from models import Problem

class ProblemIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.EdgeNgramField(document=True, use_template=True)
    date = indexes.DateTimeField(model_attr='updated_on')

    def get_model(self):
        return Problem

    def index_queryset(self, using=None):
        return self.get_model().objects.filter(state=Problem.PUBLISHED)

    def get_updated_field(self):
        return None
