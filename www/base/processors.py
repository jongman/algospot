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
        'name': 'codesprint2013',
        'start': datetime(2013, 6, 18, 0, 0, 0),
        'end': datetime(2013, 7, 14, 0, 0, 0),
        'image': '/static/images/banners/codesprint2013.png',
        'link': 'http://codesprint.skplanet.com/'
    }
]

def select_campaign(request):
    campaign = None
    now = datetime.now()
    for c in CAMPAIGNS:
        if c['start'] <= now <= c['end']:
            campaign = c
            break
    return {'campaign': campaign}
    

