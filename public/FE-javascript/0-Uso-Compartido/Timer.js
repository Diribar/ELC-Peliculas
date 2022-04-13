"use strict";
window.addEventListener("load", async () => {
	// VARIABLES -------------------------------------------------------------------------
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	// Otras variables
	let codigo = new URL(window.location.href).pathname;
	let timer = document.querySelector("#timer");
	// Horario Inicial
	let codigoEnc = encodeURIComponent(codigo);
	let horarioInicial = new Date(
		await fetch(
			"/api/horario-inicial/?entidad=" + entidad + "&id=" + prodID + "&codigo=" + codigoEnc
		).then((n) => n.json())
	);
	// Tiempo restante
	let ahora = new Date(new Date().toUTCString());
	let tiempoRestante = horarioInicial.getTime() + 1 * 60 * 60 * 1000 - ahora.getTime();
	let minutos = Math.min(60, Math.max(0, parseInt(tiempoRestante / 1000 / 60)));

	// FUNCIONES -------------------------------------------------------------
	let funcionTimer = () => {
		let actualizarTimer = setInterval(() => {
			minutos--;
			if (minutos < 0) minutos = 0;
			timer.innerHTML = minutos + " min.";
			if (minutos == 0) {
				clearInterval(actualizarTimer);
				// Cartel de "time out"
				funcionCartel();
			} else formatoTimer(minutos);
		}, 1000 * 60);
	};
	let funcionCartel = () => {
		// Partes del cartel
		let taparElFondo = document.querySelector("#tapar-el-fondo");
		let cartel = document.querySelector("#cartel");
		let gracias = document.querySelector("#gracias");
		let mensajes = document.querySelector("#cartel #mensajes");
		let flechas = document.querySelector("#cartel #flechas");
		// Formatos
		cartel.style.backgroundColor = "var(--rojo-oscuro)";
		gracias.classList.add("ocultar");

		// Mensajes
		let arrayMensajes =
			codigo == "/producto/edicion/"
				? [
						"Se acabó el tiempo de 1 hora para continuar con esta edición.",
						"Quedó a disposición de nuestro equipo para analizar tu trabajo.",
				  ]
				: codigo.startsWith("/revision/")
				? [
						"Se acabó el tiempo de 1 hora para continuar con esta revisión.",
						"Quedó a disposición de que lo continúe revisando otra persona.",
				  ]
				: [];
		mensajes.innerHTML = "";
		for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";

		// Flechas
		let iconos =
			codigo == "/producto/edicion/"
				? {
						HTML: '<i class="fa-solid fa-circle-info" title="Ir a Detalle"></i>',
						link: "/producto/detalle/?entidad=" + entidad + "&id=" + prodID,
				  }
				: codigo.startsWith("/revision/")
				? {
						HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
						link: "/revision/inactivar-captura/?entidad=" + entidad + "&id=" + prodID,
				  }
				: {};
		flechas.innerHTML = "";
		for (let icono of iconos) flechas.innerHTML += "<a href='" + icono.link + "'>" + icono.HTML + "</a>";

		// Mostrar el cartel
		taparElFondo.classList.remove("ocultar");
		cartel.classList.remove("ocultar");
	};
	let formatoTimer = (minutos) => {
		if (minutos <= 15) timer.style.backgroundColor = "var(--rojo-oscuro)";
		else if (minutos <= 30) timer.style.backgroundColor = "var(--naranja-oscuro)";
	};

	// STARTUP -------------------------------------------------------------
	timer.innerHTML = minutos + " min.";
	formatoTimer(minutos);
	funcionTimer();
	timer.classList.remove("ocultar");
});
