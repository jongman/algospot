from models import Activity

def publish(key, category, **kwargs):
    new_activity = Activity(key=key, category=category, **kwargs)
    new_activity.save()
    return new_activity

def depublish(key):
    Activity.objects.filter(key=key).delete()
