const config = {
  host:process.env.HOST || "https://sfb-cosmos.documents.azure.com:443/",
  authKey:process.env.AUTH_KEY || "hefbbEPh8Kua7HhHLOMGQXR2z8uGEJLY6jR58bWg3E1yweNP6Nyi1Cwazp0lCaPCswbrR2FqJUngCTYmPYtyuQ==",
  databaseId:"Chatbot_db",
  collectionId:"hotel_bot_table"
}

var docdb = require("documentdb");
var async = require("async");

var client = new docdb.DocumentClient(config.host, {
    masterKey: config.authKey
});

var messagesLink = docdb.UriFactory.createDocumentCollectionUri(config.databaseId, config.collectionId);

var listAll = function(callback) {
  var spec = {
    query: "SELECT * FROM c where c.intent='book_hotel_ask_builtin.number'",
    parameters: []
  };

  client.queryDocuments(messagesLink, spec, { enableCrossPartitionQuery: true }).toArray((err, results) => {
    callback(err, results);
  });
};

var deleteAll = function() {
  listAll((err, results) => {
    if (err) {
      console.log(err);
    } else {
      async.forEach(results, (message, next) => {
        client.deleteDocument(message._self , {partitionKey: message.userEmail}, err => {
          if (err) {
            console.log(err);
            next(err);
          } else {
            next();
          }
        });
      });
    }
  });
};

var task = process.argv[2];
switch (task) {
  case "listAll":
    listAll((err, results) => {
      if (err) {
        console.error(err);
      } else {
        console.log(results);
      }
    });
    break;
  case "deleteAll":
    deleteAll();
    break;

  default:
    console.log("Commands:");
    console.log("listAll deleteAll");
    break;
}