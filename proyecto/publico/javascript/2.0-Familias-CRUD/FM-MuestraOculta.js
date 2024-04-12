"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		datos: document.querySelector("#cuerpo #datos"),
		imgDerecha: document.querySelector("#imgDerecha"),
	};

	DOM = {
		...DOM,
		// Sector Cuerpo
		datosLargos: DOM.datos.querySelector("#datosLargos"),
		datosBreves: DOM.datos.querySelector("#datosBreves"),
		// Sector Imagen Derecha
		imagen: DOM.imgDerecha.querySelector("img"),
		links: DOM.imgDerecha.querySelector("#links"),
		sectorIconos: DOM.imgDerecha.querySelector("#sectorIconos"),
	};
	// Sector Íconos
	DOM.muestraDL = DOM.sectorIconos.querySelector("#muestraDL");
	DOM.muestraDB = DOM.sectorIconos.querySelector("#muestraDB");

	// Variables
	let acostado = window.matchMedia("(orientation: landscape)").matches;
	let v = {
		mostrar: true,
		ruta: location.pathname,
		rutasSectores: [
			{ruta: "producto/detalle", mostrarEstandar: acostado ? ["datosLargos", "links"] : ["links"]}, // más 'datosLargos' para 'acostado'
			{ruta: "producto/calificar", mostrarEstandar: ["datosLargos"]},
			{ruta: "rclv/detalle", mostrarEstandar: ["datosLargos"]},
		],
		sectores: ["links", "datosLargos", "datosBreves"],
	};
	const {mostrarEstandar} = v.rutasSectores.find((n) => v.ruta.includes(n.ruta));

	// Funciones
	let mostrarOcultarEstandar = () => {
		// Rutina por sector a mostrar/ocultar
		for (let sector of v.sectores) {
			if (DOM[sector])
				v.mostrar && mostrarEstandar.includes(sector)
					? DOM[sector].classList.remove("toggle")
					: DOM[sector].classList.add("toggle");
		}

		// Fin
		v.mostrar = !v.mostrar;
		return;
	};

	// Event listeners - Start-up / Sólo la imagen
	DOM.imagen.addEventListener("click", () => mostrarOcultarEstandar());
	// Event listeners - Muestra datosLargos
	if (DOM.muestraDL)
		DOM.muestraDL.addEventListener("click", () => {
			// Alterna mostrar/ocultar
			v.mostrar = DOM.datosLargos.className.includes("toggle"); // si está oculto, se debe mostrar
			DOM.datosLargos.classList.toggle("toggle");
			mostrarOcultarEstandar();
		});
	// Event listeners - Muestra datosBreves
	DOM.muestraDB.addEventListener("click", () => {
		// Alterna muestra/oculta
		if (DOM.muestraDB && DOM.muestraDB.className.includes("inactivo")) return;
		DOM.datosBreves.classList.toggle("toggle");
		v.mostrar = DOM.datosBreves.className.includes("toggle"); // si está oculto, se debe mostrar
		console.log(v.mostrar);

		DOM.datosLargos.classList.add("toggle"); // oculta
		if (DOM.links && visibleEstandar == "links") {
			v.mostrar ? DOM.links.classList.remove("toggle") : DOM.links.classList.add("toggle"); // muestra/oculta
			if (v.mostrar) v.mostrar = false;
		}
	});
	// Event listener - giro de la orientación
	screen.orientation.addEventListener("change", () => {});

	// Start-up
	mostrarOcultarEstandar();
});
