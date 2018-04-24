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
        "ageGroup"  : { "terms" : { "field" : "ageGroup.keyword", "size": 10}},
        "gender"    : { "terms" : { "field" : "gender.keyword", "size": 10}},
        "taille"    : { "terms" : { "field" : "taille.keyword", "size": 10}},
        "material"  : { "terms" : { "field" : "material.keyword", "size": 10}}
    }})

    card_colors     = res["aggregations"]["color"]["buckets"]
    card_ageGroup   = res["aggregations"]["ageGroup"]["buckets"]
    card_gender     = res["aggregations"]["gender"]["buckets"]
    card_size       = res["aggregations"]["taille"]["buckets"]
    card_material   = res["aggregations"]["material"]["buckets"]

    return render_template('test_documentation.html',
        color_cardinality       = card_colors,
        ageGroup_cardinality    = card_ageGroup,
        gender_cardinality      = card_gender,
        size_cardinality        = card_size,
        material_cardinality    = card_material)

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
