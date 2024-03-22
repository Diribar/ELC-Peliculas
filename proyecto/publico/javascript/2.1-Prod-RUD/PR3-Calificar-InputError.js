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
		eliminaCalifPropia: "/producto/api/elimina-calif-propia/?entidad=" + v.entidad + "&id=" + v.entID,
	};

	const {califGuardada, atributosCalific, calCriterios} = await fetch(rutas.califGuardada).then((n) => n.json());

	// Funciones
	let revisaErrores = () => {
		// Se fija si alguna calificacion está incompleta
		v.incompleto = Array.from(DOM.calificaciones).some((n) => !n.value);

		// Si existe una calificación guardada y no está incompleto, se fija si todas las calificaciones coinciden con la guardada
		if (califGuardada && !v.incompleto) {
			let resultados = [];
			for (let calif of DOM.calificaciones) resultados.push(calif.value == califGuardada[calif.name]);
			v.iguales = resultados.every((n) => !!n);
		}

		// Activa/Inactiva el botón guardar
		v.incompleto || v.iguales
			? DOM.guardarCambios.classList.add("inactivo")
			: DOM.guardarCambios.classList.remove("inactivo");

		// Fin
		return;
	};
	let actualizaResultado = () => {
		if (v.incompleto) DOM.resultado.innerHTML = "-";
		else {
			let resultado = 0;
			for (let criterio of calCriterios) {
				const campo_id = criterio.atributo_id;
				const campo = criterio.atributo;
				const ponderacion = criterio.ponderacion;
				const ID = Array.from(DOM.calificaciones).find((n) => n.name == campo_id).value;
				const atributoCalif = atributosCalific[campo].find((n) => n.id == ID);
				const valor = atributoCalif.valor;
				resultado += (valor * ponderacion) / 100;
			}
			resultado = Math.round(resultado);
			DOM.resultado.innerHTML = resultado + "%";
		}
	};

	// Input
	DOM.form.addEventListener("input", (e) => {
		revisaErrores();
		actualizaResultado();
	});
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.guardarCambios.className.includes("inactivo")) e.preventDefault();
		return;
	});
	if (DOM.eliminar)
		DOM.eliminar.addEventListener("click", async () => {
			// Elimina la calificación
			await fetch(rutas.eliminaCalifPropia);

			// Recarga la vista
			location.reload();
		});

	// Fin
	revisaErrores();
});
