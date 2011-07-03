
# 알고스팟 개발 시작하기

## 필요한 도구들

* Python: 파이썬 2.6 이상을 사용한다. 안 써본 사람은 [파이썬 문서화](http://docs.python.org/) 페이지에서 튜토리얼 정도는 읽고 시작하자.
* Django: 장고는 파이썬에서 가장 유명한 웹 프레임워크. 안 써본 사람은 [장고 문서화](https://docs.djangoproject.com/en/1.3/) 페이지에서 튜토리얼 정도는 읽고 시작하자.
* [virtualenv](http://pypi.python.org/pypi/virtualenv), [virtualenvwrapper](http://www.doughellmann.com/projects/virtualenvwrapper/): 프로젝트 별로 파이썬 패키지를 관리할 수 있게 해주는 툴들. 밑에서 설명할꺼임.
* [pip](http://pypi.python.org/pypi/pip): 파이썬 패키지 인스톨러. 밑에서 설명할꺼임.
* [git](http://git-scm.com/): 버전 컨트롤. [이 책](http://progit.org/book/)의 첫 두 챕터를 읽으면 아쉬운 대로 쓰기 시작할 수 있다.

## 체크아웃에서 개발 서버 돌리기까지


1. 먼저 git repository 를 클론한다.

	$ git clone git://github.com/jongman/algospot.git
	$ cd algospot

1. 사이트에 필요한 각종 패키지들을 깔기 위해 easy\_install 을 깔고, easy\_install 로 pip 을 깐다. easy\_install 이랑 pip 은 둘다 파이썬 패키지 매니저인데, pip 이 더 최신이지만 아직 우분투 리포지토리에 안 들어가 있다. easy\_install 은 처음에 pip 까는 용도 빼고는 쓰지 않는다. `libjpeg-dev` 는 아바타 리사이즈 할 때 python imaging library 에서 쓰기 때문에 필요하다.

	$ sudo apt-get install python-setuptools libjpeg-dev  
	$ sudo easy_install pip

1. virtualenv 를 깐다. virtualenv 는 파이썬 패키지를 로컬 디렉토리에 깔 수 있게 해 주는 도구다. 시스템 전역에 깔지 않아도 되기 때문에 두 개 이상의 프로젝트의 dependency 가 충돌하거나 할 일이 없음. virtualenv 가 진리임. ㅇㅇ

	$ sudo pip install virtualenv virtualenvwrapper

1. `.bashrc` 에 virtualenvwrapper 설정을 넣고 셋업을 적용한다.

	$ echo export WORKON_HOME=~/.virtualenvs >> ~/.bashrc  
	$ echo source /usr/local/bin/virtualenvwrapper.sh >> ~/.bashrc  
	$ mkdir -p ~/.virtualenvs  
	$ source ~/.bashrc        

1. virtualenv 환경을 만들고 activate 한다.

	$ mkvirtualenv algospot-django

1. 환경을 만들면 자동으로 활성화되며, 그러면 프롬프트 앞에 환경 이름인 `(algospot-django)` 이 붙는다. 다른 쉘에서는 다음 커맨드를 치면 해당 virtualenv 를 사용할 수 있다.

	$ workon algospot-django

1. virtualenv 내에서 까는 모든 패키지는 `~/.virtualenvs/algospot-django` 디렉토리 내에 깔리게 되며, sudo 권한 없이도 깔 수 있다. algospot 사이트에 필요한 각종 파이썬 패키지는 requirements.txt 에 들어있다. pip 을 이용해 requirements 에 들어 있는 패키지들을 깐다. 이렇게 하면 django 랑 기타 장고 앱들을 다 깔아 준다.

	$ pip install -r requirements.txt

1. 일단 필요한건 다 깔았다 우왕ㅋ굳ㅋ 서버를 켜기 전에 디비 테이블들을 만든다. 만드는 과정에서 슈퍼유저를 만들라고 한다. 얌전히 만든다.

	$ cd www  
	$ ./manage.py syncdb

1. `syncdb` 를 하면 각종 외부 장고 앱의 테이블들을 만든다. 그 후 알고스팟 내에서 사용하는 테이블들을 만든다. 얘들은 개발 중 스키마가 바뀔 일이 많아서, 개발할 때 디비 스키마 변경을 도와주는 도구인 [south](http://south.aeracode.org/)를 쓰기 때문에 이와 같이 따로 해 줘야 한다.

	$ ./manage.py migrate 

1. 디비에 초기 데이터(메인 페이지)를 집어넣는다.

	$ ./manage.py loaddata wiki/fixtures/fixtures.json

1. 이제 멋있게 개발 서버를 켠다.

	$ ./manange.py runserver

1. 웹브라우저에서 [http://127.0.0.1:8000/wiki/read/Main_Page](http://127.0.0.1:8000/wiki/read/Main_Page)를 연다. 아직 메인 페이지가 없어서 위키로 들어가야 한다. -_-


