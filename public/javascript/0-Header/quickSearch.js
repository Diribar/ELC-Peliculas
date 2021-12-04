window.addEventListener("load", () => {
	// DOM
	let input = document.querySelector("#busquedaRapida #inputMasResultados input");
	let display = document.querySelector("#busquedaRapida #inputMasResultados #displayResultados");
	let escribiMas = document.querySelector("#busquedaRapida #inputMasResultados #escribiMas")

	// Variables
	teclasValidas = /^[a-z áéíóúüñ\d]+$/;

	input.addEventListener("input", async () => {
		// Impide los caracteres que no son válidos
		input.value = input.value.replace(/[^a-záéíóúüñ\d\s]/gi, "").replace(/ +/g, " ");
		dataEntry = input.value;

		// Elimina palabras repetidas
		palabras = dataEntry.split(" ");
		for (let i = palabras.length - 1; i > 0; i--) {
			if (
				palabras.filter((x) => x == palabras[i]).length > 1 ||
				palabras.filter((x) => x == "").length
			) {
				palabras.splice(i, 1);
			}
		}
		pasaNoPasa = palabras.join("");

		// Termina el proceso si la palabra tiene menos de 4 caracteres significativos
		if (pasaNoPasa.length < 4) {
			input.style.borderRadius = "5px";
			display.classList.add("ocultar");
			escribiMas.classList.remove("ocultar")
			return;
		} else escribiMas.classList.add("ocultar")

		// Busca los productos
		palabras = palabras.join(" ");
		let resultados = await fetch("/quick-search/?palabras=" + palabras).then((n) => n.json());
		resultados = resultados.map((n) => {
			return {
				id: n.id,
				nombre_castellano: n.nombre_castellano,
				ano_estreno: n.ano_estreno,
				entidad: n.entidad,
			};
		});
		datos = resultados.length ? resultados : "- No encontramos coincidencias -";
		//console.log(resultados);
		agregarHallazgos(datos);
	});

	agregarHallazgos = (registros) => {
		// Generar las condiciones para que se pueda mostrar el 'display'
		input.style.borderBottomLeftRadius = 0;
		input.style.borderBottomRightRadius = 0;
		display.innerHTML = "";
		display.classList.remove("ocultar");

		// Rutinas en función del tipo de variable que sea 'registros'
		if (typeof registros == "object") {
			// Crea la tabla y el cuerpo
			let tabla = document.createElement("table");
			let tblBody = document.createElement("tbody");

			// Crea las filas y celdas
			for (registro of registros) {
				// Crea una fila y el anchor del registro
				let fila = document.createElement("tr");
				let anchor = document.createElement("a");
				id = registro.id;
				anchor.href =
					"/producto/detalle/?entidad=" + registro.entidad + "&id=" + registro.id;

				// Prepara las variables de la fila
				anchoMax = 30;
				nombre =
					registro.nombre_castellano.length > anchoMax
						? registro.nombre_castellano.slice(0, anchoMax) + "…"
						: registro.nombre_castellano;
				nombre += " (" + registro.ano_estreno + ")";
				entidad = registro.entidad.slice(0, 3).toUpperCase();
				let datos = [nombre, entidad];
				// Crea las celdas
				for (i = 0; i < 2; i++) {
					let celda = document.createElement("td");
					let textoCelda = document.createTextNode(datos[i]);
					// Agrega el texto al 'anchor' (celda nombre_castellano) o a la celda (entidad)
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
			parrafo.appendChild(document.createTextNode(datos));
			display.appendChild(parrafo);
		}
	};
});
