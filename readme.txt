//indexation Permet de mapper price as double et color text insensitive
// L'index doit être vide avant de pousser un mapping
// DELETE http://localhost:9200/kiabi/
// PUT http://localhost:9200/kiabi/
{
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
// check
// GET http://localhost:9200/kiabi/_mapping/


// ex request
{
    "size":3,
    "aggs" : {
        "Total plays" : {

        	 "terms" : {
                "field" : "price.keyword",
                "size": 10
            }
        }
    },
    "query": {
        "range" : {
            "price" : {
                "gte" : 5,
                "lte" : 7,
                "boost" : 2.0
            }
        }
    }
}
