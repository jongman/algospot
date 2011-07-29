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
    except Exception as e:
        print "RTE (popen failed, contact admin. exception: %s)" % str(e)
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
        elif sgn == signal.SIGKILL:
            print ("RTE (SIGKILL: program was forcefully killed, probably "
                   "memory limit exceeded)")
        else:
            name = str(sgn)
            for entry in dir(signal):
                if entry.startswith("SIG"):
                    if getattr(signal, entry) == sgn:
                        name = entry
                        break
            print "RTE (Unknown signal %s)" % name
        return
    usage = resource.getrusage(resource.RUSAGE_CHILDREN)
    print "OK %.4lf %d" % (usage.ru_utime + usage.ru_stime, usage.ru_maxrss)

if __name__ == "__main__":
    main()
