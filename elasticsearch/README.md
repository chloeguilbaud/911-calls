# 911 Calls avec ElasticSearch
Chloé Guilbaud & Maël Mainchain

## Import du jeu de données

Pour importer le jeu de données, complétez le script `import.js` (ici aussi, cherchez le `TODO` dans le code :wink:).

Exécutez-le ensuite :

```bash
npm install
node import.js
```

Vérifiez que les données ont été importées correctement grâce au shell (le nombre total de documents doit être `153194`) :

```
GET <nom de votre index>/_count
```

## Requêtes

À vous de jouer ! Écrivez les requêtes ElasticSearch permettant de résoudre les problèmes posés.

### Importer les données depuis le CSV
```
node import.js
```

### Compter le nombre d'appels autour de Lansdale dans un rayon de 500 mètres

Coordonnées GPS du quartier de Lansdale, PA, USA :
- Latitude : 40.241493
- Longitude : -75.283783

Un mapping est d'abord effectué dans au moment de l'import.
```
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
```

Les requêtes suivantes peuvent être lancées dans la console Kibana : 
```
GET urgencedb/urgence/_search
{
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
                        "lon": -75.283783
                    }
                }
            }
        }
    }
}
```

La commande suivante permet également son excusion en ligne de commande : 
```
node lansdale_calls.js
```

Le résultat obtenu est de 717.


### Compter le nombre d'appels par catégorie

La requête suivante peut être lancée dans la console Kibana :
- pour EMS
```
GET urgencedb/urgence/_search
{
    "query": {
        "wildcard": {
            "titre.keyword": {
                "value": "EMS*"
            }
        }
    }
}
```
- pour Fire
```
GET urgencedb/urgence/_search
{
    "query": {
        "wildcard": {
            "titre.keyword": {
                "value": "Fire*"
            }
        }
    }
}
```
- pour Traffic
```
GET urgencedb/urgence/_search
{
    "query": {
        "wildcard": {
            "titre.keyword": {
                "value": "Traffic*"
            }
        }
    }
}
```

La commande suivante permet également son excusion en ligne de commande : 
```
node count_calls_by_categories.js
```

Les résultats obtenus sont : 

| EMS   | Fire  | Traffic |
| ----- | ----- | ------- |
| 75589 | 23056 | 54549   |


### Trouver les 3 mois ayant comptabilisés le plus d'appels
```
node most_called_months.js
```

Le résultat obtenu est :

| 01/2016 | 10/2016 | 12/2016 |
| ------- | ------- | ------- |
| 13096   | 12502   | 12162   |

### Trouver le top 3 des villes avec le plus d'appels pour overdose
```
// TODO
```
Le résultat obtenu est :

| POTTSTOWN | NORRISTOWN | UPPER MORELAND |
| --------- | ---------- | -------------- |
| 203       | 180        | 110            |

## Kibana

Dans Kibana, créez un dashboard qui permet de visualiser :

* Une carte de l'ensemble des appels
* Un histogramme des appels répartis par catégories
* Un Pie chart réparti par bimestre, par catégories et par canton (township)

Pour nous permettre d'évaluer votre travail, ajoutez une capture d'écran du dashboard dans ce répertoire [images](images).

### Timelion
Timelion est un outil de visualisation des timeseries accessible via Kibana à l'aide du bouton : ![](images/timelion.png)

Réalisez le diagramme suivant :
![](images/timelion-chart.png)

Envoyer la réponse sous la forme de la requête Timelion ci-dessous:  

```
TODO : ajouter la requête Timelion ici
```
