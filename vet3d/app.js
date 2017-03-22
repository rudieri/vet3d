
/**
 * Module dependencies.
 */

var express = require('express');
var app = express();
var load = require('express-load');
var error = require('./middleware/error');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var mongoose = require('mongoose');

var KEY = 'vet3d.sid', SECRET = 'vet3d';
var cookie = express.cookieParser(SECRET);
var store = new express.session.MemoryStore();
var sessionOpts = {secret: SECRET, key: KEY, store: store};
var session = express.session(sessionOpts);

global.db = mongoose.connect('mongodb://localhost/vet3d');
global.app = app;

// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookie);
app.use(session);
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname, '/public'));
app.use(error.notFound);


// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

io.set('authorization', function(data, accept) {
    console.log("authorization (io): " + data);
    cookie(data, {}, function(err) {
        var sessionID = data.signedCookies[KEY];
        store.get(sessionID, function(err, session) {
            console.log("Session (Store) : " + session);
            if (err || !session) {
                accept(null, false);
            } else {
                data.session = session;
                accept(null, true);
            }
        });
    });
});


load('models').then('controllers').then('routes').into(app);
load('sockets').into(io);

server.listen(3000, function(){
    // fs.readFile("/socket.io/socket.io.js", function (err, data) {
    //  	if (err) {
    //  		console.log("Erro! " + err);
    // 	}else{
    //  		console.log(data)

    //  	}
    //  });
    console.log('Ainda não estamos pintando vetores... :S');
});
