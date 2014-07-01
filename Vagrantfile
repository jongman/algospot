# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.provision "ansible" do |ansible|
	ansible.playbook = "ansible/dev.playbook"
	ansible.verbose = 'v'
  end

  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.network "forwarded_port", guest: 8000, host: 8000

  # 메모리 1GB를 사용한다. scala 등의 메모리를 많이 사용하는 컴파일러를 쓰려면 uncomment할 것.
  # config.vm.provider "virtualbox" do |vb|
  #  vb.memory = 1024
  # end
end
