"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Datos generales
		cuerpo: document.querySelector("#cuerpo"),
		layout: document.querySelector("#cuerpo select[name='layout']"),
		ordenes: document.querySelectorAll("#cuerpo select[name='orden'] option"),
		elegiblesSimples: document.querySelectorAll("#cuerpo .elegibleSimple"),

		// Ascendente / Descendente
		elegiblesComplejos: document.querySelectorAll("#cuerpo .elegibleComplejo"),

		// Filtro personalizado
		filtroCabecera: document.querySelector("#filtrosPers select[name='filtrosPers']"),
		nuevo: document.querySelector("#filtrosPers i#nuevo"),
		reinicio: document.querySelector("#filtrosPers i#reinicio"),
		actualiza: document.querySelector("#filtrosPers i#actualiza"),
		modificaNombre: document.querySelector("#filtrosPers i#modificaNombre"),
		elimina: document.querySelector("#filtrosPers i#elimina"),
		iconos: document.querySelectorAll("#filtrosPers #iconos i"),

		// Rutas
		rutaCambiaFiltroPers: "/consultas/api/opciones-de-filtro-personalizado/?filtro_id=",
		rutaGuardaSessionCookies: "/consultas/api/guarda-filtro_id/?datos=",
		rutaProductos: "/consultas/api/obtiene-los-productos/?datos=",
	};
	const elegiblesSimples = Array.from(v.elegiblesSimples).map((n) => n.name);
	const elegiblesComplejos = [...new Set(Array.from(v.elegiblesComplejos).map((n) => n.name))];

	// Funciones
	let impactosDeLayout=()=>{
		let layoutElegido = v.layout.value
		console.log(layoutElegido);
		// for (){}
	}
	let impactosDeOrden = (opciones) => {
		// Variables
		let asc = document.querySelector("#cuerpo input[name='ascDes'][value='asc']");
		let ascDesAmbos = document.querySelectorAll("#cuerpo input[name='ascDes']");

		// 1. Si el orden manda ascendente --> ascendente
		let ordenElegido = document.querySelector("#cuerpo select[name='orden'] option:checked");
		if (ordenElegido.className.includes("asc")) asc.checked = true;
		// 2. De base de datos
		else if (opciones) for (let ascDes of ascDesAmbos) ascDes.checked = ascDes.value == opciones[ascDes.name];

		// Fin
		return;
	};
	let FN_fin = async (opciones) => {
		// 1. Obtiene los valores de todos los filtros elegidos
		if (!opciones) {
			// Re-define la variable
			opciones = {};
			// Elegibles simples
			for (let elegible of v.elegiblesSimples) {
				if (elegible.value) opciones[elegible.name] = elegible.value;
				console.log(elegible.className);
			}
			// Elegibles Complejos
			for (let elegible of v.elegiblesComplejos)
				if (elegible.checked) opciones[elegible.name + elegible.value] = true;
				else delete opciones[elegible.name + elegible.value];
			// Agrega el layout elegido
			opciones.layout = v.layout.value;
		}
		console.log(opciones);

		// 2. Actualiza la session y cookie
		fetch(v.rutaGuardaSessionCookies + JSON.stringify(opciones));

		// Obtiene los productos
		let productos = await fetch(v.rutaProductos + JSON.stringify(opciones));

		// Actualiza el contador
		// Actualiza la información mostrada
		// Actualiza el ID del Filtro en el registro de usuario

		// Limpia líneas consecutivas
		let hijos = document.querySelectorAll("#cuerpo #filtros .sectorConDesplV nav > *");
		let tags = [];
		hijos.forEach((hijo, num) => {
			if (window.getComputedStyle(hijo).getPropertyValue("order") == 2) tags.push({tag: hijo.tagName, num});
			hijo.classList.remove("ocultar");
		});
		for (let i = 1; i < tags.length; i++)
			if (tags[i - 1].tag == "HR" && tags[i].tag == "HR") hijos[tags[i].num].classList.add("ocultar");

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
		if (nombre == "filtrosPers") {
			// 1. Inactiva las opciones 'reinicio' y 'actualiza'
			v.reinicio.classList.add("inactivo");
			v.actualiza.classList.add("inactivo");

			// 2. Acciones para los íconos, dependiendo de si el filtro personalizado es el Estándar
			valor == 1 ? v.modificaNombre.classList.add("inactivo") : v.modificaNombre.classList.remove("inactivo");
			valor == 1 ? v.elimina.classList.add("inactivo") : v.elimina.classList.remove("inactivo");

			// 3. Obtiene las opciones de la BD
			opciones = await fetch(v.rutaCambiaFiltroPers + valor).then((n) => n.json());

			// 4. Actualiza los filtros sencillos
			elegiblesSimples.forEach((elegible, i) => {
				v.elegiblesSimples[i].value = opciones[elegible] ? opciones[elegible] : "";
			});
			// 4.2. Ascendente/Descendente
			impactosDeOrden(opciones);

			v.elegiblesComplejos.forEach((elegible, i) => {
				elegible.checked = elegible.name + elegible.value == opciones[elegible.name + elegible.value];
			});
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
		}

		// Fin
		await FN_fin(opciones);
		return;
	});

	// Startup
	impactosDeLayout()

});
