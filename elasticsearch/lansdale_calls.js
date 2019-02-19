// Compter le nombre d'appels autour de Lansdale dans un rayon de 500 mètres

var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

esClient.search({ index: 'urgencedb', body: {
    "query": {
        "bool" : {
            "must" : {
                "match_all" : {}
            },
            "filter" : {
                "geo_distance" : {
                    "distance" : "500m",
                    "location" : {
                        "lat" : 40.241493,
                        "lon" : -75.283783
                    }
                }
            }
        }
    }
}}, (err, resp) => {
    if (err) console.trace(err.message)
    if (resp) console.log("Nombre d'appels autour de Lansdale dans un rayon de 500 mètres : " + resp.hits.total)
});