
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , https = require('https')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/users', user.list);

var server = http.createServer(app)

// settings for socket.io
//var io = require('socket.io').listen(app);
var io = require('socket.io').listen(server);

function request(msg, cb) {
	var settings = {
		host: 'api.github.com',
		path: '/markdown/raw',
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain'
		}
	};
	
	var req = https.request(settings, function(res) {
		var response = [];
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			console.log('received: ' + chunk);
			response.push(chunk);
		});
		res.on('end', function() {
			cb(null, response.join());
		});
	});
	
	req.on('error', function(e) {
		cb('\033[31m' + e.message + '\033[0m');
	});

	req.write(msg);
	req.end();
}

server.listen(app.get('port'), function(){
  console.log('express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function(socket) {
	socket.on('msg send', function(msg) {
		request(msg, function(err, md) {
			console.log('md: ' + md);
			socket.emit('msg push', md);
			socket.broadcast.emit('msg push', md);
		});
	});
	socket.on('disconnect', function() {
		console.log('disconnected.');
	});
});
