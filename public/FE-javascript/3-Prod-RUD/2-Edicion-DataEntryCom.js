window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("form");
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	// Data Entry
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconoOK = document.querySelectorAll(".input-error .fa-circle-check");
	let iconoError = document.querySelectorAll(".input-error .fa-circle-xmark");
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
	// Categoría y subcategoría
	let categoria = document.querySelector("select[name='categoria_id']");
	let subcategoria = document.querySelector("select[name='subcategoria_id']");
	let subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");
	// Variables de botones 'session'
	let botonVerSession = document.querySelector("#cuerpo #comandos .fa-pen-to-square");
	let botonEliminarSession = document.querySelector("#cuerpo #comandos #session .fa-trash-can");
	let botonGuardarSession = document.querySelector("#cuerpo #comandos .fa-floppy-disk");
	// Variables de botones 'guardada'
	let botonVerGuardada = document.querySelector("#cuerpo #comandos .fa-pencil");
	let botonEliminarGuardada = document.querySelector("#cuerpo #comandos #guardada .fa-trash-can");
	// Variable de botón 'original'
	let botonOriginal = document.querySelector("#cuerpo #comandos .fa-house");
	// Variables de clases
	let inactivo_EdicSess = document.querySelectorAll("#cuerpo #comandos .inactivo_EdicSess");
	let inactivo_EdicGua = document.querySelectorAll("#cuerpo #comandos .inactivo_EdicGua");
	let versiones = document.querySelectorAll("#cuerpo #comandos .version");
	// Obtener versiones existentes
	let rutaVersiones = "/producto/edicion/api/obtener-versiones/";
	let [versionOriginal, versionEdicG] = await fetch(
		rutaVersiones + "?entidad=" + entidad + "&id=" + prodID
	).then((n) => n.json());
	let existeEdicG = !!versionEdicG.ELC_id;
	// Obtener version 'session'
	let rutaSession = "/producto/edicion/api/obtener-version-session/";
	let versionEdicS = await fetch(rutaSession + "?entidad=" + entidad + "&id=" + prodID).then(
		(n) => n.json()
	);
	let existeEdicS = !!versionEdicS;
	// Otras variables
	let flechasAviso = document.querySelectorAll(".input-error .fa-arrow-right-long");
	let status_creada = existeEdicG ? versionEdicG.status_registro.creado : false;
	let rutaVE = "/producto/edicion/api/validar-edicion/?";
	let rutaRQ = "/producto/edicion/api/enviar-a-req-query/?";

	// EVENT LISTENERS ---------------------------------------
	// Revisar campos en forma INDIVIDUAL
	form.addEventListener("input", async (e) => {
		// Averiguar si hay ERRORES
		// 1. Definir los valores para 'campo' y 'valor'
		if (e.target == paisesSelect) funcionPaises();
		let campo = e.target == paisesSelect ? paisesID.name : e.target.name;
		let valor = e.target == paisesSelect ? paisesID.value : e.target.value;
		// 2. Averiguar si hay algún error y aplicar las consecuencias
		let error = await fetch(rutaVE + campo + "=" + valor).then((n) => n.json());
		consecuenciaError(error, campo);

		// Si se cambia la categoría --> actualiza subcategoría
		if (campo == "categoria_id") {
			// Cambiar los valores que se pueden mostrar en la subcategoría
			mostrarValoresSubcat();
			// Borrar el valor anterior
			subcategoria.value = "";
			// Marcar que hay que elegir un valor
			let indiceSC = campos.indexOf("subcategoria_id");
			let erroresSC = await fetch(rutaVE + "subcategoria_id=").then((n) => n.json());
			mensajesError[indiceSC].innerHTML = erroresSC.subcategoria_id;
			iconoOK[indiceSC].classList.add("ocultar");
			iconoError[indiceSC].classList.remove("ocultar");
		}

		// Tareas varias
		activarBotonGuardar(); // Activa/Desactiva el botón 'Guardar'
		fetch(rutaRQ + dataEntry()); // Guarda el Data-Entry en session
		inputEnBotoneraComandos();

		// Le pone la flecha al campo cambiado
		let indice = campos.indexOf(campo);
		flechasAviso[indice].classList.remove("ocultar");
	});
	// Revisar campos COMBINADOS
	form.addEventListener("change", async (e) => {
		// Obtener el valor para 'campo'
		let campo = e.target.name;
		// (Título botonOriginal / castellano) + año lanzamiento
		if (campo == "nombre_original" || campo == "nombre_castellano" || campo == "ano_estreno") {
			datos = {campo1: "nombre_original", campo2: "ano_estreno"};
			await funcionDosCampos(datos, campo);
			datos = {campo1: "nombre_castellano", campo2: "ano_estreno"};
			await funcionDosCampos(datos, campo);
		}
		// Año de lanzamiento + año de finalización
		if ((campo == "ano_estreno" && campos.includes("ano_fin")) || campo == "ano_fin") {
			datos = {campo1: "ano_estreno", campo2: "ano_fin"};
			await funcionDosCampos(datos, campo);
		}
		// Subcategoría + RCLV
		if (
			campo == "subcategoria_id" ||
			campo == "personaje_id" ||
			campo == "hecho_id" ||
			campo == "valor_id"
		)
			await funcionCamposCombinados([
				"subcategoria_id",
				"personaje_id",
				"hecho_id",
				"valor_id",
			]);
		// Fin
		activarBotonGuardar();
	});
	// BOTONERA DE COMANDOS ----------------------------------
	// Session
	botonVerSession.addEventListener("click", async () => {
		// Obtener Data-Entry de session
		let versionEdicS = await fetch(rutaSession + "?entidad=" + entidad + "&id=" + prodID).then(
			(n) => n.json()
		);
		funcionInput(botonVerSession, versionEdicS);
	});
	botonEliminarSession.addEventListener("click", (e) => {
		if (Array.from(botonEliminarSession.classList).join(" ").includes("inactivo")) return;
		fetch(rutaRQ); // Elimina el Data-Entry en session
		location.reload();
	});
	botonGuardarSession.addEventListener("click", (e) => {
		if (Array.from(botonGuardarSession.classList).join(" ").includes("inactivo")) {
			e.preventDefault();
		}
	});
	// Guardada
	botonVerGuardada.addEventListener("click", () => {
		funcionInput(botonVerGuardada, versionEdicG);
	});
	botonEliminarGuardada.addEventListener("click", (e) => {
		if (Array.from(botonEliminarGuardada.classList).join(" ").includes("inactivo")) {
			e.preventDefault();
		}
	});
	// Original
	botonOriginal.addEventListener("click", () => {
		funcionInput(botonOriginal, versionOriginal);
	});

	// FUNCIONES ---------------------------------------------
	let agrega_o_quita_una_flecha_dependiendo_de_si_hay_cambios = (version, i) => {
		inputs[i].value != version[inputs[i].name] && (version[inputs[i].name] || inputs[i].value)
			? flechasAviso[i].classList.remove("ocultar")
			: flechasAviso[i].classList.add("ocultar");
	};
	let cambiarLosValoresDelInput = (version, i) => {
		if (inputs[i].name != "avatar")
			if (version[inputs[i].name] != undefined) {
				if ((inputs[i].value = version[inputs[i].name])) {
					inputs[i].value = version[inputs[i].name];
				}
			} else inputs[i].value = "";
	};
	let actualizaLaBotoneraDeComandos = (botonVersion) => {
		for (version of versiones) {
			version == botonVersion
				? version.classList.add("plus")
				: version.classList.remove("plus");
		}
	};
	let funcionInput = async (botonVersion, version) => {
		// Si el botón está inactivo, concluye la función
		if (Array.from(botonVersion.classList).join(" ").includes("inactivo") || !version) return;
		// Rutina para cada input
		for (let i = 0; i < inputs.length; i++) {
			agrega_o_quita_una_flecha_dependiendo_de_si_hay_cambios(version, i);
			cambiarLosValoresDelInput(version, i);
		}
		// Rutinas para todo el form
		actualizaLaBotoneraDeComandos(botonVersion);
		// Actualizar los errores
		let rutaVE = "/producto/edicion/api/validar-edicion/?";
		let errores = await fetch(rutaVE + dataEntry()).then((n) => n.json());
		consecuenciasErrores(errores, campos, (mostrarOK = false));
	};
	let dataEntry = () => {
		let objeto = "entidad=" + entidad + "&id=" + prodID;
		for (input of inputs) {
			objeto += "&" + input.name + "=" + input.value;
		}
		return objeto;
	};
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
	let activarBotonGuardar = () => {
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
			? botonGuardarSession.classList.remove("inactivoErrores")
			: botonGuardarSession.classList.add("inactivoErrores");
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
	let funcionCamposCombinados = async (camposEspecificos, campo) => {
		// Armado de la ruta
		let dato = "entidad=" + entidad;
		let indices = [];
		for (let i = 0; i < camposEspecificos.length; i++) {
			indices.push(campos.indexOf(camposEspecificos[i]));
			dato += "&" + camposEspecificos[i] + "=" + inputs[indices[i]].value;
		}
		// Obtener el mensaje para el campo
		let errores = await fetch(rutaVE + dato).then((n) => n.json());
		campo
			? consecuenciaError(errores, campo)
			: consecuenciasErrores(errores, camposEspecificos, (mostrarOK = true));
	};
	let consecuenciaError = (error, campo) => {
		// Guarda el mensaje de error
		mensaje = error[campo];
		// Reemplaza el mensaje
		indice = campos.indexOf(campo);
		mensajesError[indice].innerHTML = error[campo];
		// Acciones en función de si hay o no mensajes de error
		mensaje
			? iconoError[indice].classList.remove("ocultar")
			: iconoError[indice].classList.add("ocultar");
		!mensaje
			? iconoOK[indice].classList.remove("ocultar")
			: iconoOK[indice].classList.add("ocultar");
	};
	let consecuenciasErrores = (errores, camposEspecificos, mostrarOK) => {
		for (campo of camposEspecificos) {
			// Guarda el mensaje de error
			mensaje = errores[campo];
			// Reemplaza
			indice = campos.indexOf(campo);
			mensajesError[indice].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			mensaje
				? iconoError[indice].classList.remove("ocultar")
				: iconoError[indice].classList.add("ocultar");
			mensaje || !mostrarOK
				? iconoOK[indice].classList.add("ocultar")
				: iconoOK[indice].classList.remove("ocultar");
		}
	};
	let startupBotoneraComandos = () => {
		// Quita 'inactivo_EdicSess' si existe una versión 'session"
		if (existeEdicS) {
			for (inactivo of inactivo_EdicSess) {
				inactivo.classList.remove("inactivo_EdicSess");
			}
		}
		// Quita 'inactivo_EdicGua' si existe una versión 'guardada'
		if (existeEdicG) {
			for (inactivo of inactivo_EdicGua) {
				if (inactivo != botonEliminarGuardada || !status_creada)
					inactivo.classList.remove("inactivo_EdicGua");
			}
		}
		// Agregar la clase 'plus' a la versión activa
		existeEdicS
			? botonVerSession.classList.add("plus")
			: existeEdicG
			? botonVerGuardada.classList.add("plus")
			: botonOriginal.classList.add("plus");
	};
	let inputEnBotoneraComandos = () => {
		// 1. Quitar la clase 'inactivo_EdicSess'
		for (inactivo of inactivo_EdicSess) {
			if (inactivo.classList.contains("inactivo_EdicSess"))
				inactivo.classList.remove("inactivo_EdicSess");
		}
		// 2. Actualizar la clase 'plus' en 'edicionSession' y quitársela a los demás
		if (!botonVerSession.classList.contains("plus"))
			actualizaLaBotoneraDeComandos(botonVerSession);
	};
	// Aplicar cambios en la subcategoría
	let mostrarValoresSubcat = () => {
		for (opcion of subcategoriaOpciones) {
			opcion.className.includes(categoria.value)
				? opcion.classList.remove("ocultar")
				: opcion.classList.add("ocultar");
		}
	};

	// STATUS INICIAL ---------------------------------------
	startupBotoneraComandos();
	// Rutinas de categoría / subcategoría
	if (categoria.value) mostrarValoresSubcat();
});
