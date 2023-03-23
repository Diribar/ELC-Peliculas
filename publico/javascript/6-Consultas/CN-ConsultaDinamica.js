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
		rutaGuardaSessionCookies: "/consultas/api/guarda-session-cookie/?datos=",
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

	// Startup
	impactosDeLayout()

});
