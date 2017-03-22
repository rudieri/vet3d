module.exports = function(app) {
    var autenticar = require('./../middleware/autenticador.js');
    var vet3d = app.controllers.vet3d;
    app.get('/vetores/desenhar/:id', autenticar, vet3d.index);
    app.get('/vetores/calculos', autenticar, vet3d.controle);
    app.get('/vetores/novo', autenticar, vet3d.novoCalculo);
    app.post('/vetores', autenticar, vet3d.salvar);

};