docker-images: docker/web_image_id

# generate a random ssh key to connect to all docker instances
docker/common/ssh_key:
	echo Creating SSH keys for connecting to docker instance:
	ssh-keygen -t rsa -f $@ -N ''

# parent image for the rest of algospot images
docker/common_image_id: docker/common/* docker/common/ssh_key
	docker build -t algospot/common -q docker/common | grep Successfully | awk '{ print $3 }' > $@
	touch $@

docker/web_image_id: docker/common_image_id docker/web/*
	docker build -t algospot/web -q docker/web | grep Successfully | awk '{ print $3 }' > $@
	touch $@

start-web: docker/web_image_id
	docker run -d -p 8080:80 -v `pwd`/www:/www:ro algospot/web /sbin/my_init 

interactive-web: docker/web_image_id
	docker run -i -t -p 8080:80 -v `pwd`/www:/www:ro algospot/web bash

stop-web: docker/web_image_id
	docker stop `docker ps | grep algospot/web | awk '{print $$1}'`

ssh-web: 
	docker inspect `docker ps | grep algospot/web | awk '{print $$1}'` | grep IPAddress | awk -F'"' '{ print $$4 }' > docker/web_container_ipaddr
	ssh -i docker/common/ssh_key root@`cat docker/web_container_ipaddr`

start: start-web
	

compile-all:
	python -mcompileall www/
