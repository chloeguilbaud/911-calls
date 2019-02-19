// Trouver le top 3 des villes avec le plus d'appels pour overdoses

var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

esClient.search({ index: 'urgencedb', type: 'urgence', body: {
        "size": 0,
        "query" : {
            "wildcard" : {
                "titre.keyword": {
                    "value" : "*OVERDOSE"
                }
            }
        },
        "aggs": {
            "overdoseCities" : {
                "terms" : {
                    "field" : "quartier.keyword"
                }
            }
        }
    }}, (err, resp) => {
    if (err) console.trace(err.message)
    if (resp) console.log("Villes avec le plus d'appels pour overdoses : ", resp.aggregations.overdoseCities)
});