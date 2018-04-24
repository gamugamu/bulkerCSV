from flask import Flask, request, jsonify
from flask import render_template
from elasticsearch import Elasticsearch
import json


es  = Elasticsearch([{'host': 'localhost', 'port': 9200}])
app = Flask(__name__)

@app.route('/')
def home():
    # basi request test elasticpath
    res = es.search(index="kiabi", body={"size":0, "aggs" : { "result" : { "terms" : { "field" : "color.keyword", "size": 10}}}})
    print(res["aggregations"]["result"]["buckets"])

    return render_template('test_documentation.html', color_agreggation=res["aggregations"]["result"]["buckets"])

@app.route('/match', methods=['POST'])
def match():
    # simple matching test
    args    = request.json.get("value")
    res     = es.search(index="kiabi", body={ "size":50, "query": { "match" : args}})
    return jsonify(res["hits"]["hits"])
