# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.urlresolvers import reverse
from actstream.models import Action
from config import ITEMS_PER_PAGE, PAGINATOR_RANGE

def stream(request, page="1"):
    actions = Action.objects.order_by("-id")
    paginator = Paginator(actions, ITEMS_PER_PAGE)
    try:
        page = paginator.page(page)
    except PageNotAnInteger:
        page = paginator.page(1)
    except EmptyPage:
        page = paginator.page(paginator.num_pages)
    breadcrumbs = [(reverse("newsfeed"), u"뉴스 피드")]
    page_lo = max(1, page.number - PAGINATOR_RANGE)
    page_hi = min(paginator.num_pages, page.number + PAGINATOR_RANGE)
    return render(request, "newsfeed.html", {"breadcrumbs": breadcrumbs,
        "page": page, "page_lo": page_lo, 
        "page_hi": page_hi, "page_nav_range": range(page_lo, page_hi+1)})
