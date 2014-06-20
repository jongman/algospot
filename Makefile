init:
	git submodule update --init --recursive
	ln -sf www/algospot/local_settings.py.dev www/algospot/local_settings.py
	vagrant up
	vagrant reload

ssh:
	vagrant ssh

up:
	vagrant up

halt: 
	vagrant halt

# some django commands

runserver:
	vagrant ssh -c 'cd /vagrant/www; ./manage.py runserver 0.0.0.0:8000'

shell:
	vagrant ssh -c 'cd /vagrant/www; ./manage.py shell_plus'

dbshell:
	vagrant ssh -c 'cd /vagrant/www; ./manage.py dbshell'

# restart daemons

restart-celeryd:
	vagrant ssh -c 'sudo /etc/init.d/celeryd restart'

restart-uwsgi:
	vagrant ssh -c 'sudo service uwsgi restart'

restart-nginx:
	vagrant ssh -c 'sudo /etc/init.d/nginx restart'

.PHONY: up stop halt devserver

