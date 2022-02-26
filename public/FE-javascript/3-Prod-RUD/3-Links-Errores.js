window.addEventListener("load", () => {
	// Variables
	let form = document.querySelector("#datos form");
	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconoOK = document.querySelectorAll(".input-error .fa-circle-check");
	let iconoError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Guardar o Eliminar
	let eliminar = document.querySelectorAll("table .fa-trash-can");
	let guardar = document.querySelector("form .fa-floppy-disk");
	// Variables del nuevo avatar
	let imgAvatar = document.querySelector("form #dataEntry .logoProv img");
	let indiceAvatar = campos.indexOf("link_prov_id");
	// Rutas
	let rutaValidar = "/producto/links/api/validar-links/?";
	let rutaObtener = "/producto/links/api/obtener-provs-links";

	// Detectar 'changes' en el form
	form.addEventListener("change", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = e.target.value;
		let indice = campos.indexOf(campo);
		// Si es url...
		if (campo == "url") {
			// 1. Quitar los prefijos
			let aux1 = inputs[indice].value.indexOf("www.");
			let aux2 = inputs[indice].value.indexOf("//");
			inputs[indice].value =
				aux1 != -1 ? valor.slice(aux1 + 4) : aux2 != -1 ? valor.slice(aux2 + 2) : valor;
			valor = encodeURIComponent(e.target.value);
			// 2. Detectar el proveedor del link
			let proveedor = await fetch(rutaObtener).then((n) => n.json());
			let aux = proveedor
				.filter((n) => !n.generico)
				.find((n) => valor.includes(n.url_distintivo));
			proveedor = aux ? aux : proveedor.find((n) => n.generico);
			// 3. Actualizar la imagen y el input
			imgAvatar.src = "/imagenes/0-Logos/" + proveedor.avatar;
			inputs[indiceAvatar].value = proveedor.id;
			// 4. Agregar campos 'Proveedor del Link', 'Tipo de Link', 'Fecha de Prov.'
			valor += agregarCampos("link_prov_id");
			valor += agregarCampos("link_tipo_id");
		}
		// Verificar errores
		let errores = await fetch(rutaValidar + campo + "=" + valor).then((n) => n.json());
		// Si hay errores
		for (i = 0; i < campos.length; i++) {
			if (errores[campos[i]] != undefined) {
				mensajesError[i].innerHTML = errores[campos[i]];
				if (errores[campos[i]]) {
					iconoOK[i].classList.add("ocultar");
					iconoError[i].classList.remove("ocultar");
				} else {
					iconoOK[i].classList.remove("ocultar");
					iconoError[i].classList.add("ocultar");
				}
			}
		}
		// Submit
		botonGuardar();
	});

	// Form submit

	// Si 'save' OK,
	// rutinas

	// Funciones
	let botonGuardar = () => {
		let OK =
			Array.from(iconoOK)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == undefined;
		let error =
			Array.from(iconoError)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar != iconoError.length;
		OK && !error
			? guardar.classList.remove("botonInactivo")
			: guardar.classList.add("botonInactivo");
	};
	let agregarCampos = (campoAux) => {
		let indiceAux = campos.indexOf(campoAux);
		let valorAux = inputs[indiceAux].value;
		return "&" + campoAux + "=" + valorAux;
	};
});
