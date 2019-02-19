var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

// Création de l'indice avec formatage du geo_point
esClient.indices.create({index: 'urgencedb', body: {
        "mappings" : {
            "urgence": {
                "properties": {
                    "location": {
                        "type": "geo_point"
                    }
                }
            }
        }}}, (err, resp) => {
    if (err)
        console.trace(err.message);
});


let urgences = [];
fs.createReadStream('../911.csv')
    .pipe(csv())
    // Pour chaque ligne on créé un document JSON pour l'urgence correspondant
    .on('data', data => {
      // extract one line from CSV
        urgences.push({
            location: [parseFloat(data.lng), parseFloat(data.lat)],
            description: data.desc,
            codepostal: data.zip,
            titre: data.title,
            date: data.timeStamp,
            quartier: data.twp,
            adresse: data.addr,
            timestamp: new Date(data.timeStamp),
            category: data.title.substr(0, data.title.indexOf(":"))
        });
    })
    .on('end', () => {
      // insert data to ES
        esClient.bulk(createBulkInsertQuery(urgences), (err, resp) => {
            if (err) console.trace(err.message);
            else console.log(`Inserted ${resp.items.length} urgences`);
            esClient.close();
        });
    });

// Fonction utilitaire permettant de formatter les données notament pour le titre
function createBulkInsertQuery(urgences) {
    const body = urgences.reduce((acc, urgence) => {
        const { location, description, codepostal, titre, date, quartier, adresse, timestamp, category } = urgence;
        acc.push({ index: { _index: 'urgencedb', _type: 'urgence'} });
        //acc.push({ location, description, codepostal, titre, date, quartier, adresse, "@timestamp": timestamp });
        acc.push({ location, description, codepostal, titre, date, quartier, adresse, timestamp, category });
        return acc
    }, []);

    return { body };
}

// category: data.title.substr(0, data.title.indexOf(":"))