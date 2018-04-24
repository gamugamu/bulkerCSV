from flask import Flask, request, jsonify
from flask import render_template
from elasticsearch import Elasticsearch
import json


es  = Elasticsearch([{'host': 'localhost', 'port': 9200}])
app = Flask(__name__)

@app.route('/')
def home():
    # basi request test elasticpath
    res         = es.search(index="kiabi", body={"size":0, "aggs" : {
        "color"     : { "terms" : { "field" : "color.keyword", "size": 10}},
        "ageGroup"  : { "terms" : { "field" : "ageGroup.keyword", "size": 10}}
    }})

    card_colors     = res["aggregations"]["color"]["buckets"]
    card_ageGroup   = res["aggregations"]["ageGroup"]["buckets"]

    return render_template('test_documentation.html',
        color_cardinality       = card_colors,
        ageGroup_cardinality    = card_ageGroup)

@app.route('/match', methods=['POST'])
def match():
    # simple matching test (AND)
    args    = request.json.get("value")
    match   = []
    
    for key, value in args.items():
        if value is not None:
            match.append({ "match" : {key : value} })

    query   = { "bool": { "must" : match } }
    res     = es.search(index="kiabi", body={ "size":50, "query": query})
    return jsonify(res["hits"]["hits"])
