window.addEventListener("load", async () => {
	// Variables
	let entidad = document.querySelector("select[name='entidad']");
	let coleccion_id = document.querySelector("select[name='coleccion_id']");
	let temporada = document.querySelector("select[name='temporada']");
	let capitulo = document.querySelector("select[name='capitulo']");
	let submit = document.querySelectorAll(".submit");

	// Interacción con los DataEntry
	entidad.addEventListener("change", async () => {
		// Es una película o colección
		if (entidad.value != "capitulos") {
			// Dejar accesible solamente el campo "entidad"
			utilizar(entidad);
			// Limpiar las opciones de lo relacionado con colecciones
			limpiarOpciones(coleccion_id);
			// Habilitar los botones 'submit'
			for (i = 0; i < submit.length; i++) {
				submit[i].classList.remove("botonSinLink");
			}
		} else {
			// Es un capítulo
			// Agregar como visible el campo 'Nombre de Colección'
			utilizar(coleccion_id);
			// Inhabilitar los botones 'submit'
			for (i = 0; i < submit.length; i++) {
				submit[i].classList.add("botonSinLink");
			}
			// Obtener el listado de las colecciones
			let colecciones = await fetch("/producto/agregar/api/TP-averiguar-colecciones").then(
				(n) => n.json()
			);
			// Agregar el id y nombre de las colecciones a las opciones
			for (coleccion of colecciones) {
				opcion = document.createElement("option");
				opcion.value = coleccion.id;
				opcion.innerHTML = coleccion.nombre_castellano;
				coleccion_id.appendChild(opcion);
			}
		}
	});

	coleccion_id.addEventListener("change", async () => {
		// Existe un valor
		if (!coleccion_id.value) return;
		// Limpiar las opciones de lo relacionado con temporadas
		limpiarOpciones(temporada);
		// Obtener la cantidad de temporadas de la colección
		let cantTemporadas = await fetch(
			"/producto/agregar/api/TP-averiguar-cant-temporadas/?id=" + coleccion_id.value
		).then((n) => n.json());
		// Agregar las temporadas vigentes más una
		for (numTemporada = 1; numTemporada <= cantTemporadas + 1; numTemporada++) {
			// Agregar el n° y el nombre de las temporadas a las opciones
			opcion = document.createElement("option");
			opcion.value = numTemporada;
			opcion.innerHTML =
				cantTemporadas == 1 && numTemporada == 1
					? "Temporada única"
					: "Temporada " + numTemporada;
			temporada.appendChild(opcion);
		}
		// Habilitar campo siguiente
		utilizar(temporada);
	});

	temporada.addEventListener("change", async () => {
		// Existe un valor
		if (!coleccion_id.value) return;
		if (!temporada.value) return;
		// Limpiar las opciones de lo relacionado con capitulos
		limpiarOpciones(capitulo);
		// Obtener los capitulos de la temporada
		let ruta = "/producto/agregar/api/TP-averiguar-capitulos/";
		let capitulos = await fetch(
			ruta + "?coleccion_id=" + coleccion_id.value + "&temporada=" + temporada.value
		).then((n) => n.json());
		// Agregar las temporadas vigentes más una
		let cantCapitulos = capitulos.length
			? Math.max(...capitulos)
			: 0
		for (numCapitulo = 1; numCapitulo <= cantCapitulos + 1; numCapitulo++) {
			// Agregar sólo los capítulos inexistentes
			if (!capitulos.includes(numCapitulo)) {
				// Agregar el n° y el nombre del capitulo a las opciones
				opcion = document.createElement("option");
				opcion.value = numCapitulo;
				opcion.innerHTML = "Capítulo " + numCapitulo;
				capitulo.appendChild(opcion);
			}
		}
		// Habilitar campo siguiente
		utilizar(capitulo);
	});

	capitulo.addEventListener("change", () => {
		if (capitulo.value) {
			for (i = 0; i < submit.length; i++) {
				submit[i].classList.remove("botonSinLink");
			}
		}
	});
});

let utilizar = (campo) => {
	let inputs = document.querySelectorAll(".input");
	let habilitar = true;
	for (i = 0; i < inputs.length; i++) {
		if (habilitar) inputs[i].removeAttribute("disabled");
		else {
			inputs[i].setAttribute("disabled", "disabled");
			inputs[i].value = "";
		}
		if (inputs[i] == campo) habilitar = false;
	}
	return;
};

let limpiarOpciones = (campo) => {
	let inputs = document.querySelectorAll(".input");
	let habilitar = false;
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i] == campo) habilitar = true;
		// Borrar opciones y dejar sólo el estándar
		if (habilitar) inputs[i].innerHTML = "<option value=''>Elejí una opción</option>";
	}
	return;
};
