import datetime
from haystack import indexes
from models import Post
from utils import get_posts_for_user
from guardian.conf import settings
from django.contrib.auth.models import User

class PostIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.EdgeNgramField(document=True, use_template=True)
    user = indexes.CharField(model_attr='user')
    date = indexes.DateTimeField(model_attr='created_on')
    anonymous = User.objects.get(pk=settings.ANONYMOUS_USER_ID)

    def get_model(self):
        return Post

    def index_queryset(self, using=None):
        return get_posts_for_user(self.anonymous, 'forum.read_post').filter(created_on__lte=datetime.datetime.now())

    def get_updated_field(self):
        return 'modified_on'
