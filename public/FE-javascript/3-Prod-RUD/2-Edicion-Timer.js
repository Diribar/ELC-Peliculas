"use strict";
window.addEventListener("load", () => {
	// Variables
	let contador = document.querySelector("#contador");
	let tiempo = contador.innerHTML.slice(0, contador.innerHTML.indexOf(" "));
	let pulgarArriba = document.querySelector("#cartelAdvertencia .fa-thumbs-up");

	// Mensajes
	let mensaje0 = [
		"Se acabó el tiempo (1 hora) para continuar con esta edición.",
		"Quedó a disposición de quienes analizan tu trabajo.",
		"Si hacés <em>click</em> en <strong>Entendido</strong>, serás redirigido a la vista de <strong>Detalle</strong>",
	];

	// Funciones
	let funcionTimer = () => {
		// Mostrar el timer
		if (tiempo < 15) {
			// Rojo y Gris Claro
			contador.style.backgroundColor = "var(--rojo-oscuro)";
			contador.style.borderColor = "var(--rojo-oscuro)";
			contador.style.color = "var(--gris-claro)";
		} else if (tiempo < 30) {
			contador.style.backgroundColor = "var(--amarillo-oscuro)";
			contador.style.borderColor = "var(--naranja-oscuro)";
			contador.style.color = "var(--azul-oscuro)";
		}
		contador.classList.remove("ocultar");
		// Timer
		tiempo = parseInt(tiempo);
		let timer = setInterval(() => {
			tiempo--;
			contador.innerHTML = tiempo + " min.";
			if (tiempo == 0) {
				clearInterval(timer);
				// Cartel de "time out"
				funcionCartelAdvertencia(mensaje0);
			} else if (tiempo < 15) {
				// Rojo y Gris Claro
				contador.style.backgroundColor = "var(--rojo-oscuro)";
				contador.style.borderColor = "var(--rojo-oscuro)";
				contador.style.color = "var(--gris-claro)";
			} else if (tiempo < 30) {
				contador.style.backgroundColor = "var(--amarillo-oscuro)";
				contador.style.borderColor = "var(--naranja-oscuro)";
				contador.style.color = "var(--azul-oscuro)";
			}
		}, 1000*60);
	};

	let funcionCartelAdvertencia = (mensajes) => {
		// Variables
		let taparElFondo = document.querySelector("#tapar-el-fondo");
		let cartelAdvertencia = document.querySelector("#cartelAdvertencia");
		let mensajeHTML = document.querySelector("#cartelAdvertencia ul#mensaje");
		mensajeHTML.innerHTML = "";

		// Cambiar el contenido del mensaje
		for (mensaje of mensajes) {
			mensajeHTML.innerHTML += "<li>" + mensaje + "</li>";
		}

		// Íconos a mostrar y ocultar
		document
			.querySelector("#cartelAdvertencia .fa-circle-left")
			.classList.add("ocultar");
		pulgarArriba.classList.remove("ocultar");
		document.querySelector("#cartelAdvertencia .fa-circle-check").classList.add("ocultar");

		// Cambiar el texto del mensajeHTML
		pulgarArriba.setAttribute("id", "irDetalle");

		// Mostrar el cartel
		taparElFondo.classList.remove("ocultar");
		cartelAdvertencia.classList.remove("ocultar");
	};

	// Startup
	if (tiempo == 0) funcionCartelAdvertencia(mensaje0);
	else if (tiempo != "false") funcionTimer();

	// Ir a 'Detalle'
	pulgarArriba.addEventListener("click", (e) => {
		if (pulgarArriba.id == "irDetalle") {
			let entidad = new URL(window.location.href).searchParams.get("entidad");
			let producto_id = new URL(window.location.href).searchParams.get("id");
			window.location.href = "/producto/detalle/?entidad=" + entidad + "&id=" + producto_id;
		}
	});
});
