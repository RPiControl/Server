var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var chromecast  = require('./api/chromecast');
var network     = require('./api/network');

app.use(express.static('htdocs'));
app.use(bodyParser.json());
app.use('/_api', express.static('server/api'));
app.use('/_api/chromecast', chromecast);
app.use('/_api/network', network);

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});