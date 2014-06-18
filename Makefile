init:
	git submodule update --init --recursive
	vagrant up
	vagrant reload

ssh:
	vagrant ssh

up:
	vagrant up

halt: 
	vagrant halt

devserver:
	vagrant ssh -c 'cd /vagrant/www; ./manage.py runserver 0.0.0.0:8000'

.PHONY: up stop halt devserver

