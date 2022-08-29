"use strict";
window.addEventListener("load", () => {
	// DOM
	let input = document.querySelector("#busquedaRapida .menuOpciones input");
	let display = document.querySelector("#busquedaRapida .menuOpciones #displayResultados");
	let escribiMas = document.querySelector("#busquedaRapida .menuOpciones #escribiMas");

	// Variables
	let teclasValidas = /^[a-z áéíóúüñ\d]+$/;

	input.addEventListener("input", async () => {
		// Impide los caracteres que no son válidos
		input.value = input.value.replace(/[^a-záéíóúüñ\d\s]/gi, "").replace(/ +/g, " ");
		let dataEntry = input.value;

		// Elimina palabras repetidas
		let palabras = dataEntry.split(" ");
		for (let i = palabras.length - 1; i > 0; i--) {
			if (
				palabras.filter((x) => x == palabras[i]).length > 1 ||
				palabras.filter((x) => x == "").length
			) {
				palabras.splice(i, 1);
			}
		}
		let pasaNoPasa = palabras.join("");

		// Termina el proceso si la palabra tiene menos de 4 caracteres significativos
		if (pasaNoPasa.length < 4) {
			input.style.borderRadius = "5px";
			display.classList.add("ocultar");
			escribiMas.classList.remove("ocultar");
			return;
		} else escribiMas.classList.add("ocultar");

		// Busca los productos
		palabras = palabras.join(" ");
		let resultados = await fetch("/api/quick-search/?palabras=" + palabras).then((n) => n.json());
		if (resultados.length) {
			resultados = resultados.map((n) => {
				return {
					id: n.id,
					nombre: n.nombreComun,
					ano_estreno: n.ano_estreno,
					entidad: n.entidad,
					familia: n.familia,
				};
			});
			agregarHallazgos(resultados);
		} else agregarHallazgos("- No encontramos coincidencias -");
	});

	let agregarHallazgos = (registros) => {
		// Generar las condiciones para que se pueda mostrar el 'display'
		input.style.borderBottomLeftRadius = 0;
		input.style.borderBottomRightRadius = 0;
		display.innerHTML = "";
		display.classList.remove("ocultar");

		// Rutinas en función del tipo de variable que sea 'registros'
		if (Array.isArray(registros)) {
			// Crea la tabla y el cuerpo
			let tabla = document.createElement("table");
			let tblBody = document.createElement("tbody");

			// Crea las filas y celdas
			for (let registro of registros) {
				// Crea una fila y el anchor del registro
				let fila = document.createElement("tr");
				let anchor = document.createElement("a");
				anchor.href =
					"/" + registro.familia + "/detalle/?entidad=" + registro.entidad + "&id=" + registro.id;

				// Prepara las variables de la fila
				let anchoMax = 30;
				let nombre =
					registro.nombre.length > anchoMax
						? registro.nombre.slice(0, anchoMax - 1) + "…"
						: registro.nombre;
				if (registro.familia == "producto") nombre += " (" + registro.ano_estreno + ")";
				let entidad = registro.entidad.slice(0, 3).toUpperCase();
				let datos = [nombre, entidad];
				// Crea las celdas
				for (let i = 0; i < datos.length; i++) {
					let celda = document.createElement("td");
					let textoCelda = document.createTextNode(datos[i]);
					// Agrega el texto al 'anchor' (celda nombre) o a la celda (entidad)
					if (i == 0) {
						anchor.appendChild(textoCelda);
						celda.appendChild(anchor);
					} else celda.appendChild(textoCelda);
					// Agrega la celda a la fila
					fila.appendChild(celda);
				}

				// Agrega la fila al cuerpo de la tabla (tblbody)
				tblBody.appendChild(fila);
				tabla.appendChild(tblBody);
				display.appendChild(tabla);
			}
		} else {
			let parrafo = document.createElement("p");
			parrafo.style.fontStyle = "italic";
			parrafo.style.textAlign = "center";
			parrafo.appendChild(document.createTextNode(registros));
			display.appendChild(parrafo);
		}
	};
});
