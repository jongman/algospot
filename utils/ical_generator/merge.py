import icalendar
import sys
import datetime
import pytz

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

for fn in sys.argv[1:]:
    cal = icalendar.Calendar.from_ical(open(fn).read())
    for c in cal.subcomponents: 
        if recent_enough(c):
            merged.add_component(c)

print merged.to_ical()
