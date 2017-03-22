var GEO = {};
var ORIGEM;
var vectorOrigem;

GEO.init = function() {
    vectorOrigem = new THREE.Vector3(0, 0, 0);
    ORIGEM = new GEO.Ponto3D(0, 0, 0);
    GEO.Vetor3D.prototype = new GEO.CVetor();
    GEO.Resultado.prototype = new GEO.CVetor();
    this.CANONICAL_I = new GEO.Vetor3D(new GEO.Ponto3D(1, 0, 0));
    this.CANONICAL_J = new GEO.Vetor3D(new GEO.Ponto3D(0, 1, 0));
    this.CANONICAL_K = new GEO.Vetor3D(new GEO.Ponto3D(0, 0, 1));

    GEO.Operacoes = {
        getOperacao: function (id) {
            for (var vec in GEO.Operacoes) {
                if (this[vec].id == id) {
                    return this[vec];
                }
            }
        },
        SOMAR: {id: 1, executar: GEO.somar},
        SUBTRAIR: {id: 2, executar: GEO.subtrair},
        MULTIPLICAR_ESCALAR: {id: 3, executar: GEO.multiplicarEscalar},
        DIVIDIR_ESCALAR: {id: 4, executar: GEO.divivirEscalar},
        PRODUTO_ESCALAR: {id: 5, executar: GEO.produtoEscalar},
        PRODUTO_MISTO: {id: 6, executar: GEO.produtoMisto},
        PRODUTO_VETORIAL: {id: 7, executar: GEO.produtoVetorial},
        ANGULO_INTERNO: {id: 8, executar: GEO.anguloInterno},
        ANGULO_INTERNO_PLANO_RETA: {id: 9, executar: GEO.anguloInternoPlanoReta},
        PROJECAO: {id: 10, executar: GEO.projecao}
    };

};



GEO.CVetor = function(){

    this.setNome = function(nome){
        this.nome = nome;
    }

    this.getNome = function () {
        return this.nome;
    }
    this.setId = function(id){
        this._id = id;
    }

    this.getId = function () {
        return this._id;
    }

    this.getX = function() {
        return this.x;
    };

    this.getY = function() {
        return this.y;
    };

    this.getZ = function() {
        return this.z;
    };

    this.getModulo = function() {
        return Math.pow(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2), 0.5);
    };


    this.getVersor = function() {
        return GEO.divivirEscalar(this, this.getModulo());
    };

    this.getInverso = function() {
        return new Vetor3D(new GEO.Ponto3D(-this.x, -this.y, -this.z));
    };
    this.addToScene = function(scene){
        var material;
        if (this.propriedades.tipoLinha > 0) {
            material =  new THREE.LineDashedMaterial( { color:  this.propriedades.corLinha, dashSize:this.propriedades.tipoLinha});
        }else{
            material = new THREE.LineBasicMaterial( { color:  this.propriedades.corLinha});
        }
        //var cor = material !== undefined ? material.color : Math.random() * 0xffffff;
        if (this.line === undefined || this.atualizar) {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(vectorOrigem);
            var destino = new THREE.Vector3(this.x, this.y, this.z);
            geometry.vertices.push(destino);
            this.line = new THREE.Line(geometry, material);  



            
            var versor = this.getVersor(); 
            var dir = new THREE.Vector3(versor.x, versor.y, versor.z);
            
            this.seta = new GEO.SetaVetor(dir, destino, 5, this.propriedades.corLinha);

        }

        if (this.nome !== undefined) {       
            if (this.text === undefined || this.atualizar) {
                    var text3d = new THREE.TextGeometry( this.nome, {size: 0.3, height: 0.05, curveSegments: 2, font: "helvetiker"});

                    text3d.computeBoundingBox();
                    //var centerOffset = -0.5 *(text3d.boundingBox.max.x - text3d.boundingBox.min.x );

                    var textMaterial = new THREE.MeshBasicMaterial( { color: this.propriedades.corTexto, overdraw: true } );
                    this.text = new THREE.Mesh( text3d, textMaterial );

                    if (this.posicaoTexto === undefined) {
                        this.posicaoTexto = GEO.multiplicarEscalar(this, 0.5);
                    }
                    this.text.position.x = this.posicaoTexto.x;
                    this.text.position.y = this.posicaoTexto.y;
                    this.text.position.z = this.posicaoTexto.z;

                    this.text.rotation.x = 0;
                    this.text.rotation.y = 0;
            }
            scene.add(this.text);
        }
        scene.add(this.line);
        scene.add(this.seta); 
        this.atualizar = false;
    };

    this.remove = function(scene){
        scene.remove(this.text);
        scene.remove(this.line);
        scene.remove(this.seta); 
    }
    this.toString = function() {
        return (this.nome === undefined ? "" : this.nome + " ") + "[" + this.getX() + ", " +this.getY() + ", " + this.getZ() + "]";
    };
}


/**Define o objeto Ponto
 * @argument {Integer} x 
 * @argument {Integer} y 
 * @argument {Integer} z */
GEO.Ponto3D = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.getX = function() {
        return this.x;
    };

    this.getY = function() {
        return this.y;
    };

    this.getZ = function() {
        return this.z;
    };
    this.toString = function() {
        return "[" + x + ", " + y + ", " + z + "]";
    };

};
/**
 * Define o objeto Vetor.
 @argument {Ponto3D} pontoExtremidade ponto que define a extremidade do vetor
 @argument {Ponto3D} pontoOrigem ponto que define a origem, caso não informado, é usado o ponto (0, 0, 0).
 * */
GEO.Vetor3D = function(pontoExtremidade, pontoOrigem) {
   this.propriedades = {
        corLinha: Math.round(Math.random() * 0xffffff),
        tipoLinha: 0,
        corTexto: Math.round(Math.random() * 0xffffff)
   };
   if (pontoOrigem === undefined) {
        this.x = pontoExtremidade.getX() - ORIGEM.getX();
        this.y = pontoExtremidade.getY() - ORIGEM.getY();
        this.z = pontoExtremidade.getZ() - ORIGEM.getZ();
   } else {
        this.x = pontoExtremidade.getX() - pontoOrigem.getX();
        this.y = pontoExtremidade.getY() - pontoOrigem.getY();
        this.z = pontoExtremidade.getZ() - pontoOrigem.getZ();
   }

};

GEO.Resultado = function (operacao) {
    this.propriedades = {
        corLinha: Math.round(Math.random() * 0xffffff),
        tipoLinha: 0,
        corTexto: Math.round(Math.random() * 0xffffff)
    };
    this.operacao = operacao;
    this.dados = {};

    this.set = function(ponto3d){
        this.x = ponto3d.getX();
        this.y = ponto3d.getY();
        this.z = ponto3d.getZ();
    }

    this.setDados = function(dados){
        this.dados = dados;

        switch(this.operacao){
            case GEO.Operacoes.SOMAR:
            case GEO.Operacoes.SUBTRAIR:
            case GEO.Operacoes.PRODUTO_VETORIAL:
            case GEO.Operacoes.MULTIPLICAR_ESCALAR:
            case GEO.Operacoes.DIVIDIR_ESCALAR:
            case GEO.Operacoes.PROJECAO:
                var p1 = this.dados[0];
                var p2 = this.dados[1];
                this.set(operacao.executar(p1, p2));
            break;
            case GEO.Operacoes.PRODUTO_ESCALAR:
            case GEO.Operacoes.PRODUTO_MISTO:
            case GEO.Operacoes.ANGULO_INTERNO:
            case GEO.Operacoes.ANGULO_INTERNO_PLANO_RETA:
                var p1 = this.dados[0];
                var p2 = this.dados[1];
                var p3 = this.dados[2];
                var result = operacao.executar(p1, p2, p3);
                console.warn("Operação não completa. Resultado: " + result);
            break;

        }
    }

    if (arguments.length > 1) {
        var dados = {};
        for (var i = 1; i < arguments.length; i++) {
            dados[i-1] = arguments[i];
        };
        this.setDados(dados);
    }

    this.getX = function () {
        return this.x;
    }
    this.getY = function () {
        return this.y;
    }
    this.getZ = function () {
        return this.z;
    }


    this.addToScene = function(scene, material){
        this.__proto__.addToScene.call(this, scene, material);
        if (!this.linhasAux) {
            this.linhasAux = this.criarLinhasAuxiliares();
        }
        for (var vec in this.linhasAux) {
            scene.add(this.linhasAux[vec]);
        }
    }
    this.remove = function(scene){
        this.__proto__.remove.call(this, scene);
        if (this.linhasAux) {
            for (var vec in this.linhasAux) {
                scene.remove(this.linhasAux[vec]);
            }
        }
    }

     /** 
    O único parâmetro obrigatório é a operação, que define 
    como as linhas auxiliares serão desenhadas.
    Os outros parâmetros como os dados são obtidos pelo arguments[N].
    */
    this.criarLinhasAuxiliares = function () {
        if (this.linhas !== undefined) {
            return this.linhas;
        };
        var cor = Math.random() * 0xffffff;
        this.linhas = {};
        if (this.operacao === GEO.Operacoes.SOMAR) {
            var destino = new THREE.Vector3(this.x, this.y, this.z);
            
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(this.dados[0].getX(), this.dados[0].getY(), this.dados[0].getZ()));
            geometry.vertices.push(destino);
            this.linhas.linha1 = new THREE.Line(geometry, new THREE.LineDashedMaterial( { color:  cor}));  

            geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(this.dados[1].getX(), this.dados[1].getY(), this.dados[1].getZ()));
            geometry.vertices.push(destino);
            this.linhas.linha2 = new THREE.Line(geometry, new THREE.LineDashedMaterial( { color:  cor}));  

        } else if (this.operacao === GEO.Operacoes.SUBTRAIR) {

        } else if(this.operacao === GEO.Operacoes.PRODUTO_VETORIAL){
            var versorV = this.getVersor();
            var versorA = this.dados[0].getVersor();
            var versorB = this.dados[1].getVersor();
            var vAV = GEO.somar(versorA, versorV);
            var vBV = GEO.somar(versorB, versorV);

            var vecV = new THREE.Vector3(versorV.getX(), versorV.getY(), versorV.getZ());
            var vecA = new THREE.Vector3(versorA.getX(), versorA.getY(), versorA.getZ());
            var vecB = new THREE.Vector3(versorB.getX(), versorB.getY(), versorB.getZ());
            var vecAV = new THREE.Vector3(vAV.getX(), vAV.getY(), vAV.getZ());
            var vecBV = new THREE.Vector3(vBV.getX(), vBV.getY(), vBV.getZ());

            var geometry = new THREE.Geometry();
            geometry.vertices.push(vecA);
            geometry.vertices.push(vecAV);
            geometry.vertices.push(vecV);
            this.linhas.linha1 = new THREE.Line(geometry, new THREE.LineDashedMaterial( { color:  cor}));  

            geometry = new THREE.Geometry();
            geometry.vertices.push(vecB);
            geometry.vertices.push(vecBV);
            geometry.vertices.push(vecV);
            this.linhas.linha2 = new THREE.Line(geometry, new THREE.LineDashedMaterial( { color:  cor}));  

        } else {
            //....
        }
        return this.linhas;
    };
   
}

// GEO.Resultado

// static


GEO.somar = function(vetorA, vetorB) {
    return new GEO.Ponto3D(vetorA.x + vetorB.x, vetorA.y + vetorB.y, vetorA.z + vetorB.z);
}

GEO.subtrair = function(vetorA, vetorB) {
    return new GEO.Ponto3D(vetorA.x - vetorB.x, vetorA.y - vetorB.y, vetorA.z - vetorB.z);
}

GEO.multiplicarEscalar = function(vetorA, escalar) {
    return new GEO.Ponto3D(vetorA.x * escalar, vetorA.y * escalar, vetorA.z * escalar);
}

GEO.divivirEscalar = function(vetorA, escalar) {
    return new GEO.Ponto3D(vetorA.x / escalar, vetorA.y / escalar, vetorA.z / escalar);
}

GEO.produtoEscalar = function(vetorA, vetorB) {
    return (vetorA.x * vetorB.x) + (vetorA.y * vetorB.y) + (vetorA.z * vetorB.z);
}

GEO.produtoMisto = function(vetorA, vetorB, vetorC) {
    return GEO.produtoEscalar(vetorC, GEO.produtoVetorial(vetorA, vetorB));
}

GEO.produtoVetorial = function(vetorA, vetorB) {
    var v1 = GEO.multiplicarEscalar(GEO.CANONICAL_I, vetorA.y * vetorB.z);
    var v2 = GEO.multiplicarEscalar(GEO.CANONICAL_J, vetorA.z * vetorB.x);
    var v3 = GEO.multiplicarEscalar(GEO.CANONICAL_K, vetorA.x * vetorB.y);
    var diagonalPrincipal = GEO.somar(v3, GEO.somar(v1, v2));
    v1 = GEO.multiplicarEscalar(GEO.CANONICAL_K, vetorA.y * vetorB.x);
    v2 = GEO.multiplicarEscalar(GEO.CANONICAL_J, vetorA.x * vetorB.z);
    v3 = GEO.multiplicarEscalar(GEO.CANONICAL_I, vetorA.z * vetorB.y);
    var diagonalSecundaria = GEO.somar(v3, GEO.somar(v1, v2));
    return GEO.subtrair(diagonalPrincipal, diagonalSecundaria);
}


GEO.anguloInterno = function(vetorA, vetorB) {
    return (Math.acos(GEO.produtoEscalar(vetorA, vetorB) / (vetorA.getModulo() * vetorB.getModulo())) / Math.PI) * 180;
}
GEO.anguloInternoPlanoReta = function(vetorA, vetorB) {
    return (Math.asin(GEO.produtoEscalar(vetorA, vetorB) / (vetorA.getModulo() * vetorB.getModulo())) / Math.PI) * 180;
}

GEO.projecao = function(vetorA, vetorB) {
    var pc = GEO.produtoEscalar(vetorA, vetorB);
    var pb = GEO.produtoEscalar(vetorB, vetorB);
    return GEO.multiplicarEscalar(vetorB, pc/pb);
}



GEO.SetaVetor = function(dir, origin, length, hex){

    // dir is assumed to be normalized

    THREE.Object3D.call( this );

    if(hex === undefined)hex = 0xffff00;
    if(length === undefined)length = 5;

    this.position = origin;
   
    var coneGeometry = new THREE.CylinderGeometry( 0, 0.05, 0.25, 5, 1 );
    //coneGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.875, 0));

    this.cone = new THREE.Mesh( coneGeometry, new THREE.MeshBasicMaterial( { color: hex }));
    this.cone.matrixAutoUpdate = false;
    this.add( this.cone );

    this.setDirection( dir );
    this.setLength( length );

};

GEO.SetaVetor.prototype = Object.create( THREE.Object3D.prototype );

GEO.SetaVetor.prototype.setDirection = function () {

    var axis = new THREE.Vector3();
    var radians;

    return function(dir){

        // dir is assumed to be normalized

        if(dir.y > 0.99999){

            this.quaternion.set( 0, 0, 0, 1 );

        } else if(dir.y < - 0.99999){

            this.quaternion.set( 1, 0, 0, 0 );

        } else {

            axis.set( dir.z, 0, - dir.x ).normalize();

            radians = Math.acos( dir.y );

            this.quaternion.setFromAxisAngle( axis, radians );

        }

    };

}();

GEO.SetaVetor.prototype.setLength = function(length){

    this.scale.set( length, length, length );

};

GEO.SetaVetor.prototype.setColor = function(hex){

    this.line.material.color.setHex( hex );
    this.cone.material.color.setHex( hex );

};


/**
 * @author mrdoob / http://mrdoob.com/
    @param plano 
 */

GEO.Grade = function(size, step, plano){

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

    this.color1 = new THREE.Color( 0x444444 );
    this.color2 = new THREE.Color( 0x888888 );

    if (plano == undefined || plano === "xz") {

        for(var i = - size; i <= size; i += step){

            geometry.vertices.push(
                new THREE.Vector3( - size, 0, i ), new THREE.Vector3( size, 0, i ),
                new THREE.Vector3( i, 0, - size ), new THREE.Vector3( i, 0, size )
            );

            var color = i === 0 ? this.color1 : this.color2;

            geometry.colors.push( color, color, color, color );

        }
    } else if (plano === "xy"){
        for(var i = - size; i <= size; i += step){

            geometry.vertices.push(
                new THREE.Vector3( - size, i, 0 ), new THREE.Vector3( size, i, 0 ),
                new THREE.Vector3( i, - size, 0 ), new THREE.Vector3( i, size, 0 )
            );

            var color = i === 0 ? this.color1 : this.color2;

            geometry.colors.push( color, color, color, color );

        }
    } else if (plano === "yz"){
        for(var i = - size; i <= size; i += step){

            geometry.vertices.push(
                new THREE.Vector3( 0, i, - size ), new THREE.Vector3( 0, i, size ),
                new THREE.Vector3( 0, - size, i ), new THREE.Vector3( 0, size, i )
            );

            var color = i === 0 ? this.color1 : this.color2;

            geometry.colors.push( color, color, color, color );

        }
    }

    THREE.Line.call( this, geometry, material, THREE.LinePieces );

};

GEO.Grade.prototype = Object.create( THREE.Line.prototype );

GEO.Grade.prototype.setColors = function( colorCenterLine, colorGrid){

    this.color1.set( colorCenterLine );
    this.color2.set( colorGrid );

    this.geometry.colorsNeedUpdate = true;

}
