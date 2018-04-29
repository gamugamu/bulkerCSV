# -*- coding: utf-8 -*-
from elasticsearch import helpers, Elasticsearch
from contextlib import closing
import csv
import requests
import io
import os
import json

host_name   = 'elasticsearch' if os.environ.get('NUC') is not None else 'localhost'
# l'url local d'elasticsearch. En fcontion du docker et proxy.
es      = Elasticsearch([{'host': host_name, 'port': 9200}])
# l'url du catalogue cvs kiabi. Et délimité par '|' plutot que ','
print("will fetch: ", host_name)
CSV_URL = 'http://dl-cron.lengow.com/FluxKiabi/googleshopping_FR_fr.txt'

# download le cvs, le transforme en json pour elastic_search (configurer LoggerStash
# est plus long qu'écrire ces 5 lignes de codes)
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

headers = {'Content-type': 'application/json'}
r = requests.delete('http://' + host_name + ':9200' + '/kiabi', headers=headers)
print("cleaned? ", r.text)
r = requests.put('http://' + host_name + ':9200' + '/kiabi', data =json.dumps(mapping), headers=headers)
print("mapped? ", r.text)

with requests.Session() as s:
    download        = s.get(CSV_URL)
    print("will serialize")
    decoded_content = download.content.decode('utf-8')
    reader = csv.DictReader(decoded_content.splitlines(), delimiter='|')

    print("will bulk")
    # bulk peut prendre beaucoup de temps. Considérer quelques minutes
    # en fonction de la taille du csv et de sa complexitée.
    helpers.bulk(es, reader, index='kiabi', doc_type='product', request_timeout=60 * 10)
    print("bulked ")
