"use strict";
window.addEventListener("load", async () => {
	// VARIABLES -------------------------------------------------------------------------
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	// Otras variables
	let codigo = new URL(window.location.href).pathname;
	let timer = document.querySelector("#timer");
	// Temas de horario y fechas
	let minutosDispon, horarioFinal;
	let unMinuto = 60 * 1000;
	let meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

	// Horario Inicial
	let codigoEnc = encodeURIComponent(codigo);
	let horarioInicial = await fetch(
		"/api/horario-inicial/?entidad=" + entidad + "&id=" + prodID + "&codigo=" + codigoEnc
	).then((n) => n.json());

	// FUNCIONES -------------------------------------------------------------
	let horarioTexto = (horario) => {
		return (
			horario.getDate() +
			"/" +
			meses[horario.getMonth()] +
			" " +
			horario.getHours() +
			":" +
			String(horario.getMinutes()).padStart(2, "0")
		);
	};

	let funcionTimer = () => {
		let actualizarTimer = setInterval(() => {
			minutosDispon--;
			if (minutosDispon < 0) minutosDispon = 0;
			timer.innerHTML = minutosDispon + " min.";
			if (minutosDispon == 0) {
				clearInterval(actualizarTimer);
				// Cartel de "time out"
				funcionCartel();
			} else formatoTimer(minutosDispon);
		}, unMinuto);
	};
	let funcionCartel = () => {
		// Partes del cartel
		let taparElFondo = document.querySelector("#tapar-el-fondo");
		let cartel = document.querySelector("#cartel");
		let gracias = document.querySelector("#gracias");
		let mensajes = document.querySelector("#cartel #mensajes");
		let flechas = document.querySelector("#cartel #flechasCartel");
		// Formatos
		cartel.style.backgroundColor = "var(--rojo-oscuro)";
		gracias.classList.add("ocultar");
		// Mensajes
		let arrayMensajes =
			codigo == "/producto/edicion/"
				? [
						"Tu edición de este producto comenzó el " +
							horarioInicial.slice(0, horarioInicial.indexOf(" ")) +
							" a las " +
							horarioInicial.slice(horarioInicial.indexOf(" ")) +
							"hs..",
						"Transcurrida 1 hora, quedó a disposición de nuestro equipo para analizar tu trabajo.",
				  ]
				: codigo == "/producto/links/"
				? [
						"Esta edición quedó inconclusa desde el " +
							horarioFinal.slice(0, horarioFinal.indexOf(" ")) +
							" a las " +
							horarioFinal.slice(horarioFinal.indexOf(" ")) +
							"hs.. ",
						"Quedó a disposición del equipo de revisores.",
						"Si nadie comienza a revisarlo hasta 1 hora después de ese horario, podrás retomar la edición.",
				  ]
				: codigo.startsWith("/revision/")
				? [
						"Esta revisión quedó inconclusa desde el " +
							horarioFinal.slice(0, horarioFinal.indexOf(" ")) +
							" a las " +
							horarioFinal.slice(horarioFinal.indexOf(" ")) +
							"hs.. ",
						"Quedó a disposición de que lo revise otra persona.",
						"Si nadie comienza a revisarlo hasta 1 hora después de ese horario, podrás volverlo a revisar.",
				  ]
				: [];
		console.log();
		mensajes.innerHTML = "";
		for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";

		// Flechas
		let iconos =
			codigo == "/producto/edicion/" || codigo == "/producto/links/"
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
	let formatoTimer = (minutosDispon) => {
		if (minutosDispon <= 15) timer.style.backgroundColor = "var(--rojo-oscuro)";
		else if (minutosDispon <= 30) timer.style.backgroundColor = "var(--naranja-oscuro)";
	};

	// Variables con funciones
	if (horarioInicial) {
		// Pulir el horario inicial
		horarioInicial = new Date(horarioInicial);
		horarioInicial.setSeconds(0);
		// Configurar el horario final
		horarioFinal = horarioInicial;
		horarioFinal.setHours(horarioInicial.getHours() + 1);
		// Tiempo restante
		let ahora = new Date(new Date().toUTCString());
		ahora.setSeconds(0);
		let tiempoRestante = parseInt((horarioFinal.getTime() - ahora.getTime()) / unMinuto);
		minutosDispon = tiempoRestante > 0 ? Math.min(60, tiempoRestante) : tiempoRestante <= -60 ? 60 : 0;
		// Horario en formato texto
		horarioInicial = horarioTexto(horarioInicial);
		horarioFinal = horarioTexto(horarioFinal);
	}

	// STARTUP -------------------------------------------------------------
	if (horarioInicial) {
		timer.innerHTML = minutosDispon + " min.";
		formatoTimer(minutosDispon);
		funcionTimer();
		timer.classList.remove("ocultar");
		if (minutosDispon == 0) funcionCartel();
	}
});
