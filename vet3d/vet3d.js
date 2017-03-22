global.vet3d = {};

var express = require('express');
var app = express();
var load = require('express-load');
var error = require('./middleware/error');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');

var KEY = 'vet3d.sid', SECRET = 'vet3d';
var cookie = express.cookieParser(SECRET);
var store = new express.session.MemoryStore();
var sessionOpts = {secret: SECRET, key: KEY, store: store};
var session = express.session(sessionOpts);

global.db = mongoose.connect('mongodb://localhost/vet3d');

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


// Verificar sessão ao connectar no socket.io
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

/* 
* Carrega os arquivos dos diretórios models, 
controllers e router dentro da variável app.
*/
load('models').into(global.vet3d);
load('controllers').then('routes').into(app);
load('sockets').into(io);

server.listen(3000, function(){
    console.log('Vet3D voando... :D');
});
