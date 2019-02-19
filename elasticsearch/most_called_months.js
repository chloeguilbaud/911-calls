// Trouver les 3 mois ayant comptabilisés le plus d'appels

var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

esClient.search({ index: 'urgencedb', type: 'urgence', body: {
                "size": 0,
                "aggs" : {
                    "monthsWithTheMostCalls" : {
                        "date_histogram": {
                            "field": "timestamp",
                            "interval": "month",
                            "format": "yyyy-MM",
                            "order": {
                                "_count": "desc"
                            },
                            "time_zone": "Europe/Paris"
                        }
                    }
                }
    }}, (err, resp) => {
    if (err) console.trace(err.message)
    if (resp) console.log("Mois ayant comptabilisés le plus d'appels : ", resp.aggregations.monthsWithTheMostCalls)
});