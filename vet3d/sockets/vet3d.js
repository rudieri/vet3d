module.exports = function(io) {
	// Pega o modelo do usuário para fazer as operações no BD
    var Usuario = global.vet3d.models.usuario;

    var vetSocket = io.of('/vetores');
    vetSocket.on('connection', function(cliSocket) {
        var session = cliSocket.handshake.session;
        var usuario = session.usuario;

        // Função para salvar um vetor
        cliSocket.on('salvar-vetor', function(data) {
            Usuario.findById(usuario._id, function(err, usuario) {

            	if (data.tipo == 'vetor') {
	                var calculo = usuario.calculos.id(data.idCalc);
					var vetor = calculo.vetores.create(data.vetor);
	                calculo.vetores.push(vetor);
	                usuario.save(function() {
	                    cliSocket.emit('salvar-retorno', {resultado: 0, idVetor: vetor._id, nome: vetor.nome});
	                });
            	} else if(data.tipo == 'resultado') {
            		var calculo = usuario.calculos.id(data.idCalc);
            		console.log("Data(tipo): " + data.tipo);
            		console.log("Data(resultado): " + data.resultado);
            		for(var i in data.resultado.dados){
            			console.log("Data(dados[" + i + "]): " + data.resultado.dados[i]);
            		}
					var resultado = calculo.resultados.create(data.resultado);
	                calculo.resultados.push(resultado);
	                usuario.save(function(erro) {
	                	if (erro) {
	                		console.log(erro);
	                	}
	                    cliSocket.emit('salvar-retorno', {resultado: 0, idResultado: resultado._id, nome: resultado.nome});
	                });
            	}
            });
        });

        // Função para remover um vetor
        cliSocket.on('remover-vetor', function(data) {
       
            Usuario.findById(usuario._id, function(err, usuario) {
                if (err) {
                    console.log("Removendo vetores... deu erro" + err);
                } 
                if(data.tipo == 'vetor'){
	                console.log("Removendo vetor: " + data.idVetor);
	                var calculo = usuario.calculos.id(data.idCalc);
	                var vetor = calculo.vetores.id(data.idVetor);
	                vetor.remove();
	                
	                usuario.save(function() {
	                    cliSocket.emit('remover-retorno', {resultado: 0, idVetor: vetor._id});
	                });
                } else {
                	var calculo = usuario.calculos.id(data.idCalc);
					var resultado = calculo.resultados.id(data.idResultado);
	                resultado.remove();
	                usuario.save(function() {
	                    cliSocket.emit('remover-retorno', {resultado: 0, idResultado: resultado._id, nome: resultado.nome});
	                });

                }
            });
        });

        // Função para listar os vetores de um cálculo
        cliSocket.on('listar-vetores', function(data) {
            console.log("listando vetores do usuário: " + data.idUsuario);
            Usuario.findById(data.idUsuario, function(err, usuario) {
                if (err) {
                    console.log("Listando vetores... deu erro" + err);
                }
                console.log("listando vetores do cálculo: " + data.idCalc);
                var calculo = usuario.calculos.id(data.idCalc);
                cliSocket.emit('listar-retorno', {calculo: calculo});
            });

        });

    });




};