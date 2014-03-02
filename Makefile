SSH=ssh -i docker/common/ssh_key -o StrictHostKeyChecking=no
SCP=scp -i docker/common/ssh_key -o StrictHostKeyChecking=no

docker-images: docker/web_image_id docker/db_image_id

# generate a random ssh key to connect to all docker instances
docker/common/ssh_key:
	echo Creating SSH keys for connecting to docker instance:
	ssh-keygen -t rsa -f $@ -N ''

# generate a random password for postgresql user
docker/db/password:
	echo Generating a random password for db server.
	tr -cd '[:alnum:]' < /dev/urandom | fold -w30 | head -n1 > $@

# parent image for the rest of algospot images
docker/common_image_id: docker/common/* docker/common/ssh_key
	docker build -t algospot/common -q docker/common | grep Successfully | awk '{ print $$3 }' > $@

docker/web_image_id: docker/common_image_id docker/web/*
	docker build -t algospot/web -q docker/web | grep Successfully | awk '{ print $$3 }' > $@

docker/db_image_id: docker/common_image_id docker/db/password docker/db/*
	# create a new data container
	docker run -v /var/lib/postgresql -v /var/log/postgresql -v /etc/postgresql busybox true > docker/data_image_id
	# we cannot use data volumes in dockerfiles; so spin up a new container, make changes through ssh, and commit
	# the resulting container as the final image.
	docker run -d -volumes-from=`cat docker/data_image_id` algospot/common > docker/tmp_container_id
	# get IP ADDR
	docker inspect `cat docker/tmp_container_id` | grep IPAddress | awk -F'"' ' { print $$4 }' > docker/tmp_container_ipaddr
	# wait until sshd is ready
	sleep 3
	# inject a script for setting up container
	$(SCP) docker/db/setup_postgres.sh root@`cat docker/tmp_container_ipaddr`:/setup_postgres.sh
	$(SCP) docker/db/password root@`cat docker/tmp_container_ipaddr`:/password
	# setup!
	$(SSH) root@`cat docker/tmp_container_ipaddr` sh /setup_postgres.sh
	docker commit `cat docker/tmp_container_id` algospot/db > docker/db_image_id
	# get rid of that image now
	docker stop `cat docker/tmp_container_id`
	docker rm `cat docker/tmp_container_id`

start-db: docker/db_image_id
	docker run -d -p 6379 -p 5432 -volumes-from=`cat docker/data_image_id` algospot/db /sbin/my_init

stop-db: docker/web_image_id
	docker ps | grep algospot/db | awk '{print $$1}' | xargs -n 1 docker stop

interactive-db: docker/db_image_id
	docker run -i -t -p 5432 -volumes-from=`cat docker/data_image_id` algospot/db bash

ssh-db:
	docker inspect `docker ps | grep algospot/db | awk '{print $$1}'` | grep IPAddress | awk -F'"' '{ print $$4 }' | head -n 1 > docker/db_container_ipaddr
	ssh -i docker/common/ssh_key root@`cat docker/db_container_ipaddr`

start-web: docker/web_image_id
	docker run -d -p 8080:80 -v `pwd`/www:/www:ro algospot/web /sbin/my_init 

interactive-web: docker/web_image_id
	docker run -rm -i -t -p 8080:80 -v `pwd`/www:/www:ro algospot/web bash

stop-web: docker/web_image_id
	docker ps | grep algospot/web | awk '{print $$1}' | xargs -n 1 docker stop

stop-all:
	docker ps | grep -v CONTAINER | awk '{ print $$1}' | xargs -n 1 docker stop	

ssh-web: 
	docker inspect `docker ps | grep algospot/web | awk '{print $$1}'` | grep IPAddress | awk -F'"' '{ print $$4 }' > docker/web_container_ipaddr
	ssh -i docker/common/ssh_key root@`cat docker/web_container_ipaddr`

start: start-web
	

compile-all:
	python -mcompileall www/
