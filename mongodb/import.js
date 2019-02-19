var mongodb = require('mongodb');
var csv = require('csv-parser');
var fs = require('fs');

var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/911-calls';

// Constuction de données pour insertion
const prepareData = data => {

    const delim = data.title.indexOf(':');

    const category = data.title.substring(0, delim);
    const coordinates = [parseFloat(data.lng), parseFloat(data.lat)];
    const event = data.title.substring(delim + 1, data.title.length).trim();

    return {
        coordonnees: coordinates,
        categorie: category,
        evenement: event,
        description: data.desc,
        codepostal: data.zip,
        timestamp: new Date(data.timeStamp),
        quartier: data.twp,
        adresse: data.addr
    };
};

// Insertion des données
const insertCalls = function(db, callback) {
    const collection = db.collection('calls');

    const calls = [];
    fs.createReadStream('../911.csv')
        .pipe(csv())
        .on('data', data => {
            // Création de l'objet transformé à partir de la ligne
            calls.push(prepareData(data));
        })
        .on('end', () => {
            collection.insertMany(calls, (err, result) => {
                callback(result)
            });
        });
};

MongoClient.connect(mongoUrl, (err, db) => {
    insertCalls(db, result => {
        console.log(`${result.insertedCount} calls inserted`);
        db.close();
    })
});
