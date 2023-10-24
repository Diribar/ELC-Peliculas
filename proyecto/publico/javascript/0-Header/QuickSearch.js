"use strict";
window.addEventListener("load", () => {
	// DOM
	let DOM = {
		desplMostrar: document.querySelector("#busquedaRapida .desplMostrar"),
		input: document.querySelector("#busquedaRapida .desplMostrar input"),
		muestraResultados: document.querySelector("#busquedaRapida .desplMostrar #muestraResultados"),
		escribiMas: document.querySelector("#busquedaRapida .desplMostrar #escribiMas"),
	};

	// Funciones
	let agregaResultados = (registros) => {
		// Generar las condiciones para que se puedan mostrar los 'muestraResultados'
		DOM.muestraResultados.innerHTML = "";
		DOM.muestraResultados.classList.remove("ocultar");

		// Rutinas en función del tipo de variable que sea 'registros'
		if (Array.isArray(registros)) {
			// Crea la tabla y el cuerpo
			let tabla = document.createElement("table");
			let tblBody = document.createElement("tbody");

			// Crea las filas y celdas
			for (let registro of registros) {
				// Variables
				let {familia, entidad, id, anoEstreno, nombre} = registro;
				// Crea una fila y el anchor del registro
				let fila = document.createElement("tr");
				fila.classList.add(familia.slice(0, 4));
				const anchor = document.createElement("a");
				anchor.href = "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;
				// Prepara las variables de la fila
				// 1. Procesa el nombre
				let anchoMax = 40;
				nombre = nombre.length > anchoMax ? nombre.slice(0, anchoMax - 1) + "…" : nombre;
				if (familia == "producto") nombre += " (" + anoEstreno + ")";
				// 2. Procesa la entidad
				let ent = entidad.slice(0, 5);
				if (ent == "perso") ent = "pers.";
				else if (ent != entidad) ent += ".";
				let datos = [nombre, ent];
				// Crea las celdas
				for (let i = 0; i < datos.length; i++) {
					const celda = document.createElement("td");
					const textoCelda = document.createTextNode(datos[i]);
					if (i == 0) {
						// Agrega el texto al 'anchor' (celda nombre)
						anchor.appendChild(textoCelda);
						celda.appendChild(anchor);
					}
					// Agrega el texto a la celda (entidad)
					else celda.appendChild(textoCelda);
					// Agrega la celda a la fila
					fila.appendChild(celda);
				}

				// Agrega la fila al cuerpo de la tabla (tblbody)
				tblBody.appendChild(fila);
				tabla.appendChild(tblBody);
				DOM.muestraResultados.appendChild(tabla);
			}
		}
		// En caso de que sea un sólo registro
		else {
			let parrafo = document.createElement("p");
			parrafo.style.fontStyle = "italic";
			parrafo.style.textAlign = "center";
			parrafo.appendChild(document.createTextNode(registros));
			DOM.muestraResultados.appendChild(parrafo);
		}
	};

	// Add Event Listener
	DOM.input.addEventListener("input", async () => {
		// Impide los caracteres que no son válidos
		DOM.input.value = DOM.input.value.replace(/[^a-záéíóúüñ'\d\s]/gi, "").replace(/ +/g, " ");
		let dataEntry = DOM.input.value;

		// Elimina palabras
		let palabras = dataEntry.split(" ");
		for (let i = palabras.length - 1; i > 0; i--)
			// Elimina palabras repetidas o ¿vacías?
			if (palabras.filter((n) => n == palabras[i]).length > 1 || !palabras[i]) palabras.splice(i, 1);
		let pasaNoPasa = palabras.join("");

		// Acciones si la palabra tiene menos de 4 caracteres significativos
		if (pasaNoPasa.length < 4) {
			// Oculta el sector de muestraResultados
			DOM.muestraResultados.classList.add("ocultar");
			// Muestra el cartel de "escribí más"
			DOM.escribiMas.classList.remove("ocultar");
			return;
		}
		// Oculta el cartel de "escribí más"
		else DOM.escribiMas.classList.add("ocultar");

		// Busca los productos
		palabras = palabras.join(" ");
		let resultados = await fetch("/api/busqueda-rapida/?palabras=" + palabras).then((n) => n.json());
		// Acciones en función de si encuentra resultados o no
		if (resultados.length) agregaResultados(resultados);
		else agregaResultados("- No encontramos coincidencias -");
	});
	DOM.input.addEventListener("keydown", (e) => {
		// Redirige a la vista del hallazgo
		if (e.key == "Enter") {
			DOM.anchors = DOM.muestraResultados.querySelectorAll("a");
			if (DOM.anchors.length == 1) location.href = DOM.anchors[0].href;
			console.log(DOM.anchors.length);
			console.log(DOM.anchors[0].href);
		}

		// Escape - Oculta el sector de muestraResultados
		if (e.key == "Escape") DOM.desplMostrar.classList.add("ocultar");
	});
});
