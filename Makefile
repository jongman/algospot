devserver:
	vagrant ssh -c 'cd /vagrant/www; ./manage.py runserver 0.0.0.0:8000'

.PHONY: up stop halt devserver

