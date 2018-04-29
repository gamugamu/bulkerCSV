from flask import Flask, request, jsonify
from flask import render_template
from elasticsearch import Elasticsearch
import json
import os

host_name  = 'elasticsearch' if os.environ.get('NUC') is not None else 'localhost'
es  = Elasticsearch([{'host': host_name, 'port': 9200}])
app = Flask(__name__)

@app.route('/')
def home():
    # basi request test elasticpath
    res = es.search(index="kiabi", body={"size":0, "aggs" : {
        "color"     : { "terms" : { "field" : "generic_color.keyword", "size": 10}},
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
    SIZE_PAGE   = 50
    args        = request.json.get("value")
    from_pages  = request.json.get("from_pages")
    match = [] # AND
    terms = [] # OR
    range = []

    for key, value in args.items():
        if value is not None and key is not "":
            if isinstance(value, list) or isinstance(value, dict):
                if key == "RANGE":
                    # Gestion de tout les ranges
                    for _key, _value in value.items():
                        # Les values doivent être par pair (un range quoi)
                        k = _key.replace("_range", "")
                        #TODO unsafe, catch exc
                        range_keyed = {"range": {
                                          k : {
                                            "gte": _value[0],
						                    "lte": _value[1]
                        }}}

                        range.append(range_keyed)
                else:
                    # note: Elastic search est trop stupide pour retrouver les
                    # termes renvoyés par la cardinalité en case sensitive:
                    # ex "BLEU" -> BLEU ne fonctionne pas.
                    # Alors que "bleu" -> Bleu fonctionne. Pour que ça soit case
                    # insensitive, il faut au préalable indiquer dans le mapping le type
                    # d'analyse à faire; Sinon ça ne fonctionne pas.
                    # https://pranavprakash.net/2017/09/13/case-insensitive-exact-match-search-in-elasticsearch/
                    to_lower = list(map(lambda x:x.lower(), value))
                    match.append({ "terms" : {key : to_lower} }) # OR
            else:
                match.append({ "match" : {key : value} }) # AND

    if len(range):
        # elastic path aime pas les tableaux vides :(
        match.extend(range) # AND

    query       = { "bool": { "must" : match } }
    body        = { "size":SIZE_PAGE, "from":from_pages * SIZE_PAGE, "query": query}
    res         = es.search(index="kiabi", body=body)
    count_pages = int(int(res["hits"]["total"]) / SIZE_PAGE)
    print("body", body)

    result = {
        "data"          :res["hits"]["hits"],
        "hits"          : res["hits"]["total"],
        "total_pages"   : count_pages,
        "current_page"  : from_pages}

    return jsonify(result)
