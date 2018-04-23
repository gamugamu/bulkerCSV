from flask import Flask
from flask import render_template
from elasticsearch import Elasticsearch


es  = Elasticsearch([{'host': 'localhost', 'port': 9200}])
app = Flask(__name__)

@app.route('/')
def hello_world():
    # basi request test elasticpath
    res = es.search(index="kiabi", body={"size":0, "aggs" : { "result" : { "terms" : { "field" : "color.keyword", "size": 10}}}})
    print(res["aggregations"]["result"]["buckets"])
    return render_template('test_documentation.html', color_agreggation=res["aggregations"]["result"]["buckets"])
