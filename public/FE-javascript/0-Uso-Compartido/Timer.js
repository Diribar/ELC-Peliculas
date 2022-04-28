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
		// Horario de captura
		let meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
		let horarioCaptura =
			horarioInicial.getDate() +
			"/" +
			meses[horarioInicial.getMonth()] +
			" " +
			horarioInicial.getHours() +
			":" +
			String(horarioInicial.getMinutes() + 1).padStart(2, "0");
		// Mensajes
		let arrayMensajes =
			codigo == "/producto/edicion/"
				? [
						"Tu edición de este producto comenzó un poco antes del " +
							horarioCaptura.slice(0, horarioCaptura.indexOf(" ")) +
							" a las " +
							horarioCaptura.slice(horarioCaptura.indexOf(" ")) +
							"hs..",
						"Transcurrida 1 hora, quedó a disposición de nuestro equipo para analizar tu trabajo.",
				  ]
				: codigo.startsWith("/revision/")
				? [
						"Esta revisión quedó inconclusa desde un poco antes del " +
							horarioCaptura.slice(0, horarioCaptura.indexOf(" ")) +
							" a las " +
							horarioCaptura.slice(horarioCaptura.indexOf(" ")) +
							"hs.. ",
						"Quedó a disposición de que lo continúe revisando otra persona.",
						"Si nadie lo revisa hasta 2 horas después de ese horario, podrás volver a revisarlo.",
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
		flechas.innerHTML += "<a href='" + iconos.link + "'>" + iconos.HTML + "</a>";

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
	if (minutos == 0) funcionCartel();
});
