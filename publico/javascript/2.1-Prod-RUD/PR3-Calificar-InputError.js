"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		form: document.querySelector("form"),
		calificaciones: document.querySelectorAll("form select"),
		guardarCambios: document.querySelector("form #guardarCambios"),
		eliminar: document.querySelector("form #eliminar"),
	};
	let v = {
		entidad: new URL(location.href).searchParams.get("entidad"),
		entID: new URL(location.href).searchParams.get("id"),
	};
	let rutas = {
		califGuardada: "/producto/api/calificacion-guardada/?entidad=",
	};
	const {userID, califGuardada} = await fetch(rutas.califGuardada + v.entidad + "&id=" + v.entID).then((n) => n.json());
	console.log(califGuardada);

	// Funciones
	let revisaErrores = () => {
		// Se fija si alguna calificacion está incompleta
		let errores = DOM.calificaciones.some((n) => !n.value);

		// Si no hubo errores, se fija si todas las calificaciones coinciden con la guardada
		if (califGuardada && !errores) {
			let resultados = [];
			for (let calif of DOM.calificaciones) resultados.push(calif.value == califGuardada[calif.name]);
			errores = resultados.every((n) => !!n);
		}
		console.log(errores);
		errores ? DOM.guardarCambios.classList.add("inactivo") : DOM.guardarCambios.classList.remove("inactivo");
		return;
	};

	let activaInactivaBotonEliminar = () => {
		califGuardada ? DOM.eliminar.classList.remove("inactivo") : DOM.eliminar.classList.add("inactivo");
		return;
	};

	// Input
	DOM.form.addEventListener("input", (e) => {});
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
