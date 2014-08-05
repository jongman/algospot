#!env python
import icalendar
import datetime
import pytz
import urllib2

CALENDARS = {
    '[CF] ': 'https://www.google.com/calendar/ical/br1o1n70iqgrrbc875vcehacjg%40group.calendar.google.com/public/basic.ics',
    '[TC] ': 'https://www.google.com/calendar/ical/appirio.com_bhga3musitat85mhdrng9035jg%40group.calendar.google.com/public/basic.ics',
    '[GCJ] ': 'https://www.google.com/calendar/ical/google.com_jqv7qt9iifsaj94cuknckrabd8%40group.calendar.google.com/public/basic.ics',
    '': 'https://www.google.com/calendar/ical/iqe3kkmf7vltagnjs7fd2sv4a8%40group.calendar.google.com/public/basic.ics'
}

merged = icalendar.Calendar()
merged.add('PRODID', '-//Algospot Calendar//algospot.com//EN')
merged.add('METHOD', 'PUBLISH')

thresh = datetime.date.today() + datetime.timedelta(days=-30)
def recent_enough(c):
    if 'DTSTART' not in c: return True
    dt_start = c['DTSTART'].dt
    if isinstance(dt_start, datetime.datetime):
        dt_start = dt_start.date()
    return dt_start >= thresh

for prefix, url in CALENDARS.items():
    ics = urllib2.urlopen(url).read()
    cal = icalendar.Calendar.from_ical(ics)
    for c in cal.subcomponents: 
        if recent_enough(c) and 'SUMMARY' in c:
            c['SUMMARY'] = prefix + c['SUMMARY']
            merged.add_component(c)

print merged.to_ical()
