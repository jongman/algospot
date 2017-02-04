# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.provision "ansible" do |ansible|
    ansible.galaxy_role_file = "ansible/roles.txt"
	ansible.playbook = "ansible/dev.playbook"
	ansible.verbose = 'v'
  end

  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.network "forwarded_port", guest: 8000, host: 8000

  config.vm.provider "virtualbox" do |vb|
    vb.memory = 1024
  end
end
