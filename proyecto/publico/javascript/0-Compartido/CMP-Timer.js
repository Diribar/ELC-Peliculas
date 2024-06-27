"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		timer: document.querySelector("#timer"),

		// Partes del cartel
		todoElMain: document.querySelector("#todoElMain"),
		tapaElFondo: document.querySelector("#todoElMain #tapaElFondo"),
		cartelGenerico: document.querySelector("#todoElMain #cartelGenerico"),
		contenedorMensajes: document.querySelector("#cartelGenerico #contenedorMensajes"),
	};
	let v = {
		// Temas de horario y fechas
		unMinuto: 60 * 1000,
		mesesAbrev: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],

		// Otras variables
		tipoUsuario: location.pathname.startsWith("/revision/") ? "revisores" : "usuarios",
		codigo: location.pathname,

		// Pointer del producto
		entID: new URL(location.href).searchParams.get("id"),
		entidad: new URL(location.href).searchParams.get("entidad"),
	};
	const familia = ["peliculas", "colecciones", "capitulos"].includes(v.entidad) ? "producto" : "rclv";
	if (!v.entidad && location.pathname.includes("/revision/usuarios")) v.entidad = "usuarios";

	// Horario Inicial
	let datos = await fetch("/api/horario-inicial/?entidad=" + v.entidad + "&id=" + v.entID).then((n) => n.json());
	let horarioInicial = false
		? false
		: !datos.capturadoEn
		? datos.creadoEn
		: datos.capturadoPor_id == datos.userID
		? datos.capturadoEn
		: new Date();

	// Configura el horario final
	let horarioFinal = new Date(horarioInicial);
	horarioFinal.setHours(horarioFinal.getHours() + 1);

	// Tiempo restante
	let ahora = new Date(new Date().toUTCString());
	let tiempoMax = 60;
	let tiempoRestante = Math.min(tiempoMax, (horarioFinal.getTime() - ahora.getTime()) / v.unMinuto);

	// Minutos y Segundos disponibles
	v.minutosDispon =
		// ¿Hay tiempo restante?
		tiempoRestante > 0
			? tiempoRestante
			: // ¿Pasó más de una hora?
			tiempoRestante <= -60
			? tiempoMax
			: 0;
	v.segundosDispon = Math.round((v.minutosDispon % 1) * 60);

	// Funciones
	let FN = {
		fechaHorario: (horario) => {
			return (
				horario.getDate() +
				"/" +
				v.mesesAbrev[horario.getMonth()] +
				" " +
				horario.getHours() +
				":" +
				String(horario.getMinutes()).padStart(2, "0")
			);
		},
		// let actualizaTimer =
		timer: setInterval(() => {
			// Si ya se mostró el cartel, interrumpe la función
			if (!DOM.todoElMain.className.includes("ocultar")) return clearInterval(FN.timer);

			// Actualiza los minutos disponibles
			v.minutosDispon--;
			if (v.minutosDispon < 0) v.minutosDispon = 0;
			DOM.timer.innerHTML = v.minutosDispon + " min.";

			// Acciones si se acabó el tiempo
			if (v.minutosDispon == 0) {
				clearInterval(FN.timer);
				return FN.funcionCartel();
			}

			// Si sigue habiendo tiempo, actualiza el formato
			else FN.formatoTimer();
		}, v.unMinuto),
		funcionCartel: () => {
			// Variables
			const horarioFinalTexto = FN.fechaHorario(horarioFinal);
			const dia = horarioFinalTexto.slice(0, horarioFinalTexto.indexOf(" "));
			const hora = horarioFinalTexto.slice(horarioFinalTexto.indexOf(" "));

			// Crea el mensaje
			const mensajes = datos.capturadoEn
				? [
						"Esta captura terminó el " + dia + " a las " + hora + "hs.. ",
						"Quedó a disposición de los demás " + v.tipoUsuario + ".",
						"Si nadie lo captura hasta 1 hora después, podrás volver a capturarlo.",
				  ]
				: [
						"Se cumplió el plazo de 1 hora desde que se creó el registro.",
						"Estará disponible luego de ser revisado, en caso de ser aprobado.",
				  ];
			const [link, clase, titulo] = v.codigo.startsWith("/revision/usuarios")
				? ["/revision/usuarios/tablero-de-usuarios", "fa-thumbs-up", "Entendido"]
				: v.codigo.startsWith("/revision/")
				? ["/revision/tablero-de-entidades", "fa-thumbs-up", "Entendido"]
				: ["/" + familia + "/detalle/?entidad=" + v.entidad + "&id=" + v.entID, "fa-circle-info", "Ir a Detalle"];
			contenidoDelCartelGenerico({DOM, mensajes, clase, titulo, link});

			// Muestra el cartel
			DOM.todoElMain.classList.remove("ocultar");
			DOM.tapaElFondo.classList.remove("ocultar");
			DOM.cartelGenerico.classList.remove("ocultar");
		},
		formatoTimer: () => {
			if (v.minutosDispon <= 15) DOM.timer.style.backgroundColor = "var(--rojo-oscuro)";
			else if (v.minutosDispon <= 30) DOM.timer.style.backgroundColor = "var(--naranja-oscuro)";
		},
	};

	// STARTUP -------------------------------------------------------------
	// Muestra el tiempo inicial
	DOM.timer.innerHTML = Math.ceil(v.minutosDispon) + " min.";
	FN.formatoTimer();
	DOM.timer.classList.remove("ocultar");

	// Cuando se acaban los segundos del minuto inicial, actualiza el contador
	setTimeout(() => {
		// Actualiza los minutos disponibles
		v.minutosDispon = parseInt(v.minutosDispon);
		DOM.timer.innerHTML = v.minutosDispon + " min.";
		if (v.minutosDispon == 0) return FN.funcionCartel();

		// Ejecuta la rutina
		FN.formatoTimer(v.minutosDispon);
		FN.timer;
	}, v.segundosDispon * 1000);
});
