"use strict";
window.addEventListener("load", async () => {
	// Variables
	let colecciones = new URL(window.location.href).searchParams.get("entidad") == "colecciones";
	let form = document.querySelector("#datos form");
	let prov_idInput = document.querySelector(".inputError input[name='link_prov_id'");

	// Form - Campos en general
	let inputs = document.querySelectorAll("form .input");
	let columnasInput = document.querySelectorAll("form #altas .input").length;
	let camposInput = Array.from(inputs)
		.map((n) => n.name)
		.slice(0, columnasInput);
	let filasInput = inputs.length / columnasInput;
	let filaUrlAlta = filasInput - 1;

	// Sectores particulares
	let calidad = document.querySelectorAll("form #calidad");
	let tipo = document.querySelectorAll("form #tipo");
	let completo = document.querySelectorAll("form #completo");
	let parte = document.querySelectorAll("form #parte");
	let gratuito = document.querySelectorAll("form #gratuito");
	let guardar = document.querySelectorAll("form .fa-floppy-disk");

	// Inputs particulares
	let urlInputs = document.querySelectorAll(".inputError input[name='url'");
	let calidadInputs = document.querySelectorAll("#calidad .inputError .input");
	let tipoInputs = document.querySelectorAll("#tipo .inputError .input");
	let completoInputs = document.querySelectorAll("#completo .inputError .input");
	let parteInputs = document.querySelectorAll("#parte .inputError .input");
	let gratuitoInputs = document.querySelectorAll("#gratuito .inputError .input");

	// OK/Errores
	let provsDesconocido = document.querySelectorAll("#url .inputError .fa-circle-question");
	let provsConocido = document.querySelectorAll("#url .inputError .fa-circle-check");
	let iconosOK = document.querySelectorAll(".inputError .fa-circle-check");
	let iconosError = document.querySelectorAll(".inputError .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".inputError .mensajeError");
	// Rutas
	let rutaValidar = "/producto/links/api/validar-links/?";
	let rutaObtenerProv = "/producto/links/api/obtener-provs-links";

	// Depurar el 'url' de alta
	urlInputs[filaUrlAlta].addEventListener("input", () => {
		depurarUrl();
	});

	// Detectar 'changes' en el form
	form.addEventListener("change", async (e) => {
		let fila = funcionIndice(e);
		rutinaFormChange(e, fila);
	});

	// FUNCIONES ---------------------------------------------------------------
	let funcionIndice = (e) => {
		for (let fila = 0; fila < filasInput; fila++) {
			for (let col = 0; col < camposInput.length; col++) {
				if (e.target == inputs[fila * columnasInput + col]) return fila;
			}
		}
	};
	let rutinaFormChange = async (e, fila) => {
		// Definir los valores para 'campo'
		let campo = e.target.name;
		let valor = e.target.value;
		// Si es url...
		if (campo == "url") await funcionesDerivadasDelUrl(fila);
		else if (campo == "link_tipo_id") impactosPorTipoLink(fila);
		else if (campo == "completo") impactoPorCompleto(fila, valor);
		else if (campo == "parte" && valor < 1 && valor != "") parteInputs[fila].value = 1;
		// Actualizar los errores de toda la fila
		if (campo != "motivo_id") {
			if (campo != "url") await consecuenciasErrores(fila);
			botonGuardar(fila);
		}
	};
	// DERIVADAS DEL URL -------------------------------------------------------
	let funcionesDerivadasDelUrl = async (fila) => {
		// 1. Impacto en errores
		if (fila == filaUrlAlta) {
			// Depurar el url
			// let url = encodeURIComponent(depurarUrl())
			let url = depurarUrl();
			// 2. Averiguar si hay algún error y aplicar las consecuencias
			var error = await fetch(rutaValidar + "url=" + url).then((n) => n.json());
		} else var error = {hay: false};
		let proveedor = await consecuenciaErrorUrl(error, fila);
		if (error.url) return;
		// 2. Impacto en 'calidad'
		impactoEnCalidad(proveedor, fila);
		// 3. Impacto en 'tipo'
		impactoEnTipo(proveedor, fila);
		// 4. Impacto en 'completo' y 'parte'
		impactosEnCompletoParte(proveedor, fila);
		// 5. Impacto en 'gratuito'
		impactoEnGratuito(proveedor, fila);
	};
	// 1. Impacto en errores
	let depurarUrl = () => {
		// Obtener el valor actual
		let valor = urlInputs[filaUrlAlta].value;
		// Obtener ambos índices
		let indice1 = valor.indexOf("www.");
		let indice2 = valor.indexOf("//");
		let url = indice1 != -1 ? valor.slice(indice1 + 4) : indice2 != -1 ? valor.slice(indice2 + 2) : valor;
		// Si es YOUTUBE, quitarle el sufijo
		if (url.slice(0, "youtube.com".length) == "youtube.com" && url.includes("&"))
			url = url.slice(0, url.lastIndexOf("&t="));

		// Si es FORMED-LAT, quitarle el nombre repetido del producto
		if (url.slice(0, "ver.formed.lat".length) == "ver.formed.lat") {
			let producto = url.slice(url.lastIndexOf("/"));
			nuevaUrl = url.split(producto);
			nuevaUrl.pop();
			url = nuevaUrl.join("") + producto;
		}
		// Conclusiones
		urlInputs[filaUrlAlta].value = url;
		return url;
	};
	let consecuenciaErrorUrl = async (error, fila) => {
		// Guarda el mensaje de error
		let mensaje = error.url;
		// Reemplaza el mensaje
		let indiceGral = fila * columnasInput;
		mensajesError[indiceGral].innerHTML = mensaje;
		// Acciones en función de si hay o no mensajes de error
		mensaje
			? iconosError[indiceGral].classList.remove("ocultar")
			: iconosError[indiceGral].classList.add("ocultar");
		!mensaje
			? iconosOK[indiceGral].classList.remove("ocultar")
			: iconosOK[indiceGral].classList.add("ocultar");
		if (!mensaje) {
			// 1. Obtiene el proveedor del url
			let proveedor = await obtenerProvUrl(fila);
			// 2. Agregar el prov_id en el form (sólo en la fila de 'altas')
			prov_idInput.value = proveedor.id;
			// 3. Actualizar el ícono OK del url
			actualizarIconoProv(proveedor, fila);
			return proveedor;
		}
		return null;
	};
	let obtenerProvUrl = async (fila) => {
		// Obtener el url
		let url = urlInputs[fila].value;
		// Obtener todos los proveedores
		let proveedores = await fetch(rutaObtenerProv).then((n) => n.json());
		// Averigua si algún 'distintivo de proveedor' está incluido en el 'url'
		let proveedor = proveedores.filter((n) => !n.generico).find((n) => url.includes(n.url_distintivo));
		// Si no se reconoce el proveedor, se asume el 'desconocido'
		return proveedor ? proveedor : proveedores.find((n) => n.generico);
	};
	let actualizarIconoProv = (proveedor, fila) => {
		// Acciones en función de si el proveedor es genérico
		proveedor.generico
			? provsDesconocido[fila].classList.remove("prov_id")
			: provsDesconocido[fila].classList.add("prov_id");
		!proveedor.generico
			? provsConocido[fila].classList.remove("prov_id")
			: provsConocido[fila].classList.add("prov_id");
	};
	// 2. Impacto en 'calidad'
	let impactoEnCalidad = (proveedor, fila) => {
		// Adecuaciones
		if (proveedor.calidad) {
			calidad[fila].classList.add("desperdicio");
			calidadInputs[fila].classList.add("ocultar");
			calidadInputs[fila].value = proveedor.calidad;
		} else {
			calidad[fila].classList.remove("desperdicio");
			calidadInputs[fila].classList.remove("ocultar");
		}
	};
	// 3. Impacto en 'tipo'
	let impactoEnTipo = (proveedor, fila) => {
		if (!proveedor.trailer || !proveedor.pelicula || colecciones) {
			tipo[fila].classList.add("desperdicio");
			tipoInputs[fila].classList.add("ocultar");
			tipoInputs[fila].value = proveedor.trailer || colecciones ? 1 : 2;
		} else {
			tipo[fila].classList.remove("desperdicio");
			tipoInputs[fila].classList.remove("ocultar");
		}
	};
	// 4. Impacto en 'completo' y 'parte'
	let impactosEnCompletoParte = (proveedor, fila) => {
		// Cambios en el campo 'completo'
		if ((proveedor.trailer && !proveedor.pelicula) || proveedor.peli_siempre_completa || colecciones) {
			completo[fila].classList.add("desperdicio");
			completoInputs[fila].classList.add("ocultar");
			!proveedor.pelicula
				? (completoInputs[fila].disabled = true)
				: (completoInputs[fila].disabled = false);
			if (proveedor.peli_siempre_completa) completoInputs[fila].value = "1";
		} else {
			completo[fila].classList.remove("desperdicio");
			completoInputs[fila].classList.remove("ocultar");
			completoInputs[fila].disabled = false;
		}
		// Cambios en el campo 'parte'
		if ((proveedor.trailer && !proveedor.pelicula) || proveedor.peli_siempre_completa || colecciones) {
			parte[fila].classList.add("desperdicio");
			parteInputs[fila].classList.add("ocultar");
			parteInputs[fila].disabled = true;
		} else {
			parte[fila].classList.remove("desperdicio");
			parteInputs[fila].classList.remove("ocultar");
			parteInputs[fila].disabled = false;
		}
	};
	// 5. Impacto en 'gratuito'
	let impactoEnGratuito = (proveedor, fila) => {
		// Adecuaciones
		if (proveedor.siempre_pago != null) {
			gratuito[fila].classList.add("desperdicio");
			gratuitoInputs[fila].classList.add("ocultar");
			gratuitoInputs[fila].value = proveedor.siempre_pago ? 0 : 1;
		} else {
			gratuito[fila].classList.remove("desperdicio");
			gratuitoInputs[fila].classList.remove("ocultar");
		}
	};
	// DERIVADAS DE OTROS DATA-ENTRY -------------------------------------------
	let funcionesDerivadasDeOtrosDataEntry = (fila) => {
		// Impacto en 'completo' y 'parte'
		impactosPorTipoLink(fila);
		// Impacto en 'parte'
		impactoPorCompleto(fila);
		// Impacto en 'parte'
		if (parteInputs[fila].value < 1 && parteInputs[fila].value != "") parteInputs[fila].value = 1;
	};
	let impactosPorTipoLink = (fila) => {
		// Obtener el valor
		let valor = tipoInputs[fila].value;
		// Consecuencias
		if (valor == 1) {
			completo[fila].classList.add("desperdicio");
			completoInputs[fila].classList.add("ocultar");
			completoInputs[fila].disabled = true;
			parte[fila].classList.add("desperdicio");
			parteInputs[fila].classList.add("ocultar");
			parteInputs[fila].disabled = true;
		} else {
			completo[fila].classList.remove("desperdicio");
			completoInputs[fila].classList.remove("ocultar");
			completoInputs[fila].disabled = false;

			if (!completoInputs[fila].value) {
				parte[fila].classList.remove("desperdicio");
				parteInputs[fila].classList.remove("ocultar");
				parteInputs[fila].disabled = false;
			}
		}
	};
	let impactoPorCompleto = (fila) => {
		// Obtener el valor
		let valor = completoInputs[fila].value;
		// Consecuencias
		if (valor == 1) {
			parte[fila].classList.add("desperdicio");
			parteInputs[fila].classList.add("ocultar");
			parteInputs[fila].disabled = true;
		} else {
			if (completoInputs[fila].value == "0") {
				parte[fila].classList.remove("desperdicio");
				parteInputs[fila].classList.remove("ocultar");
				parteInputs[fila].disabled = false;
			}
		}
	};
	// OTRAS FUNCIONES --------------------------------------------------------
	let consecuenciasErrores = async (fila) => {
		// Obtener la info de losdata-entry de la fila
		let dataEntry = actualizarDataEntry(fila);
		// Obtener los errores de la fila
		let errores = await fetch(rutaValidar + dataEntry).then((n) => n.json());
		// Consecuencias en cada celda
		for (let campo of camposInput) {
			// Guarda el mensaje de error
			let mensaje = fila == filaUrlAlta || campo != "url" ? errores[campo] : "";
			// Reemplaza el mensaje de error
			let columna = camposInput.indexOf(campo);
			let celda = fila * columnasInput + columna;
			mensajesError[celda].innerHTML = mensaje;
			// Consecuencias de los errores
			mensaje
				? iconosError[celda].classList.remove("ocultar")
				: iconosError[celda].classList.add("ocultar");
			!mensaje ? iconosOK[celda].classList.remove("ocultar") : iconosOK[celda].classList.add("ocultar");
		}
	};
	let actualizarDataEntry = (fila) => {
		let objeto = "";
		for (let i = 0; i < columnasInput; i++) {
			let celda = fila * columnasInput + i;
			objeto += "&" + inputs[celda].name + "=" + inputs[celda].value;
		}
		return objeto;
	};
	let botonGuardar = (fila) => {
		let OK =
			Array.from(iconosOK)
				.slice(fila * columnasInput, (fila + 1) * columnasInput)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == undefined;
		let error =
			Array.from(iconosError)
				.slice(fila * columnasInput, (fila + 1) * columnasInput)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == columnasInput;
		OK && error ? guardar[fila].classList.remove("inactivo") : guardar[fila].classList.add("inactivo");
	};

	// START-UP ---------------------------------------------------------------------
	for (let fila = 0; fila < filasInput; fila++) {
		if (urlInputs[fila].value) {
			// Funciones derivadas del url
			await funcionesDerivadasDelUrl(fila);
			// Funciones derivadas del Dara Entry
			funcionesDerivadasDeOtrosDataEntry(fila);
			// Actualizar los errores de todo el form
			await consecuenciasErrores(fila);
			// Submit
			botonGuardar(fila);
		} else {
			let filaInput = filasInput - 1;
			impactoEnTipo({trailer: 1, pelicula: 1}, filaInput);
			impactosPorTipoLink(filaInput);
		}
	}
});
