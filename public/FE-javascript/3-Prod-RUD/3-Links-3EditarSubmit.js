window.addEventListener("load", async () => {
	// Variables
	let form = document.querySelector("#datos form");
	let filasDatos = document.querySelectorAll("form .yaExistentes");
	let filasEditar = document.querySelectorAll("form .edicion");
	let botonesEditar = document.querySelectorAll("form .yaExistentes .editar");
	let botonesGuardar = document.querySelectorAll("form .fa-floppy-disk");
	let numeroFila = document.querySelector("form input[name='numeroFila']");

	// Acciones si se elije botonEditar
	for (let i = 0; i < botonesEditar.length; i++) {
		let botonEditar = botonesEditar[i];
		botonEditar.addEventListener("click", () => {
			// Verificar que sea un 'pen'
			if (botonEditar.classList.contains("fa-pen")) {
				// Ocultar la fila de Datos
				filasDatos[i].classList.add("ocultar");
				// Mostrar la fila de Edición
				filasEditar[i].classList.remove("ocultar");
			}
		});
	}

	// Acciones si se elije botonEditar
	for (let i = 0; i < botonesGuardar.length; i++) {
		let botonGuardar = botonesGuardar[i];
		botonGuardar.addEventListener("click", () => {
			// Averiguar si está inactivo --> return
			// if (botonGuardar.classList.contains("inactivo")) return;
			// Agregar el valor al numeroFila
			numeroFila.value = i;
			// submit --> form.submit();
			form.submit();
		});
	}
});
