window.addEventListener("load", () => {
	// Variables
	let contador = document.querySelector("#contador");
	let tiempo = contador.innerHTML.slice(0, contador.innerHTML.indexOf(" "));
	let pulgarArriba = document.querySelector("#cartelAdvertencia .fa-thumbs-up");

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
				funcionCartelAdvertencia();
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
		}, 1000);
	};

	let funcionCartelAdvertencia = () => {
		// Variables
		let taparElFondo = document.querySelector("#tapar-el-fondo");
		let cartelAdvertencia = document.querySelector("#cartelAdvertencia");
		let mensajeHTML = document.querySelector("#cartelAdvertencia #mensaje");
		let mensajeTexto = [
			"Se acabó el tiempo de 1 hora, para continuar con esta edición.",
			"Quedó a disposición de quienes analizan tu trabajo.",
			"Si hacés 'click' en 'Entendido', serás redirigido a la vista de 'Detalle'",
		];
		let ul = document.createElement("ul");
		for (mensaje of mensajeTexto) {
			let texto = document.createTextNode(mensaje);
			let li = document.createElement("li");
			li.appendChild(texto);
			ul.appendChild(li);
			mensajeHTML.appendChild(li);
		}
		console.log(ul);

		// Íconos a mostrar y ocultar
		document
			.querySelector("#cartelAdvertencia .fa-arrow-alt-circle-left")
			.classList.add("ocultar");
		pulgarArriba.classList.remove("ocultar");
		document.querySelector("#cartelAdvertencia .fa-check-circle").classList.add("ocultar");

		// Cambiar el texto del mensajeHTML
		mensajeHTML.innerHTML = mensajeTexto;
		pulgarArriba.setAttribute("id", "irDetalle");

		// Mostrar el cartel
		taparElFondo.classList.remove("ocultar");
		cartelAdvertencia.classList.remove("ocultar");
	};

	// Startup
	if (tiempo == 0) funcionCartelAdvertencia();
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
