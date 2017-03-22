var Exp = Exp || {};

Exp.resoverExp = function(exp){
	var min = -1;
	var nEx = "";
	for (var i = 0; i < exp.length; i++) {
		console.log("Exp: " + exp[i]);
		var ch = exp[i];
		if (ch == "(") {
			min = i;
			nEx = "";
		} else {
			if (ch == ")") {
				resoverExp(nEx);
			}
			if (min != -1) {
				nEx += ch;
			}
		}

	};
}
