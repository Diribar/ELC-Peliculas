"use strict";
window.addEventListener("load", async () => {
	// Variables
	let rutaObtenerProvs = "/links/api/obtener-provs-links";
	let inputs = document.querySelectorAll("tbody .inputError .input");
	let camposInput = Array.from(document.querySelectorAll("tbody .alta .input")).map((n) => n.name);
	let columnas = camposInput.length;
	let filas = inputs.length / columnas;

	let v = {
		// Generales
		colecciones: new URL(window.location.href).searchParams.get("entidad") == "colecciones",
		form: document.querySelector("#datos form"),
		proveedores: await fetch(rutaObtenerProvs).then((n) => n.json()),
		guardar: document.querySelectorAll("tbody .fa-floppy-disk"),

		// Variables de Edición y Alta
		campos: document.querySelectorAll("tbody .campo"),

		// Variables de Alta
		prov_id: document.querySelector("tbody .alta input[name='prov_id'"),
		filaAlta: filas - 1,

		// Inputs
		urlInputs: document.querySelectorAll(".inputError input[name='url'"),
		calidadInputs: document.querySelectorAll(".calidad .inputError .input"),
		tipoInputs: document.querySelectorAll(".tipo .inputError .input"),
		completoInputs: document.querySelectorAll(".completo .inputError .input"),
		parteInputs: document.querySelectorAll(".parte .inputError .input"),
		gratuitoInputs: document.querySelectorAll(".gratuito .inputError .input"),

		// OK/Errores
		provsDesconocido: document.querySelectorAll(".url .inputError .fa-question"),
		provsConocido: document.querySelectorAll(".url .inputError .fa-circle-check"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
		// Rutas
		rutaValidar: "/links/api/validar/?",
	};

	// Controles de los Data Entry
	v.form.addEventListener("input", async (e) => {
		let depurarUrl = () => {
			// Quitar caracteres incompatibles con un 'url'
			v.urlInputs[v.filaAlta].value = v.urlInputs[v.filaAlta].value.replace(
				/[^A-Za-záéíóúüñ?=&./\d]/gi,
				""
			);
			// Obtener el valor actual
			let valor = v.urlInputs[v.filaAlta].value;
			// Obtener ambos índices
			let indice1 = valor.indexOf("www.");
			let indice2 = valor.indexOf("//");
			let url =
				indice1 != -1 ? valor.slice(indice1 + 4) : indice2 != -1 ? valor.slice(indice2 + 2) : valor;

			// Si es YOUTUBE, quitarle el sufijo
			if (url.startsWith("youtube.com") && url.includes("&"))
				url = url.slice(0, url.lastIndexOf("&t="));

			// Si es FORMED-LAT, quitarle el nombre repetido del producto
			if (url.startsWith("ver.formed.lat")) {
				let producto = url.slice(url.lastIndexOf("/"));
				let nuevaUrl = url.split(producto);
				nuevaUrl.pop();
				url = nuevaUrl.join("") + producto;
			}
			// Conclusiones
			v.urlInputs[v.filaAlta].value = url;
			return url;
		};
		let obtenerFilaColumna = () => {
			// Obtener campo
			let campo = e.target.name;
			// Obtener la columna y fila del input
			let columna = camposInput.indexOf(campo);
			for (var fila = 0; fila < filas; fila++) if (e.target == inputs[fila * columnas + columna]) break;
			return [fila, columna];
		};
		// Ejecutar funciones
		let [fila, columna] = obtenerFilaColumna();
		if (fila == filas) return;
		if (fila == v.filaAlta) depurarUrl();
		controlesDataEntry(fila, columna);
	});

	// FUNCIONES ---------------------------------------------------------------
	let controlesDataEntry = async (fila, columna) => {
		let fn = {
			controlesEnUrl: async (fila) => {
				// Detectar errores y aplicar consecuencias
				let error = fila == v.filaAlta ? await mensajeDeError(fila, 0) : "";
				return !error || !error.url;
			},
			controlesEnCalidad: async (fila, proveedor) => {
				// Si el resultado es conocido --> ponerlo
				let condicion = !!proveedor.calidad;
				if (condicion) v.calidadInputs[fila].value = proveedor.calidad;
				v.calidadInputs[fila].disabled = condicion;
				// Detectar errores y aplicar consecuencias
				let error = await mensajeDeError(fila, 1);
				// Fin
				return !error || !error.calidad;
			},
			controlesEnTipo: async (fila, proveedor) => {
				// Si el resultado es conocido --> ponerlo
				let condicion = !proveedor.trailer || !proveedor.pelicula || v.colecciones;
				if (condicion) v.tipoInputs[fila].value = !proveedor.pelicula ? 1 : 2;
				v.tipoInputs[fila].disabled = condicion;
				// Detectar errores y aplicar consecuencias
				let error = await mensajeDeError(fila, 2);
				// Fin
				return !error || !error.tipo_id;
			},
			controlesEnCompleto: async (fila, proveedor) => {
				// Si el resultado es conocido --> ponerlo
				let condicion =
					(proveedor.trailer && !proveedor.pelicula) ||
					proveedor.siempre_completa ||
					v.colecciones ||
					v.tipoInputs[fila].value == 1;
				if (condicion) v.completoInputs[fila].value = "1";
				v.completoInputs[fila].disabled = condicion;
				// Detectar errores y aplicar consecuencias
				let error = await mensajeDeError(fila, 3);
				// Fin
				return !error || !error.completo;
			},
			controlesEnParte: async (fila) => {
				// Prevenir errores en 'parte'
				v.parteInputs[fila].value = v.parteInputs[fila].value.replace(/[^-\d]/g, "");
				// Si el resultado es conocido --> ponerlo
				let condicion = v.completoInputs[fila].value == "1";
				if (condicion) v.parteInputs[fila].value = "-";
				v.parteInputs[fila].disabled = condicion;
				// Detectar errores y aplicar consecuencias
				let error = await mensajeDeError(fila, 4);
				// Fin
				return !error || !error.parte;
			},
			controlesEnGratuito: async (fila, proveedor) => {
				// Si el resultado es conocido --> ponerlo
				let condicion1 = proveedor.siempre_pago;
				let condicion2 = proveedor.siempre_gratuito === 0;
				if (condicion1) v.gratuitoInputs[fila].value = "1";
				else if (condicion2) v.gratuitoInputs[fila].value = "0";
				v.gratuitoInputs[fila].disabled = condicion1 || condicion2;
				// Detectar errores y aplicar consecuencias
				let error = await mensajeDeError(fila, 5);
				// Fin
				return !error || !error.gratuito;
			},
			actualizarFormato: (fila, columna) => {
				// Barrer el formato de izquierda a derecha
				let indice;
				for (let col = columna; col < columnas - 1; col++) {
					// Obtener el índice
					indice = fila * columnas + col;
					// Acciones si el campo tiene un valor y está aprobado
					if (inputs[indice].value && !v.iconosOK[indice].classList.contains("ocultar")) {
						// Mostrar el campo siguiente
						v.campos[indice + 1].classList.remove("desperdicio");
						inputs[indice + 1].classList.remove("ocultar");
					} else {
						for (let nuevaCol = col; nuevaCol < columnas - 1; nuevaCol++) {
							let nuevoIndice = fila * columnas + nuevaCol;
							v.campos[nuevoIndice + 1].classList.add("desperdicio");
							inputs[nuevoIndice + 1].classList.add("ocultar");
							v.iconosError[nuevoIndice + 1].classList.add("ocultar");
						}
						break;
					}
				}
				return;
			},
			activarInactivarbotonGuardar: (fila) => {
				let OK =
					Array.from(v.iconosOK)
						.slice(fila * columnas, (fila + 1) * columnas)
						.map((n) => n.classList.value)
						.join(" ")
						.split(" ")
						.reduce((acumulador, b) => {
							return acumulador[b] ? acumulador[b]++ : (acumulador[b] = 1), acumulador;
						}, {}).ocultar == undefined;
				let error =
					Array.from(v.iconosError)
						.slice(fila * columnas, (fila + 1) * columnas)
						.map((n) => n.classList.value)
						.join(" ")
						.split(" ")
						.reduce((acumulador, b) => {
							return acumulador[b] ? acumulador[b]++ : (acumulador[b] = 1), acumulador;
						}, {}).ocultar == columnas;
				OK && error
					? v.guardar[fila].classList.remove("inactivo")
					: v.guardar[fila].classList.add("inactivo");
			},
		};
		// Sub-funciones ------------------------------------------------------------
		let obtenerProveedor = (fila) => {
			// Obtener el url
			let url = v.urlInputs[fila].value;
			// Averigua si algún 'distintivo de proveedor' está incluido en el 'url'
			let proveedor = v.proveedores
				.filter((n) => !n.generico)
				.find((n) => url.includes(n.url_distintivo));
			// Si no se reconoce el proveedor, se asume el 'desconocido'
			proveedor = proveedor ? proveedor : v.proveedores.find((n) => n.generico);
			// Acciones si es la fila de altas
			if (fila == v.filaAlta) {
				// Agrega el prov_id en el form
				v.prov_id.value = proveedor.id;
				// Muestra el ícono de genérico o de OK
				proveedor.generico
					? v.provsDesconocido[v.filaAlta].classList.remove("prov_id")
					: v.provsDesconocido[v.filaAlta].classList.add("prov_id");
				!proveedor.generico
					? v.provsConocido[v.filaAlta].classList.remove("prov_id")
					: v.provsConocido[v.filaAlta].classList.add("prov_id");
			}
			return proveedor;
		};
		let mensajeDeError = async (fila, columna) => {
			// Obtener el índice
			let indice = fila * columnas + columna;
			// completo o parte
			let [campoAnt, valorAnt] =
				columna == 3 || columna == 4
					? [inputs[indice - 1].name + "=", inputs[indice - 1].value + "&"]
					: ["", ""];
			// Obtener los datos de campo y valor
			let campo = inputs[indice].name;
			let valor = encodeURIComponent(inputs[indice].value);
			// Consolidar la información
			let condiciones = campoAnt + valorAnt + campo + "=" + valor;
			// Averiguar si hay algún error
			let error = await fetch(v.rutaValidar + condiciones).then((n) => n.json());
			// Guarda el mensaje de error
			let mensaje = error[campo];
			// Reemplaza el mensaje
			v.mensajesError[indice].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			mensaje
				? v.iconosError[indice].classList.remove("ocultar")
				: v.iconosError[indice].classList.add("ocultar");
			!mensaje
				? v.iconosOK[indice].classList.remove("ocultar")
				: v.iconosOK[indice].classList.add("ocultar");
			return error;
		};
		// Barrer el contenido de izquierda a derecha
		let OK = true;
		for (let col = columna; col < columnas; col++) {
			if (col == 0 && OK) OK = await fn.controlesEnUrl(fila);
			if (OK) var proveedor = obtenerProveedor(fila);
			if (col == 1 && OK) OK = await fn.controlesEnCalidad(fila, proveedor);
			if (col == 2 && OK) OK = await fn.controlesEnTipo(fila, proveedor);
			if (col == 3 && OK) OK = await fn.controlesEnCompleto(fila, proveedor);
			if (col == 4 && OK) OK = await fn.controlesEnParte(fila);
			if (col == 5 && OK) OK = await fn.controlesEnGratuito(fila, proveedor);
		}
		// Actualizar el formato
		fn.actualizarFormato(fila, columna);
		// Submit
		fn.activarInactivarbotonGuardar(fila);
	};
	let obtenerDataEntry = (fila) => {
		let objeto = "";
		for (let columna = 0; columna < columnas; columna++) {
			let indice = fila * columnas + columna;
			objeto += "&" + inputs[indice].name + "=" + inputs[indice].value;
		}
		return objeto;
	};

	// Startup
	// for (let fila = 0; fila < filas; fila++) controlesDataEntry(fila, 0);
});
