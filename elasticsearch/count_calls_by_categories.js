// Compter le nombre d'appels autour de Lansdale dans un rayon de 500 mètres

var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

// Création de l'indice
esClient.indices.create({ index: 'urgencedb' }, (err, resp) => {
    if (err) console.trace(err.message);
});

esClient
    .count({
        index: 'urgencedb',
        type: 'urgence',
        body: {
            query: {
                "wildcard": {
                    "titre.keyword": {
                        "value": "EMS*"
                    }
                }
            }
        }
    })
    .then(resp => {
        console.log("EMS: " + resp.count);
    });

esClient
    .count({
        index: 'urgencedb',
        type: 'urgence',
        body: {
            query: {
                "wildcard": {
                    "titre.keyword": {
                        "value": "Fire*"
                    }
                }
            }
        }
    })
    .then(resp => {
        console.log("Fire: " + resp.count);
    });


esClient
    .count({
        index: 'urgencedb',
        type: 'urgence',
        body: {
            query: {
                "wildcard": {
                    "titre.keyword": {
                        "value": "Traffic*"
                    }
                }
            }
        }
    })
    .then(resp => {
        console.log("Traffic: " + resp.count);
    });