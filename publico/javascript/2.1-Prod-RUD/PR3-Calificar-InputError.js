"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		form: document.querySelector("form"),
		calificaciones: document.querySelectorAll("form select"),
		guardarCambios: document.querySelector("form #guardarCambios #guardar"),
		eliminar: document.querySelector("form #guardarCambios #eliminar"),
		resultado: document.querySelector("form #consolidado #valor"),
	};
	let v = {
		entidad: new URL(location.href).searchParams.get("entidad"),
		entID: new URL(location.href).searchParams.get("id"),
	};
	let rutas = {
		califGuardada: "/producto/api/calificacion-guardada/?entidad=" + v.entidad + "&id=" + v.entID,
	};

	const {userID, califGuardada, atributosCalific, criteriosCalif} = await fetch(rutas.califGuardada).then((n) => n.json());
	console.log(califGuardada);
	console.log(atributosCalific);

	// Funciones
	let revisaErrores = () => {
		// Se fija si alguna calificacion está incompleta
		let errores = Array.from(DOM.calificaciones).some((n) => !n.value);

		// Si no hubo errores, se fija si todas las calificaciones coinciden con la guardada
		if (califGuardada && !errores) {
			let resultados = [];
			for (let calif of DOM.calificaciones) resultados.push(calif.value == califGuardada[calif.name]);
			errores = resultados.every((n) => !!n);
		}

		// Activa/Inactiva el botón guardar
		errores ? DOM.guardarCambios.classList.add("inactivo") : DOM.guardarCambios.classList.remove("inactivo");

		// Fin
		return;
	};
	let activaInactivaBotonEliminar = () => {
		califGuardada ? DOM.eliminar.classList.remove("inactivo") : DOM.eliminar.classList.add("inactivo");
		return;
	};
	let actualizaResultado = () => {
		let resultado=0
		for (let atributo in atributosCalific)
		console.log(48,atributo);
		// const
		// atributosCalific
	};

	// Input
	DOM.form.addEventListener("input", (e) => {
		revisaErrores();
	});
	DOM.form.addEventListener("submit", () => {
		if (button.classList.contains("inactivo")) e.preventDefault();
		return;
	});
	DOM.eliminar.addEventListener("click", () => {
		// Si no está activo, termina la función
		if (DOM.eliminar.classList.contains("inactivo")) return;

		// Elimina la calificación

		// Recarga la vista
		location.reload();
	});

	// Fin
	revisaErrores();
	activaInactivaBotonEliminar();
});
