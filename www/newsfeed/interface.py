from models import Activity

def publish(key, category, type, **kwargs):
    new_activity = Activity.new(key=key, category=category, type=type, **kwargs)
    new_activity.save()
    return new_activity

def depublish(key):
    Activity.objects.filter(key=key).delete()

def depublish_where(**kwargs):
    Activity.delete_all(**kwargs)

def has_activity(**kwargs):
    return Activity.objects.filter(**Activity.translate(kwargs)).count() > 0

def get_activity(**kwargs):
    return Activity.objects.get(**Activity.translate(kwargs))
