"use strict";
window.addEventListener("load", async () => {
	// Variables
	const domIconos = document.querySelectorAll(".iconos #ppp");
	const opciones = await fetch("/producto/api/obtiene-opciones-de-preferencia").then((n) => n.json());
	const rutaGuardar = "/producto/api/guarda-la-preferencia-del-usuario/?entidad=" + entidad + "&entidad_id=" + prod_id;
	let guardado = true;

	// Eventos
	for (let domIcono of domIconos)
		domIcono.addEventListener("click", async () => {
			// Si no se completó el guardado, termina la función
			if (!guardado) return;

			// Opción actual
			const opcionActual = opciones.find((n) => n.icono == domIcono.className);
			const idActual = opcionActual.id;

			// Opción propuesta
			const idPropuesta = idActual > 1 ? idActual - 1 : opciones.length;
			const opcionPropuesta = opciones.find((n) => n.id == idPropuesta);

			for (let domIcono of domIconos) {
				// Actualiza el ícono
				domIcono.classList.remove(...opcionActual.icono.split(" "));
				domIcono.classList.add(...opcionPropuesta.icono.split(" "));

				// Actualiza el título
				domIcono.title = opcionPropuesta.nombre;
			}

			// Actualiza la preferencia
			guardado = false;
			await fetch(rutaGuardar + "&ppp_id=" + idPropuesta);
			guardado = true;
		});
});
const prod_id = new URL(location.href).searchParams.get("id");
