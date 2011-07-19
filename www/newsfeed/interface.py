from models import Activity

def publish(key, category, type, **kwargs):
    new_activity = Activity.new(key=key, category=category, type=type, **kwargs)
    new_activity.save()
    return new_activity

def depublish(key):
    Activity.objects.filter(key=key).delete()
