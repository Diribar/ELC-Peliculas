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

	// Funciones ------------------------------------------------------------
	let quitarInactivos = (existeEdicG, existeEdicS) => {
		// Quitar inactivoEstable si existe una versión 'guardada'
		if (existeEdicG)
			for (inactivo of inactivoEstable) {
				if (inactivo != eliminar || !status_creada)
					inactivo.classList.remove("inactivoEstable");
			}
		// Quitar inactivoDinamico si existe una versión 'session"
		if (existeEdicS)
			for (inactivo of inactivoDinamico) {
				inactivo.classList.remove("inactivoDinamico");
			}
	};
	let funcionInput = (botonVersion, version) => {
		if (!Array.from(botonVersion.classList).join(" ").includes("inactivo")) {
			//console.log(version);
			for (input of inputs) {
				if (input.name != "avatar")
					version[input.name] != undefined
						? (input.value = version[input.name])
						: (input.value = "");
			}
			for (version of versiones) {
				version.style.borderColor = version == botonVersion ? "var(--amarillo-oscuro)" : "transparent";
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
	quitarInactivos(existeEdicG, existeEdicS);
});
