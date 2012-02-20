import datetime
from haystack.indexes import SearchIndex, EdgeNgramField, DateTimeField
from haystack import site
from models import Page

class PageIndex(SearchIndex):
    text = EdgeNgramField(document=True, use_template=True)
    date = DateTimeField(model_attr='modified_on')
    def get_updated_field(self):
        return 'modified_on'
    def index_queryset(self):
        return Page.objects.filter(modified_on__lte=datetime.datetime.now())

site.register(Page, PageIndex)
