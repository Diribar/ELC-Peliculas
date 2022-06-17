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
	let unMinuto = 60 * 1000;
	let meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
	// Horario Inicial
	let horarioInicial = await fetch("/api/horario-inicial/?entidad=" + entidad + "&id=" + prodID).then((n) =>
		n.json()
	);
	// Configurar el horario final
	let horarioFinal = new Date(horarioInicial);
	horarioFinal.setHours(horarioFinal.getHours() + 1);
	// Tiempo restante
	let ahora = new Date(new Date().toUTCString());
	let tiempoRestante = (horarioFinal.getTime() - ahora.getTime()) / unMinuto;

	let tiempoMax = 60;
	let minutosDispon = tiempoRestante > 0 ? tiempoRestante : tiempoRestante <= -60 ? tiempoMax : 0;
	let segundosDispon = Math.round((minutosDispon % 1) * 60);

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
				return funcionCartel();
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
		let horarioFinalTexto = horarioTexto(horarioFinal);
		let arrayMensajes = [
			"Esta captura terminó el " +
				horarioFinalTexto.slice(0, horarioFinalTexto.indexOf(" ")) +
				" a las " +
				horarioFinalTexto.slice(horarioFinalTexto.indexOf(" ")) +
				"hs.. ",
			"Quedó a disposición de los demás usuarios.",
			"Si nadie lo captura hasta 1 hora después de ese horario, podrás volver a capturarlo.",
		];
		mensajes.innerHTML = "";
		for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";

		// Flechas
		let iconos =
			codigo == "/producto/edicion/" || codigo == "/links/abm/"
				? {
						link: "/producto/detalle/?entidad=" + entidad + "&id=" + prodID,
						HTML: '<i class="fa-solid fa-circle-info" title="Ir a Detalle"></i>',
				  }
				: codigo.startsWith("/revision/")
				? {
						link: "/revision/inactivar-captura/?entidad=" + entidad + "&id=" + prodID,
						HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
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

	console.log(horarioFinal);
	console.log(ahora);
	console.log(segundosDispon);

	// STARTUP -------------------------------------------------------------
	// Mostrar el tiempo inicial
	let minutosInicialesAMostrar = parseInt(minutosDispon) + (segundosDispon ? 1 : 0);
	timer.innerHTML = minutosInicialesAMostrar + " min.";
	formatoTimer(minutosDispon);
	timer.classList.remove("ocultar");
	// Pausa hasta que se acaben los segundos del minuto inicial
	setTimeout(() => {
		// Actualizar los minutos disponibles
		minutosDispon = parseInt(minutosDispon);
		timer.innerHTML = minutosDispon + " min.";
		if (minutosDispon == 0) return funcionCartel();
		// Ejecutar la rutina
		funcionTimer();
	}, segundosDispon * 1000);
});
