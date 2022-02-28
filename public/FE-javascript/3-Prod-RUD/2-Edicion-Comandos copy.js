window.addEventListener("load", async () => {
	// Variables de íconos
	let edicSession = document.querySelector("#cuerpo #comandos .fa-rotate-right");
	let edicGuardada = document.querySelector("#cuerpo #comandos .fa-pencil");
	let original = document.querySelector("#cuerpo #comandos .fa-house");
	let guardar = document.querySelector("#cuerpo #comandos .fa-floppy-disk");
	let eliminar = document.querySelector("#cuerpo #comandos .fa-trash-can");
	// Variables de clases
	let inactivo_NoExisteEdicSess = document.querySelectorAll("#cuerpo #comandos .inactivo_NoExisteEdicSess");
	let inactivo_NoExisteEdicGua = document.querySelectorAll("#cuerpo #comandos .inactivo_NoExisteEdicGua");
	let versiones = document.querySelectorAll("#cuerpo #comandos .version");
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
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
	let status_creada = existeEdicG ? versionEdicG.status_registro.creado : false;
	let inputs = document.querySelectorAll(".input-error .input");
	let flechasAviso = document.querySelectorAll(".input-error .fa-arrow-right-long");

	// Funciones ------------------------------------------------------------
	let startup = (existeEdicG, existeEdicS) => {
		// Quitar inactivo_NoExisteEdicSess si existe una versión 'session"
		if (existeEdicS) {
			for (inactivo of inactivo_NoExisteEdicSess) {
				inactivo.classList.remove("inactivo_NoExisteEdicSess");
			}
		}
		if (existeEdicG) {
			// Quitar inactivo_NoExisteEdicGua si existe una versión 'guardada'
			for (inactivo of inactivo_NoExisteEdicGua) {
				if (inactivo != eliminar || !status_creada)
					inactivo.classList.remove("inactivo_NoExisteEdicGua");
			}
		}
		// Agregar la clase 'plus' a la versión activa
		existeEdicS
			? edicSession.classList.add("plus")
			: existeEdicG
			? edicGuardada.classList.add("plus")
			: original.classList.add("plus");
	};
	let funcionInput = async (botonVersion, version) => {
		// Se ejecuta solamente si el botón está activo
		if (!Array.from(botonVersion.classList).join(" ").includes("inactivo")) {
			// Rutina para cada input
			for (let i = 0; i < inputs.length; i++) {
				// Agregar las flechas cuando ocurren cambios
				inputs[i].value != version[inputs[i].name] &&
				(version[inputs[i].name] || inputs[i].value)
					? flechasAviso[i].classList.remove("ocultar")
					: flechasAviso[i].classList.add("ocultar");
				// Cambiar los valores del input
				if (inputs[i].name != "avatar")
					if (version[inputs[i].name] != undefined) {
						if ((inputs[i].value = version[inputs[i].name])) {
							inputs[i].value = version[inputs[i].name];
						}
					} else inputs[i].value = "";
			}
			// Actualizar los errores
			// 1. Generar los datos para el 'fetch'
			let rutaVE = "/producto/edicion/api/validar-edicion/?";
			let objeto = "entidad=" + entidad + "&id=" + prodID;
			for (input of inputs) {
				objeto += "&" + input.name + "=" + input.value;
			}
			// 2. Averiguar los errores
			let errores = await fetch(rutaVE + objeto).then((n) => n.json());
			// 3. Poner el resultado de los errores
			for (let i = 0; i < inputs.length; i++) {
				// Captura el mensaje de error
				mensaje = errores[inputs[i].name];
				if (mensaje != undefined) {
					// Reemplaza
					mensajesError[indice[i]].innerHTML = mensaje;
					// Acciones en función de si hay o no mensajes de error
					mensaje
						? iconoError[indice[i]].classList.remove("ocultar")
						: iconoError[indice[i]].classList.add("ocultar");
					!mensaje
						? iconoOK[indice[i]].classList.remove("ocultar")
						: iconoOK[indice[i]].classList.add("ocultar");
				}
			}
			console.log(errores);

			// Actualizar la botonera de comandos
			for (version of versiones) {
				version == botonVersion
					? version.classList.add("plus")
					: version.classList.remove("plus");
			}
		}
	};

	// INTERACCIÓN DE COMANDOS ----------------------------------------------
	edicSession.addEventListener("click", async () => {
		// Obtener Data-Entry de session
		let versionEdicS = await fetch(rutaSession + "?entidad=" + entidad + "&id=" + prodID).then(
			(n) => n.json()
		);
		funcionInput(edicSession, versionEdicS);
	});
	edicGuardada.addEventListener("click", () => {
		funcionInput(edicGuardada, versionEdicG);
	});
	original.addEventListener("click", () => {
		funcionInput(original, versionOriginal);
	});
	guardar.addEventListener("click", (e) => {
		if (guardar.classList.contains("inactivo_NoExisteEdicSess")) {
			e.preventDefault();
		}
	});
	eliminar.addEventListener("click", (e) => {
		if (eliminar.classList.contains("inactivo_NoExisteEdicGua")) {
			e.preventDefault();
		}
	});

	// Start-up -------------------------------------------------------------
	startup(existeEdicG, existeEdicS);
});
