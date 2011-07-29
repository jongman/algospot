#!/usr/bin/python
import subprocess
import argparse
import resource
import signal

def get_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--input", default=None)
    parser.add_argument("-e", "--error", default=None)
    parser.add_argument("-o", "--output", default=None)
    parser.add_argument("command")
    return parser

def main():
    args = get_parser().parse_args()
    kwargs = {}
    if args.input: kwargs["stdin"] = open(args.input, "r")
    if args.error: kwargs["stderr"] = open(args.error, "w")
    if args.output: kwargs["stdout"] = open(args.output, "w")

    try:
        process = subprocess.Popen(args.command.split(), **kwargs)
        returncode = process.wait()
    except:
        print "RTE (popen failed, contact admin)"
        return
    if returncode > 0:
        print "RTE (nonzero return code)"
        return
    if returncode < 0:
        sgn = -returncode
        if sgn == signal.SIGABRT:
            print "RTE (SIGABRT: program aborted, probably assertion fail)"
        elif sgn == signal.SIGFPE:
            print "RTE (SIGFPE: floating point error, probably divide by zero)"
        elif sgn == signal.SIGSEGV:
            print ("RTE (SIGSEGV: segmentation fault, probably incorrect memory "
                   "access)")
        else:
            print "RTE Unknown signal %d" % sgn
        return
    usage = resource.getrusage(resource.RUSAGE_CHILDREN)
    print "OK %.4lf %d" % (usage.ru_utime + usage.ru_stime, usage.ru_maxrss)

if __name__ == "__main__":
    main()
