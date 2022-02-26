window.addEventListener("load", async () => {
	// Variables de íconos
	let edicSession = document.querySelector("#cuerpo #comandos .fa-pencil");
	let edicGuardada = document.querySelector("#cuerpo #comandos .fa-rotate-right");
	let original = document.querySelector("#cuerpo #comandos .fa-house");
	let guardar = document.querySelector("#cuerpo #comandos .fa-floppy-disk");
	let eliminar = document.querySelector("#cuerpo #comandos .fa-trash-can");
	// Variables de clases
	let inactivoDinamico = document.querySelectorAll("#cuerpo #comandos .inactivoDinamico");
	let inactivoEstable = document.querySelectorAll("#cuerpo #comandos .inactivoEstable");
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	// Versiones existentes
	let ruta = "/producto/edicion/api/obtener-versiones/";
	let [versionOriginal, versionEdicG, versionEdicS] = await fetch(
		ruta + "?entidad=" + entidad + "&id=" + prodID
	).then((n) => n.json());
	// Datos de la Edición Guardada
	let existeEdicG = !!versionEdicG.ELC_id;
	let status_creada = existeEdicG ? versionEdicG.status_registro.creado : false;

	// QUITAR 'INACTIVO' SI CORRESPONDE -------------------------------------
	// Quitar inactivoEstable si existe una versión 'guardada'
	if (existeEdicG)
		for (inactivo of inactivoEstable) {
			if (inactivo != eliminar || !status_creada)
				inactivo.classList.remove("inactivoEstable");
		}
	// Quitar inactivoDinamico si existe una versión 'session"
	if (versionEdicS)
		for (inactivo of inactivoDinamico) {
			inactivo.classList.remove("inactivoDinamico");
		}

	// COMANDOS -------------------------------------------------------------
	// Acción si se elige 'edicion'
	edicGuardada.addEventListener("click", () => {
		//console.log(Array.from(edicGuardada.classList).join(" ").includes("inactivo"));
		if (!Array.from(edicGuardada.classList).join(" ").includes("inactivo")) {
			console.log("hacer algo");
		} else console.log("inactivo");
	});
	// Acción si se elige 'original'
	original.addEventListener("click", () => {
	});
	// Acción si se elige 'guardar'
	guardar.addEventListener("click", (e) => {
		if (guardar.classList.contains("inactivoDinamico")) {
			e.preventDefault();
		}
	});
	// Acción si se elige 'eliminar'
	eliminar.addEventListener("click", (e) => {
		if (eliminar.classList.contains("inactivoEstable")) {
			e.preventDefault();
		}
	});
});
