let DocumentDBClient = require('documentdb').DocumentClient;
import config from '../config';

var docdbUtils = {
    getOrCreateDatabase: function (client:any, databaseId:any, callback:any) {
        var querySpec = {
            query: 'SELECT * FROM root r WHERE r.id= @id',
            parameters: [{
                name: '@id',
                value: databaseId
            }]
        };

        client.queryDatabases(querySpec).toArray(function (err:any, results:any) {
            if (err) {
                callback(err);
            } else {
                if (results.length === 0) {
                    var databaseSpec = {
                        id: databaseId
                    };

                    client.createDatabase(databaseSpec, function (err:any, created:any) {
                        callback(null, created);
                    });

                } else {
                    callback(null, results[0]);
                }
            }
        });
    },

    getOrCreateCollection: function (client:any, databaseLink:any, collectionId:any, callback:any) {
        var querySpec = {
            query: 'SELECT * FROM root r WHERE r.id=@id',
            parameters: [{
                name: '@id',
                value: collectionId
            }]
        };             

        client.queryCollections(databaseLink, querySpec).toArray(function (err:any, results:any) {
            if (err) {
                callback(err);

            } else {        
                if (results.length === 0) {
                    var collectionSpec = {
                        id: collectionId
                    };

                    client.createCollection(databaseLink, collectionSpec, function (err:any, created:any) {
                        callback(null, created);
                    });

                } else {
                    callback(null, results[0]);
                }
            }
        });
    }
};

const performDbOperations = function (documentDBClient:any, databaseId:any, collectionId:any) {
    this.client = documentDBClient;
    this.databaseId = databaseId;
    this.collectionId = collectionId;
  
    this.database = null;
    this.collection = null;
    this.initialiseDb = function(callback:any){
        var self = this;
        docdbUtils.getOrCreateDatabase(self.client, self.databaseId, function (err:any, db:any) {
            if (err) {
                callback(err);
            } else if(db) {
                self.database = db;
                // console.log("Before 1",self.database);
                docdbUtils.getOrCreateCollection(self.client, self.database._self, self.collectionId, function (err:string, coll:any) {
                    if (err) {
                        callback(err);

                    } else {
                        self.collection = coll;
                    }
                });
            }
        });
    }
    this.find = function (itemId:any , itemType:any , callback:any) {
        let query = {
            query: 'SELECT * FROM root r WHERE r.'+itemType+' = @'+itemType,
            parameters: [{
                name: '@'+itemType,
                value: itemId
            }]
        };
        // console.log("Before 2",this.collection);
        this.client.queryDocuments(this.collection._self, query).toArray(function (err:string, results:any) {
            if (err) {
                callback(err);

            } else {
                callback(null, results);
            }
        });
    }
    this.addItem = function (item:any, callback:any) {
        var self = this;
        // console.log("Before 3",self.collection);
        self.client.createDocument(self.collection._self, item, function (err:any, doc:any) {
            if (err) {
                callback(err);
            } else {
                callback(null, doc);
            }
        });
    }
    this.updateItem = function (itemId:any, callback:any) {
        var self = this;

        self.getItem(itemId, function (err:any, doc:any) {
            if (err) {
                callback(err);

            } else {
                doc.completed = true;
                // console.log("Before 4",doc);
                self.client.replaceDocument(doc._self, doc, function (err:any, replaced:any) {
                    if (err) {
                        callback(err);

                    } else {
                        callback(null, replaced);
                    }
                });
            }
        });
    };
    this.getItem = function (itemId:any, callback:any) {
        var self = this;

        var querySpec = {
            query: 'SELECT * FROM root r WHERE r.id = @id',
            parameters: [{
                name: '@id',
                value: itemId
            }]
        };
        // console.log("Before 5",self.collection);
        self.client.queryDocuments(self.collection._self, querySpec).toArray(function (err:any, results:any) {
            if (err) {
                callback(err);

            } else {
                callback(null, results[0]);
            }
        });
    }
  }

const fetchUser = (activity:any) => {
    let user;
    if(activity.from.name) {
        user = activity.from.name.split("sip:")[1] ? activity.from.name.split("sip:")[1] : "test.bot@se.com";
    } else {
        user = activity.from.id;
    }
    return user;
}

//Instantiate docdb for analytics
const docDbClient = new DocumentDBClient(config.host, {
    masterKey: config.authKey
});
let dbOperations = new performDbOperations(docDbClient, config.databaseId, config.collectionId);
const initDB =async () => {
    await dbOperations.initialiseDb((err) => {
        console.log("Error in intializing DB",err);
    });
}
initDB();


export default (intent: string, activity:any , replyText:any , type:string): any => {
    let userEmail = fetchUser(activity);
    let dataEntry = {
        "conversationID": activity.conversation.id,
        "userEmail": userEmail,
        "userInput": activity.text ,
        "botResponse": replyText,
        "type": type,
        "intent": intent,
        "timestamp": new Date().toISOString().split('.')[0]
    }
    return dbOperations.addItem(dataEntry, function (err:any, doc:any) {
        if(err) console.log("Error in DB\n",err);      
    });
}