window.addEventListener("load", () => {
	// Variables
	let form = document.querySelector("#datos form");
	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconoOK = document.querySelectorAll(".input-error .fa-check-circle");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Variables de íconos
	let guardar = document.querySelector("#cuerpo #flechas .fa-save");
	// Otras variables
	let ruta = "/producto/api/validar-links/?";

	// Detectar 'changes' en el form
	form.addEventListener("change",async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = e.target.value;
		let indice = campos.indexOf(campo);
		// Si es url...
		if (campo == "url") {
			// Quitar los prefijos
			aux = inputs[indice].value.indexOf("www.");
			if (aux != -1) {
				inputs[indice].value = valor.slice(aux + 4);
				valor = e.target.value;
			}
			aux = inputs[indice].value.indexOf("https://");
			if (aux != -1) {
				inputs[indice].value = valor.slice(aux + 8);
				valor = e.target.value;
			}
			aux = inputs[indice].value.indexOf("http://");
			if (aux != -1) {
				inputs[indice].value = valor.slice(aux + 7);
				valor = e.target.value;
			}
			// Verificar si el 'Tipo de Link' está elegido
			let campoLK = "link_tipo_id";
			let indiceLK = campos.indexOf(campoLK);
			let valorLK = inputs[indiceLK].value;
			if (!valorLK) valor += "&" + campoLK + "=" + valorLK;
			// Verificar errores
			let errores = await fetch(ruta + campo + "=" + valor).then((n) => n.json());
			if (errores.hay) {
			} else {
				// Obtener el proveedor
				// Reemplazar la imagen
			}
		} else {
			// Para otros, verificar errores
			let errores = await fetch(ruta + campo + "=" + valor).then((n) => n.json());
			// Si hay errores
			if (errores[campo] != undefined) {
				mensajesError[indice].innerHTML = errores[campo];
				if (errores[campo]) {
					iconoOK[indice].classList.add("ocultar");
					iconoError[indice].classList.remove("ocultar");
				} else {
					iconoOK[indice].classList.remove("ocultar");
					iconoError[indice].classList.add("ocultar");
				}
			}
		}
		// botonSubmit
		botonGuardar();
	});

	// Form submit
	// Si 'save' OK,
	// rutinas
});
