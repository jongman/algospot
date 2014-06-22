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
        'name': 'nexon_global_internship_2013late', 
        'start': datetime(2013, 9, 3, 10, 0, 0),
        'end': datetime(2013, 9, 24, 16, 59, 59),
        'image': '/static/images/banners/nexon-gi-2013-late.jpg',
        'link': 'https://career.nexon.com/',
    },
    {
        'name': 'codesprint2013',
        'start': datetime(2013, 6, 18, 0, 0, 0),
        'end': datetime(2013, 7, 19, 0, 0, 0),
        'image': '/static/images/banners/codesprint2013.png',
        'link': 'http://codesprint.skplanet.com/'
    },
    {
        'name': 'nexon_global_internship_2013late_2', 
        'start': datetime(2013, 12, 2, 9, 0, 0),
        'end': datetime(2013, 12, 23, 16, 59, 59),
        'image': '/static/images/banners/intern_algospot_186_287.jpg',
        'link': 'https://www.nexonin.com/',
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
    

