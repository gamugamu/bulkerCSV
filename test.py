from elasticsearch import helpers, Elasticsearch
from contextlib import closing
import csv
import requests
import io

# l'url local d'elasticsearch. En fcontion du docker et proxy.
es      = Elasticsearch([{'host': 'localhost', 'port': 9200}])
# l'url du catalogue cvs kiabi. Et délimité par '|' plutot que ','
CSV_URL = 'http://dl-cron.lengow.com/FluxKiabi/googleshopping_FR_fr.txt'

# download le cvs, le transforme en json pour elastic_search (configurer LoggerStash
# est plus long qu'écrire ces 5 lignes de codes)
with requests.Session() as s:
    download        = s.get(CSV_URL)
    decoded_content = download.content.decode('utf-8')
    reader = csv.DictReader(decoded_content.splitlines(), delimiter='|')

    print("will bulk")
    # bulk peut prendre beaucoup de temps. Considérer quelques minutes
    # en fonction de la taille du csv et de sa complexitée.
    helpers.bulk(es, reader, index='kiabi', doc_type='product')
    print("bulked ")
