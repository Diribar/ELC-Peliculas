"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		filasDatos: document.querySelectorAll("tbody tr.yaExistentes"),
		filasEdicion: document.querySelectorAll("tbody tr.edicion"),
		inputs: document.querySelectorAll("tbody .input"),
		urlInputs: document.querySelectorAll("tbody .inputError input[name='url'"),

		// Activo / Inactivo
		activos: document.querySelector("#tabla #tags #activo"),
		pasivos: document.querySelector("#tabla #tags #inactivo"),

		// Botones
		botonesEditar: document.querySelectorAll("tbody .yaExistentes i.edicion"),
		botonesRecuperar: document.querySelectorAll("tbody .yaExistentes i.in"),
		botonesDeshacer: document.querySelectorAll("tbody .yaExistentes i.deshacer"),
		botonesGuardar: document.querySelectorAll("tbody tr td button"),
	};
	let v = {
		prodEntidad: new URL(location.href).searchParams.get("entidad"),
		prodId: new URL(location.href).searchParams.get("id"),
		columnas: DOM.inputs.length / (DOM.filasDatos.length + 1),
	};

	// Formulas
	let obtieneDataEntry = (fila) => {
		let objeto = "?prodEntidad=" + v.prodEntidad + "&prodId=" + v.prodId;
		for (let columna = 0; columna < v.columnas; columna++) {
			let indice = fila * v.columnas + columna;
			objeto += "&" + DOM.inputs[indice].name + "=" + encodeURIComponent(DOM.inputs[indice].value);
		}
		return objeto;
	};

	// Editar - Hecho
	DOM.botonesEditar.forEach((botonEditar, fila) => {
		botonEditar.addEventListener("click", () => {
			// Ocultar la fila de Datos y mostrar la fila de Edición
			DOM.filasDatos[fila].classList.add("ocultar");
			DOM.filasEdicion[fila].classList.remove("ocultar");
		});
	});
	// Guardar - Hecho
	DOM.botonesGuardar.forEach((botonGuardar, fila) => {
		botonGuardar.addEventListener("click", async (e) => {
			// Si está inactivo --> interrumpe la ejecución
			if (botonGuardar.className.includes("inactivo")) return;
			botonGuardar.classList.add("inactivo");

			// Obtiene los datos
			let objeto = obtieneDataEntry(fila);
			// Submit
			await fetch("/links/api/guardar/" + objeto).then((n) => n.json());
			location.reload();
		});
	});
	DOM.botonesRecuperar.forEach((botonRecuperar, fila) => {
		botonRecuperar.addEventListener("click", async () => {
			// Averigua si está inactivo --> return
			if (botonRecuperar.className.includes("inactivo")) return;
			botonRecuperar.classList.add("inactivo");
			// Obtiene los datos del link
			let objeto = "?v.prodEntidad=" + v.prodEntidad + "&v.prodId=" + v.prodId;
			objeto += "&url=" + DOM.urlInputs[fila].value;
			// Submit
			let respuesta = await fetch("/links/api/recuperar/" + objeto).then((n) => n.json());
			// location.reload();
			if (respuesta.ocultar) DOM.filasDatos[fila].classList.add("ocultar");
			//if (respuesta.activos) DOM.activos.innerHTML = "* Activos";
		});
	});
	DOM.botonesDeshacer.forEach((botonDeshacer, fila) => {
		botonDeshacer.addEventListener("click", async () => {
			// Averigua si está inactivo --> return
			if (botonDeshacer.className.includes("inactivo")) return;
			botonDeshacer.classList.add("inactivo");
			// Obtiene los datos del link
			let objeto = "?v.prodEntidad=" + v.prodEntidad + "&v.prodId=" + v.prodId;
			objeto += "&url=" + DOM.urlInputs[fila].value;
			// Submit
			let respuesta = await fetch("/links/api/deshacer/" + objeto).then((n) => n.json());
			// location.reload();
			if (respuesta.reload) location.reload();
			if (respuesta.ocultar) DOM.filasDatos[fila].classList.add("ocultar");
			if (respuesta.activos && DOM.activos.className.includes("traslucido")) DOM.activos.innerHTML = "* Activos";
			if (respuesta.pasivos && DOM.pasivos.className.includes("traslucido")) DOM.pasivos.innerHTML = "* Pasivos";
		});
	});
});
