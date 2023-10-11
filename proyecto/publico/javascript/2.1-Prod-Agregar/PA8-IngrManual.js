"use strict";
window.addEventListener("load", async () => {
	// Variables
	let entidad = document.querySelector("select[name='entidad']");
	let invisible = document.querySelector(".invisible");
	let coleccion_id = document.querySelector("select[name='coleccion_id']");
	let temporada = document.querySelector("select[name='temporada']");
	let capitulo = document.querySelector("select[name='capitulo']");
	let submits = document.querySelectorAll(".submit");

	// Interacción con los DataEntry
	entidad.addEventListener("change", async () => {
		// Es una película o colección
		if (entidad.value != "capitulos") {
			// Deja visible y accesible solamente el campo "entidad"
			invisible.classList.add("invisible");
			muestraOcultaCampos(entidad);
			// Limpia las opciones de lo relacionado con colecciones
			limpiaLasOpciones(coleccion_id);
			// Habilita los botones 'submit'
			for (let submit of submits) submit.classList.remove("inactivo");
		} else {
			// Es un capítulo
			// Deja accesible el campo 'Nombre de Colección'
			muestraOcultaCampos(coleccion_id);
			// Deja visible todos los campos
			invisible.classList.remove("invisible");
			// Inhabilita los botones 'submit'
			for (let submit of submits) submit.classList.add("inactivo");
			// Obtiene el listado de las colecciones
			let colecciones = await fetch("api/IM-colecciones").then((n) => n.json());
			// Agrega el id y nombre de las colecciones a las opciones
			for (let coleccion of colecciones) {
				let opcion = document.createElement("option");
				opcion.value = coleccion.id;
				opcion.innerHTML = coleccion.nombreCastellano;
				coleccion_id.appendChild(opcion);
			}
		}
	});

	coleccion_id.addEventListener("change", async () => {
		// Existe un valor
		if (!coleccion_id.value) return;
		// Limpia las opciones de lo relacionado con temporadas
		limpiaLasOpciones(temporada);
		// Obtiene la cantidad de temporadas de la colección
		let cantTemporadas = await fetch("api/IM-cantTemps/?id=" + coleccion_id.value).then((n) => n.json());
		// Agrega las temporadas vigentes más una
		for (let numTemporada = 1; numTemporada <= cantTemporadas + 1; numTemporada++) {
			// Agregar el n° y el nombre de las temporadas a las opciones
			let opcion = document.createElement("option");
			opcion.value = numTemporada;
			opcion.innerHTML =
				cantTemporadas == 1 && numTemporada == 1 ? "Temporada única" : "Temporada " + numTemporada;
			temporada.appendChild(opcion);
		}
		// Habilitar campo siguiente
		muestraOcultaCampos(temporada);
	});

	temporada.addEventListener("change", async () => {
		// Existe un valor
		if (!coleccion_id.value) return;
		if (!temporada.value) return;
		// Limpia las opciones de lo relacionado con capitulos
		limpiaLasOpciones(capitulo);
		// Obtiene los capitulos de la temporada
		let ruta = "/crud/api/obtiene-capitulos/";
		let capitulos = await fetch(
			ruta + "?coleccion_id=" + coleccion_id.value + "&temporada=" + temporada.value
		).then((n) => n.json());
		// Agrega las temporadas vigentes más una
		let cantCapitulos = capitulos.length ? Math.max(...capitulos) : 0;
		for (let numCapitulo = 1; numCapitulo <= cantCapitulos + 1; numCapitulo++) {
			// Agrega sólo los capítulos inexistentes
			if (!capitulos.includes(numCapitulo)) {
				// Agrega el n° y el nombre del capitulo a las opciones
				let opcion = document.createElement("option");
				opcion.value = numCapitulo;
				opcion.innerHTML = "Capítulo " + numCapitulo;
				capitulo.appendChild(opcion);
			}
		}
		// Habilitar campo siguiente
		muestraOcultaCampos(capitulo);
	});

	capitulo.addEventListener("change", () => {
		for (let submit of submits)
			if (capitulo.value) submit.classList.remove("inactivo");
			else submit.classList.add("inactivo");
	});

	// Status inicial
	if (
		entidad.value &&
		(entidad.value != "capitulos" ||
			(entidad.value == "capitulos" && coleccion_id.value && temporada.value && capitulo.value))
	)
		for (let submit of submits) submit.classList.remove("inactivo");

});

let muestraOcultaCampos = (campo) => {
	// Muestra los campos iniciales y oculta los siguientes
	// Variables
	let inputs = document.querySelectorAll(".input");
	let habilitar = true;
	// Rutina
	for (let input of inputs) {
		if (habilitar) input.removeAttribute("disabled");
		else {
			input.setAttribute("disabled", "disabled");
			input.value = "";
		}
		if (input == campo) habilitar = false;
	}
	// Fin
	return;
};

let limpiaLasOpciones = (campo) => {
	// Variables
	let inputs = document.querySelectorAll(".input");
	let habilitar = false;
	// Rutina
	for (let input of inputs) {
		if (input == campo) habilitar = true;
		// Borra los valores de opciones y deja sólo el estándar
		if (habilitar) input.innerHTML = "<option value=''>Elejí una opción</option>";
	}
	return;
};
