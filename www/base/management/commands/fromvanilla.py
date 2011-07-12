# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.comments.models import Comment
from django.contrib.contenttypes.models import ContentType
from forum.models import Post, Category
import MySQLdb

def fetch_all(db, table, **where):
    c = db.cursor()
    where_clause = ""
    if where:
        where_clause = "WHERE " + " AND ".join(["%s=%s" % it for it in
            where.items()])
    c.execute("SELECT * FROM %s %s;" % (table, where_clause))
    return c.fetchall()

def migrate_user(db):
    username_seen = set()
    created = 0
    for u in fetch_all(db, "GDN_User"):
        if u["Name"] in username_seen:
            print "%s is a duplicate" % u["Name"]
            continue
        if u["Deleted"] == "1": continue
        pw = (u["Password"] 
                if u["HashMethod"] != "Vanilla" 
                else "sha1$deadbeef$" + u["Password"].replace("$", "_"))
        new_user = User(id=u["UserID"],
                username = u["Name"],
                date_joined=u["DateInserted"],
                email=u["Email"],
                is_active=True,
                last_login=u["DateLastActive"] or u["DateInserted"],
                password=pw,
                is_superuser=(u["Admin"] == "1"))
        new_user.save()
        created += 1
        if created % 10 == 0:
            print "created %d users so far" % created
        username_seen.add(u["Name"])
    print "created %d users." % created

CATEGORY_MAP = {"freeboard": "free",
        "qna": "qna",
        "openlecture": "old",
        "contest": "old",
        "algospot_contest": "old",
        "editorial": "old",
        "aoj_board": "qna",
        "news": "news"
        }

def migrate_forum(db):
    category_id_map = {}
    for cat in fetch_all(db, "GDN_Category"):
        slug = CATEGORY_MAP.get(cat["UrlCode"], None)
        if not slug: continue
        category_id_map[cat["CategoryID"]] = Category.objects.get(slug=slug)

    copied_posts, copied_comments = 0, 0
    for thread in fetch_all(db, "GDN_Discussion"):
        cat = category_id_map.get(thread["CategoryID"])
        if not cat: continue
        new_post = Post(pk=thread["DiscussionID"],
                category=cat,
                title=thread["Name"],
                user=User.objects.get(pk=thread["InsertUserID"]),
                created_on=thread["DateInserted"],
                text=thread["Body"])
        new_post.save()

        comments = fetch_all(db, "GDN_Comment",
                DiscussionID=thread["DiscussionID"])
        for comment in comments:
            user = User.objects.get(pk=comment["InsertUserID"])
            new_comment = Comment(
                    user=user,
                    content_type=ContentType.objects.get_for_model(Post),
                    object_pk=new_post.pk,
                    comment=comment["Body"],
                    site_id=settings.SITE_ID,
                    submit_date=comment["DateInserted"])
            new_comment.save()
            copied_comments += 1
        copied_posts += 1
        if copied_posts % 10 == 0:
            print "%d posts. %d comments." % (copied_posts, copied_comments)

    print "%d posts. %d comments." % (copied_posts, copied_comments)


class Command(BaseCommand):
    args = '<mysql host> <mysql user> <mysql password> <mysql db> [app]'
    help = 'Migrate data over from Vanilla\'s CSV dump'

    def handle(self, *args, **options):
        host, user, password, db = args[:4]
        db = MySQLdb.connect(host=host, user=user, passwd=password, db=db,
                cursorclass=MySQLdb.cursors.DictCursor)
        app = "all" if len(args) == 4 else args[4]
        if app in ["all", "user"]:
            migrate_user(db)
        if app in ["all", "forum"]:
            migrate_forum(db)
