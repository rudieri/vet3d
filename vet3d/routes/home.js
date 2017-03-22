module.exports = function(app) {

    var home = app.controllers.home;
    app.get('/', home.index);
    app.post('/entrar', home.login);
    app.post('/cadastro', home.cadastro);
    app.get('/sair', home.logout);
};