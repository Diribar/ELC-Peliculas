"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let personajes = entidad == "RCLV_personajes";
	let valores = entidad == "RCLV_valores";
	let id = new URL(window.location.href).searchParams.get("id");
	let botonSubmit = document.querySelector("#flechas button");
	let errores = {};

	// Campos para todos los RCLV
	let nombre = document.querySelector("#dataEntry input[name='nombre']");
	let mes_id = document.querySelector("#dataEntry select[name='mes_id']");
	let dia = document.querySelector("#dataEntry select[name='dia']");
	let desconocida = document.querySelector("#dataEntry input[name='desconocida']");
	// Campos para entidad != 'valores'
	if (!valores) var ano = document.querySelector("#dataEntry input[name='ano']");
	// Campos para entidad == 'personajes'
	if (personajes) {
		var enProcCan = document.querySelectorAll("input[name='enProcCan']");
		var genero = document.querySelectorAll("input[name='genero']");
		var proceso_canonizacion_id = document.querySelector("select[name='proceso_canonizacion_id']");
		var rol_iglesia_id = document.querySelector("select[name='rol_iglesia_id']");
	}

	// Add Event Listeners **************
	botonSubmit.addEventListener("click", async (e) => {
		// Detener el submit si corresponde
		if (botonSubmit.classList.contains("inactivo")) e.preventDefault();
		// Obtener todos los valores del formulario
		let url = () => {
			let url = "";
			// Campos de identificación
			url += "?entidad=" + entidad;
			url += "&id=" + id;
			// Campos  que siempre están
			url += "&nombre=" + nombre.value;
			url += "&mes_id=" + mes_id.value + "&dia=" + dia.value;
			url += "&desconocida=" + desconocida.checked;
			let casos = document.querySelectorAll("#posiblesRepetidos li input");
			if (Array.from(casos).filter((n) => n.checked).length) url += "&repetido=SI";
			// Campos cuando la entidad difiere de 'valores'
			if (entidad != "RCLV_valores") url += "&ano=" + ano.value;
			// Campos exclusivos de 'personajes'
			if (entidad == "RCLV_personajes")
				url += "&enProcCan=" + (enProcCan[0].checked ? "1" : enProcCan[1].checked ? "0" : "");
			if (entidad == "RCLV_personajes" && enProcCan[0].checked) {
				let generoElegido = genero[0].checked ? "V" : genero[1].checked ? "M" : "";
				url += "&genero=" + generoElegido;
				url += "&proceso_canonizacion_id=" + proceso_canonizacion_id.value;
				url += "&rol_iglesia_id=" + rol_iglesia_id.value;
			}
			return url;
		};
		// Validar todos los campos una vez más
		let rutaValidar = "/rclv/api/validar-consolidado/";
		errores = await fetch(rutaValidar + url()).then((n) => n.json());
		// Si hay errores, recargar la página
		if (errores.hay) return;
		//if (errores.hay) location.reload();
		// Editar y cambiar el status del nuevo RCLV
		let rutaStatus = "/revision/api/rclv-alta/";
		let resultado = await fetch(rutaStatus + url()).then((n) => n.json());
		console.log(resultado);
		// Cartel de 'OK'
	});

	// Funciones ************************
	let cartelFin = (statusAprobado) => {
		// Partes del cartel
		let taparElFondo = document.querySelector("#tapar-el-fondo");
		let cartel = document.querySelector("#cartel");
		let error = document.querySelector("#error");
		let mensajes = document.querySelector("ul#mensajes");
		let flechas = document.querySelector("#cartel #flechas");

		// Formatos
		cartel.style.backgroundColor = "var(--verde-oscuro)";
		error.classList.add("ocultar");

		// Mensajes
		let arrayMensajes = ["Gracias por completar la revisión."];
		// Si el status se cambió a 'aprobado', comunicarlo
		if (statusAprobado) {
			// Texto en función de la entidad
			let producto =
				entidad == "peliculas"
					? " la película"
					: entidad == "colecciones"
					? " la colección"
					: "l capítulo";
			let texto = "El status de" + producto + " fue cambiado a <strong>aprobado</strong>.";
			arrayMensajes.push(texto);
			// Texto sobre los capítulos
			if (entidad == "colecciones")
				arrayMensajes.push("Los capítulos también fueron cambiados a ese estado.");
		}
		// Cambiar el contenido del mensaje
		mensajes.innerHTML = "";
		for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";

		// Flechas
		let icono = {
			HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
			link: "/revision/inactivar-captura/?entidad=" + entidad + "&id=" + prodID,
		};
		flechas.innerHTML = "";
		flechas.innerHTML += "<a href='" + icono.link + "' autofocus>" + icono.HTML + "</a>";

		// Mostrar el cartel
		taparElFondo.classList.remove("ocultar");
		cartel.classList.remove("ocultar");

		// Fin
		return;
	};
});
