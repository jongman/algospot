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
        'name': 'codesprint2014',
        'start': datetime(2014, 5, 7, 10, 0, 0),
        'end': datetime(2014, 5, 31, 23, 59, 59),
        'image': '/static/images/banners/codesprint2014.png',
        'link': 'http://codesprint.skplanet.com/'
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
        'name': 'nos2014',
        'start': datetime(2014, 6, 2, 0, 0, 0),
        'end': datetime(2014, 6, 20, 23, 59, 59),
        'image': '/static/images/banners/nos.jpg',
        'link': 'https://www.nexonin.com/jsp/nos/info.detail.jsp',
    },
    {
        'name': 'jmbook',
        'start': datetime(2012, 11, 15, 0, 0, 0),
        'end': datetime(2013, 12, 31, 23, 59, 59),
        'image': '/static/images/banners/jmbook.png',
        'link': 'http://book.algospot.com/'
    },
    {
        'name': 'nexoncareer2014',
        'start': datetime(2014, 9, 1, 9, 0, 0, 0),
        'end': datetime(2014, 9, 22, 23, 59, 59),
        'image': '/static/images/banners/nexon2014.jpg',
        'link': 'https://career.nexon.com/'
    },
    {
        'name': 'nexonintern2014',
        'start': datetime(2014, 12, 1, 9, 0, 0, 0),
        'end': datetime(2014, 12, 22, 17, 0, 0),
        'image': '/static/images/banners/nexonintern2014winter.jpg',
        'link': 'https://www.nexonin.com/'
    },
    {
        'name': 'nexoncareer2015a',
        'start': datetime(2015, 3, 30, 9, 0, 0, 0),
        'end': datetime(2015, 4, 20, 17, 0, 0, 0),
        'image': '/static/images/banners/algospot_0325.jpg',
        'link': 'https://career.nexon.com/'
    },
    {
        'name': 'nexoncareer2015',
        'start': datetime(2015, 1, 26, 9, 0, 0, 0),
        'end': datetime(2015, 4, 25, 23, 59, 59),
        'image': '/static/images/banners/nexon2015.jpg',
        'link': 'https://career.nexon.com/'
    },
    {
        'name': 'nos7',
        'start': datetime(2015, 6, 1, 9, 0, 0, 0),
        'end': datetime(2015, 6, 19, 23, 59, 59),
        'image': '/static/images/banners/nos7.jpg',
        'link': 'https://www.nexonin.com/'
    },
    {
        'name': 'codesprint2015',
        'start': datetime(2015, 6, 24, 9, 0, 0, 0),
        'end': datetime(2015, 7, 24, 23, 59, 59),
        'image': '/static/images/banners/codesprint2015.jpg',
        'link': 'http://codesprint.skplanet.com/'
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


