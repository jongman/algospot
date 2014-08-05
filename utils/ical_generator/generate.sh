#!/bin/bash
set -o errexit
rm -f topcoder.ics codeforces.ics
wget "https://www.google.com/calendar/ical/br1o1n70iqgrrbc875vcehacjg%40group.calendar.google.com/public/basic.ics" -O codeforces.ics
wget "https://www.google.com/calendar/ical/appirio.com_bhga3musitat85mhdrng9035jg%40group.calendar.google.com/public/basic.ics" -O topcoder.ics
python merge.py codeforces.ics topcoder.ics > merged.ics
cp merged.ics /algospot/www_static/
