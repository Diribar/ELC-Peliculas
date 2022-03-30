"use strict";
window.addEventListener("load", async () => {
	// Variables
	let codigo = new URL(window.location.href).pathname;
	let contador = document.querySelector("#contador");
	let pulgarArriba = document.querySelector("#cartelAdvertencia .fa-thumbs-up");

	// Horario Inicial
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let codigoEnc = encodeURIComponent(codigo);
	let horarioInicial = new Date(
		await fetch("/horario-inicial/?entidad=" + entidad + "&id=" + prodID + "&codigo=" + codigoEnc).then(
			(n) => n.json()
		)
	);

	// Tiempo restante
	let ahora = new Date(new Date().toUTCString());
	let tiempoRestante = horarioInicial.getTime() + 1 * 60 * 60 * 1000 - ahora.getTime();
	let minutos = Math.max(0, parseInt(tiempoRestante / 1000 / 60) + 1);
	minutos=30

	// Funciones
	let funcionTimer = () => {
		let timer = setInterval(() => {
			minutos--;
			contador.innerHTML = minutos + " min.";
			if (minutos == 0) {
				clearInterval(timer);
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
						"Se acabó el tiempo (1 hora) para continuar con esta edición.",
						"Quedó a disposición de quienes analizan tu trabajo.",
						"Si hacés <em>click</em> en <strong>Entendido</strong>, serás redirigido a la vista de <strong>Detalle</strong>",
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
		document.querySelector("#cartelAdvertencia .fa-circle-left").classList.add("ocultar");
		pulgarArriba.classList.remove("ocultar");
		document.querySelector("#cartelAdvertencia .fa-circle-check").classList.add("ocultar");

		// Mostrar el cartel
		taparElFondo.classList.remove("ocultar");
		cartelAdvertencia.classList.remove("ocultar");
	};
	let formatoTimer = (minutos) => {
		if (minutos <= 15) contador.style.backgroundColor = "var(--rojo-oscuro)"
		else if (minutos <= 30) contador.style.backgroundColor = "var(--naranja-oscuro)";
	};
	
	// Eventos
	pulgarArriba.addEventListener("click", () => {
		if (codigo == "/producto/edicion/")
			window.location.href = "/producto/detalle/?entidad=" + entidad + "&id=" + prodID;
	});

	// Startup
	contador.innerHTML = minutos + " min.";
	formatoTimer(minutos);
	funcionTimer();
	contador.classList.remove("ocultar");
});
