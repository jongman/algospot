# Dockerfile for building web docker image: nginx + uwsgi

# BELOW COMING FROM docker-baseimage's documentation
# ##################################################

FROM phusion/baseimage:0.9.6
ENV HOME /root
RUN /etc/my_init.d/00_regen_ssh_host_keys.sh
CMD /sbin/my_init

# BELOW ARE SETUP FOR ALGOSPOT
# ############################

# add SSH key
ADD ssh_key.pub /tmp/my_key
RUN cat /tmp/my_key >> /root/.ssh/authorized_keys && rm -f /tmp/my_key

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
