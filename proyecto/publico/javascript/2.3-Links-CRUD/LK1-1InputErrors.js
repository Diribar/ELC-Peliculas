"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Generales
		colecciones: new URL(location.href).searchParams.get("entidad") == "colecciones",
		form: document.querySelector("#datos form"),
		guardar: document.querySelectorAll("tbody tr button"),

		// Variables de Edición y Alta
		campos: document.querySelectorAll("tbody .campo"),

		// Inputs
		inputs: document.querySelectorAll("tbody .inputError .input"),
		camposInput: Array.from(document.querySelectorAll("tbody .alta .input")).map((n) => n.name),
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
		// Rutas
		rutaValidar: "/links/api/valida/?",
		rutaObtieneProvs: "/links/api/obtiene-provs-links",
	};
	let columnas = v.camposInput.length;
	let filas = v.inputs.length / columnas;
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
			for (var fila = 0; fila < filas; fila++) if (e.target === v.inputs[fila * columnas + columna]) break;
			return [fila, columna];
		},
		depuraUrl: () => {
			// Obtiene el valor actual
			let valor = v.urlInputs[filaAlta].value;
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
			v.urlInputs[filaAlta].value = url;
			return url;
		},
		controlesEnUrl: async (fila) => {
			// Detecta errores y aplica consecuencia
			let error = fila == filaAlta ? await mensajeDeError(fila, "url") : "";
			sinErrores = !error || !error.url;
			if (sinErrores && !col) col++;

			// Obtiene el proveedor
			if (sinErrores) {
				// Obtiene el url
				let url = v.urlInputs[fila].value;
				// Intenta reconocer al proveedor
				prov = provs.find((n) => !n.generico && url.includes(n.urlDistintivo));
				// Si no lo reconoce, se asume el 'desconocido'
				prov = prov ? prov : provs.find((n) => n.generico);
				// Acciones si es la fila de altas
				if (fila == filaAlta) {
					// Muestra el ícono de genérico o de OK
					prov.generico
						? v.provsDesconocido[filaAlta].classList.remove("prov_id")
						: v.provsDesconocido[filaAlta].classList.add("prov_id");
					!prov.generico
						? v.provsConocido[filaAlta].classList.remove("prov_id")
						: v.provsConocido[filaAlta].classList.add("prov_id");
				}
			} else prov = null;

			// Fin
			return;
		},
		controlesEnCalidad: async (fila, prov) => {
			// Si el resultado es conocido --> ponerlo
			let condicion = !!prov.calidad;
			if (condicion) v.calidadInputs[fila].value = prov.calidad;
			if (fila == filaAlta) v.calidadInputs[fila].disabled = condicion;

			// Detecta errores y aplica consecuencias
			let error = await mensajeDeError(fila, "calidad");
			sinErrores = !error || !error.calidad;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnCastellano: async (fila, prov) => {
			// Si el resultado es conocido --> ponerlo
			let condicion = prov.siempre_castellano == 1;
			if (condicion) v.castellanoInputs[fila].value = "1";
			if (fila == filaAlta) v.castellanoInputs[fila].disabled = condicion;

			// Detecta errores y aplica consecuencia
			let error = await mensajeDeError(fila, "castellano");
			sinErrores = !error || !error.castellano;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnSubtitulosCastellano: async (fila) => {
			// Si el resultado es conocido --> ponerlo
			let condicion = v.castellanoInputs[fila].value == "1";
			if (condicion) v.subtitulos[fila].value = "-";
			v.subtitulos[fila].disabled = condicion;

			// Detecta errores y aplica consecuencia
			let error = await mensajeDeError(fila, "subtitulos");
			sinErrores = !error || !error.subtitulos;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnGratuito: async (fila, prov) => {
			// Si el resultado es conocido --> ponerlo
			let condicion1 = prov.siempreGratuito == 1;
			let condicion2 = prov.siemprePago;
			if (condicion1) v.gratuitoInputs[fila].value = "1";
			else if (condicion2) v.gratuitoInputs[fila].value = "0";
			if (fila == filaAlta) v.gratuitoInputs[fila].disabled = condicion1 || condicion2;

			// Detecta errores y aplica consecuencia
			let error = await mensajeDeError(fila, "gratuito");
			sinErrores = !error || !error.gratuito;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnTipo: async (fila, prov) => {
			// Si el resultado es conocido --> ponerlo
			let condicion = !prov.trailer || !prov.pelicula || v.colecciones;
			if (condicion) v.tipoInputs[fila].value = !prov.pelicula || v.colecciones ? 1 : 2;
			if (fila == filaAlta) v.tipoInputs[fila].disabled = condicion;

			// Detecta errores y aplica consecuencia
			let error = await mensajeDeError(fila, "tipo_id");
			sinErrores = !error || !error.tipo_id;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnCompleto: async (fila, prov) => {
			// Si el resultado es conocido --> ponerlo
			let condicion =
				(prov.trailer && !prov.pelicula) || prov.siempreCompleta || v.colecciones || v.tipoInputs[fila].value == 1;
			if (condicion) v.completoInputs[fila].value = "1";
			v.completoInputs[fila].disabled = condicion;

			// Detecta errores y aplica consecuencia
			let error = await mensajeDeError(fila, "completo");
			sinErrores = !error || !error.completo;
			if (sinErrores) col++;

			// Fin
			return;
		},
		controlesEnParte: async (fila) => {
			// Eliminar los caracteres que no sean '-' o un número
			v.parteInputs[fila].value = v.parteInputs[fila].value.replace(/[^-\d]/g, "");
			// Si el resultado es conocido --> ponerlo
			let condicion = v.completoInputs[fila].value == "1";
			if (condicion) v.parteInputs[fila].value = "-";
			v.parteInputs[fila].disabled = condicion;

			// Detecta errores y aplica consecuencia
			let error = await mensajeDeError(fila, "parte");
			sinErrores = !error || !error.parte;
			if (sinErrores) col++;

			// Fin
			return;
		},
		actualizaFormato: (fila, columna) => {
			// Barre el formato de izquierda a derecha
			let indice;
			for (let col = columna; col < columnas - 1; col++) {
				// Obtiene el índice
				indice = fila * columnas + col;
				// Acciones si el campo tiene un valor y está aprobado
				if (v.inputs[indice].value && !v.iconosOK[indice].classList.contains("ocultar")) {
					// Mostrar el campo siguiente
					v.campos[indice + 1].classList.remove("desperdicio");
					v.inputs[indice + 1].classList.remove("ocultar");
				} else {
					for (let nuevaCol = col; nuevaCol < columnas - 1; nuevaCol++) {
						let nuevoIndice = fila * columnas + nuevaCol;
						v.campos[nuevoIndice + 1].classList.add("desperdicio");
						v.inputs[nuevoIndice + 1].classList.add("ocultar");
						v.iconosError[nuevoIndice + 1].classList.add("ocultar");
					}
					break;
				}
			}
			return;
		},
		activaInactivaBotonGuardar: (fila) => {
			let OK = Array.from(v.iconosOK)
				.slice(fila * columnas, (fila + 1) * columnas)
				.map((n) => n.className)
				.every((n) => !n.includes("ocultar"));
			let error = Array.from(v.iconosError)
				.slice(fila * columnas, (fila + 1) * columnas)
				.map((n) => n.className)
				.every((n) => n.includes("ocultar"));
			OK && error ? v.guardar[fila].classList.remove("inactivo") : v.guardar[fila].classList.add("inactivo");
			OK && error ? v.guardar[fila].setAttribute("tabindex", "0") : v.guardar[fila].setAttribute("tabindex", "-1");
		},
	};
	// Sub-funciones ------------------------------------------------------------
	let controlesDataEntry = async (fila, columna) => {
		// Barre el contenido de izquierda a derecha
		col = columna;
		sinErrores = true;
		await fn.controlesEnUrl(fila);
		if (col == 1 && sinErrores) await fn.controlesEnCalidad(fila, prov);
		if (col == 2 && sinErrores) await fn.controlesEnCastellano(fila, prov);
		if (col == 3 && sinErrores) await fn.controlesEnSubtitulosCastellano(fila);
		if (col == 4 && sinErrores) await fn.controlesEnGratuito(fila, prov);
		if (col == 5 && sinErrores) await fn.controlesEnTipo(fila, prov);
		if (col == 6 && sinErrores) await fn.controlesEnCompleto(fila, prov);
		if (col == 7 && sinErrores) await fn.controlesEnParte(fila);
		// Actualizar el formato
		fn.actualizaFormato(fila, columna);
		// Submit
		fn.activaInactivaBotonGuardar(fila);
		// Pone el foco en el input a resolver o en el botón guardar
		let celda = fila * columnas + col;
		if (col < columnas) v.inputs[celda].focus();
		else if (!v.guardar[fila].classList.contains("inactivo")) v.guardar[fila].focus();
		// Fin
		return;
	};
	let mensajeDeError = async (fila, campo) => {
		// Obtiene la columna
		let columna = v.camposInput.indexOf(campo);
		// Obtiene el índice
		let indice = fila * columnas + columna;
		// Casos en los que se necesita considerar el campo anterior
		let [campoAnt, valorAnt] =
			campo == "subtitulos" || campo == "completo" || campo == "parte"
				? [v.inputs[indice - 1].name + "=", v.inputs[indice - 1].value + "&"]
				: ["", ""];
		// Obtiene los datos de campo y valor
		let valor = encodeURIComponent(v.inputs[indice].value);
		// Consolida la información
		let condiciones = campoAnt + valorAnt + campo + "=" + valor;
		// Averigua si hay algún error
		let error = await fetch(v.rutaValidar + condiciones).then((n) => n.json());
		// Guarda el mensaje de error
		let mensaje = error[campo];
		// Reemplaza el mensaje
		v.mensajesError[indice].innerHTML = mensaje;
		// Acciones en función de si hay o no mensajes de error
		mensaje ? v.iconosError[indice].classList.remove("ocultar") : v.iconosError[indice].classList.add("ocultar");
		!mensaje ? v.iconosOK[indice].classList.remove("ocultar") : v.iconosOK[indice].classList.add("ocultar");
		return error;
	};

	// Event Listeners
	v.form.addEventListener("input", async (e) => {
		// Obtiene la fila y columna
		let [fila, columna] = fn.obtieneFilaColumna(e);
		// Si hubo un error (fila=filas), interrumpe
		if (fila == filas) return;
		// Si se ingresó un url en el alta, depurarlo
		if (fila == filaAlta && !columna) fn.depuraUrl();
		controlesDataEntry(fila, columna);
	});

	// Startup
	// Revisa las ediciones y el alta
	for (let fila = 0; fila < filas - 1; fila++) await controlesDataEntry(fila, 0);
});
