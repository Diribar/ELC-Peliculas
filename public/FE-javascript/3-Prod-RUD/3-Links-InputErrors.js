window.addEventListener("load", async () => {
	// Variables
	let form = document.querySelector("#datos form");
	// Form - Campos en general
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// Sectores - Campos particulares
	let completo = document.querySelector("#completo");
	let parte = document.querySelector("#parte");
	let calidad = document.querySelector("#calidad");
	let tipo = document.querySelector("#tipo");
	let gratuito = document.querySelector("#gratuito");
	// Form - Inputs particulares
	let urlInput = document.querySelector(".input-error input[name='url'");
	let prov_idInput = document.querySelector(".input-error input[name='link_prov_id'");
	let calidadInput = document.querySelector("#calidad .input-error .input");
	let tipoInput = document.querySelector("#tipo .input-error .input");
	let completoInput = document.querySelector("#completo .input-error .input");
	let parteInput = document.querySelector("#parte .input-error .input");
	let gratuitoInput = document.querySelector("#gratuito .input-error .input");

	// OK/Errores
	let provDesconocido = document.querySelector("#url .input-error .fa-circle-question");
	let provConocido = document.querySelector("#url .input-error .fa-circle-check");
	let iconosOK = document.querySelectorAll(".input-error .fa-circle-check");
	let iconosError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Guardar o Eliminar
	let eliminar = document.querySelectorAll("table .fa-trash-can");
	let guardar = document.querySelector("form .fa-floppy-disk");
	// Rutas
	let rutaValidar = "/producto/links/api/validar-links/?";
	let rutaObtenerProv = "/producto/links/api/obtener-provs-links";

	// Descartar 'basura' del 'url'
	urlInput.addEventListener("input", () => {
		depurarUrl();
	});

	// Detectar 'changes' en el form
	form.addEventListener("change", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = e.target.value;
		// Si es url...
		if (campo == "url") {
			// 1. Actualizar el valor sin los prefijos
			url = valor;
			// 2. Averiguar si hay algún error y aplicar las consecuencias
			var error = await fetch(rutaValidar + campo + "=" + valor).then((n) => n.json());
			consecuenciaError(error, campo);
			// Acciones si no hay errores en el url
			if (!error[campo]) await funcionesDerivadasDelUrl();
		} else if (campo == "link_tipo_id") impactosPorTipoLink();
		else if (campo == "completo") impactoPorCompleto(valor);
		else if (campo == "parte" && valor < 1) parteInput.value = 1;

		// Actualizar los errores de todo el form
		if (campo != "url" || !error.url) {
			let dataEntry = actualizarDataEntry();
			errores = await fetch(rutaValidar + dataEntry).then((n) => n.json());
			consecuenciasErrores(errores, campos);
		}

		// Submit
		botonGuardar();
	});

	// FUNCIONES ---------------------------------------------------------------
	// DERIVADAS DEL URL -------------------------------------------------------
	let funcionesDerivadasDelUrl = async () => {
		// Depurar el url
		depurarUrl();
		// 1. Obtiene el proveedor del url
		let proveedor = await obtenerProvUrl();
		// 2. Agregar el prov_id en el form
		prov_idInput.value = proveedor.id;
		// 3. Actualizar el ícono OK del url
		actualizarIconoProv(proveedor);
		// 4. Impacto en 'calidad'
		impactoEnCalidad(proveedor);
		// 5. Impacto en 'tipo'
		impactoEnTipo(proveedor);
		// 6. Impacto en 'completo' y 'parte'
		impactosEnCompletoParte(proveedor);
		// 7. Impacto en 'gratuito'
		impactoEnGratuito(proveedor);
	};
	let depurarUrl = () => {
		// Obtener el valor actual
		let indice = campos.indexOf("url");
		let valor = inputs[indice].value;
		// Obtener ambos índices
		let indice1 = valor.indexOf("www.");
		let indice2 = valor.indexOf("//");
		let url =
			indice1 != -1
				? valor.slice(indice1 + 4)
				: indice2 != -1
				? valor.slice(indice2 + 2)
				: valor;
		// Si es YOUTUBE, quitarle el sufijo
		if (
			url.slice(0, "youtube.com".length) == "youtube.com" &&
			url.includes("&t=") &&
			url.slice(-1) == "s"
		)
			url = url.slice(0, url.lastIndexOf("&t="));
		// Si es FORMED-LAT, quitarle el nombre repetido del producto
		if (url.slice(0, "ver.formed.lat".length) == "ver.formed.lat") {
			let producto = url.slice(url.lastIndexOf("/"));
			nuevaUrl = url.split(producto);
			nuevaUrl.pop();
			url = nuevaUrl.join("") + producto;
		}
		// Conclusiones
		inputs[indice].value = url;
		return url;
	};
	let obtenerProvUrl = async () => {
		// Obtener el url
		let indice = campos.indexOf("url");
		let url = inputs[indice].value;
		// Obtener todos los proveedores
		let proveedores = await fetch(rutaObtenerProv).then((n) => n.json());
		// Averigua si algún 'distintivo de proveedor' está incluido en el 'url'
		let aux = proveedores
			.filter((n) => !n.generico)
			.find((n) => url.includes(n.url_distintivo));
		// Si no se reconoce el proveedor, se asume el 'desconocido'
		return aux ? aux : proveedores.find((n) => n.generico);
	};
	let actualizarIconoProv = (proveedor) => {
		// Acciones en función de si el proveedor es genérico
		proveedor.generico
			? provDesconocido.classList.remove("prov_id")
			: provDesconocido.classList.add("prov_id");
		!proveedor.generico
			? provConocido.classList.remove("prov_id")
			: provConocido.classList.add("prov_id");
	};
	let impactoEnCalidad = (proveedor) => {
		// Adecuaciones
		if (proveedor.calidad) {
			calidad.classList.add("desperdicio");
			calidadInput.classList.add("ocultar");
			calidadInput.value = proveedor.calidad;
		} else {
			calidad.classList.remove("desperdicio");
			calidadInput.classList.remove("ocultar");
		}
	};
	let impactoEnTipo = (proveedor) => {
		// Adecuaciones
		if (!proveedor.trailer || !proveedor.pelicula) {
			tipo.classList.add("desperdicio");
			tipoInput.classList.add("ocultar");
			tipoInput.value = proveedor.trailer ? 1 : 2;
		} else {
			tipo.classList.remove("desperdicio");
			tipoInput.classList.remove("ocultar");
		}
	};
	let impactosEnCompletoParte = (proveedor) => {
		// Cambios en el campo 'completo'
		if (!proveedor.pelicula || proveedor.peli_siempre_completa) {
			completo.classList.add("desperdicio");
			completoInput.classList.add("ocultar");
			!proveedor.pelicula
				? (completoInput.disabled = true)
				: (completoInput.disabled = false);
			if (proveedor.peli_siempre_completa) completoInput.value = "1";
		} else {
			completo.classList.remove("desperdicio");
			completoInput.classList.remove("ocultar");
			completoInput.disabled = false;
		}
		// Cambios en el campo 'parte'
		if (!proveedor.pelicula || proveedor.peli_siempre_completa) {
			parte.classList.add("desperdicio");
			parteInput.classList.add("ocultar");
			parteInput.disabled = true;
		} else {
			parte.classList.remove("desperdicio");
			parteInput.classList.remove("ocultar");
			parteInput.disabled = false;
		}
	};
	let impactoEnGratuito = (proveedor) => {
		// Adecuaciones
		if (proveedor.siempre_pago || proveedor.siempre_pago == false) {
			gratuito.classList.add("desperdicio");
			gratuitoInput.classList.add("ocultar");
			gratuitoInput.value = proveedor.siempre_pago ? 0 : 1;
		} else {
			gratuito.classList.remove("desperdicio");
			gratuitoInput.classList.remove("ocultar");
		}
	};
	// DERIVADAS DE OTROS DATA-ENTRY -------------------------------------------
	let funcionesDerivadasDeOtrosDataEntry = () => {
		// Impacto en 'completo' y 'parte'
		impactosPorTipoLink()
		// Impacto en 'parte'
		impactoPorCompleto()
		// Impacto en 'parte'
		if (parteInput.value < 1) parteInput.value = 1;
	};
	let impactosPorTipoLink = () => {
		// Obtener el valor
		let valor = tipoInput.value;
		// Consecuencias
		if (valor == 1) {
			completo.classList.add("desperdicio");
			completoInput.classList.add("ocultar");
			completoInput.disabled = true;
			parte.classList.add("desperdicio");
			parteInput.classList.add("ocultar");
			parteInput.disabled = true;
		} else {
			if (completoInput.value == "") {
				completo.classList.remove("desperdicio");
				completoInput.classList.remove("ocultar");
				completoInput.disabled = false;
			}
			if (!completoInput.value && parteInput.value == "") {
				parte.classList.remove("desperdicio");
				parteInput.classList.remove("ocultar");
				parteInput.disabled = false;
			}
		}
	};
	let impactoPorCompleto = () => {
		// Obtener el valor
		let valor = completoInput.value;
		// Consecuencias
		if (valor == 1) {
			parte.classList.add("desperdicio");
			parteInput.classList.add("ocultar");
			parteInput.disabled = true;
		} else {
			if (completoInput.value == "0" && parteInput.value == "") {
				parte.classList.remove("desperdicio");
				parteInput.classList.remove("ocultar");
				parteInput.disabled = false;
			}
		}
	};
	// OTRAS FUNCIONES --------------------------------------------------------
	let consecuenciaError = (error, campo) => {
		// Guarda el mensaje de error
		mensaje = error[campo];
		// Reemplaza el mensaje
		indice = campos.indexOf(campo);
		mensajesError[indice].innerHTML = mensaje;
		// Acciones en función de si hay o no mensajes de error
		mensaje
			? iconosError[indice].classList.remove("ocultar")
			: iconosError[indice].classList.add("ocultar");
		!mensaje
			? iconosOK[indice].classList.remove("ocultar")
			: iconosOK[indice].classList.add("ocultar");
	};
	let consecuenciasErrores = (errores, camposEspecificos) => {
		for (campo of camposEspecificos) {
			// Guarda el mensaje de error
			mensaje = errores[campo];
			// Reemplaza
			indice = campos.indexOf(campo);
			mensajesError[indice].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			mensaje
				? iconosError[indice].classList.remove("ocultar")
				: iconosError[indice].classList.add("ocultar");
			!mensaje
				? iconosOK[indice].classList.remove("ocultar")
				: iconosOK[indice].classList.add("ocultar");
		}
	};
	let actualizarDataEntry = () => {
		let objeto = "";
		for (input of inputs) {
			objeto += "&" + input.name + "=" + input.value;
		}
		return objeto;
	};
	let botonGuardar = () => {
		let OK =
			Array.from(iconosOK)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == undefined;
		let error =
			Array.from(iconosError)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == iconosError.length;
		OK && error ? guardar.classList.remove("inactivo") : guardar.classList.add("inactivo");
	};

	// Start-up
	if (urlInput.value) {
		// Funciones derivadas del url
		await funcionesDerivadasDelUrl();
		// Funciones derivadas del Dara Entry
		funcionesDerivadasDeOtrosDataEntry()
		// Actualizar los errores de todo el form
		let dataEntry = actualizarDataEntry();
		errores = await fetch(rutaValidar + dataEntry).then((n) => n.json());
		consecuenciasErrores(errores, campos);
	}

	// Submit
	botonGuardar();
});
