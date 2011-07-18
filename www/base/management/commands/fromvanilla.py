# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.comments.models import Comment
from django.contrib.contenttypes.models import ContentType
from forum.models import Post, Category
from judge.models import Problem, Submission, Attachment
from djangoutils import get_or_none
from actstream.models import Action
import MySQLdb
import hashlib
import shutil
import os

def fetch_all(db, table, **where):
    c = db.cursor()
    where_clause = ""
    if where:
        where_clause = "WHERE " + " AND ".join(["%s=%s" % it for it in
            where.items()])
    c.execute("SELECT * FROM %s %s;" % (table, where_clause))
    return c.fetchall()

# god.. forgive me
def patch_action_time(timestamp, **kwargs):
    criteria = {}
    for k, v in kwargs.items():
        criteria[k + "_content_type"] = ContentType.objects.get_for_model(v.__class__)
        criteria[k + "_object_id"] = v.id
    action = Action.objects.get(**criteria)
    action.timestamp = timestamp
    action.save()

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
        category_id_map[cat["CategoryID"]] = (Category.objects.get(slug=slug),
                cat["UrlCode"])

    copied_posts, copied_comments = 0, 0
    for thread in fetch_all(db, "GDN_Discussion"):
        if thread["CategoryID"] not in category_id_map: continue
        cat, urlcode = category_id_map.get(thread["CategoryID"])
        new_post = Post(pk=thread["DiscussionID"],
                category=cat,
                title=(thread["Name"] if CATEGORY_MAP[urlcode] != "old"
                    else ("[%s] " % urlcode) + thread["Name"]),
                user=User.objects.get(pk=thread["InsertUserID"]),
                created_on=thread["DateInserted"],
                text=thread["Body"])
        new_post.save()
        new_post.created_on = thread["DateInserted"]
        new_post.save()
        patch_action_time(thread["DateInserted"], action_object=new_post)

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
            patch_action_time(comment["DateInserted"],
                    action_object=new_comment,
                    target=new_post)
            copied_comments += 1
        copied_posts += 1
        if copied_posts % 10 == 0:
            print "%d posts. %d comments." % (copied_posts, copied_comments)

    print "%d posts. %d comments." % (copied_posts, copied_comments)

def migrate_problems(db):
    PROBLEM_MAPPING = {
        "No": "id",
        "ID": "slug",
        "Updated": "updated_on",
        "State": "state",
        "Source": "source",
        "Name": "name",
        "Description": "description",
        "Input": "input",
        "Output": "output",
        "SampleInput": "sample_input",
        "SampleOutput": "sample_output",
        "Note": "note",
        "JudgeModule": "judge_module",
        "TimeLimit": "time_limit",
        "MemoryLimit": "memory_limit",
        "Accepted": "accepted_count",
        "Submissions": "submissions_count",
    }
    imported = 0
    for problem in fetch_all(db, "GDN_Problem", State=3):
        kwargs = {}
        kwargs["user"] = User.objects.get(id=problem["Author"])
        for k, v in PROBLEM_MAPPING.items():
            kwargs[v] = problem[k]
        new_problem = Problem(**kwargs)
        new_problem.save()
        imported += 1
    print "imported %d problems." % imported

def migrate_submissions(db):
    SUBMISSION_MAPPING = {
            "No": "id",
            "Submitted": "submitted_on",
            "IsPublic": "is_public",
            "Language": "language",
            "State": "state",
            "Length": "length",
            "Source": "source",
            "Message": "message",
            "Time": "time",
            "Memory": "memory"}
    imported = 0
    submissions = fetch_all(db, "GDN_Submission")
    for submission in submissions:
        kwargs = {}
        kwargs["problem"] = Problem.objects.get(id=submission["Problem"])
        kwargs["user"] = User.objects.get(id=submission["Author"])
        for k, v in SUBMISSION_MAPPING.items():
            kwargs[v] = submission[k]
        new_submission = Submission(**kwargs)
        new_submission.save()
        new_submission.submitted_on = submission["Submitted"]
        new_submission.save()
        imported += 1
        if imported % 100 == 0:
            print "Migrated %d of %d submissions." % (imported,
                    len(submissions))
    print "Migrated %d submissions." % imported

def md5file(file_path):
    md5 = hashlib.md5()
    md5.update(open(file_path, "rb").read())
    return md5.hexdigest()

def migrate_attachments(db, upload):
    attachments = fetch_all(db, "GDN_Attachment")
    for attachment in attachments:
        origin = os.path.join(upload, attachment["Path"])
        md5 = md5file(origin)
        target_path = os.path.join("judge-attachments",
                                   md5, attachment["Name"])
        copy_to = os.path.join(settings.MEDIA_ROOT, target_path)
        try:
            os.makedirs(os.path.dirname(copy_to))
        except:
            pass
        shutil.copy(origin, copy_to)
        problem = get_or_none(Problem, id=attachment["Problem"])
        if not problem: continue
        new_attachment = Attachment(problem=problem,
                                    id=attachment["No"], file=target_path)
        new_attachment.save()

def migrate_judge(db, upload):
    #migrate_problems(db)
    #migrate_submissions(db)
    migrate_attachments(db, upload)

class Command(BaseCommand):
    args = '<mysql host> <mysql user> <mysql password> <mysql db> <uploaded> [app]'
    help = 'Migrate data over from Vanilla\'s CSV dump'

    def handle(self, *args, **options):
        host, user, password, db, upload = args[:5]
        db = MySQLdb.connect(host=host, user=user, passwd=password, db=db,
                cursorclass=MySQLdb.cursors.DictCursor)
        app = "all" if len(args) == 5 else args[5]
        if app in ["all", "user"]:
            migrate_user(db)
        if app in ["all", "forum"]:
            migrate_forum(db)
        if app in ["all", "judge"]:
            migrate_judge(db, upload)
