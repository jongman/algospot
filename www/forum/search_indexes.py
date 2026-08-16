import datetime
from haystack import indexes
from .models import Post
from .utils import get_posts_for_user
from django.conf import settings
from django.contrib.auth.models import User

class PostIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.EdgeNgramField(document=True, use_template=True)
    user = indexes.CharField(model_attr='user')
    date = indexes.DateTimeField(model_attr='created_on')
    def get_model(self):
        return Post

    def index_queryset(self, using=None):
        # Haystack discovers index classes during Django startup. Avoid a
        # database query until an index operation is actually requested.
        anonymous = User.objects.get(pk=settings.ANONYMOUS_USER_ID)
        return get_posts_for_user(
            anonymous, 'forum.read_post').filter(
                created_on__lte=datetime.datetime.now())

    def get_updated_field(self):
        return 'modified_on'
