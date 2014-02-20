FROM algospot/common

# dependencies in APT
RUN apt-get update
RUN apt-get install -y python python-setuptools python-software-properties build-essential python-dev git-core

# dependencies from custom sources
RUN git clone --recursive https://github.com/beingryu/misaka.git /misaka
RUN cd /misaka && python setup.py install

# dependencies in PyPI
RUN easy_install pip
RUN pip install --allow-external pygooglechart --allow-unverified pygooglechart Django==1.4 Pygments==1.6 South==0.8.1 Whoosh==2.4.1 celery==3.0.21 celery-with-redis==3.0 django-appconf==0.6 django-attachments==0.3.1 django-avatar==1.0.5 django-celery==3.0.17 django-debug-toolbar==0.9.4 django-extensions==1.1.1 django-guardian==1.1.1 django-haystack==2.0.0 django-picklefield==0.3.0 django-registration==1.0 django-staticfiles==1.2.1 django-tagging==0.3.1 ipdb==0.7 ipython==0.13.2 pygooglechart==0.3.0 redis==2.7.6
RUN pip install uwsgi

# dependencies from PPA
RUN add-apt-repository -y ppa:nginx/stable
RUN apt-get update
RUN apt-get install -y nginx 

# add config file for nginx 
ADD nginx.conf /etc/nginx/nginx.conf

# set up uwsgi and nginx for 
ADD uwsgi.run /etc/service/uwsgi/run
ADD nginx.run /etc/service/nginx/run

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

