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

	// Funciones
	let revisaErrores = () => {
		// Se fija si alguna calificacion está incompleta
		v.errores = Array.from(DOM.calificaciones).some((n) => !n.value);

		// Si no hubo errores, se fija si todas las calificaciones coinciden con la guardada
		if (califGuardada && !v.errores) {
			let resultados = [];
			for (let calif of DOM.calificaciones) resultados.push(calif.value == califGuardada[calif.name]);
			v.iguales = resultados.every((n) => !!n);
		}

		// Activa/Inactiva el botón guardar
		v.errores || v.iguales ? DOM.guardarCambios.classList.add("inactivo") : DOM.guardarCambios.classList.remove("inactivo");

		// Fin
		return;
	};
	let activaInactivaBotonEliminar = () => {
		califGuardada ? DOM.eliminar.classList.remove("inactivo") : DOM.eliminar.classList.add("inactivo");
		return;
	};
	let actualizaResultado = () => {
		if (v.errores) DOM.resultado.innerHTML = "-";
		else {
			let resultado = 0;
			for (let criterio of criteriosCalif) {
				const campo_id = criterio.atributo_id;
				const campo = criterio.atributo;
				const ponderacion = criterio.ponderacion;
				const ID = Array.from(DOM.calificaciones).find((n) => n.name == campo_id).value;
				const atributoCalif = atributosCalific[campo].find((n) => n.id == ID);
				const valor = atributoCalif.valor;
				resultado += (valor * ponderacion) / 100;
				// console.log({campo_id, campo, ID, valor, ponderacion, resultado});
			}
			resultado = parseInt(resultado + 0.5);
			DOM.resultado.innerHTML = resultado + "%";
		}
		// const
		// atributosCalific
	};

	// Input
	DOM.form.addEventListener("input", (e) => {
		revisaErrores();
		actualizaResultado();
	});
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.guardarCambios.classList.contains("inactivo")) e.preventDefault();
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
