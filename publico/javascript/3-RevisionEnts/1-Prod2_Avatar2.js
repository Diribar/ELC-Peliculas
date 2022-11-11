"use strict";
window.addEventListener("load", () => {
	let beneficios = {
		titulo: document.querySelectorAll("#medio #titulo")[0],
		ul: document.querySelectorAll("#medio #beneficios"),
	};
	let perjuicios = {
		titulo: document.querySelectorAll("#medio #titulo")[1],
		ul: document.querySelectorAll("#medio #perjuicios"),
	};

	// Variables de Imagen Nueva
	let imagenNuevaDOM = document.querySelector("#izquierda img");
	let imagenNueva = {
		dom: imagenNuevaDOM,
		ancho: imagenNuevaDOM.naturalWidth,
		alto: imagenNuevaDOM.naturalHeight,
	};
	imagenNueva.ratio = imagenNueva.alto / imagenNueva.ancho;
	imagenNueva.ratioAdecuado = imagenNueva.ratio >= 1.42 && imagenNueva.ratio <= 2;

	// Variables de Imagen Actual
	let imagenActualDOM = document.querySelector("#derecha img");
	let imagenActual = {
		dom: imagenActualDOM,
		ancho: imagenActualDOM.naturalWidth,
		alto: imagenActualDOM.naturalHeight,
	};
	imagenActual.ratio = imagenActual.alto / imagenActual.ancho;
	imagenActual.ratioAdecuado = imagenActual.ratio >= 1.42 && imagenActual.ratio <= 2;

	// Comparaciones de ratio
	beneficios = {
		...beneficios,
		ratioResultado:
			!imagenActual.ratioAdecuado &&
			(imagenNueva.ratioAdecuado || (imagenNueva.ratio > imagenActual.ratio && imagenNueva.ratio <= 2)),
		ratioLeyenda: "Mejor relación de alto y ancho",
	};
	perjuicios = {
		...perjuicios,
		ratioResultado:
			!imagenNueva.ratioAdecuado &&
			(imagenActual.ratioAdecuado ||
				(imagenActual.ratio > imagenNueva.ratio && imagenActual.ratio <= 2)),
		ratioLeyenda: "Peor relación de alto y ancho",
	};

	// Comparaciones de calidad
	beneficios = {
		...beneficios,
		calidadResultado: (imagenActual.alto < 700) & (imagenNueva.alto > imagenActual.alto),
		calidadLeyenda: "Mejor resolución",
	};
	perjuicios = {
		...perjuicios,
		calidadResultado: (imagenNueva.alto < 700) & (imagenActual.alto > imagenNueva.alto),
		calidadLeyenda: "Peor resolución",
	};

	// Funciones
	let feedback = (bloque, infos) => {
		if (typeof infos == "string") {
			// Agregar titulo
			let h3 = document.createElement("h3");
			h3.innerText = bloque.slice(0, -1) + ":";
			bloque == "beneficios" ? beneficios.titulo.appendChild(h3) : perjuicios.titulo.appendChild(h3);
			// Agregar párrafo
			let p = document.createElement("p");
			p.innerText = (
				!beneficios[infos + "Leyenda"] && !perjuicios[infos + "Leyenda"]
					? infos
					: bloque == "beneficios"
					? beneficios[infos + "Leyenda"]
					: perjuicios[infos + "Leyenda"]
			).toLowerCase();
			bloque == "beneficios" ? beneficios.titulo.appendChild(p) : perjuicios.titulo.appendChild(p);
		} else {
			// Agregar titulo
			let h3 = document.createElement("h3");
			h3.innerText = bloque + ":";
			bloque == "beneficios" ? beneficios.titulo.appendChild(h3) : perjuicios.titulo.appendChild(h3);
			for (let info of infos) {
				let li = document.createElement("li");
				li.innerText = [bloque][info + "Leyenda"];
				bloque == "beneficios" ? beneficios.ul.appendChild(li) : perjuicios.ul.appendChild(li);
			}
		}
		// Fin
		return;
	};

	// Beneficios
	!beneficios.ratioResultado && !beneficios.calidadResultado
		? feedback("beneficios", "ninguno")
		: !beneficios.ratioResultado
		? feedback("beneficios", "calidad")
		: !beneficios.calidadResultado
		? feedback("beneficios", "ratio")
		: feedback("beneficios", ["ratio", "calidad"]);

	// Perjuicios
	!perjuicios.ratioResultado && !perjuicios.calidadResultado
		? feedback("perjuicios", "ninguno")
		: !perjuicios.ratioResultado
		? feedback("perjuicios", "calidad")
		: !perjuicios.calidadResultado
		? feedback("perjuicios", "ratio")
		: feedback("perjuicios", ["ratio", "calidad"]);

	// if (!peorRatio.resultado) document.querySelector("#perjuicios #ratio").classList.add("ocultar");
	// if (!peorCalidad.resultado) document.querySelector("#perjuicios #resolucion").classList.add("ocultar");
	// if (!peorRatio.resultado && !peorCalidad.resultado) {
	// 	const para = document.createElement("p");
	// 	para.innerText = "ninguno";
	// 	perjuicios.appendChild(para);
	// }
});
