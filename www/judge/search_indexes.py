from haystack.indexes import SearchIndex, EdgeNgramField, DateTimeField
from haystack import site
from models import Problem

class ProblemIndex(SearchIndex):
    text = EdgeNgramField(document=True, use_template=True)
    date = DateTimeField(model_attr='updated_on')
    def index_queryset(self):
        return Problem.objects.filter(state=Problem.PUBLISHED)
    def get_updated_field(self):
        return 'updated_on'

site.register(Problem, ProblemIndex)
