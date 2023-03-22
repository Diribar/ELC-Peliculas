"use strict";
window.addEventListener("load", async () => {
	// Variables
	let prodEntidad = new URL(location.href).searchParams.get("entidad");
	let prodID = new URL(location.href).searchParams.get("id");
	let filasDatos = document.querySelectorAll("tbody .yaExistentes");
	let filasEditar = document.querySelectorAll("tbody .edicion");
	let inputs = document.querySelectorAll("tbody .input");
	let urlInputs = document.querySelectorAll("tbody .inputError input[name='url'");
	let columnas = inputs.length / (filasEditar.length + 1);
	let activos = document.querySelector("#tabla #tags #activo");
	let pasivos = document.querySelector("#tabla #tags #inactivo");
	// Botones
	let botonesEditar = document.querySelectorAll("tbody .yaExistentes .editar");
	let botonesRecuperar = document.querySelectorAll("tbody .yaExistentes .in");
	let botonesDeshacer = document.querySelectorAll("tbody .yaExistentes .deshacer");
	let botonesGuardar = document.querySelectorAll("tbody tr button");

	// Formulas
	let obtieneDataEntry = (fila) => {
		let objeto = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
		for (let columna = 0; columna < columnas; columna++) {
			let indice = fila * columnas + columna;
			objeto += "&" + inputs[indice].name + "=" + encodeURIComponent(inputs[indice].value);
		}
		return objeto;
	};

	// Editar - Hecho
	botonesEditar.forEach((botonEditar, fila) => {
		botonEditar.addEventListener("click", () => {
			// Ocultar la fila de Datos y mostrar la fila de Edición
			filasDatos[fila].classList.add("ocultar");
			filasEditar[fila].classList.remove("ocultar");
		});
	});
	// Guardar - Hecho
	botonesGuardar.forEach((botonGuardar, fila) => {
		botonGuardar.addEventListener("click", async (e) => {
			// Si está inactivo --> interrumpe la ejecución
			if (botonGuardar.classList.contains("inactivo")) return;
			botonGuardar.classList.add("inactivo");
			// Obtiene los datos
			let objeto = obtieneDataEntry(fila);
			// Submit
			await fetch("./api/guardar/" + objeto).then((n) => n.json());
			location.reload();
		});
	});
	botonesRecuperar.forEach((botonRecuperar, fila) => {
		botonRecuperar.addEventListener("click", async () => {
			// Averigua si está inactivo --> return
			if (botonRecuperar.classList.contains("inactivo")) return;
			botonRecuperar.classList.add("inactivo");
			// Obtiene los datos del link
			let objeto = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
			objeto += "&url=" + urlInputs[fila].value;
			// Submit
			let respuesta = await fetch("./api/recuperar/" + objeto).then((n) => n.json());
			// location.reload();
			if (respuesta.ocultar) filasDatos[fila].classList.add("ocultar");
			if (respuesta.activos) activos.innerHTML = "* Activos";
		});
	});
	botonesDeshacer.forEach((botonDeshacer, fila) => {
		botonDeshacer.addEventListener("click", async () => {
			// Averigua si está inactivo --> return
			if (botonDeshacer.classList.contains("inactivo")) return;
			botonDeshacer.classList.add("inactivo");
			// Obtiene los datos del link
			let objeto = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
			objeto += "&url=" + urlInputs[fila].value;
			// Submit
			let respuesta = await fetch("./api/deshacer/" + objeto).then((n) => n.json());
			// location.reload();
			if (respuesta.reload) location.reload();
			if (respuesta.ocultar) filasDatos[fila].classList.add("ocultar");
			if (respuesta.activos && activos.classList.contains("traslucido")) activos.innerHTML = "* Activos";
			if (respuesta.pasivos && pasivos.classList.contains("traslucido")) pasivos.innerHTML = "* Pasivos";
		});
	});
});
