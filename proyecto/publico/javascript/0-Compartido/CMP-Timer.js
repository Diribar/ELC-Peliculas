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
	const familia = ["peliculas", "colecciones", "capitulos"].includes(entidad) ? "producto" : "rclv";
	if (!entidad && location.pathname.includes("/revision/usuarios")) entidad = "usuarios";

	// Horario Inicial
	const datos = await fetch("/api/horario-inicial/?entidad=" + entidad + "&id=" + entId).then((n) => n.json());
	const {capturadoEn, creadoEn, capturadoPor_id, usuario_id} = datos;
	let horarioInicial = !capturadoEn ? creadoEn : capturadoPor_id == usuario_id ? capturadoEn : new Date();
	horarioInicial = new Date(horarioInicial);
	horarioInicial.setSeconds(0);

	// Configura el horario final
	let horarioFinal = new Date(horarioInicial);
	horarioFinal.setHours(horarioFinal.getHours() + 1);

	// Tiempo restante
	let ahora = new Date(new Date().toUTCString());
	let tiempoMax = 60;
	let tiempoRestante = Math.min(tiempoMax, (horarioFinal.getTime() - ahora.getTime()) / unMinuto);

	// Minutos y Segundos disponibles
	minutosDispon =
		// ¿Hay tiempo restante?
		tiempoRestante > 0
			? tiempoRestante
			: // ¿Pasó más de una hora?
			tiempoRestante <= -60
			? tiempoMax
			: 0;
	segundosDispon = Math.floor((minutosDispon % 1) * 60);

	// Funciones
	let FN = {
		fechaHorario: (horario) => {
			return (
				horario.getDate() +
				"/" +
				meses[horario.getMonth()] +
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
			minutosDispon--;
			if (minutosDispon < 0) minutosDispon = 0;
			DOM.timer.innerHTML = minutosDispon + " min.";

			// Acciones si se acabó el tiempo
			if (minutosDispon == 0) {
				clearInterval(FN.timer);
				return FN.funcionCartel();
			}

			// Si sigue habiendo tiempo, actualiza el formato
			else FN.formatoTimer();
		}, unMinuto),
		funcionCartel: () => {
			// Variables
			const horarioFinalTexto = FN.fechaHorario(horarioFinal);
			const dia = horarioFinalTexto.slice(0, horarioFinalTexto.indexOf(" "));
			const hora = horarioFinalTexto.slice(horarioFinalTexto.indexOf(" "));

			// Crea el mensaje
			const mensajes = datos.capturadoEn
				? [
						"Esta captura terminó el " + dia + " a las " + hora + "hs.. ",
						"Quedó a disposición de los demás " + tipoUsuario + ".",
						"Si nadie lo captura hasta 1 hora después, podrás volver a capturarlo.",
				  ]
				: [
						"Se cumplió el plazo de 1 hora desde que se creó el registro.",
						"Estará disponible luego de ser revisado, en caso de ser aprobado.",
				  ];
			const [link, clase, titulo] = codigo.startsWith("/revision/usuarios")
				? ["/revision/usuarios/tablero-de-usuarios", "fa-thumbs-up", "Entendido"]
				: codigo.startsWith("/revision/")
				? ["/revision/tablero-de-entidades", "fa-thumbs-up", "Entendido"]
				: ["/" + familia + "/detalle/?entidad=" + entidad + "&id=" + entId, "fa-circle-info", "Ir a Detalle"];
			contenidoDelCartelGenerico({DOM, mensajes, clase, titulo, link});

			// Muestra el cartel
			DOM.todoElMain.classList.remove("ocultar");
			DOM.tapaElFondo.classList.remove("ocultar");
			DOM.cartelGenerico.classList.remove("ocultar");
		},
		formatoTimer: () => {
			if (minutosDispon <= 15) DOM.timer.style.backgroundColor = "var(--rojo-oscuro)";
			else if (minutosDispon <= 30) DOM.timer.style.backgroundColor = "var(--naranja-oscuro)";
		},
	};

	// STARTUP -------------------------------------------------------------
	// Muestra el tiempo inicial
	DOM.timer.innerHTML = Math.ceil(minutosDispon) + " min.";
	FN.formatoTimer();
	DOM.timer.classList.remove("ocultar");

	// Cuando se acaban los segundos del minuto inicial, actualiza el contador
	setTimeout(() => {
		// Actualiza los minutos disponibles
		minutosDispon = parseInt(minutosDispon);
		DOM.timer.innerHTML = minutosDispon + " min.";
		if (minutosDispon == 0) return FN.funcionCartel();

		// Ejecuta la rutina
		FN.formatoTimer(minutosDispon);
		FN.timer;
	}, segundosDispon * 1000);
});

// Variables
const entidad = new URL(location.href).searchParams.get("entidad");
const entId = new URL(location.href).searchParams.get("id");
const codigo = location.pathname;
const tipoUsuario = codigo.startsWith("/revision/") ? "revisores" : "usuarios";
const unMinuto = 60 * 1000;
let minutosDispon, segundosDispon;
