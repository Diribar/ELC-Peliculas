"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Selects
		entidad: document.querySelector("select[name='entidad']"),
		coleccion_id: document.querySelector("select[name='coleccion_id']"),
		temporada: document.querySelector("select[name='temporada']"),
		capitulo: document.querySelector("select[name='capitulo']"),

		// Otros
		inputs: document.querySelectorAll(".input"),
		invisible: document.querySelector(".invisible"),
		submits: document.querySelectorAll(".submit"),
	};
	let v = {
		entidad: new URL(location.href).searchParams.get("entidad"),
		coleccion_id: new URL(location.href).searchParams.get("coleccion_id"),
		temporada: new URL(location.href).searchParams.get("temporada"),
		capitulo: new URL(location.href).searchParams.get("capitulo"),
	};

	// Funciones
	let FN = {
		// Inputs
		entidadConValor: async function () {
			// Autofocus
			DOM.entidad.focus();

			// Es una película o colección
			if (DOM.entidad.value != "capitulos") {
				// Deja visible y accesible solamente el campo "entidad"
				DOM.invisible.classList.add("invisible");
				this.muestraOcultaCampos(DOM.entidad);

				// Limpia las opciones de lo relacionado con colecciones
				this.limpiaLasOpciones(DOM.coleccion_id);

				// Habilita los botones 'submit'
				for (let submit of DOM.submits) submit.classList.remove("inactivo");
			}

			// Es un capítulo
			else {
				// Deja accesibles los campos que correspondan
				this.muestraOcultaCampos(DOM.coleccion_id);
				DOM.invisible.classList.remove("invisible");

				// Inhabilita los botones 'submit'
				for (let submit of DOM.submits) submit.classList.add("inactivo");

				// Obtiene el listado de las colecciones
				const colecciones = await fetch("api/obtiene-colecciones").then((n) => n.json());

				// Agrega el id y nombre de las colecciones a las opciones
				for (let coleccion of colecciones) {
					const opcion = document.createElement("option");
					opcion.value = coleccion.id;
					opcion.innerHTML = coleccion.nombreCastellano;
					if (opcion.value == v.coleccion_id) opcion.selected = true;
					DOM.coleccion_id.appendChild(opcion);
				}
			}

			// Fin

			this.coleccionConValor();
			return;
		},
		coleccionConValor: async function () {
			// Autofocus
			DOM.coleccion_id.focus();

			// Existe un valor
			if (!DOM.coleccion_id.value) return;

			// Limpia las opciones de lo relacionado con temporadas
			this.limpiaLasOpciones(DOM.temporada);

			// Obtiene la cantidad de temporadas de la colección
			const ruta = "api/obtiene-cantTemps/?id=";
			const cantTemporadas = await fetch(ruta + DOM.coleccion_id.value).then((n) => n.json());

			// Agrega las temporadas vigentes más una
			for (let numTemporada = 1; numTemporada <= cantTemporadas + 1; numTemporada++) {
				const opcion = document.createElement("option");
				opcion.value = numTemporada;
				opcion.innerHTML = cantTemporadas == 1 && numTemporada == 1 ? "Temporada única" : "Temporada " + numTemporada;
				if (opcion.value == v.temporada) opcion.selected = true;
				DOM.temporada.appendChild(opcion);
			}

			// Habilita el campo siguiente
			this.muestraOcultaCampos(DOM.temporada);

			// Fin
			this.temporadaConValor();
			return;
		},
		temporadaConValor: async function () {
			// Autofocus
			DOM.temporada.focus();

			// Existe un valor
			if (!DOM.temporada.value) return;

			// Limpia las opciones de lo relacionado con capitulos
			this.limpiaLasOpciones(DOM.capitulo);

			// Obtiene los capitulos de la temporada
			const ruta = "/crud/api/obtiene-capitulos/";
			const capitulos = await fetch(ruta + "?coleccion_id=" + DOM.coleccion_id.value + "&temporada=" + DOM.temporada.value)
				.then((n) => n.json())
				.then((n) => n.map((m) => m.numero));

			// Agrega los capítulos vigentes más uno
			const maxCapitulos = capitulos.length ? Math.max(...capitulos) : 0;
			for (let numCapitulo = 1; numCapitulo <= maxCapitulos + 1; numCapitulo++) {
				if (capitulos.includes(numCapitulo)) continue;
				const opcion = document.createElement("option");
				opcion.value = numCapitulo;
				opcion.innerHTML = "Capítulo " + numCapitulo;
				if (opcion.value == v.capitulo) opcion.selected = true;
				DOM.capitulo.appendChild(opcion);
			}

			// Habilita el campo siguiente
			this.muestraOcultaCampos(DOM.capitulo);

			// Fin
			this.capituloConValor();
			return;
		},
		capituloConValor: () => {
			// Autofocus
			DOM.capitulo.focus();

			// Existe un valor
			if (!DOM.capitulo.value) return;

			// Activa los submits
			for (let submit of DOM.submits)
				if (DOM.capitulo.value) submit.classList.remove("inactivo");
				else submit.classList.add("inactivo");

			// Fin
			return;
		},

		// Auxiliares
		muestraOcultaCampos: (campo) => {
			// Variables
			let habilitar = true;

			// Rutina
			for (let input of DOM.inputs) {
				if (habilitar) input.removeAttribute("disabled");
				else {
					input.setAttribute("disabled", "disabled");
					input.value = "";
				}
				if (input == campo) habilitar = false;
			}

			// Fin
			return;
		},

		limpiaLasOpciones: (campo) => {
			// Variables
			let habilitar = false;

			// Rutina
			for (let input of DOM.inputs) {
				if (input == campo) habilitar = true;

				// Borra los valores de opciones y deja sólo el estándar
				if (habilitar) input.innerHTML = "<option value=''>Elejí una opción</option>";
			}
			return;
		},
	};

	// Interacción con los DataEntry
	DOM.entidad.addEventListener("change", async () => await FN.entidadConValor());

	DOM.coleccion_id.addEventListener("change", async () => await FN.coleccionConValor());

	DOM.temporada.addEventListener("change", async () => await FN.temporadaConValor());

	DOM.capitulo.addEventListener("change", () => FN.capituloConValor());

	// Status inicial
	if (DOM.entidad.value) await FN.entidadConValor();
});
