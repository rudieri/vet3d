var STATE = {NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2};
var VET3D = VET3D || {
    vetores: {},
    idxUltVet: 0,
    qtdVetores: 0,
    entrVet: undefined,
    entrExp: undefined,
    saidaVet: undefined,
    dCanvas: undefined,
    camera: undefined,
    scene: undefined,
    renderer: undefined,
    enabled: true,
    vector: new THREE.Vector3(),
    state: STATE.NONE,
    center: new THREE.Vector3(),
    normalMatrix: new THREE.Matrix3(),
    pointer: new THREE.Vector2(),
    pointerOld: new THREE.Vector2(),
    htmlDirCam: undefined,
    htmlPosCam: undefined,
    configurar: function(entradaVetores, entradaExpressoes, saidaVetores, entrDirecaoCamera, entrPosicaoCamera, canvasContainer) {
        VET3D.entrVet = entradaVetores;
        VET3D.entrExp = entradaExpressoes;
        VET3D.saidaVet = saidaVetores;
        VET3D.dCanvas = canvasContainer;
        VET3D.htmlDirCam = entrDirecaoCamera;
        VET3D.htmlPosCam = entrPosicaoCamera;
        GEO.init();


        var LARGURA = window.innerWidth - 40;
        var ALTURA = window.innerHeight - 60;

        //Cena
        VET3D.scene = new THREE.Scene();
        // Camera
        VET3D.camera = new THREE.PerspectiveCamera(75, LARGURA / ALTURA, 1, 10000);
        VET3D.camera.position.z = 40;
        VET3D.camera.position.y = 5;
        VET3D.camera.position.x = 5;

        VET3D.htmlPosCam.value = "(" + VET3D.camera.position.x + ", " + VET3D.camera.position.y + ", " + VET3D.camera.position.z + ")";
        VET3D.htmlDirCam.value = "(0,0,0)";

        // Renderer
        VET3D.renderer = new THREE.CanvasRenderer();
        VET3D.renderer.setSize(LARGURA, ALTURA);

        VET3D.dCanvas.appendChild(VET3D.renderer.domElement);


        VET3D.dCanvas.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        }, false);
        VET3D.dCanvas.addEventListener('mousedown', VET3D.onMouseDown, false);
        VET3D.dCanvas.addEventListener('mousewheel', VET3D.onMouseWheel, false);
        VET3D.dCanvas.addEventListener('DOMMouseScroll', VET3D.onMouseWheel, false); // firefox
        VET3D.itensPreDefinidos();
        VET3D.animate();
    },
    // configurando o Three
    animate: function() {
        requestAnimationFrame(VET3D.animate);
        VET3D.render();
    },
    render: function() {
        VET3D.camera.lookAt(VET3D.center);
        VET3D.renderer.render(VET3D.scene, VET3D.camera);
    },
    atualizaCamera: function() {
        var vetor = VET3D.criarVetorDoTexto(htmlPosCam.value);
        VET3D.camera.position.x = vetor.x;
        VET3D.camera.position.y = vetor.y;
        VET3D.camera.position.z = vetor.z;
    },
    atualizaInfoCamera: function() {
        var x = Math.round(VET3D.camera.position.x * 10) / 10;
        var y = Math.round(VET3D.camera.position.y * 10) / 10;
        var z = Math.round(VET3D.camera.position.z * 10) / 10;
        VET3D.htmlPosCam.value = "(" + x + ", " + y + ", " + z + ")";
    },
    // remover
    alternarContrCamera: function() {
        console.warn('DEPRECATED: alternarContrCamera');
        var contrCamera = document.getElementById('contrCamera');
        var divs = contrCamera.getElementsByTagName('div');
        for (var i = 0; i < divs.length; i++) {
            var div = divs[i];
            div.style['display'] = div.style['display'] === 'none' ? 'block' : 'none';
        }
    },
    atualizarDirCamera: function() {
        var vetor = VET3D.criarVetorDoTexto(VET3D.htmlDirCam.value);
        VET3D.center.setX(vetor.x);
        VET3D.center.setY(vetor.y);
        VET3D.center.setZ(vetor.z);
        VET3D.camera.lookAt(VET3D.center);
    },
    atualizaInfoDirCamera: function() {
        var x = Math.round(VET3D.center.x * 10) / 10;
        var y = Math.round(VET3D.center.y * 10) / 10;
        var z = Math.round(VET3D.center.z * 10) / 10;
        VET3D.htmlDirCam.value = "(" + x + ", " + y + ", " + z + ")";
    },
    // métodos dos vetores

    criarVetorDoTexto: function(txtVet) {
        var coordenadas = txtVet.match(/([0-9.-]+)/g);
        if (coordenadas.length !== 3) {
            alert("Vetor inválido!");
            return;
        }
        ;
        return new GEO.Vetor3D(new GEO.Ponto3D(coordenadas[0], coordenadas[1], coordenadas[2]));
    },
    criarVetor: function() {
        if (VET3D.entrVet === undefined) {
            console.log("Você não definiu um campo de texto para a entrada dos dados dos vetores.\n Use VET3D.configurar(entradaVetores, entradaExpressoes, saidaVetores, scene).");
        }
        var txtVet = VET3D.entrVet.value;
        var v1 = VET3D.criarVetorDoTexto(txtVet);
        var idxVet = VET3D.getNextIdx();

        VET3D.entrVet.value = "";


        v1.setNome("V" + (idxVet));

        VET3D.adicionarVetor(v1, idxVet);
        VSOCKET.salvarVetor(v1, function(data){
            console.log("Vetor salvo com id: " + data.idVetor + ", resultado: " + data.resultado);
            if (data.resultado == 0) {
                v1._id = data.idVetor;
            }
        });

    },
    adicionarVetor: function(v1, idxVet) {
        if (idxVet === undefined) {
            idxVet = VET3D.getNextIdx();
        }
        VET3D.vetores[idxVet] = v1;
        VET3D.qtdVetores++;
        var div = document.createElement("div");
        div.setAttribute("id", "_" + v1.getNome() + "_");
        // div.setAttribute("class", "lista");
        div.innerHTML += v1.getNome() + " (" + v1.getX() + ", " + v1.getY() + ", " + v1.getZ() + ") <span class='opcoes'> <img src='/public/images/menu.png' alt='Editar' onclick='VET3D.editar("+idxVet+")'/> <a href='#' onclick= VET3D.removerVetor(" + idxVet + ");><img src='/public/images/x.png' alt='Remover'/></a></span><br/>";
        if (idxVet === VET3D.idxUltVet) {
           VET3D.saidaVet.appendChild(div);
        } else {
            for (var i = idxVet + 1; i <= VET3D.idxUltVet; i++) {
                var outroDiv;
                if (VET3D.vetores[i] !== null) {
                    outroDiv = document.getElementById("_v" + i + "_");
                    break;
                }
            }
            if (!outroDiv) {
                VET3D.saidaVet.appendChild(div);
            } else {
                VET3D.saidaVet.insertBefore(div, outroDiv);
            }
        }
        v1.addToScene(VET3D.scene);

    },
    removerVetor: function(idxVet) {
        var v = VET3D.vetores[idxVet];
        v.remove(VET3D.scene);
        VET3D.vetores[idxVet] = null;
        VET3D.qtdVetores--;

        VET3D.saidaVet.removeChild(document.getElementById("_" + v.getNome() + "_"));
        VSOCKET.removerVetor(v);
    },
    editar: function(idxVet){
        var elCont = document.getElementById('edt_opcoes');
        elCont.style['display'] = 'block';
        var elIdxVet = document.getElementById('idxVetEdit');
        var elTipoLinha = document.getElementById('tipoLinha');
        var elCorLinha = document.getElementById('corLinha');
        var elCorTxt = document.getElementById('corTexto');

        var v = VET3D.vetores[idxVet];
        elIdxVet.value = idxVet;
        elTipoLinha.value = v.propriedades.tipoLinha;
        elCorLinha.value = v.propriedades.corLinha;
        elCorTxt.value = v.propriedades.corTexto;

    },
    salvarOpcoes: function(){
        var elCont = document.getElementById('edt_opcoes');
        elCont.style['display'] = 'none';

        var elIdxVet = document.getElementById('idxVetEdit');
        var v = VET3D.vetores[elIdxVet.value];


        var elTipoLinha = document.getElementById('tipoLinha');
        var elCorLinha = document.getElementById('corLinha');
        var elCorTxt = document.getElementById('corTexto');

        
        v.propriedades.tipoLinha = Number(elTipoLinha.value);
        v.propriedades.corLinha = Number(elCorLinha.value);
        v.propriedades.corTexto = Number(elCorTxt.value);
        v.atualizar = true;
        v.remove(VET3D.scene);
        v.addToScene(VET3D.scene);

    },
    getNextIdx: function() {
        var idxVet = -1;
        if (VET3D.idxUltVet === VET3D.qtdVetores) {
            idxVet = ++VET3D.idxUltVet;
        } else {
            for (var i = 1; i <= VET3D.idxUltVet; i++) {
                if (VET3D.vetores[i] === null) {
                    idxVet = i;
                    break;
                }
                if (idxVet === -1) {
                    idxVet = ++VET3D.idxUltVet;
                }
            }
        }
        return idxVet;
    },
    resolver: function() {
        var vr;
        var txtExp = VET3D.entrExp.value;
        //Exp.resoverExp(txtExp);
        var argumentos = txtExp.match(/(v?[0-9]+)[ ]*([p+\/*\-]{1})[ ]*(v?[0-9]+)/i);
        
        for (var i = 0; i < argumentos.length; i++) {
            console.log(argumentos[i]);

        }
        if (argumentos.length !== 4) {
            alert("Expressão inválida!");
            return;
        }

        var operador = argumentos[2];

        var v1;
        if (/^[0-9]+$/.test(argumentos[1])) {
            v1 = new Number(argumentos[1]);
        } else {
            v1 = VET3D.vetores[argumentos[1].match(/([0-9]+)/)[1]];

        }

        var v2;
        if (/^[0-9]+$/.test(argumentos[3])) {
            v2 = new Number(argumentos[3]);
        } else {
            v2 = VET3D.vetores[argumentos[3].match(/([0-9]+)/)[1]];
        }

        var linhasAux;
        if (v1 instanceof Number && v2 instanceof Number) {
            var saida;
            if (operador === "+") {
                saida = v1 + v2;
            } else if (operador === "-") {
                saida = v1 - v2;
            } else if (operador === "*") {
                saida = v1 * v2;
            } else if (operador === "/") {
                saida = v1 / v2;
            } else {
                alert("Operador inválido!");
                return;
            }
            alert("Não tens nada melhor para fazer?\n" + v1 + " " + operador + " " + v2 + " = " + saida);
            return;
        } else if (v1 instanceof GEO.Vetor3D && v2 instanceof Number) {
            if (operador === "*") {
                vr = new GEO.Resultado(GEO.Operacoes.MULTIPLICAR_ESCALAR, v1, v2);
                // vr = GEO.multiplicarEscalar(v1, v2);
            } else if (operador === "/") {
                vr = new GEO.Resultado(GEO.Operacoes.DIVIDIR_ESCALAR, v1, v2);
                // vr = GEO.dividirEscalar(v1, v2);
            } else {
                alert("Operação não se aplica a um vetor e um escalar.");
                return;
            }

        } else if (v1 instanceof GEO.Vetor3D && v2 instanceof GEO.Vetor3D) {
            if (operador === "+") {
                vr = new GEO.Resultado(GEO.Operacoes.SOMAR, v1, v2);
                // vr = GEO.somar(v1, v2);
                // linhasAux = vr.criarLinhasAuxiliares(GEO.somar, v1, v2);
            } else if (operador === "-") {
                vr = new GEO.Resultado(GEO.Operacoes.SUBTRAIR, v1, v2);
                // vr = GEO.subtrair(v1, v2);
            } else if (operador === "*") {
                vr = new GEO.Resultado(GEO.Operacoes.PRODUTO_VETORIAL, v1, v2);
                // vr = GEO.produtoVetorial(v1, v2);
                // linhasAux = vr.criarLinhasAuxiliares(GEO.produtoVetorial, v1, v2);
            } else if (operador === "p") {
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
        VET3D.adicionarVetor(vr, ++VET3D.idxUltVet);
        VSOCKET.salvarVetor(vr, function(data){
            if (data.resultado == 0) {
                vr._id = data.idResultado;
            }
        });

        // for (var vec in linhasAux) {
            //VET3D.scene.add(linhasAux.linha1);
            //VET3D.scene.add(linhasAux.linha2);
        // };


    },
    itensPreDefinidos: function() {
        var planoXY = new GEO.Grade(300, 4, "xz");
        VET3D.scene.add(planoXY);


        // var planoYZ = new GEO.Grade( 300, 4, "yz" );
        // scene.add(planoYZ);

        var xMaterial = new THREE.LineDashedMaterial({color: 0xff0000, dashSize: 12});
        var yMaterial = new THREE.LineDashedMaterial({color: 0x0000ff, dashSize: 12});
        var zMaterial = new THREE.LineDashedMaterial({color: 0x00ff00, dashSize: 12});

        var vxP = new GEO.Vetor3D(new GEO.Ponto3D(300, 0, 0));
        vxP.setNome("(+300)");
        vxP.posicaoTexto = vxP;
        var vxN = new GEO.Vetor3D(new GEO.Ponto3D(-300, 0, 0));
        vxN.posicaoTexto = vxN;
        vxN.setNome("X (-300)");

        var vyP = new GEO.Vetor3D(new GEO.Ponto3D(0, 300, 0));
        vyP.posicaoTexto = vyP;
        vyP.setNome("(+300)");
        var vyN = new GEO.Vetor3D(new GEO.Ponto3D(0, -300, 0));
        vyN.posicaoTexto = vyN;
        vyN.setNome("Y (-300)");

        var vzP = new GEO.Vetor3D(new GEO.Ponto3D(0, 0, 300));
        vzP.posicaoTexto = vzP;
        vzP.setNome("(+300)");
        var vzN = new GEO.Vetor3D(new GEO.Ponto3D(0, 0, -300));
        vzN.posicaoTexto = vzN;
        vzN.setNome("Z (-300)");

        vxP.addToScene(VET3D.scene, xMaterial);
        vxN.addToScene(VET3D.scene, xMaterial);
        vyP.addToScene(VET3D.scene, yMaterial);
        vyN.addToScene(VET3D.scene, yMaterial);
        vzP.addToScene(VET3D.scene, zMaterial);
        vzN.addToScene(VET3D.scene, zMaterial);

    },
    rotate: function(delta) {

        VET3D.vector.copy(VET3D.camera.position).sub(VET3D.center);

        var theta = Math.atan2(VET3D.vector.x, VET3D.vector.z);
        var phi = Math.atan2(Math.sqrt(VET3D.vector.x * VET3D.vector.x + VET3D.vector.z * VET3D.vector.z), VET3D.vector.y);

        theta += delta.x;
        phi += delta.y;

        var EPS = 0.000001;

        phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

        var radius = VET3D.vector.length();

        VET3D.vector.x = radius * Math.sin(phi) * Math.sin(theta);
        VET3D.vector.y = radius * Math.cos(phi);
        VET3D.vector.z = radius * Math.sin(phi) * Math.cos(theta);

        VET3D.camera.position.copy(VET3D.center).add(VET3D.vector);

        VET3D.camera.lookAt(VET3D.center);

        VET3D.atualizaInfoCamera();
        VET3D.atualizaInfoDirCamera();

    },
    pan: function(distance) {

        VET3D.normalMatrix.getNormalMatrix(VET3D.camera.matrix);

        distance.applyMatrix3(VET3D.normalMatrix);
        distance.multiplyScalar(VET3D.vector.copy(VET3D.center).sub(VET3D.camera.position).length() * 0.001);

        VET3D.camera.position.add(distance);
        VET3D.center.add(distance);

        VET3D.atualizaInfoCamera();
        VET3D.atualizaInfoDirCamera();

    },
    zoom: function(distance) {

        VET3D.normalMatrix.getNormalMatrix(VET3D.camera.matrix);

        distance.applyMatrix3(VET3D.normalMatrix);
        distance.multiplyScalar(VET3D.vector.copy(VET3D.center).sub(VET3D.camera.position).length() * 0.001);

        VET3D.camera.position.add(distance);

        VET3D.atualizaInfoCamera();
        VET3D.atualizaInfoDirCamera();

    },
    onMouseDown: function(event) {

        if (VET3D.enabled === false)
            return;

        event.preventDefault();

        if (event.button === 0) {

            VET3D.state = STATE.ROTATE;

        } else if (event.button === 1) {

            VET3D.state = STATE.ZOOM;

        } else if (event.button === 2) {

            VET3D.state = STATE.PAN;

        }

        VET3D.pointerOld.set(event.clientX, event.clientY);

        VET3D.dCanvas.addEventListener('mousemove', VET3D.onMouseMove, false);
        VET3D.dCanvas.addEventListener('mouseup', VET3D.onMouseUp, false);
        VET3D.dCanvas.addEventListener('mouseout', VET3D.onMouseUp, false);

    },
    onMouseMove: function(event) {

        if (VET3D.enabled === false)
            return;

        event.preventDefault();

        VET3D.pointer.set(event.clientX, event.clientY);

        var movementX = VET3D.pointer.x - VET3D.pointerOld.x;
        var movementY = VET3D.pointer.y - VET3D.pointerOld.y;

        if (VET3D.state === STATE.ROTATE) {

            VET3D.rotate(new THREE.Vector3(-movementX * 0.005, -movementY * 0.005, 0));

        } else if (VET3D.state === STATE.ZOOM) {

            VET3D.zoom(new THREE.Vector3(0, 0, movementY));

        } else if (VET3D.state === STATE.PAN) {

            VET3D.pan(new THREE.Vector3(-movementX, movementY, 0));

        }

        VET3D.pointerOld.set(event.clientX, event.clientY);

    },
    onMouseUp: function(event) {

        if (VET3D.enabled === false)
            return;

        VET3D.dCanvas.removeEventListener('mousemove', VET3D.onMouseMove, false);
        VET3D.dCanvas.removeEventListener('mouseup', VET3D.onMouseUp, false);
        VET3D.dCanvas.removeEventListener('mouseout', VET3D.onMouseUp, false);

        VET3D.state = STATE.NONE;

    },
    onMouseWheel: function(event) {

        if (VET3D.enabled === false)
            return;

        var delta = 0;

        if (event.wheelDelta) { // WebKit / Opera / Explorer 9

            delta = -event.wheelDelta;

        } else if (event.detail) { // Firefox

            delta = event.detail * 10;

        }

        VET3D.zoom(new THREE.Vector3(0, 0, delta));

    }

};










//        var passo = 1;

//   		window.addEventListener("keydown", function(evt) {
//            if (evt.shiftKey) {
//                if (evt.keyCode === 87) {
//                	camera.position.y += passo;
//                    // cy.value = parseInt(cy.value) + passo;
//                } else if (evt.keyCode === 83) {
//                	camera.position.y -= passo;
//                    // cy.value=parseInt(cy.value) - passo;
//                } else {
//                    //console.log("Key" + evt.keyCode);
//                    return;
//                }
//            } else {
//                if (evt.keyCode === 87) {
//                	camera.position.z += passo;
//                    // cz.value=parseInt(cz.value) + passo;
//                } else if (evt.keyCode === 83) {
//                	camera.position.z -= passo;
//                    // cz.value=parseInt(cz.value) - passo;
//                } else if (evt.keyCode === 65) {
//                	camera.position.x -= passo;
//                    // cx.value=parseInt(cx.value) - passo;
//                } else if (evt.keyCode === 68) {
//                	camera.position.x += passo;
//                    // cx.value=parseInt(cx.value) + passo;
//                } else {
//                   // console.log("Key" + evt.keyCode);
//                    return;
//                }
//            }
//            atualizaInfoCamera();

//            //console.log("Camera: [" + camera.position.x + ", " + camera.position.y + ", " + camera.position.z + "]");

//       	}, false);


// }
