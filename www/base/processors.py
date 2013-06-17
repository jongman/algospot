from datetime import datetime

CAMPAIGNS = [
    {
        'name': 'techplanet', 
        'start': datetime(2012, 10, 8, 9, 0, 0),
        'end': datetime(2012, 10, 25, 23, 59, 59),
        'image': '/static/images/banners/techplanet.jpg',
        'link': 'http://www.techplanet.kr/'
    },
    {
        'name': 'codesprint', 
        'start': datetime(2012, 10, 8, 9, 0, 0),
        'end': datetime(2012, 11, 4, 23, 59, 59),
        'image': '/static/images/banners/codesprint.gif',
        'link': 'http://www.codesprint.kr/'
    },
    {
        'name': 'nexon_global_internship', 
        'start': datetime(2012, 12, 4, 0, 0, 0),
        'end': datetime(2012, 12, 25, 23, 59, 59),
        'image': '/static/images/banners/nexon-gi.jpg',
        'link': 'http://www.nexonin.com/'
    },
    {
        'name': 'jmbook', 
        'start': datetime(2012, 11, 15, 0, 0, 0),
        'end': datetime(2013, 12, 31, 23, 59, 59),
        'image': '/static/images/banners/jmbook.png',
        'link': 'http://book.algospot.com/'
    },
]

def select_campaign(request):
    campaign = None
    now = datetime.now()
    for c in CAMPAIGNS:
        if c['start'] <= now <= c['end']:
            campaign = c
            break
    return {'campaign': campaign}
    

