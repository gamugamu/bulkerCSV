# -*- coding: utf-8 -*-
from elasticsearch import helpers, Elasticsearch
from contextlib import closing
import csv
import requests
import io
import os
import json
import configparser

host_name   = 'elasticsearch' if os.environ.get('NUC') is not None else 'localhost'
# l'url local d'elasticsearch. En fcontion du docker et proxy.
es      	= Elasticsearch([{'host': host_name, 'port': 9200}])
# l'url du catalogue cvs kiabi. Et délimité par '|' plutot que ','
conf 		= configparser.ConfigParser()
conf.read("conf.txt")

languages	= dict(conf.items('section_language'))

print("--> ", languages)

def bulk(language, url):
	# download le cvs, le transforme en json pour elastic_search (configurer LoggerStash
	# est plus long qu'écrire ces 5 lignes de codes)
	print("will fetch: ", language, url)

	mapping = {
		"settings": {
			"index": {
				"analysis": {
					"analyzer": {
						"analyzer_case_insensitive": {
							"tokenizer": "keyword",
							"filter": "lowercase"
						}
					}
				}
			}
		},
		"mappings": {
			"product": {
				"properties": {
					"price": {
						"type": "double"
					},
					"color": {
						"type": "text",
						"analyzer": "analyzer_case_insensitive"
					}
				}
			}
		}
	}

	index_uri 	= '/' + language # un index pour chaque langue
	headers 	= {'Content-type': 'application/json'}
	port		= ":9200"
	prot		= "http://"

	r = requests.delete(prot + host_name + port + index_uri, headers=headers)
	print("did clean? ", r.text)
	r = requests.put(prot + host_name + port + index_uri, data =json.dumps(mapping), headers=headers)
	print("did map? ", r.text)

	with requests.Session() as s:
	    download        = s.get(url)
	    print("will serialize")
	    decoded_content = download.content.decode('utf-8')
	    reader 			= csv.DictReader(decoded_content.splitlines(), delimiter='|')

	    print("will bulk")
	    # bulk peut prendre beaucoup de temps. Considérer quelques minutes
	    # en fonction de la taille du csv et de sa complexitée.
	    helpers.bulk(es, reader, index=language, doc_type='product', request_timeout=60 * 10)
	    print("bulked ")

# pour chaque langue, un index. Depuis le fichier conf. lang(index)= key, url=value
for lang, url in languages.items():
	bulk(lang, url)
