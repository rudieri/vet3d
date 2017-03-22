var OPERACOES = OPERACOES || {
    SALVAR_VETOR: {emis: 'salvar-vetor', ret: 'salvar-retorno'},
    REMOVER_VETOR: {emis: 'remover-vetor', ret: 'remover-retorno'},
    LISTAR_VETORES: {emis: 'listar-vetores', ret: 'listar-retorno'}
};


var VSOCKET = VSOCKET || {
    server: undefined,
    callbacks: {}
};

VSOCKET.Vetor3D = function(x, y, z, nome) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.nome = nome;
};
VSOCKET.conectar = function(callback) {
    VSOCKET.server = io.connect('http://localhost:3000/vetores');
    VSOCKET.server.on('connect', callback);
    
    VSOCKET.server.on(OPERACOES.SALVAR_VETOR.ret, function(msg) {
        VSOCKET.executarCallback(OPERACOES.SALVAR_VETOR.emis, msg.nome, msg);
    });
    VSOCKET.server.on(OPERACOES.LISTAR_VETORES.ret, function(msg) {
        var vetoresWrapper = new Array();
        var vetores = msg.calculo.vetores;
        for (i = 0; i < vetores.length; i++) {
            var vAux = vetores[i];
            var vWrapper = new GEO.Vetor3D(new GEO.Ponto3D(vAux.x, vAux.y, vAux.z));
            vWrapper.setNome(vAux.nome);
            vWrapper.setId(vAux._id)
            if (vAux.propriedades) {
                vWrapper.propriedades = vAux.propriedades;
            }
            vetoresWrapper.push(vWrapper);
        }
        var resultados = msg.calculo.resultados;
        for (i = 0; i < resultados.length; i++) {
            var cAux = resultados[i];
            var dados = {};
             for (var vec in cAux.dados) {
                var vAux = cAux.dados[vec];
                    if (vAux instanceof GEO.Vetor3D) {

                    var vWrapper = new GEO.Vetor3D(new GEO.Ponto3D(vAux.x, vAux.y, vAux.z));
                    vWrapper.setNome(vAux.nome);
                    // if (cAux.propriedades) {
                    //     vWrapper.propriedades = cAux.propriedades;
                    // }
                    dados[vec] = vWrapper;
                } else {
                    dados[vec] = vAux;
                }
            }
            
            var cWrapper = new GEO.Resultado(GEO.Operacoes.getOperacao(cAux.operacao));
            if (cAux.propriedades) {
                cWrapper.propriedades = cAux.propriedades;
            }
            cWrapper.setDados(dados);
            cWrapper.setNome(cAux.nome);
            cWrapper.setId(cAux._id);
            vetoresWrapper.push(cWrapper);
        }
        VSOCKET.executarCallback(OPERACOES.LISTAR_VETORES.emis, msg.calculo._id, {vetores: vetoresWrapper});
    });
};

VSOCKET.registrarCallback = function(operacao, idObj, callback) {
    if (!VSOCKET.callbacks[operacao]) {
        VSOCKET.callbacks[operacao] = {};
    }
    VSOCKET.callbacks[operacao][idObj] = callback;

};
VSOCKET.executarCallback = function(operacao, idObj, msg) {
    var cbo = VSOCKET.callbacks[operacao];
    if (cbo && cbo[idObj]) {
        cbo[idObj](msg);
        cbo[idObj] = null;
    }
};

VSOCKET.salvarVetor = function(vetor, callback) {
    VSOCKET.registrarCallback(OPERACOES.SALVAR_VETOR.emis, vetor.nome, callback);
    var tipo;
    var wrapper;
    if (vetor instanceof GEO.Resultado) {
        var dados = {};
         for (var vec in vetor.dados) {
            var vAux = vetor.dados[vec];
            if(vAux instanceof GEO.Vetor3D){
                dados[vec] = new VSOCKET.Vetor3D(vAux.getX(), vAux.getY(), vAux.getZ(), vAux.getNome());
            }else{
                dados[vec] = vAux;
            }
        };
        wrapper = {nome: vetor.nome, operacao: vetor.operacao.id, dados: dados, propriedades: vetor.propriedades};
        VSOCKET.server.emit(OPERACOES.SALVAR_VETOR.emis, {resultado: wrapper, idCalc: window.location.pathname.replace(/^.+\//, ""), tipo: 'resultado'});
    } else {
        wrapper = new VSOCKET.Vetor3D(vetor.getX(), vetor.getY(), vetor.getZ(), vetor.getNome());
        wrapper.propriedades = vetor.propriedades;
        VSOCKET.server.emit(OPERACOES.SALVAR_VETOR.emis, {vetor: wrapper, idCalc: window.location.pathname.replace(/^.+\//, ""), tipo: 'vetor'});
        
    }
};
VSOCKET.removerVetor = function(vetor, callback) {
    VSOCKET.registrarCallback(OPERACOES.REMOVER_VETOR.emis, vetor.getNome(), callback);
    if (vetor instanceof GEO.Resultado) {
        VSOCKET.server.emit(OPERACOES.REMOVER_VETOR.emis, {idResultado: vetor.getId(), idCalc: window.location.pathname.replace(/^.+\//, ""), tipo: 'resultado'});
    } else {
        VSOCKET.server.emit(OPERACOES.REMOVER_VETOR.emis, {idVetor: vetor.getId(), idCalc: window.location.pathname.replace(/^.+\//, ""), tipo: 'vetor'});
    }
};

VSOCKET.listarVetores = function(idUsuario, idCalc, callback) {
    VSOCKET.registrarCallback(OPERACOES.LISTAR_VETORES.emis, idCalc, callback);
    VSOCKET.server.emit(OPERACOES.LISTAR_VETORES.emis, {idUsuario: idUsuario, idCalc: idCalc});
};




