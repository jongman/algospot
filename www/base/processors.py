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
]

def select_campaign(request):
    campaign = None
    now = datetime.now()
    for c in CAMPAIGNS:
        if c['start'] <= now <= c['end']:
            campaign = c
            break
    return {'campaign': campaign}
    

