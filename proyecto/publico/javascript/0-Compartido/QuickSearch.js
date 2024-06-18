"use strict";
window.addEventListener("load", () => {
	// DOM
	let DOM = {
		ayudaMensMostrar: document.querySelector("#busquedaRapida .ayudaMensMostrar"),
		input: document.querySelector("#busquedaRapida .ayudaMensMostrar input"),
		muestraResultados: document.querySelector("#busquedaRapida .ayudaMensMostrar #muestraResultados"),
		escribiMas: document.querySelector("#busquedaRapida .ayudaMensMostrar #escribiMas"),
	};

	// Funciones
	let agregaResultados = (registros) => {
		// Generar las condiciones para que se puedan mostrar los 'muestraResultados'
		DOM.muestraResultados.innerHTML = "";
		DOM.muestraResultados.classList.remove("ocultar");

		// Rutinas en función del tipo de variable que sea 'registros'
		if (Array.isArray(registros)) creaElListado(registros);
		// En caso de que sea un sólo registro
		else {
			let parrafo = document.createElement("p");
			parrafo.style.fontStyle = "italic";
			parrafo.style.textAlign = "center";
			parrafo.appendChild(document.createTextNode(registros));
			DOM.muestraResultados.appendChild(parrafo);
		}
	};
	let creaElListado = (registros) => {
		// Rutina de creación de filas
		for (let registro of registros) {
			// Variables
			const {familia, entidad, id} = registro;
			const clase = familia.slice(0, 4);

			// Crea el anchor del registro
			const anchor = document.createElement("a");
			anchor.classList.add(clase, "flexRow");
			anchor.href = "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;

			// Crea las celdas
			creaLasCeldas({anchor, registro});

			// Agrega la fila al cuerpo de la tabla (tblbody)
			DOM.muestraResultados.appendChild(anchor);
		}
	};
	let creaLasCeldas = ({anchor, registro}) => {
		// Variables
		const {familia, entidad, anoEstreno} = registro;
		let {nombre} = registro;
		let anchoMax = 40;

		// Nombre
		if (nombre.length > anchoMax) nombre = nombre.slice(0, anchoMax - 1) + "…";
		if (familia == "producto" && anoEstreno) nombre += " (" + anoEstreno + ")";
		const spanNombre = document.createElement("span");
		spanNombre.innerHTML = nombre;
		spanNombre.className = "spanNombre";
		anchor.appendChild(spanNombre);

		// Entidad
		const entidadCorta = entidad.slice(0, -1);
		let ent = entidad == "personajes" ? "pers" : entidadCorta.slice(0, 5);
		if (ent != entidadCorta && ent != "epoca") ent += ".";
		const spanEnt = document.createElement("span");
		spanEnt.innerHTML = ent;
		spanEnt.className = "spanEnt";
		anchor.appendChild(spanEnt);

		// Fin
		return;
	};

	// Add Event Listener
	DOM.input.addEventListener("input", async () => {
		// Impide los caracteres que no son válidos
		DOM.input.value = DOM.input.value.replace(/[^a-záéíóúüñ'-\d\s]/gi, "").replace(/ +/g, " ");
		let dataEntry = DOM.input.value;

		// Elimina palabras
		let palabras = dataEntry.split(" ");
		for (let i = palabras.length - 1; i > 0; i--)
			// Elimina palabras repetidas o ¿vacías?
			if (palabras.filter((n) => n == palabras[i]).length > 1 || !palabras[i]) palabras.splice(i, 1);
		let pasaNoPasa = palabras.join("");

		// Acciones si la palabra tiene menos de 3 caracteres significativos
		if (pasaNoPasa.length < 3) {
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
		const resultados = await fetch("/api/busqueda-rapida/?palabras=" + palabras).then((n) => n.json());

		// Acciones en función de si encuentra resultados
		if (resultados.length) agregaResultados(resultados);
		else agregaResultados("- No encontramos coincidencias -");

		// Fin
		return;
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
		if (e.key == "Escape") DOM.ayudaMensMostrar.classList.add("ocultar");
	});
});
