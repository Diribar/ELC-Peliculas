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
	DOM.imagen.addEventListener("click", () => {
		if (acostado) v.mostrar = true;
		mostrarOcultarEstandar();
	});

	// Event listeners - Muestra datosLargos
	if (DOM.muestraDL)
		DOM.muestraDL.addEventListener("click", () => {
			// Averigua si está oculto
			const oculto = DOM.datosLargos.className.includes("toggle"); // averigua si está oculto
			v.mostrar = !oculto;

			// Alterna mostrar/ocultar
			mostrarOcultarEstandar();
			if (oculto) DOM.datosLargos.classList.remove("toggle"); // muestra DB
			v.mostrar = false;
		});

	// Event listeners - Muestra datosBreves
	DOM.muestraDB.addEventListener("click", () => {
		// Averigua si está oculto
		const oculto = DOM.datosBreves.className.includes("toggle");
		v.mostrar = !oculto;

		// Alterna mostrar/ocultar
		mostrarOcultarEstandar();
		if (oculto) DOM.datosBreves.classList.remove("toggle"); // muestra DB
		v.mostrar = false;
	});
	// Event listener - giro de la orientación
	screen.orientation.addEventListener("change", () => {});

	// Start-up
	mostrarOcultarEstandar();
});
