import datetime
from haystack.indexes import SearchIndex, CharField, EdgeNgramField, DateTimeField
from haystack import site
from models import Post

class PostIndex(SearchIndex):
    text = EdgeNgramField(document=True, use_template=True)
    user = CharField(model_attr='user')
    date = DateTimeField(model_attr='created_on')
    def index_queryset(self):
        return Post.objects.filter(created_on__lte=datetime.datetime.now())
    def get_updated_field(self):
        return 'modified_on'

site.register(Post, PostIndex)
