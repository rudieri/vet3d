
module.exports = function (app) {
	var Schema = require('mongoose').Schema;
	var ObjectId = Schema.Types.ObjectId;


	var Vetor = Schema({
		nome: {type: String, required: true},
		x: {type:Number, required: true},
		y: {type:Number, required: true},
		z: {type:Number, required: true},
		propriedades: {type: Schema.Types.Mixed}
	});
	// var DadoResultado = Schema({
	// 	numero: {type: Number},
	// 	vetor: {type: Vetor}
	// });

	var Resultado = Schema({
		nome: {type: String, required: true},
		operacao: {type: Number, required:true},
		dados: [Schema.Types.Mixed],
		propriedades: {type: Schema.Types.Mixed}
	});

	var Calculo = Schema({
		nome: {type: String, required: true},
		dataCriacao: {type: Date, required: true},
		vetores: [Vetor],
		resultados: [Resultado]
	});

	var Usuario = Schema({
		nome: {type: String, required: true},
		email: {type: String, required: true},
		senha: {type: String, required: true},
		calculos: [Calculo]
	});
	return db.model('usuarios', Usuario);
};