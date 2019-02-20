# 911 Calls avec MongoDB

Maël MAINCHAIN & Chloé GUILBAUD

## Import du jeu de données

Pour importer le jeu de données, complétez le script `import.js` (cherchez le `TODO` dans le code :wink:).

Exécutez-le ensuite :

```bash
npm install
node import.js
```

Vérifiez que les données ont été importées correctement grâce au shell (le nombre total de documents doit être `153194`) :

```
use 911-calls
db.calls.count()
```

## Index géographique et index textuel

Afin de répondre aux différents problèmes, vous allez avoir besoin de créer deux index particuliers sur la collection des appels :

* Un index géographique de type `2dsphere` pour les coordonnées GPS des appels.
  * https://docs.mongodb.com/manual/core/2dsphere/#create-a-2dsphere-index
* Un index textuel sur le titre des appels pour pouvoir faire des recherches full-text sur ce champ (recherche des overdoses par exemple)
  * https://docs.mongodb.com/manual/core/index-text/#create-text-index

## Requêtes

À vous de jouer ! Écrivez les requêtes MongoDB permettant de résoudre les problèmes posés.

### Importer les données depuis le CSV
```
node import.js
```

### Compter le nombre d'appels autour de Lansdale dans un rayon de 500 mètres

Coordonnées GPS du quartier de Lansdale, PA, USA :
- Latitude : 40.241493
- Longitude : -75.283783

Un index est crée sur le champ des coordonnées géographiques : 
```
db.calls.createIndex({ coordonnees : "2dsphere" })
```

Il faut ensuite lancer la requête suivante dans la console : 
```
db.calls.find(
  {
    coordonnees: { 
      $near : {
        $geometry: { type: "Point", coordonnees: [-75.283783, 40.241493 ]}, $maxDistance: 500
      }
    }
  }
).count()
```

Le résultat obtenu est de 717.


### Compter le nombre d'appels par catégorie

La requête suivante permet l'obtention de ces informations :
```
db.calls.aggregate([
    { $group: {  _id: "$categorie", count: { $sum: 1 } } }
])
```

Le résultat attendu et obtenu : 
```
{ "_id" : "Traffic", "count" : 54549 }
{ "_id" : "Fire", "count" : 23056 }
{ "_id" : "EMS", "count" : 75589 }
```


### Trouver les 3 mois ayant comptabilisés le plus d'appels

Processus : 
- récupération des mois par années
- aplication de l'ordre descendant limité à 3
```
db.calls.aggregate([
  { $project : { month: { $month : "$timestamp" }, year: { $year: "$timestamp" } } },
  { $project : {
      monthYear: { $concat: [{ $substr: ["$month",0,2] }, "/", { $substr: ["$year",0,4] }] }}
  },
  { $group: { _id: "$monthYear", count: { $sum: 1 }}},
  { $sort: { count: -1 }},
  { $limit: 3 }
])
```

Le résultat obtenu est :
```
{ "_id" : "1/2016", "count" : 13084 }
{ "_id" : "10/2016", "count" : 12502 }
{ "_id" : "12/2016", "count" : 12162 }
```

Le résultat attendu est :

| 01/2016 | 10/2016 | 12/2016 |
| ------- | ------- | ------- |
| 13096   | 12502   | 12162   |


### Trouver le top 3 des villes avec le plus d'appels pour overdose

Un index est d'abord crée sur sur le champ des `evenement` permettant une recherhce textuelle.
```
db.calls.createIndex({ evenement : "text" })
```

Pour afficher les 3 villes ayant reçu le plus d'appels pour overdoses :
```
db.calls.aggregate([
  { $match: { $text: { $search : "OVERDOSE" }}},
  { $group: { _id: "$quartier", count: { $sum: 1 }}},
  { $sort: { count: -1 }},
  { $limit: 3 }
])
```

Le résultat obtenu est :
```
{ "_id" : "POTTSTOWN", "count" : 203 }
{ "_id" : "NORRISTOWN", "count" : 180 }
{ "_id" : "UPPER MORELAND", "count" : 110 }
```

Le résultat obtenu est :

| POTTSTOWN | NORRISTOWN | UPPER MORELAND |
| --------- | ---------- | -------------- |
| 203       | 180        | 110            |


Vous allez sûrement avoir besoin de vous inspirer des points suivants de la documentation :

* Proximity search : https://docs.mongodb.com/manual/tutorial/query-a-2dsphere-index/#proximity-to-a-geojson-point
* Text search : https://docs.mongodb.com/manual/text-search/#text-operator
* Aggregation Pipeline : https://docs.mongodb.com/manual/core/aggregation-pipeline/
* Aggregation Operators : https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
