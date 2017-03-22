window.vetores = {};
window.idxUltVet = 0;
window.qtdVetores = 0;


function criarVetorDoTexto (txtVet) {
	var coordenadas = txtVet.match(/([0-9.-]+)/g);
	if (coordenadas.length != 3) {
		alert("Vetor inválido!");
		return;
	};
	return new GEO.Vetor3D(new GEO.Ponto3D(coordenadas[0], coordenadas[1], coordenadas[2]));
}
		
function criarVetor() {
	var txtVet = document.getElementById('v1').value;
	
	var v1 = criarVetorDoTexto(txtVet);

	//scene.add(v1);
	document.getElementById('v1').value = "";
	
	var idxVet = getNextIdx();

	v1.setNome("v"+(idxVet));
	
	adicionarVetor(v1, idxVet);
	
}

function adicionarVetor (v1, idxVet) {
	vetores[idxVet] = v1;
	qtdVetores++;
	var span = document.createElement("span");
	span.setAttribute("id", "_"+ v1.getNome() +"_");
	span.innerHTML += v1.getNome() + " (" + v1.getX() + ", " + v1.getY() + ", " + v1.getZ() + ") <a href='#' onclick= removerVetor(" + idxVet + ");><img src='/public/images/x.png' alt='Remover'/></a><br/>";
	if (idxVet == idxUltVet) {
        document.getElementById('vetores').appendChild(span);
	} else {
		for (var i = idxVet + 1; i <= idxUltVet; i++) {
			var outroSpan;
			if(vetores[i] != null){
				outroSpan = document.getElementById( "_v"+i+"_");
	 			break;
			}
		}
		if (!outroSpan) {
			 document.getElementById('vetores').appendChild(span);
		}else{
			document.getElementById('vetores').insertBefore(span, outroSpan);
		}	
	}
	v1.addToScene(scene);
}

function removerVetor (idxVet) {
	var v = vetores[idxVet];
	v.remove(scene);
	vetores[idxVet] = null;
	qtdVetores--;
	
	document.getElementById('vetores').removeChild(document.getElementById("_"+v.getNome()+"_"));

}

function getNextIdx() {
	var idxVet = -1;
	if(idxUltVet == qtdVetores){
		idxVet = ++idxUltVet;
	} else {
		for (var i = 1; i <= idxUltVet; i++) {
			if(vetores[i] == null){
				idxVet = i;
	 			break;
			}
			if (idxVet == -1) {
				idxVet = ++idxUltVet;
			};
		}
 	}
 	return idxVet;
}



function resolver () {
	var vr;
	var txtExp = document.getElementById('exp1').value;
	//Exp.resoverExp(txtExp);
	var argumentos = txtExp.match(/(v?[0-9]+)[ ]*([p+\/*\-]{1})[ ]*(v?[0-9]+)/i);
	// var reVetor = "(\\bv[0-9]+\\b)";
	// var reNum = "(\\b[0-9,]+\\b)";
	// var reOper = "(\\b[+*/.-]+\\b)";
	for (var i = 0; i < argumentos.length; i++) {
		console.log(argumentos[i]	);
			
	}
	if (argumentos.length != 4) {
		alert("Expressão inválida!");
		return;
	}

	var operador = argumentos[2];
	
	var v1;
	if (/^[0-9]+$/.test(argumentos[1])) {
		v1 = new Number(argumentos[1]);
	}else{
	 	v1 = vetores[argumentos[1].match(/([0-9]+)/)[1]];

	}

	var v2;
	if (/^[0-9]+$/.test(argumentos[3])) {
		v2 = new Number(argumentos[3]);
	}else{
	 	v2 = vetores[argumentos[3].match(/([0-9]+)/)[1]];
	}
	
	if (v1 instanceof Number && v2 instanceof Number) {
		var saida;
		if (operador == "+") {
			saida = v1 + v2;
		} else if(operador == "-") {
			saida = v1 - v2;
		} else if(operador == "*") {
			saida = v1 * v2;
		} else if(operador == "/") {
			saida = v1 / v2;
		}else{
			alert("Operador inválido!");
			return;
		}
		alert("Não tens nada melhor para fazer?\n" + v1 + " " + operador + " " + v2 + " = " + saida);
		return;
	} else if (v1 instanceof GEO.Vetor3D && v2 instanceof Number) {
		if (operador == "*") {
			vr = new GEO.Resultado(GEO.Operacoes.MULTIPLICAR_ESCALAR, v1, v2);
		} else if (operador == "/") {
			vr = new GEO.Resultado(GEO.Operacoes.DIVIDIR_ESCALAR, v1, v2);
			// vr = GEO.dividirEscalar(v1, v2);
		}else{
			alert("Operação não se aplica a um vetor e um escalar.");
			return;
		}

	} else if(v1 instanceof GEO.Vetor3D && v2 instanceof GEO.Vetor3D){
		if (operador == "+") {
			vr = new GEO.Resultado(GEO.Operacoes.SOMAR, v1, v2);
			// vr = GEO.somar(v1, v2);
		} else if (operador == "-") {
			vr = new GEO.Resultado(GEO.Operacoes.SUBTRAIR, v1, v2);
			// vr = GEO.subtrair(v1, v2);
		} else if (operador == "*") {
			vr = new GEO.Resultado(GEO.Operacoes.PRODUTO_VETORIAL, v1, v2);
			// vr = GEO.produtoVetorial(v1, v2);
		} else if (operador == "p") {
			vr = new GEO.Resultado(GEO.Operacoes.PROJECAO, v1, v2);
			// vr = GEO.projecao(v1, v2);
			// console.log("[" + vr.getX() + ", " + vr.getY() + ", " + vr.getZ() + "]");
		} else {
			alert("Operação inválida!");
			return;
		}
	} else {
		alert("Tipos desconhecidos " + v1 + " " + v2);
		return;
	}
	vr.setNome(txtExp);
	// vr.addToScene(scene);
	adicionarVetor(vr, ++idxUltVet);

}