"use strict";
window.addEventListener("load", () => {
	// DOM
	let DOM = {
		mostrarClick: document.querySelector("#busquedaRapida .mostrarClick"),
		input: document.querySelector("#busquedaRapida .mostrarClick input"),
		muestraResultados: document.querySelector("#busquedaRapida .mostrarClick #muestraResultados"),
		escribiMas: document.querySelector("#busquedaRapida .mostrarClick #escribiMas"),
	};
	let posicion = 0;

	// Funciones
	let agregaResultados = (registros) => {
		// Generar las condiciones para que se puedan mostrar los 'muestraResultados'
		DOM.muestraResultados.innerHTML = "";
		DOM.muestraResultados.classList.remove("ocultar");

		// Si se encontraron resultados, crea el listado
		if (Array.isArray(registros)) return creaElListado(registros);

		// Mensaje de 'no se encontraron resultados'
		const parrafo = document.createElement("p");
		parrafo.style.fontStyle = "italic";
		parrafo.style.textAlign = "center";
		parrafo.appendChild(document.createTextNode(registros));
		DOM.muestraResultados.appendChild(parrafo);
	};
	let creaElListado = (registros) => {
		// Rutina de creación de filas
		for (let registro of registros) {
			// Variables
			const {familia, entidad, id} = registro;
			const siglaFam = familia[0];
			const clase = familia.slice(0, 4);

			// Crea el anchor del registro
			const anchor = document.createElement("a");
			anchor.classList.add(clase, "flexRow");
			anchor.href = "/" + entidad + "/detalle/" + siglaFam + "/?id=" + id;

			// Crea las celdas
			creaLasCeldas({anchor, registro});

			// Agrega la fila al cuerpo de la tabla
			DOM.muestraResultados.appendChild(anchor);
		}

		// Terminación
		DOM.muestraResultados.children[0].classList.add("resaltar"); // Resalta el registro anterior
		posicion = 0;

		// Fin
		return;
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
		DOM.input.value = DOM.input.value.replace(/[^a-záéíóúüñ'¡¿-\d\s]/gi, "").replace(/ +/g, " ");
		let dataEntry = DOM.input.value;

		// Elimina palabras repetidas
		let palabras = dataEntry.split(" ");
		for (let i = palabras.length - 1; i > 0; i--)
			if (palabras.filter((n) => n == palabras[i]).length > 1) palabras.splice(i, 1);
		let pasaNoPasa = palabras.join("");

		// Acciones si la palabra tiene menos de 3 caracteres significativos
		if (pasaNoPasa.length < 3) {
			DOM.muestraResultados.classList.add("ocultar"); // Oculta el sector de muestraResultados
			DOM.escribiMas.classList.remove("ocultar"); // Muestra el cartel de "escribí más"
			return;
		}
		// Oculta el cartel de "escribí más"
		else DOM.escribiMas.classList.add("ocultar");

		// Busca los productos
		palabras = palabras.join(" ");
		const resultados = await fetch("/api/cmp-busqueda-rapida/?palabras=" + palabras).then((n) => n.json());

		// Acciones en función de si encuentra resultados
		if (resultados.length) agregaResultados(resultados);
		else agregaResultados("- No encontramos coincidencias -");

		// Fin
		return;
	});
	DOM.input.addEventListener("keydown", (e) => {
		// Variables
		const cantResultados = DOM.muestraResultados.children && DOM.muestraResultados.children.length;
		if (!cantResultados) return;

		// Resalta el registro anterior
		if (e.key == "ArrowUp" && posicion) {
			DOM.muestraResultados.children[posicion].classList.remove("resaltar"); // Des-resalta el registro vigente
			posicion--;
			DOM.muestraResultados.children[posicion].classList.add("resaltar"); // Resalta el registro anterior
		}

		// Resalta el registro siguiente
		if (e.key == "ArrowDown" && posicion < cantResultados - 1) {
			DOM.muestraResultados.children[posicion].classList.remove("resaltar"); // Des-resalta el registro vigente
			posicion++;
			DOM.muestraResultados.children[posicion].classList.add("resaltar"); // Resalta el registro siguiente
		}

		// Redirige a la vista del hallazgo
		if (e.key == "Enter") {
			const href = DOM.muestraResultados.children[posicion].href;
			if (href) location.href = href;
		}

		// Escape - Oculta el sector de muestraResultados
		if (e.key == "Escape") DOM.mostrarClick.classList.add("ocultar");
	});
	DOM.muestraResultados.addEventListener("mouseover", (e) => {
		// Variables
		const opciones = Array.from(DOM.muestraResultados.children);
		const indice = opciones.findIndex((n) => n == e.target.parentNode);
		if (indice == -1) return;

		// Quita la clase resaltar de donde estaba
		if (posicion !== null) DOM.muestraResultados.children[posicion].classList.remove("resaltar");
		posicion = indice;
		DOM.muestraResultados.children[posicion].classList.add("resaltar");

		// Fin
		return;
	});
});
