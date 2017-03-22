module.exports = function(app) {
    var Usuario = global.vet3d.models.usuario;

    var Vet3dController = {
        index: function(req, res) {
            var usuario = req.session.usuario;
            var params = {
                usuario: usuario,
                idCalc: req.params.id,
                erro: undefined
            };
            res.render('vet3d/index', params);
        },
        controle: function(req, res) {
            var usuario = req.session.usuario;
            var params = {
                usuario: usuario,
                erro: undefined
            };

            res.render('vet3d/controle', params);
        },
        novoCalculo: function(req, res) {
            var usuario = req.session.usuario;
            res.render('vet3d/novo', {erro: undefined, usuario: usuario});
        },
        salvar: function(req, res) {
            Usuario.findById(req.session.usuario._id, function(erro, usuario) {
                if (erro) {
                    console.log(erro);
                    res.render('home/index', {erro: {msg: erro, duracao: 3}});
                } else {
                    var nome = req.body.calculo.nome;
                    var descricao = req.body.calculo.descricao;
                    var calculo = usuario.calculos.create({
                        nome: nome,
                        descricao: descricao,
                        dataCriacao: new Date(),
                        vetores: []
                    });
                    usuario.calculos.push(calculo);
                   usuario.save(function(erro) {
                        res.redirect("/vetores/desenhar/" + calculo._id);
                   });
                }
            });


        },
        listarCalculos: function(req, res) {
            var usuario = req.session.usuario;
            var query = {email: usuario.email};
            var projecao = {calculos: 1};
            Usuario.find(usuario, projecao).exec(function(erro, calculos) {

            });
        }
    };
    return Vet3dController;
};