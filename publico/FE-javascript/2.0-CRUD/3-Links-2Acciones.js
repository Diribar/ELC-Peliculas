"use strict";
window.addEventListener("load", async () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let inputs = document.querySelectorAll(".edicion .input");
	let filasDatos = document.querySelectorAll("tbody .yaExistentes");
	let filasEditar = document.querySelectorAll("tbody .edicion");
	let urlInputs = document.querySelectorAll("tbody .inputError input[name='url'");
	let columnas = inputs.length / (filasEditar.length + 1);
	let activos = document.querySelector("#tabla #tags #activo");
	let pasivos = document.querySelector("#tabla #tags #inactivo");
	// Botones
	let botonesEditar = document.querySelectorAll("tbody .yaExistentes .editar");
	let botonesRecuperar = document.querySelectorAll("tbody .yaExistentes .in");
	let botonesDeshacer = document.querySelectorAll("tbody .yaExistentes .deshacer");
	let botonesGuardar = document.querySelectorAll("tbody .fa-floppy-disk");

	// Formulas
	let obtenerDataEntry = (fila) => {
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
		botonGuardar.addEventListener("click", async () => {
			// Averiguar si está inactivo --> return
			if (botonGuardar.classList.contains("inactivo")) return;
			botonGuardar.classList.add("inactivo");
			// Obtener los datos editados
			// Obtener los datos del link
			let objeto = obtenerDataEntry(fila);
			// Submit
			await fetch("/links/api/guardar/" + objeto).then((n) => n.json());
			window.location.reload();
		});
	});
	botonesRecuperar.forEach((botonRecuperar, fila) => {
		botonRecuperar.addEventListener("click", async () => {
			// Averiguar si está inactivo --> return
			if (botonRecuperar.classList.contains("inactivo")) return;
			botonRecuperar.classList.add("inactivo");
			// Obtener los datos del link
			let objeto = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
			objeto += "&url=" + urlInputs[fila].value;
			// Submit
			let respuesta = await fetch("/links/api/recuperar/" + objeto).then((n) => n.json());
			// window.location.reload();
			if (respuesta.ocultar) filasDatos[fila].classList.add("ocultar");
			if (respuesta.activos) activos.innerHTML = "* Activos";
			console.log(respuesta);
		});
	});
	botonesDeshacer.forEach((botonDeshacer, fila) => {
		botonDeshacer.addEventListener("click", async () => {
			// Averiguar si está inactivo --> return
			if (botonDeshacer.classList.contains("inactivo")) return;
			botonDeshacer.classList.add("inactivo");
			// Obtener los datos del link
			let objeto = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
			objeto += "&url=" + urlInputs[fila].value;
			// Submit
			let respuesta = await fetch("/links/api/deshacer/" + objeto).then((n) => n.json());
			// window.location.reload();
			if (respuesta.reload) window.location.reload();
			if (respuesta.ocultar) filasDatos[fila].classList.add("ocultar");
			if (respuesta.activos && activos.classList.contains("traslucido"))
				activos.innerHTML = "* Activos";
			if (respuesta.pasivos && pasivos.classList.contains("traslucido"))
				pasivos.innerHTML = "* Pasivos";
			console.log(respuesta);
		});
	});
});
