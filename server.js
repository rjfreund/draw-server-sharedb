var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var WebSocketJSONStream = require('@teamwork/websocket-json-stream');

var db = require('sharedb-mongo')('mongodb://superhero1:superhero1@ds229118.mlab.com:29118/heroku_tbwl7ftx');
var backend = new ShareDB({db: db});
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
  var connection = backend.connect();
  var doc = connection.get('someCollectionName', 'drawings');
  doc.fetch(function(err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create([], callback);
      return;
    }
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  app.use(express.static('static'));
  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({server: server});
  wss.on('connection', function(ws) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });


  var port = process.env.PORT || 8080;
  server.listen(port);
  console.log('Listening on http://localhost:'+port);
}
