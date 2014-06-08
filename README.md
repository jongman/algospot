
# 알고스팟 개발 시작하기

알고스팟은 수많은 패키지들과 서버들이 합쳐져 돌아가고 있다. 따라서 이들을 각각 개인 서버에 셋업해 개발하는 것보다는, 가상머신을 이용하고 가상머신을 쉽게 셋업해 줄 수 있는 도구를 이용하기로 하자. 알고스팟의 공식 개발 환경은 [vagrant](http://vagrantup.com)를 이용한다. vagrant는 VirtualBox, VMWare 등의 가상화 도구를 사용하기 커맨드 라인에서 사용하기 쉽게 포장해 둔 것이다.

Vagrant 위에서의 개발환경은 아직 준비중이며, 완벽하지 않다. (온라인 채점 서버는 아직 동작하지 않는다.)

## 필요한 도구들

* [Vagrant](http://vagrantup.com): 사용중인 운영체제 용을 다운받는다.
* [VirtualBox](https://www.virtualbox.org/): 가상 머신을 돌리기 위한 소프트웨어. VMWare, 리눅스의 경우 LXC를 이용해도 되지만 아직 확인해 보지 못했다.

## 체크아웃에서 개발 서버 돌리기까지


1. 먼저 git repository 를 클론한다.

	$ git clone git://github.com/jongman/algospot.git  
	$ cd algospot

1. 가상 머신을 띄운다. 이 명령어는 가상 머신 이미지를 다운받고, 필요한 패키지를 깔고, 데이터베이스와 기타 서버들을 셋업해 준다. 

	$ vagrant up

1. 가상 머신에 접속해 개발 서버를 띄운다.

	$ vagrant ssh
	$ cd /vagrant/www; ./manage.py runserver 0.0.0.0:8000

1. 웹브라우저에서 http://localhost:8000/ 을 연다.

## 커밋하기

프로젝트에 새 기능을 추가하거나 버그를 고치려면 다음과 같은 과정을 밟는다.

1. [프로젝트 홈페이지](https://github.com/jongman/algospot)의 오른쪽 위 Fork  버튼을 이용해서 프로젝트를 fork 한다. 그러면 algospot 프로젝트의 개인 복사본이 생긴다.
1. 위 과정을 거쳐 해당 프로젝트를 클론한다.
1. 로컬에서 적절히 수정한 뒤 개인 복사본 프로젝트로 클론한다.
1. 개인 프로젝트 홈페이지에서 Pull Request 를 통해 jongman 에게 Pull Request 를 보낸다.
1. jongman 이 해당 프로젝트를 가져와 머지한다.
1. -끗-

좀더 자세한 설명은 [github의 매뉴얼 페이지](http://help.github.com/send-pull-requests/)에서 볼 수 있다.

## Troubles

* error at /accounts/register/ ([Errno 111] Connection refused)  
  회원가입 시, 위와 같은 에러가 난다면 개발서버에 회원가입 인증메일 발송을 위한 SMTP 서버가 없기 때문이다. 아래와 같이 로컬에 임시 SMTP 서버를 띄우고, local_setting.py에 SMTP 서버 포트를 지정한다.
        ```
        $ python -m smtpd -n -c DebuggingServer localhost:1025
        ```

        // local_settings.py  
        ```
        settings.EMAIL_HOST = 'localhost' 
        settings.EMAIL_PORT = 1025
        ```

