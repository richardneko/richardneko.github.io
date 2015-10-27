#!/usr/bin/env python
import os;

print "Content-type: text/html\n\n"
print "Power off...\n"

os.system("sudo shutdown -h now");

