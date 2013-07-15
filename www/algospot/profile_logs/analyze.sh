FILE=$1
OUT=$FILE.cachegrind
if [ ! -f $OUT ]; then
	hotshot2calltree -o $OUT $FILE
fi
kcachegrind $OUT

