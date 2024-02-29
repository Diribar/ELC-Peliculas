"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Generales
		form: document.querySelector("#datos form"),
		guardar: document.querySelectorAll("tbody tr button"),

		// Variables de Edición y Alta
		campos: document.querySelectorAll("tbody td.campo"),

		// Inputs
		inputs: document.querySelectorAll("tbody .inputError .input"),
		camposInput: document.querySelectorAll("tbody .alta .input"),
		urlInputs: document.querySelectorAll(".inputError input[name='url'"),
		calidadInputs: document.querySelectorAll(".calidad .inputError .input"),
		castellanoInputs: document.querySelectorAll(".castellano .inputError .input"),
		subtitulos: document.querySelectorAll(".subtitulos .inputError .input"),
		gratuitoInputs: document.querySelectorAll(".gratuito .inputError .input"),
		tipoInputs: document.querySelectorAll(".tipo_id .inputError .input"),
		completoInputs: document.querySelectorAll(".completo .inputError .input"),
		parteInputs: document.querySelectorAll(".parte .inputError .input"),

		// OK/Errores
		provsDesconocido: document.querySelectorAll(".url .inputError .fa-question"),
		provsConocido: document.querySelectorAll(".url .inputError .fa-circle-check"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
	};
	let v = {
		// Generales
		colecciones: new URL(location.href).searchParams.get("entidad") == "colecciones",
		camposInput: Array.from(DOM.camposInput).map((n) => n.name),

		// Rutas
		rutaValidar: "/links/api/valida/?",
		rutaObtieneProvs: "/links/api/obtiene-provs-links",
	};
	let columnas = DOM.camposInput.length;
	let filas = DOM.inputs.length / columnas;
	let filaAlta = filas - 1;
	let provs = await fetch(v.rutaObtieneProvs).then((n) => n.json());
	let prov, col, sinErrores;

	// FUNCIONES ---------------------------------------------------------------
	let fn = {
		obtieneFilaColumna: (e) => {
			// Obtiene campo
			let campo = e.target.name;
			// Obtiene la columna y fila del input
			let columna = v.camposInput.indexOf(campo);
			for (var fila = 0; fila < filas; fila++) if (e.target === DOM.inputs[fila * columnas + columna]) break;
			return [fila, columna];
		},
		depuraUrl: () => {
			// Obtiene el valor actual
			let valor = DOM.urlInputs[filaAlta].value;
			// Obtiene ambos índices
			let indice1 = valor.indexOf("www.");
			let indice2 = valor.indexOf("//");
			let url = indice1 != -1 ? valor.slice(indice1 + 4) : indice2 != -1 ? valor.slice(indice2 + 2) : valor;

			// Quita el sufijo
			if (url.startsWith("youtube.com") && url.includes("&")) url = url.slice(0, url.indexOf("&"));
			if (
				(url.startsWith("ver.formed.lat") || url.startsWith("netflix.com") || url.startsWith("dailymotion.com")) &&
				url.includes("?")
			)
				url = url.slice(0, url.indexOf("?"));

			// Conclusiones
			DOM.urlInputs[filaAlta].value = url;
			return url;
		},
		controlesEnUrl: async (fila) => {
			// Detecta errores y aplica consecuencia
			const error = fila == filaAlta ? await mensajeDeError(fila, "url") : "";
			sinErrores = !error || !error.url;
			if (sinErrores && !col) col++;

			// Obtiene el proveedor
			if (sinErrores) {
				// Obtiene el url
				let url = DOM.urlInputs[fila].value;
				// Intenta reconocer al proveedor
				prov = provs.find((n) => !n.generico && url.includes(n.urlDistintivo));
				// Si no lo reconoce, se asume el 'desconocido'
				prov = prov ? prov : provs.find((n) => n.generico);
				// Acciones si es la fila de altas
				if (fila == filaAlta) {
					// Muestra el ícono de genérico o de OK
					prov.generico
						? DOM.provsDesconocido[filaAlta].classList.remove("prov_id")
						: DOM.provsDesconocido[filaAlta].classList.add("prov_id");
					!prov.generico
						? DOM.provsConocido[filaAlta].classList.remove("prov_id")
						: DOM.provsConocido[filaAlta].classList.add("prov_id");
				}
			} else prov = null;

			// Fin
			return;
		},
		controlesEnCalidad: async (fila, prov) => {
			// Si el resultado es conocido --> ponerlo
			const condicion = !!prov.calidad;
			if (condicion) DOM.calidadInputs[fila].value = prov.calidad;
			DOM.calidadInputs[fila].disabled = !!condicion;

			// Detecta errores y aplica consecuencias
			const error = await mensajeDeError(fila, "calidad");
			sinErrores = !error || !error.calidad;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnCastellano: async (fila) => {
			// Detecta errores y aplica consecuencia
			const error = await mensajeDeError(fila, "castellano");
			sinErrores = !error || !error.castellano;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnSubtitulosCastellano: async (fila) => {
			// Si el resultado es conocido --> ponerlo
			const condicion = DOM.castellanoInputs[fila].value == "1";
			if (condicion) DOM.subtitulos[fila].value = "-";
			DOM.subtitulos[fila].disabled = !!condicion;

			// Detecta errores y aplica consecuencia
			const error = await mensajeDeError(fila, "subtitulos");
			sinErrores = !error || !error.subtitulos;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnGratuito: async (fila, prov) => {
			// Si el resultado es conocido --> ponerlo
			let cond1 = prov.siempreGratuito;
			let cond2 = prov.siemprePago;
			console.log(cond1, cond2);
			if (cond1) DOM.gratuitoInputs[fila].value = "1";
			else if (cond2) DOM.gratuitoInputs[fila].value = "0";
			DOM.gratuitoInputs[fila].disabled = cond1 || cond2;

			// Detecta errores y aplica consecuencia
			const error = await mensajeDeError(fila, "gratuito");
			sinErrores = !error || !error.gratuito;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnTipo: async (fila, prov) => {
			// Si el resultado es conocido --> ponerlo
			const condicion = !prov.trailer || !prov.pelicula || v.colecciones;
			if (condicion)
				DOM.tipoInputs[fila].value =
					!prov.pelicula || v.colecciones
						? 1 // no tiene película (trailer sí) o es una colección
						: 2; // no tiene trailer es una película o capítulo
			DOM.tipoInputs[fila].disabled = !!condicion;

			// Detecta errores y aplica consecuencia
			const error = await mensajeDeError(fila, "tipo_id");
			sinErrores = !error || !error.tipo_id;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnCompleto: async (fila, prov) => {
			// Si el resultado es conocido --> ponerlo
			console.log(
				DOM.tipoInputs[fila].value == 1, // es un trailer
				prov.trailer && !prov.pelicula, // es un trailer
				v.colecciones, // es una colección
				prov.siempreCompleta
			);
			const condicion =
				DOM.tipoInputs[fila].value == 1 || // es un trailer
				(prov.trailer && !prov.pelicula) || // es un trailer
				v.colecciones || // es una colección
				prov.siempreCompleta; // los links del proveedor son siempre completos
			if (condicion) DOM.completoInputs[fila].value = "1";
			DOM.completoInputs[fila].disabled = !!condicion;

			// Detecta errores y aplica consecuencia
			const error = await mensajeDeError(fila, "completo");
			sinErrores = !error || !error.completo;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnParte: async (fila) => {
			// Eliminar los caracteres que no sean '-' o un número
			DOM.parteInputs[fila].value = DOM.parteInputs[fila].value.replace(/[^-\d]/g, "");

			// Si el resultado es conocido --> ponerlo
			const condicion = DOM.completoInputs[fila].value == "1";
			if (condicion) DOM.parteInputs[fila].value = "-";
			DOM.parteInputs[fila].disabled = !!condicion;

			// Detecta errores y aplica consecuencia
			const error = await mensajeDeError(fila, "parte");
			sinErrores = !error || !error.parte;
			if (sinErrores) col++;

			// Fin
			return;
		},
		actualizaFormato: (columna) => {
			// Barre el formato de izquierda a derecha
			let indice;
			for (let col = columna; col < columnas - 1; col++) {
				// Obtiene el índice
				indice = filaAlta * columnas + col;
				// Acciones si el campo tiene un valor y está aprobado
				if (DOM.inputs[indice].value && !DOM.iconosOK[indice].classList.contains("ocultar")) {
					// Mostrar el campo siguiente
					DOM.campos[indice + 1].classList.remove("desperdicio");
					DOM.inputs[indice + 1].classList.remove("ocultar");
				} else {
					for (let nuevaCol = col; nuevaCol < columnas - 1; nuevaCol++) {
						let nuevoIndice = filaAlta * columnas + nuevaCol;
						DOM.campos[nuevoIndice + 1].classList.add("desperdicio");
						DOM.inputs[nuevoIndice + 1].classList.add("ocultar");
						DOM.iconosError[nuevoIndice + 1].classList.add("ocultar");
					}
					break;
				}
			}
			return;
		},
		activaInactivaBotonGuardar: (fila) => {
			let OK = Array.from(DOM.iconosOK)
				.slice(fila * columnas, (fila + 1) * columnas)
				.map((n) => n.className)
				.every((n) => !n.includes("ocultar"));
			const error = Array.from(DOM.iconosError)
				.slice(fila * columnas, (fila + 1) * columnas)
				.map((n) => n.className)
				.every((n) => n.includes("ocultar"));
			OK && error ? DOM.guardar[fila].classList.remove("inactivo") : DOM.guardar[fila].classList.add("inactivo");
			OK && error ? DOM.guardar[fila].setAttribute("tabindex", "0") : DOM.guardar[fila].setAttribute("tabindex", "-1");
		},
	};
	// Sub-funciones ------------------------------------------------------------
	let controlesDataEntry = async (fila, columna) => {
		// Barre el contenido de izquierda a derecha
		col = columna;
		sinErrores = true;
		await fn.controlesEnUrl(fila);
		if (col == 1 && sinErrores) await fn.controlesEnCalidad(fila, prov);
		if (col == 2 && sinErrores) await fn.controlesEnCastellano(fila);
		if (col == 3 && sinErrores) await fn.controlesEnSubtitulosCastellano(fila);
		if (col == 4 && sinErrores) await fn.controlesEnGratuito(fila, prov);
		if (col == 5 && sinErrores) await fn.controlesEnTipo(fila, prov);
		if (col == 6 && sinErrores) await fn.controlesEnCompleto(fila, prov);
		if (col == 7 && sinErrores) await fn.controlesEnParte(fila);
		// Actualizar el formato
		if (fila == filaAlta) fn.actualizaFormato(columna);
		// Submit
		fn.activaInactivaBotonGuardar(fila);
		// Pone el foco en el input a resolver o en el botón guardar
		let celda = fila * columnas + col;
		if (col < columnas) DOM.inputs[celda].focus();
		else if (!DOM.guardar[fila].classList.contains("inactivo")) DOM.guardar[fila].focus();
		// Fin
		return;
	};
	let mensajeDeError = async (fila, campo) => {
		// Obtiene la columna, el índice y el valor
		let columna = v.camposInput.indexOf(campo);
		let indice = fila * columnas + columna;
		let valor = encodeURIComponent(DOM.inputs[indice].value);

		// Obtiene el campo y valor anterior
		let [campoAnt, valorAnt] =
			campo == "subtitulos" || campo == "completo" || campo == "parte"
				? [DOM.inputs[indice - 1].name + "=", DOM.inputs[indice - 1].value + "&"]
				: ["", ""];

		// Consolida la información y averigua si hay algún error
		const condiciones = campoAnt + valorAnt + campo + "=" + valor;
		const error = await fetch(v.rutaValidar + condiciones).then((n) => n.json());

		// Reemplaza el mensaje
		let mensaje = error[campo];
		DOM.mensajesError[indice].innerHTML = mensaje;

		// Acciones en función de si hay o no mensajes de error
		mensaje ? DOM.iconosError[indice].classList.remove("ocultar") : DOM.iconosError[indice].classList.add("ocultar");
		!mensaje ? DOM.iconosOK[indice].classList.remove("ocultar") : DOM.iconosOK[indice].classList.add("ocultar");

		// Fin
		return error;
	};

	// Event Listeners
	DOM.form.addEventListener("input", async (e) => {
		// Obtiene la fila y columna
		let [fila, columna] = fn.obtieneFilaColumna(e);
		// Si hubo un error (fila=filas), interrumpe
		if (fila == filas) return;
		// Si se ingresó un url en el alta, depurarlo
		if (fila == filaAlta && !columna) fn.depuraUrl();
		controlesDataEntry(fila, columna);
	});

	// Startup - revisa las ediciones y el alta
	for (let fila = 0; fila < filas - 1; fila++) await controlesDataEntry(fila, 0);
});
