FROM python:3
WORKDIR /usr/src/app

# elasticsearch  web
EXPOSE 9200

COPY requirements.txt ./
RUN pip install -r requirements.txt

ADD . /usr/src/app
CMD gunicorn -w 2 -b :5000 app:app
