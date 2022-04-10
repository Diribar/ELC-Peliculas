"use strict";
window.addEventListener("load", async () => {
	// VARIABLES -------------------------------------------------------------------------
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	// Otras variables
	let codigo = new URL(window.location.href).pathname;
	let timer = document.querySelector("#timer");
	let pulgarArriba = document.querySelector("#cartelAdvertencia .fa-thumbs-up");
	// Horario Inicial
	let codigoEnc = encodeURIComponent(codigo);
	let horarioInicial = new Date(
		await fetch("/api/horario-inicial/?entidad=" + entidad + "&id=" + prodID + "&codigo=" + codigoEnc).then(
			(n) => n.json()
		)
	);
	// Tiempo restante
	let ahora = new Date(new Date().toUTCString());
	let tiempoRestante = horarioInicial.getTime() + 1 * 60 * 60 * 1000 - ahora.getTime();
	let minutos = Math.min(60, Math.max(0, parseInt(tiempoRestante / 1000 / 60)));
	//minutos=1

	// FUNCIONES ------------------------------------------------------------------------
	let funcionTimer = () => {
		let actualizarTimer = setInterval(() => {
			minutos--;
			timer.innerHTML = minutos + " min.";
			if (minutos <= 0) {
				clearInterval(actualizarTimer);
				// Cartel de "time out"
				funcionCartelAdvertencia();
			} else formatoTimer(minutos);
		}, 1000 * 60);
	};
	let funcionCartelAdvertencia = () => {
		// Variables
		let taparElFondo = document.querySelector("#tapar-el-fondo");
		let cartelAdvertencia = document.querySelector("#cartelAdvertencia");
		let mensajeHTML = document.querySelector("#cartelAdvertencia ul#mensaje");

		// Mensajes
		let arrayMensajes =
			codigo == "/producto/edicion/"
				? [
						"Se acabó el tiempo de 1 hora para continuar con esta edición.",
						"Quedó a disposición de quienes analizan tu trabajo.",
						"Si hacés <em>click</em> en <strong>Entendido</strong>, serás redirigido a la vista de <strong>Detalle</strong>",
				  ]
				: codigo.startsWith("/revision/")
				? [
						"Se acabó el tiempo de 1 hora para continuar con esta revisión.",
						"Quedó a disposición de que lo continúe revisando otra persona.",
						"Si hacés <em>click</em> en <strong><i class='fa-solid fa-thumbs-up'></i></strong>, serás redirigido a la vista <strong>Visión-General</strong>",
				  ]
				: [];

		// Cambiar el contenido del mensaje
		mensajeHTML.innerHTML = "";
		for (let mensaje of arrayMensajes) {
			mensajeHTML.innerHTML += "<li>" + mensaje + "</li>";
		}

		// Cambiar el texto del mensajeHTML
		pulgarArriba.setAttribute("id", "irDetalle");

		// Íconos a mostrar y ocultar
		pulgarArriba.classList.remove("ocultar");

		// Mostrar el cartel
		taparElFondo.classList.remove("ocultar");
		cartelAdvertencia.classList.remove("ocultar");
	};
	let formatoTimer = (minutos) => {
		if (minutos <= 15) timer.style.backgroundColor = "var(--rojo-oscuro)";
		else if (minutos <= 30) timer.style.backgroundColor = "var(--naranja-oscuro)";
	};

	// EVENTOS -------------------------------------------------------------
	pulgarArriba.addEventListener("click", () => {
		if (codigo == "/producto/edicion/")
			window.location.href = "/producto/detalle/?entidad=" + entidad + "&id=" + prodID;
		else if (codigo.startsWith("/revision/")) window.location.href = "/revision/tablero-de-control";
	});

	// STARTUP -------------------------------------------------------------
	timer.innerHTML = minutos + " min.";
	formatoTimer(minutos);
	funcionTimer();
	timer.classList.remove("ocultar");
});
