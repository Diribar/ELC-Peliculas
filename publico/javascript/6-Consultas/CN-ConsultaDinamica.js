"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Datos generales
		cuerpo: document.querySelector("#cuerpo"),
		layoutElegido:document.querySelector("#cuerpo select[name='layout']"),
		elegiblesSimples: document.querySelectorAll("#cuerpo .elegibleSimple"),
		elegiblesComplejos: document.querySelectorAll("#cuerpo .elegibleComplejo"),

		// Filtro personalizado
		filtroCabecera: document.querySelector("#filtrosPersUsuario select[name='filtrosCabecera']"),
		nuevo: document.querySelector("#filtrosPersUsuario i#nuevo"),
		reinicio: document.querySelector("#filtrosPersUsuario i#reinicio"),
		actualiza: document.querySelector("#filtrosPersUsuario i#actualiza"),
		modificaNombre: document.querySelector("#filtrosPersUsuario i#modificaNombre"),
		elimina: document.querySelector("#filtrosPersUsuario i#elimina"),
		iconos: document.querySelectorAll("#filtrosPersUsuario #iconos i"),

		// Rutas
		rutaCambiaFiltroPers: "/consultas/api/opciones-de-filtro-personalizado/?filtro_id=",
		rutaGuardaSessionCookies: "/consultas/api/guarda-session-cookie",
		rutaConsultaDinamica: "/consultas/api/consulta-dinamica",
	};
	const elegiblesSimples = Array.from(v.elegiblesSimples).map((n) => n.name);
	const elegiblesComplejos = [...new Set(Array.from(v.elegiblesComplejos).map((n) => n.name))];	

	// Funciones
	let FN_fin = (opciones) => {
		// Obtiene los valores de todos los filtros elegidos
		if (!opciones) {
			// Re-define la variable
			opciones = {};
			// Elegibles simples
			for (let elegible of v.elegiblesSimples) if (elegible.value) opciones[elegible.name] = elegible.value;
			// Elegibles Complejos
			for (let elegible of v.elegiblesComplejos) if (elegible.checked) opciones[elegible.name] = elegible.value;
			opciones.layout=v.layoutElegido.value
			// console.log(opciones);
		}
		// Actualiza la session y cookie
		fetch
		// Obtiene la información a mostrar
		// Actualiza el contador
		// Actualiza la información mostrada
		// Actualiza el ID del Filtro en el registro de usuario

		// Fin
		return;
	};

	// Novedad en algún lado
	v.cuerpo.addEventListener("change", async (e) => {
		// Variables
		const nombre = e.target.name;
		const valor = e.target.value;
		let opciones;

		// 1. Acciones si la novedad está en el filtro personalizado
		if (nombre == "filtrosCabecera") {
			// Inactiva las opciones 'reinicio' y 'actualiza'
			v.reinicio.classList.add("inactivo");
			v.actualiza.classList.add("inactivo");

			// Si el filtro personalizado es el Estándar, inactiva además los íconos 'actualiza' 'modificaNombre' y 'elimina'
			if (valor == 1) {
				v.modificaNombre.classList.add("inactivo");
				v.elimina.classList.add("inactivo");
			} else {
				// De lo contrario, activa los iconos 'modifica nombre' y 'elimina'
				v.modificaNombre.classList.remove("inactivo");
				v.elimina.classList.remove("inactivo");
			}

			// Obtiene las opciones de la BD
			opciones = await fetch(v.rutaCambiaFiltroPers + valor).then((n) => n.json());
			console.log(opciones);

			// Actualiza los filtros
			elegiblesSimples.forEach((elegible, i) => {
				v.elegiblesSimples[i].value = opciones[elegible] ? opciones[elegible] : "";
			});
			v.elegiblesComplejos.forEach((elegible, i) => {
				elegible.checked = elegible.value == opciones[elegible.name];
			});

			// Fin
			FN_fin(opciones);
		}

		// 2. Si la novedad está en cualquier otro campo...
		else {
			// Inactiva las opciones de 'modificaNombre' y 'elimina' en la vista
			v.modificaNombre.classList.add("inactivo");
			v.elimina.classList.add("inactivo");

			// Acciones si el filtro personalizado es uno definido
			if (v.filtroCabecera.value) {
				// Activa la opcion de 'reinicio'
				v.reinicio.classList.remove("inactivo");
				// Activa la opcion de 'actualiza'
				if (v.filtroCabecera.value != 1) v.actualiza.classList.remove("inactivo");
			}
			// Inactiva todos los íconos menos 'nuevo' (el primero)
			else
				v.iconos.forEach((icono, i) => {
					if (i) icono.classList.add("inactivo");
				});

			// Fin
			FN_fin();
		}

		// Limpia líneas consecutivas
		let hijos = document.querySelectorAll("#cuerpo #filtros .sectorConDesplV nav > *")
		console.log(hijos);
		for (let hijo of hijos)
			console.dir(hijo);
		
	});
});
