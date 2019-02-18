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

let urgences = [];
fs.createReadStream('../911.csv')
    .pipe(csv())
    // Pour chaque ligne on créé un document JSON pour l'urgence correspondant
    .on('data', data => {
      // TODO extract one line from CSV
        urgences.push({
            latitude: data.lat,
            longitude: data.lng,
            description: data.desc,
            codepostal: data.zip,
            titre: data.title,
            date: data.timeStamp,
            quartier: data.twp,
            adresse: data.addr
            //utype: data.title.substr(0, data.title.indexOf(":"))
        });
    })
    .on('end', () => {
      // TODO insert data to ES
        esClient.bulk(createBulkInsertQuery(urgences), (err, resp) => {
            if (err) console.trace(err.message);
            else console.log(`Inserted ${resp.items.length} urgences`);
            esClient.close();
        });
    });

// Fonction utilitaire permettant de formatter les données notament pour le titre
function createBulkInsertQuery(urgences) {
    const body = urgences.reduce((acc, urgence) => {
        const { latitude, longitude, description, codepostal, titre, date, quartier, adresse } = urgence;
        acc.push({ index: { _index: 'urgencedb', _type: 'urgence', _id: urgence.date + urgence.latitude + urgence.longitude} });
        acc.push({ latitude, longitude, description, codepostal, titre, date, quartier, adresse });
        return acc
    }, []);

    return { body };
}


//type: data.title.substr(0, data.title.indexOf(":"))