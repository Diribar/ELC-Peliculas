"use strict";
window.addEventListener("load", () => {
	// DOM
	let input = document.querySelector("#busquedaRapida .despl_mostrar input");
	let hallazgos = document.querySelector("#busquedaRapida .despl_mostrar #displayResultados");
	let escribiMas = document.querySelector("#busquedaRapida .despl_mostrar #escribiMas");

	// Funciones
	let agregaHallazgos = (registros) => {
		// Generar las condiciones para que se puedan mostrar los 'hallazgos'
		input.style.borderBottomLeftRadius = 0;
		input.style.borderBottomRightRadius = 0;
		hallazgos.innerHTML = "";
		hallazgos.classList.remove("ocultar");

		// Rutinas en función del tipo de variable que sea 'registros'
		if (Array.isArray(registros)) {
			// Crea la tabla y el cuerpo
			let tabla = document.createElement("table");
			let tblBody = document.createElement("tbody");

			// Crea las filas y celdas
			for (let registro of registros) {
				// Variables
				let {familia, entidad, id, ano, nombre} = registro;
				// Crea una fila y el anchor del registro
				let fila = document.createElement("tr");
				fila.classList.add(familia.slice(0, 4));
				let anchor = document.createElement("a");
				anchor.href = "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;
				// Prepara las variables de la fila
				// 1. Procesa el nombre
				let anchoMax = 40;
				nombre = nombre.length > anchoMax ? nombre.slice(0, anchoMax - 1) + "…" : nombre;
				if (familia == "producto") nombre += " (" + ano + ")";
				// 2. Procesa la entidad
				let ent = entidad.slice(0, 5);
				if (ent == "perso") ent = "pers.";
				else if (ent != entidad) ent += ".";
				let datos = [nombre, ent];
				// Crea las celdas
				for (let i = 0; i < datos.length; i++) {
					let celda = document.createElement("td");
					let textoCelda = document.createTextNode(datos[i]);
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
				hallazgos.appendChild(tabla);
			}
		}
		// En caso de que sea un sólo registro
		else {
			let parrafo = document.createElement("p");
			parrafo.style.fontStyle = "italic";
			parrafo.style.textAlign = "center";
			parrafo.appendChild(document.createTextNode(registros));
			hallazgos.appendChild(parrafo);
		}
	};

	// Add Event Listener
	input.addEventListener("input", async () => {
		// Impide los caracteres que no son válidos
		input.value = input.value.replace(/[^a-záéíóúüñ\d\s]/gi, "").replace(/ +/g, " ");
		let dataEntry = input.value;

		// Elimina palabras
		let palabras = dataEntry.split(" ");
		for (let i = palabras.length - 1; i > 0; i--)
			// Elimina palabras repetidas o ¿vacías?
			if (palabras.filter((n) => n == palabras[i]).length > 1 || !palabras[i]) palabras.splice(i, 1);
		let pasaNoPasa = palabras.join("");

		// Acciones si la palabra tiene menos de 4 caracteres significativos
		if (pasaNoPasa.length < 4) {
			// Estandariza los bordes redondeados en el input
			input.style.borderRadius = "5px";
			// Oculta el sector de Hallazgos
			hallazgos.classList.add("ocultar");
			// Muestra el cartel de "escribí más"
			escribiMas.classList.remove("ocultar");
			return;
		}
		// Oculta el cartel de "escribí más"
		else escribiMas.classList.add("ocultar");

		// Busca los productos
		palabras = palabras.join(" ");
		let resultados = await fetch("/api/quick-search/?palabras=" + palabras).then((n) => n.json());
		// Acciones en función de si encuentra resultados o no
		if (resultados.length) agregaHallazgos(resultados);
		else agregaHallazgos("- No encontramos coincidencias -");
	});
});
