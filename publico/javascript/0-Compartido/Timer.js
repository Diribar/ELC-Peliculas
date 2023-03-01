"use strict";
window.addEventListener("load", async () => {
	// VARIABLES -------------------------------------------------------------------------
	// Pointer del producto
	const entID = new URL(location.href).searchParams.get("id");
	let entidad = new URL(location.href).searchParams.get("entidad")
	if (!entidad && location.pathname.includes("/revision/usuarios")) entidad = "usuarios";
	// Temas de horario y fechas
	const unMinuto = 60 * 1000;
	const mesesAbrev = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
	// Otras variables
	const tipoUsuario = location.pathname.startsWith("/revision/") ? "revisores" : "usuarios";
	const codigo = new URL(location.href).pathname;
	let timer = document.querySelector("#timer");
	// Horario Inicial
	let datos = await fetch("/api/horario-inicial/?entidad=" + entidad + "&id=" + entID).then((n) =>
		n.json()
	);
	let horarioInicial = datos.capturado_en ? datos.capturado_en : datos.creado_en;
	// Configurar el horario final
	let horarioFinal = new Date(horarioInicial);
	horarioFinal.setHours(horarioFinal.getHours() + 1);
	// Tiempo restante
	let ahora = new Date(new Date().toUTCString());
	let tiempoMax = 60;
	let tiempoRestante = Math.min(tiempoMax, (horarioFinal.getTime() - ahora.getTime()) / unMinuto);
	// Minutos y Segundos disponibles
	let minutosDispon =
		// ¿Hay tiempo restante?
		tiempoRestante > 0
			? tiempoRestante
			: // ¿Pasó más de una hora?
			tiempoRestante <= -60
			? tiempoMax
			: 0;
	let segundosDispon = Math.round((minutosDispon % 1) * 60);

	// FUNCIONES -------------------------------------------------------------
	let fechaHorarioTexto = (horario) => {
		return (
			horario.getDate() +
			"/" +
			mesesAbrev[horario.getMonth()] +
			" " +
			horario.getHours() +
			":" +
			String(horario.getMinutes()).padStart(2, "0")
		);
	};
	let funcionTimer = () => {
		let actualizaTimer = setInterval(() => {
			minutosDispon--;
			if (minutosDispon < 0) minutosDispon = 0;
			timer.innerHTML = minutosDispon + " min.";
			if (minutosDispon == 0) {
				clearInterval(actualizaTimer);
				return funcionCartel();
			} else formatoTimer(minutosDispon);
		}, unMinuto);
	};
	let funcionCartel = () => {
		// Partes del cartel
		let taparElFondo = document.querySelector("#tapar-el-fondo");
		let cartel = document.querySelector("#cartel");
		let cartelMensajes = document.querySelector("#cartel #mensajes");
		let flechas = document.querySelector("#cartel #flechasCartel");
		// Mensajes
		let horarioFinalTexto = fechaHorarioTexto(horarioFinal);
		let dia = horarioFinalTexto.slice(0, horarioFinalTexto.indexOf(" "));
		let hora = horarioFinalTexto.slice(horarioFinalTexto.indexOf(" "));
		let mensajes = datos.capturado_en
			? [
					"Esta captura terminó el " + dia + " a las " + hora + "hs.. ",
					"Quedó a disposición de los demás " + tipoUsuario + ".",
					"Si nadie lo captura hasta 1 hora después de ese horario, podrás volver a capturarlo.",
			  ]
			: [
					"Se cumplió el plazo de 1 hora desde que se creó el registro.",
					"Estará disponible luego de ser revisado, en caso de ser aprobado.",
			  ];
		cartelMensajes.innerHTML = "";
		for (let mensaje of mensajes) cartelMensajes.innerHTML += "<li>" + mensaje + "</li>";

		// Flechas
		let icono = codigo.startsWith("/revision/usuarios")
			? {
					link: "/revision/usuarios/tablero-de-control",
					HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
			  }
			: codigo.startsWith("/revision/")
			? {
					link: "/revision/tablero-de-control",
					HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
			  }
			: codigo.startsWith("/producto/edicion/") || codigo.startsWith("/links/abm/")
			? {
					link: "/producto/detalle/?entidad=" + entidad + "&id=" + entID,
					HTML: '<i class="fa-solid fa-circle-info" title="Ir a Detalle"></i>',
			  }
			: codigo.startsWith("/rclv/edicion/")
			? {
					link: "/rclv/detalle/?entidad=" + entidad + "&id=" + entID,
					HTML: '<i class="fa-solid fa-circle-info" title="Ir a Detalle"></i>',
			  }
			: {};
		flechas.innerHTML = "<a href='" + icono.link + "'>" + icono.HTML + "</a>";

		// Mostrar el cartel
		taparElFondo.classList.remove("ocultar");
		cartel.classList.remove("ocultar");
	};
	let formatoTimer = (minutosDispon) => {
		if (minutosDispon <= 15) timer.style.backgroundColor = "var(--rojo-oscuro)";
		else if (minutosDispon <= 30) timer.style.backgroundColor = "var(--naranja-oscuro)";
	};

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
		formatoTimer(minutosDispon);
		if (minutosDispon == 0) return funcionCartel();
		// Ejecutar la rutina
		funcionTimer();
	}, segundosDispon * 1000);
});
