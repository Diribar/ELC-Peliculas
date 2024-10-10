"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		form: document.querySelector("form"),
		calificaciones: document.querySelectorAll("form select"),
		guardarCambios: document.querySelectorAll("form #guardar"),
		eliminar: document.querySelectorAll("form #eliminar"),
		resultado: document.querySelector("form #consolidado #valor"),
	};
	let v = {

		entId: new URL(location.href).searchParams.get("id"),
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
		for (let boton of DOM.guardarCambios)
			!!v.incompleto || !!v.iguales ? boton.classList.add("inactivo") : boton.classList.remove("inactivo");

		// Fin
		return;
	};
	let actualizaResultado = () => {
		if (v.incompleto) return (DOM.resultado.innerHTML = "-");

		// Calcula el resultado
		let resultado = 0;
		for (let criterio of calCriterios) {
			const campo_id = criterio.atributo_id;
			const campo = criterio.atributo;
			const ponderacion = criterio.ponderacion;
			const calificacion_id = Array.from(DOM.calificaciones).find((n) => n.name == campo_id).value;
			const atributoCalif = atributosCalific[campo].find((n) => n.id == calificacion_id);
			const valor = atributoCalif.valor;
			resultado += (valor * ponderacion) / 100;
		}
		resultado = Math.round(resultado);
		DOM.resultado.innerHTML = resultado + "%";
	};

	// Input
	DOM.form.addEventListener("input", (e) => {
		revisaErrores();
		actualizaResultado();
	});
	// Guardar
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.guardarCambios[0].className.includes("inactivo")) e.preventDefault();
		return;
	});
	// Eliminar
	for (let eliminar of DOM.eliminar)
		eliminar.addEventListener("click", async () => {
			// Elimina la calificación
			await fetch(rutas.eliminaCalifPropia);

			// Recarga la vista
			location.reload();
		});

	// Fin
	revisaErrores();
});
const rutas = {
	califGuardada: "/producto/api/pr-calificacion-del-usuario/?entidad=" + entidad + "&id=" + id,
	eliminaCalifPropia: "/producto/api/pr-elimina-la-calificacion/?entidad=" + entidad + "&id=" + id,
};
