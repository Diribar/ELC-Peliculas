"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Partes del cuerpo
		cuerpo: document.querySelector("#cuerpo"),

		// Partes del Encabezado
		layout: document.querySelector("#cuerpo #encabezado select[name='layout']"),
		orden: document.querySelector("#cuerpo #encabezado select[name='orden']"),
		ordenes: document.querySelectorAll("#cuerpo #encabezado select[name='orden'] option"),
		ascDes: document.querySelector("#cuerpo #encabezado #ascDes"),

		// Filtro personalizado
		filtroCabecera: document.querySelector("#filtrosPers select[name='filtrosPers']"),
		nuevo: document.querySelector("#filtrosPers i#nuevo"),
		reinicio: document.querySelector("#filtrosPers i#reinicio"),
		actualiza: document.querySelector("#filtrosPers i#actualiza"),
		modificaNombre: document.querySelector("#filtrosPers i#modificaNombre"),
		elimina: document.querySelector("#filtrosPers i#elimina"),
		iconos: document.querySelectorAll("#filtrosPers #iconos i"),

		// Partes del Filtro
		hechosReales: document.querySelector("#cuerpo #filtros #hechosReales select[name='hechosReales']"),
		sector_hechosReales: document.querySelector("#cuerpo #filtros #hechosReales"),
		sector_personajes: document.querySelector("#cuerpo #filtros #personajes"),
		sector_hechos: document.querySelector("#cuerpo #filtros #hechos"),

		elegiblesSimples: document.querySelectorAll("#cuerpo .elegibleSimple"),
		elegiblesComplejos: document.querySelectorAll("#cuerpo .elegibleComplejo"),

		// Rutas
		rutaCambiaFiltroPers: "/consultas/api/opciones-de-filtro-personalizado/?filtro_id=",
		rutaGuardaSessionCookies: "/consultas/api/guarda-session-cookie/?datos=",
		rutaProductos: "/consultas/api/obtiene-los-productos/?datos=",
	};
	const elegiblesSimples = Array.from(v.elegiblesSimples).map((n) => n.name);
	const elegiblesComplejos = [...new Set(Array.from(v.elegiblesComplejos).map((n) => n.name))];

	// Funciones
	let impactosDeLayout = () => {
		let layoutElegido = v.layout.value;

		// Acciones en 'Ordenes'
		for (let orden of v.ordenes) {
			console.log(orden.className);
			// Muestra una orden
			if (orden.className.includes("siempre") || orden.className.includes(layoutElegido)) orden.classList.remove("ocultar");
			// Acciones si la orden no se corresponde con el layout
			else {
				// Oculta ordenes
				orden.classList.add("ocultar");
				// Des-selecciona una orden si no corresponde al layout
				if (orden.checked) v.orden.value = "";
			}
		}
	};

	let impactosDeOrden = () => {
		// Acciones en Ascendente / Descendente
		v.orden.className.includes("ascDes") ? ascDes.classList.remove("ocultar") : ascDes.classList.add("ocultar");

		// Acciones en 'Basado en Hechos Reales' - Tiene que figurar 'bhr' en el layout y en el orden
		v.layout.className.includes("bhr") && v.orden.className.includes("bhr")
			? v.sector_hechosReales.classList.remove("ocultar")
			: v.sector_hechosReales.classList.add("ocultar");
	};

	let impactosDeBHR = () => {
		// Acciones en Personajes
		v.layout.value == "personajes"
			? v.sector_personajes.classList.remove("ocultar")
			: v.layout.value == "hechos"
			? v.sector_personajes.classList.add("ocultar")
			: v.hechosReales.className.includes("personajes")
			? v.sector_personajes.classList.remove("ocultar")
			: v.sector_personajes.classList.add("ocultar");

		// Acciones en Hechos
		v.layout.value == "hechos"
			? v.sector_hechos.classList.remove("ocultar")
			: v.layout.value == "personajes"
			? v.sector_hechos.classList.add("ocultar")
			: v.hechosReales.className.includes("hechos")
			? v.sector_hechos.classList.remove("ocultar")
			: v.sector_hechos.classList.add("ocultar");
	};

	// Startup
	impactosDeLayout();
	impactosDeOrden();
	impactosDeBHR();
});
