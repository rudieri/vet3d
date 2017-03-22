module.exports = function(app) {

    var Usuario = global.vet3d.models.usuario;

    var HomeController = {
        index: function(req, res) {
            res.render('home/index', {erro: undefined});
        },
        login: function(req, res) {
            var email = req.body.usuario.email;
            var senha = req.body.usuario.senha;
            var query = {email: email};

            Usuario.findOne(query).exec(function(erro, usuario) {
                if (erro) {
                    console.log(erro);
                    var paramErro = {
                        msg: erro,
                        duracao: 3
                    };
                    res.render('home/index', {erro: paramErro});
                } else if (usuario && usuario.senha === senha) {
                    console.log('Sessão criada!!!');
                    if (!usuario.contatos) {
                        usuario.contatos = new Array();
                    }
                    req.session.usuario = usuario;
                    res.redirect('/vetores/calculos');
                    
                } else {
                    var paramErro = {
                        msg: "Usuário ou senha inválidos!",
                        duracao: 5
                    };
                    res.render('home/index', {erro: paramErro});
                }
            });

        },
        logout: function(req, res) {
            console.log('Logout!!!');
            req.session.destroy();
            res.render('home/index', {erro: undefined});
        },
        cadastro: function(req, res) {
            var email = req.body.usuario.email;
            //var nome = req.body.usuario.nome;
            //var senha = req.body.usuario.senha;

            var query = {email: email};
            var Usuario = global.vet3d.models.usuario;

            Usuario.findOne(query).select('email').exec(function(erro, usuario) {
                if (erro) {
                    console.log(erro);
                    res.render('home/index', {erro: {msg: erro, duracao: 3}});
                } else if (usuario) {
                    var paramErro = {
                        msg: "Usuário já existe para esse e-mail.",
                        duracao: 5
                    };
                    res.render('home/index', {erro: paramErro});
                } else {
                    Usuario.create(req.body.usuario, function(erro, usuario) {
                        if (erro) {
                            console.log("Erro ao criar usuário: " + erro);
                            res.render('home/index', {erro: {msg: erro, duracao: 3}});
                        } else {
                            req.session.usuario = usuario;
                            res.redirect('/vetores/calculos');
                        }
                    });
                }
            });
        }
    };
    return HomeController;
};