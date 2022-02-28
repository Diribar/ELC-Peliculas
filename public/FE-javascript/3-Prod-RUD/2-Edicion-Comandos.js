window.addEventListener("load", async () => {
	// Variables de íconos
	let edicSession = document.querySelector("#cuerpo #comandos .fa-rotate-right");
	let edicGuardada = document.querySelector("#cuerpo #comandos .fa-pencil");
	let original = document.querySelector("#cuerpo #comandos .fa-house");
	let guardar = document.querySelector("#cuerpo #comandos .fa-floppy-disk");
	let eliminar = document.querySelector("#cuerpo #comandos .fa-trash-can");
	// Variables de clases
	let inactivoDinamico = document.querySelectorAll("#cuerpo #comandos .inactivoDinamico");
	let inactivoEstable = document.querySelectorAll("#cuerpo #comandos .inactivoEstable");
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
		// Quitar inactivoDinamico si existe una versión 'session"
		if (existeEdicS) {
			for (inactivo of inactivoDinamico) {
				inactivo.classList.remove("inactivoDinamico");
			}
		}
		if (existeEdicG) {
			// Quitar inactivoEstable si existe una versión 'guardada'
			for (inactivo of inactivoEstable) {
				if (inactivo != eliminar || !status_creada)
					inactivo.classList.remove("inactivoEstable");
			}
		}
		// Agregar la clase 'plus' a la versión activa
		existeEdicS
			? edicSession.classList.add("plus")
			: existeEdicG
			? edicGuardada.classList.add("plus")
			: original.classList.add("plus");
	};
	let funcionInput = (botonVersion, version) => {
		if (!Array.from(botonVersion.classList).join(" ").includes("inactivo")) {
			for (let i = 0; i < inputs.length; i++) {
				// Agregar las flechas cuando ocurren cambios
				inputs[i].value != version[inputs[i].name] &&
				(version[inputs[i].name] || inputs[i].value)
					? flechasAviso[i].classList.remove("ocultar")
					: flechasAviso[i].classList.add("ocultar");
				// Cambiar los valores del input
				if (inputs[i].name != "avatar")
					version[inputs[i].name] != undefined
						? (inputs[i].value = version[inputs[i].name])
						: (inputs[i].value = "");
			}
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
		if (guardar.classList.contains("inactivoDinamico")) {
			e.preventDefault();
		}
	});
	eliminar.addEventListener("click", (e) => {
		if (eliminar.classList.contains("inactivoEstable")) {
			e.preventDefault();
		}
	});

	// Start-up -------------------------------------------------------------
	startup(existeEdicG, existeEdicS);
});
