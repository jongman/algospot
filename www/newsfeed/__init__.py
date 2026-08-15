"""Lazy public interface that is safe during Django application discovery."""


def publish(*args, **kwargs):
    from newsfeed.interface import publish as actual_publish
    return actual_publish(*args, **kwargs)


def depublish(*args, **kwargs):
    from newsfeed.interface import depublish as actual_depublish
    return actual_depublish(*args, **kwargs)


def depublish_where(*args, **kwargs):
    from newsfeed.interface import depublish_where as actual_depublish_where
    return actual_depublish_where(*args, **kwargs)


def has_activity(*args, **kwargs):
    from newsfeed.interface import has_activity as actual_has_activity
    return actual_has_activity(*args, **kwargs)


def get_activity(*args, **kwargs):
    from newsfeed.interface import get_activity as actual_get_activity
    return actual_get_activity(*args, **kwargs)
