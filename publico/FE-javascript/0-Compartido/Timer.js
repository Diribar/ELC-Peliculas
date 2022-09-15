"use strict";
window.addEventListener("load", async () => {
	// VARIABLES -------------------------------------------------------------------------
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	if (!entidad && location.pathname.includes("/revision/usuarios")) entidad = "usuarios";
	const tipoUsuario = window.location.pathname.startsWith("/revision/") ? "revisores" : "usuarios";
	// Otras variables
	const codigo = new URL(window.location.href).pathname;
	let timer = document.querySelector("#timer");
	// Temas de horario y fechas
	let unMinuto = 60 * 1000;
	let meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
	// Horario Inicial
	let datos = await fetch("/api/horario-inicial/?entidad=" + entidad + "&id=" + prodID).then((n) =>
		n.json()
	);
	let horarioInicial = datos.capturado_en ? datos.capturado_en : datos.creado_en;
	// Configurar el horario final
	let horarioFinal = new Date(horarioInicial);
	horarioFinal.setHours(horarioFinal.getHours() + 1);
	// Tiempo restante
	let ahora = new Date(new Date().toUTCString());
	let tiempoRestante = (horarioFinal.getTime() - ahora.getTime()) / unMinuto;
	// Minutos y Segundos disponibles
	let tiempoMax = 60;
	let minutosDispon = tiempoRestante > 0 ? tiempoRestante : tiempoRestante <= -60 ? tiempoMax : 0;
	let segundosDispon = Math.round((minutosDispon % 1) * 60);

	// FUNCIONES -------------------------------------------------------------
	let fechaHorarioTexto = (horario) => {
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
		let horarioFinalTexto = fechaHorarioTexto(horarioFinal);
		let dia = horarioFinalTexto.slice(0, horarioFinalTexto.indexOf(" "));
		let hora = horarioFinalTexto.slice(horarioFinalTexto.indexOf(" "));
		let arrayMensajes = datos.capturado_en
			? [
					"Esta captura terminó el " + dia + " a las " + hora + "hs.. ",
					"Quedó a disposición de los demás " + tipoUsuario + ".",
					"Si nadie lo captura hasta 1 hora después de ese horario, podrás volver a capturarlo.",
			  ]
			: [
					"Se cumplió el plazo de 1 hora desde que se creó el registro.",
					"Estará disponible luego de ser revisado, en caso de ser aprobado.",
			  ];
		mensajes.innerHTML = "";
		for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";

		// Flechas
		let icono = codigo.startsWith("/revision/usuarios")
			? {
					link: "/inactivar-captura/?entidad=usuarios&id=" + prodID + "&origen=tableroUs",
					HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
			  }
			: codigo.startsWith("/revision/")
			? {
					link: "/inactivar-captura/?entidad=" + entidad + "&id=" + prodID + "&origen=tableroEnts",
					HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
			  }
			: codigo.startsWith("/producto/edicion/") || codigo.startsWith("/links/abm/")
			? {
					link: "/producto/detalle/?entidad=" + entidad + "&id=" + prodID,
					HTML: '<i class="fa-solid fa-circle-info" title="Ir a Detalle"></i>',
			  }
			: codigo.startsWith("/rclv/edicion/")
			? {
					link: "/rclv/detalle/?entidad=" + entidad + "&id=" + prodID,
					HTML: '<i class="fa-solid fa-circle-info" title="Ir a Detalle"></i>',
			  }
			: {};
		flechas.innerHTML = "";
		flechas.innerHTML += "<a href='" + icono.link + "'>" + icono.HTML + "</a>";

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
