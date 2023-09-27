"use strict";
window.addEventListener("load", () => {
	// Variables
	let textoActores = document.querySelector("#datosDetalle #actores p");
	let consolidado = textoActores.innerHTML;
	let contador = 0;
	let texto = null;

	if (consolidado.length)
		for (let i = consolidado.length - 1; i >= 0; i--) {
			// Revisa si el carácter es un paréntesis de cierre
			let caracter = consolidado[i];
			if (caracter == ")") {
				contador++;
				if (contador == 1) {
					texto = consolidado.slice(0, i + 1);
					if (i < consolidado.length - 1 && consolidado[i + 1] == ",") {
						texto += ",</span>";
						texto += consolidado.slice(i + 2);
					} else {
						texto += "</span>";
						if (i < consolidado.length - 1) texto += consolidado.slice(i + 1);
					}
				}
			} else if (caracter == "(") {
				contador--;
				if (contador == 0) {
					if (i > 0) texto = consolidado.slice(0, i);
					texto += "<span>";
					texto += consolidado.slice(i);
				}
			}

			// Si corresponde, actualiza el contenido del texto
			if (texto) consolidado = texto;
			texto = null;
		}

	// Convierte el sector en 'bold'
	textoActores.innerHTML = consolidado;
	textoActores.style.fontWeight = "bold";
});
