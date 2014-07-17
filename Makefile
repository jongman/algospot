default: up

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

celeryd-console:
	vagrant ssh -c 'cd /vagrant/www; sudo ./manage.py celeryd'

dbshell:
	vagrant ssh -c 'cd /vagrant/www; ./manage.py dbshell'

collectstatic:
	vagrant ssh -c 'cd /vagrant/www; ./manage.py collectstatic --noinput'

# restart daemons

restart-celeryd:
	vagrant ssh -c 'sudo /etc/init.d/celeryd restart'

stop-celeryd: 
	vagrant ssh -c 'sudo /etc/init.d/celeryd stop'

start-celeryd: 
	vagrant ssh -c 'sudo /etc/init.d/celeryd start'

restart-uwsgi:
	vagrant ssh -c 'sudo service uwsgi restart'

restart-nginx:
	vagrant ssh -c 'sudo /etc/init.d/nginx restart'

.PHONY: default up stop halt devserver
