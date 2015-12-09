var express		= require('express');
var api 		= express();
var Client 		= require('castv2-client').Client;
var Application = require('castv2-client').Application;
var mdns        = require('mdns');

var chromecasts = [];

var browser = mdns.createBrowser(mdns.tcp('googlecast'));
browser.on('serviceUp', function(service) {
	var chromecast = {
		name: service.name,
		ip: service.addresses[0],
		port: service.port,
		playing: service.txtRecord.st == 0 ? false : true
	};
	if (service.txtRecord.rs !== undefined && service.txtRecord.rs !== '') {
		chromecast.app = service.txtRecord.rs;
	}
	chromecasts.push(chromecast);
  	browser.stop();
});
browser.start();

api.get('/', function(req, res) {
	res.json(chromecasts);
	res.status(200).end();
});

api.param(['ip'], function(req, res, next, ip) {
	var client = new Client();
  	client.connect(ip, function() {
  		req.chromecast = client;
  		next();
  	});
});

api.get('/:ip', function(req, res) {
	console.log(req.chromecast);
	req.chromecast.getStatus(function(err, status) {
		if (!err) {
			res.json(status).status(200).end();
		}else {
			res.send(err).status(400).end();
		}
	});
	//res.status(200).end();
});

api.post('/:ip', function(req, res) {
	if (req.body.mute !== undefined) {
		req.chromecast.setVolume({muted: req.body.mute}, function(err, volume) {
			if (!err) {
				res.json(volume).status(200).end();
			}else {
				res.send(err).status(400).end();
			}
		});
	}else if (req.body.volume !== undefined) {
		req.chromecast.setVolume({level: req.body.volume}, function(err, volume) {
			if (!err) {
				res.json(volume).status(200).end();
			}else {
				res.send(err).status(400).end();
			}
		});
	}
});

api.post('/:ip/stop', function(req, res) {
  	req.chromecast.getStatus(function(err, response) {
		req.chromecast.join(response.applications[0], Application, function(err, app) {
			req.chromecast.stop(app, function() {
				res.status(200).end();
  			});
		});
	});
});

module.exports = api;