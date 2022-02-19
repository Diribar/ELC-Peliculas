window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("form");
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconoOK = document.querySelectorAll(".input-error .fa-check-circle");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Variables de país
	let paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
	let paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
	let paisesSelect = document.querySelector("#paises_id select");
	let paisesListado = Array.from(document.querySelectorAll("#paises_id select option")).map(
		(n) => {
			return {id: n.value, nombre: n.innerHTML};
		}
	);
	// Variables de íconos
	let detalle = document.querySelector("#cuerpo #flechas .fa-circle-info");
	let links = document.querySelector("#cuerpo #flechas .fa-film");
	let edicion = document.querySelector("#cuerpo #comandos .fa-pencil-alt");
	let original = document.querySelector("#cuerpo #comandos .fa-home");
	let guardar = document.querySelector("#cuerpo #comandos .fa-save");
	let descartar = document.querySelector("#cuerpo #comandos .fa-rotate-right");
	let eliminar = document.querySelector("#cuerpo #comandos .fa-trash-alt");

	// Otras variables
	let linksRCLV = document.querySelectorAll(".input-error i.linkRCLV");
	let ruta = "/producto/api/validar-edicion/?";

	// Revisar campos en forma INDIVIDUAL
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		if (e.target == paisesSelect) funcionPaises();
		let campo = e.target == paisesSelect ? paisesID.name : e.target.name;
		let valor = e.target == paisesSelect ? paisesID.value : e.target.value;
		let indice = campos.indexOf(campo);
		// Averiguar si hay algún error
		let errores = await fetch(ruta + campo + "=" + valor).then((n) => n.json());
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

		// Desactivar íconos
		detalle.classList.add("botonInactivado");
		links.classList.add("botonInactivado");
		edicion.classList.add("botonInactivado");
		original.classList.add("botonInactivado");
		eliminar.classList.add("botonInactivado");
		for (let i = 0; i < linksRCLV.length; i++) {
			linksRCLV[i].classList.add("botonInactivado");
		}

		// Activar íconos
		descartar.classList.remove("botonInactivado");
		botonGuardar();
	});

	// Revisar campos COMBINADOS
	form.addEventListener("change", async (e) => {
		// Obtener el valor para 'campo'
		let campo = e.target.name;
		// (Título original / castellano) + año lanzamiento
		if (campo == "nombre_original" || campo == "nombre_castellano" || campo == "ano_estreno") {
			datos = {campo1: "nombre_original", campo2: "ano_estreno"};
			funcionDosCampos(datos, campo);
			datos = {campo1: "nombre_castellano", campo2: "ano_estreno"};
			funcionDosCampos(datos, campo);
		}
		// Año de lanzamiento + año de finalización
		if ((campo == "ano_estreno" && campos.includes("ano_fin")) || campo == "ano_fin") {
			datos = {campo1: "ano_estreno", campo2: "ano_fin"};
			funcionDosCampos(datos, campo);
		}
		// Subcategoría + RCLV
		if (
			campo == "subcategoria_id" ||
			campo == "personaje_historico_id" ||
			campo == "hecho_historico_id" ||
			campo == "valor_id"
		)
			funcionCamposCombinados([
				"subcategoria_id",
				"personaje_historico_id",
				"hecho_historico_id",
				"valor_id",
			]);
		// Fin
		botonGuardar();
	});

	// Funciones
	let funcionPaises = () => {
		let paisID = paisesSelect.value;
		if (paisID == "borrar") {
			paisesSelect.value = "";
			paisesMostrar.value = "";
			paisesID.value = "";
			return;
		}
		// Verificar si figura en paisesID
		let agregar = !paisesID.value.includes(paisID);
		// Si no figura en paisesID, agregárselo
		if (agregar) {
			// Limita la cantidad máxima de países a 1+4 = 5, para permitir el mensaje de error
			if (paisesID.value.length >= 2 * 1 + 4 * 4) return;
			paisesID.value += !paisesID.value ? paisID : ", " + paisID;
		} else {
			// Si sí figura, quitárselo
			paises_idArray = paisesID.value.split(", ");
			indice = paises_idArray.indexOf(paisID);
			paises_idArray.splice(indice, 1);
			paisesID.value = paises_idArray.join(", ");
		}
		// Agregar los países a mostrar
		paisesNombre = "";
		if (paisesID.value) {
			paises_idArray = paisesID.value.split(", ");
			for (pais_id of paises_idArray) {
				paisNombre = paisesListado.find((n) => n.id == pais_id).nombre;
				paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
			}
		}
		paisesMostrar.value = paisesNombre;
	};

	let botonGuardar = () => {
		let OK =
			Array.from(iconoOK)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar < iconoOK.length;
		let error =
			Array.from(iconoError)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar < iconoError.length;
		OK && !error
			? guardar.classList.remove("botonInactivado")
			: guardar.classList.add("botonInactivado");
	};

	let funcionDosCampos = async (datos, campo) => {
		campo1 = datos.campo1;
		campo2 = datos.campo2;
		indice1 = campos.indexOf(campo1);
		indice2 = campos.indexOf(campo2);
		if (
			(campo == campo1 || campo == campo2) &&
			inputs[indice1].value &&
			!mensajesError[indice1].innerHTML &&
			inputs[indice2].value &&
			!mensajesError[indice2].innerHTML
		)
			funcionCamposCombinados([campo1, campo2], campo1);
	};

	let funcionCamposCombinados = async (valores, campo) => {
		// Armado de la ruta
		let dato = "entidad=" + entidad;
		let indice = [];
		for (let i = 0; i < valores.length; i++) {
			indice.push(campos.indexOf(valores[i]));
			dato += "&" + valores[i] + "=" + inputs[indice[i]].value;
		}
		// Obtener el mensaje para el campo
		let errores = await fetch(ruta + dato).then((n) => n.json());
		if (campo) {
			mensaje = errores[campo];
			indice = campos.indexOf(campo);
			// Reemplaza
			mensajesError[indice].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			mensaje
				? iconoError[indice].classList.remove("ocultar")
				: iconoError[indice].classList.add("ocultar");
		} else {
			for (let i = 0; i < valores.length; i++) {
				// Captura el mensaje de error
				mensaje = errores[valores[i]];
				if (mensaje == undefined) mensaje = "";
				// Reemplaza
				mensajesError[indice[i]].innerHTML = mensaje;
				// Acciones en función de si hay o no mensajes de error
				mensaje
					? iconoError[indice[i]].classList.remove("ocultar")
					: iconoError[indice[i]].classList.add("ocultar");
			}
		}
		return;
	};
});
