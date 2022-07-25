"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let personajes = entidad == "personajes";
	let valores = entidad == "valores";
	let id = new URL(window.location.href).searchParams.get("id");
	let dataEntry = document.querySelector("#dataEntry");
	let botonSubmit = document.querySelector("#flechas button");
	let ruta = "/rclv/api/validar-sector/?sector=";

	// Links a otros sitios
	let wiki = document.querySelector("#dataEntry #wiki");
	let url_wiki = "https://es.wikipedia.org/wiki/";
	let santopedia = document.querySelector("#dataEntry #santopedia");
	let url_santopedia = "https://www.santopedia.com/buscar?q=";

	// Variables de errores
	let iconoOK = document.querySelectorAll("#dataEntry .OK .fa-circle-check");
	let iconoError = document.querySelectorAll("#dataEntry .OK .fa-circle-xmark");
	let mensajeError = document.querySelectorAll("#dataEntry .OK .mensajeError");
	let OK = {};
	let errores = {};

	// Campos para todos los RCLV
	let nombre = document.querySelector("#dataEntry input[name='nombre']");
	let mes_id = document.querySelector("#dataEntry select[name='mes_id']");
	let dia = document.querySelector("#dataEntry select[name='dia']");
	let desconocida = document.querySelector("#dataEntry input[name='desconocida']");
	let posiblesRepetidos = document.querySelector("#dataEntry #posiblesRepetidos");

	// Campos para entidad != 'valores'
	if (!valores) var ano = document.querySelector("#dataEntry input[name='ano']");

	// Campos para entidad == 'personajes'
	if (personajes) {
		// Inputs
		var contemp = document.querySelectorAll("input[name='contemp']");
		var categoria_id = document.querySelectorAll("input[name='categoria_id']");
		var genero = document.querySelectorAll("input[name='genero']");
		var rol_iglesia_id = document.querySelector("select[name='rol_iglesia_id']");
		var enProcCan = document.querySelectorAll("input[name='enProcCan']");
		var proceso_canonizacion_id = document.querySelector("select[name='proceso_canonizacion_id']");
		var ap_mar = document.querySelectorAll("input[name='ap_mar']");
		var ap_mar_id = document.querySelector("select[name='ap_mar_id']");
		var santosanta = document.querySelector("#dataEntry #santosanta");
		// Para ocultar
		var ocultarEnProcCan = document.querySelector("#dataEntry #ocultarEnProcCan");
	}

	// Funciones ************************
	// Primera columna
	let funcionNombre = async () => {
		// Verificar errores en el nombre
		let url = "&nombre=" + nombre.value + "&entidad=" + entidad;
		if (id) url += "&id=" + id;
		errores.nombre = await fetch(ruta + "nombre" + url).then((n) => n.json());
		// Consolidar la info
		OK.nombre = !errores.nombre;
		// Fin
		return [OK, errores];
	};
	let diasDelMes = () => {
		// Aplicar cambios en los días 30 y 31
		// Variables
		let dia30 = document.querySelector("select[name='dia'] option[value='30']");
		let dia31 = document.querySelector("select[name='dia'] option[value='31']");

		// Revisar para febrero
		if (mes_id.value == 2) {
			dia30.classList.add("ocultar");
			dia31.classList.add("ocultar");
			if (dia.value > 29) dia.value = "";
		} else {
			// Revisar para los demás meses de 30 días
			dia30.classList.remove("ocultar");
			if (mes_id.value == 4 || mes_id.value == 6 || mes_id.value == 9 || mes_id.value == 11) {
				dia31.classList.add("ocultar");
				if (dia.value > 30) dia.value = "";
			} else dia31.classList.remove("ocultar");
		}
	};
	let funcionFechas = async () => {
		// Si se conoce la fecha...
		if (!desconocida.checked) {
			// Se averigua si hay un error con la fecha
			let url = "&mes_id=" + mes_id.value + "&dia=" + dia.value;
			errores.fecha = await fetch(ruta + "fecha" + url).then((n) => n.json());
			OK.fecha = !errores.fecha;
			// Agregar los registros que tengan esa fecha
			if (OK.fecha) {
				errores.repetidos = await registrosConEsaFecha(mes_id.value, dia.value);
				OK.repetidos = !errores.repetidos;
			} else OK.repetidos = false;
		} else {
			// OK y Errores
			errores.fecha = "";
			errores.repetidos = "";
			OK.fecha = true;
			OK.repetidos = true;
			// Limpia los valores de campos relacionados
			mes_id.value = "";
			dia.value = "";
			posiblesRepetidos.innerHTML = "";
		}
		return [OK, errores];
	};
	// Segunda columna
	let funcionRepetido = () => {
		let casos = document.querySelectorAll("#posiblesRepetidos li input");
		errores.repetidos = Array.from(casos).some((n) => n.checked) ? cartelDuplicado : "";
		OK.repetidos = !errores.repetidos;
		return [OK, errores];
	};
	let registrosConEsaFecha = async () => {
		// Buscar otros casos en esa fecha
		// Obtener los casos
		let url =
			"/rclv/api/otros-casos/?mes_id=" + mes_id.value + "&dia=" + dia.value + "&entidad=" + entidad;
		if (id) url += "&id=" + id;
		let casos = await fetch(url).then((n) => n.json());
		// Si no hay, mensaje de "no hay casos"
		if (!casos.length) {
			posiblesRepetidos.innerHTML = "¡No hay otros casos!";
			posiblesRepetidos.classList.add("sinCasos");
			return "";
		} else {
			// Si hay, mostrarlos
			posiblesRepetidos.innerHTML = "";
			posiblesRepetidos.classList.remove("sinCasos");
			for (let caso of casos) {
				// Crear el input
				let input = document.createElement("input");
				input.type = "checkbox";
				input.name = "repetido";
				input.checked = true;
				// Crear la label
				let texto = document.createTextNode(caso);
				let label = document.createElement("label");
				label.appendChild(texto);
				// Crear el 'li'
				let li = document.createElement("li");
				li.appendChild(input);
				li.appendChild(label);
				posiblesRepetidos.appendChild(li);
			}
			return "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
		}
	};
	let funcionAno = async () => {
		// Se averigua si hay un error con el año
		let url = "&ano=" + ano.value;
		errores.ano = await fetch(ruta + "ano" + url).then((n) => n.json());
		OK.ano = !errores.ano;
		return [OK, errores];
	};
	// Preguntas
	let funcionRCLI_personaje = async (mostrarErrores) => {
		let url = "";
		// Contemporáneo
		let contempElegido = contemp[0].checked
			? contemp[0].value
			: contemp[1].checked
			? contemp[1].value
			: "";
		url += "&contemp=" + contempElegido;
		// categoria_id
		let categoria_idElegido = categoria_id[0].checked ? categoria_id[0].value : categoria_id[1].checked ? categoria_id[1].value : "";
		url += "&categoria_id=" + categoria_idElegido;
		// Resto de RCLI
		if (categoria_id[0].checked) {
			// Género
			let generoElegido = genero[0].checked
				? genero[0].value
				: genero[1].checked
				? genero[1].value
				: "";
			url += "&genero=" + generoElegido;
			// Rol en la Iglesia
			url += "&rol_iglesia_id=" + rol_iglesia_id.value;
			// Proceso de canonización
			let procCanElegido = enProcCan[0].checked
				? enProcCan[0].value
				: enProcCan[1].checked
				? enProcCan[1].value
				: "";
			url += "&enProcCan=" + procCanElegido;
			if (procCanElegido == "1") url += "&proceso_canonizacion_id=" + proceso_canonizacion_id.value;
			// Aparición mariana
			let apMarElegido = ap_mar[0].checked ? ap_mar[0].value : ap_mar[1].checked ? ap_mar[1].value : "";
			url += "&ap_mar=" + apMarElegido;
			if (apMarElegido == "1") url += "&ap_mar_id=" + ap_mar_id.value;
			// Logo de Santopedia
			// if (nombre.value && !errores.nombre) santopedia.classList.remove("ocultar");
		} else {
			// Ocultar las opciones 'enProcCan'
			// ocultarEnProcCan.classList.add("invisible");
			// Logo de Santopedia
			// santopedia.classList.add("ocultar");
		}
		// OK y Errores
		errores.RCLI = await fetch(ruta + "RCLI" + url).then((n) => n.json());
		OK.RCLI = !errores.RCLI;
		if (!mostrarErrores) errores.RCLI = "";

		// Fin
		return [OK, errores];
	};
	let funcionGenero = () => {
		// Definir variables
		let generoElegido = genero[0].checked ? genero[0].value : genero[1].checked ? genero[1].value : "";
		if (generoElegido) {
			// Actualizar el género de la leyenda
			let letraActual = generoElegido == "V" ? "o" : "a";
			let letraAnterior = generoElegido == "V" ? "a" : "o";
			if (santosanta.innerHTML.includes("ant" + letraAnterior))
				santosanta.innerHTML = santosanta.innerHTML.replace(
					"ant" + letraAnterior,
					"ant" + letraActual
				);
			// Dejar solamente las opciones alineadas con el género
			let opciones_proc = document.querySelectorAll("select[name='proceso_canonizacion_id'] option");
			opciones_proc.forEach((n) =>
				n.value.length < 2 || n.value[2] != generoElegido
					? n.classList.add("ocultar")
					: n.classList.remove("ocultar")
			);
			let opciones_rol = document.querySelectorAll("select[name='rol_iglesia_id'] option");
			opciones_rol.forEach((n) =>
				n.value.length < 2 || n.value[2] != generoElegido
					? n.classList.add("ocultar")
					: n.classList.remove("ocultar")
			);
			// Cambiar la opción anterior por el nuevo genero
			if (
				proceso_canonizacion_id.value &&
				proceso_canonizacion_id.value.length != 2 &&
				proceso_canonizacion_id.value[2] != generoElegido
			)
				proceso_canonizacion_id.value = proceso_canonizacion_id.value.slice(0, 2) + generoElegido;
			if (
				rol_iglesia_id.value &&
				rol_iglesia_id.value.length != 2 &&
				rol_iglesia_id.value[2] != generoElegido
			)
				rol_iglesia_id.value = rol_iglesia_id.value.slice(0, 2) + generoElegido;
		}
		return
	};
	let esconderMostrarRCLI=()=>{

	}
	// Consolidado
	let startUp = async () => {
		if (nombre.value) [OK, errores] = await funcionNombre();
		if (mes_id.value) diasDelMes(mes_id, dia);
		if ((mes_id.value && dia.value) || desconocida.checked) {
			[OK, errores] = await funcionFechas();
			[OK, errores] = funcionRepetido();
		}
		if (ano && ano.value) await funcionAno();
		if (personajes) {
			if (categoria_id[0].checked) funcionGenero();
			[OK, errores] = await funcionRCLI_personaje(false);
		}
	};
	let feedback = (OK, errores) => {
		// Definir las variables
		let sectores = ["nombre", "fecha", "repetidos"];
		if (entidad != "valores") sectores.push("ano", "RCLI");
		// Rutina
		sectores.forEach((sector, i) => {
			// Ícono de OK
			OK[sector] ? iconoOK[i].classList.remove("ocultar") : iconoOK[i].classList.add("ocultar");
			// Ícono de error
			errores[sector]
				? iconoError[i].classList.remove("ocultar")
				: iconoError[i].classList.add("ocultar");
			// Mensaje de error
			mensajeError[i].innerHTML = errores[sector] ? errores[sector] : "";
		});
		// Mostrar logo de Wikipedia
		if (OK.nombre) {
			wiki.classList.remove("ocultar");
			if (entidad == "personajes" && enProcCan[0].checked) santopedia.classList.remove("ocultar");
		} else {
			wiki.classList.add("ocultar");
			santopedia.classList.add("ocultar");
		}
		// Conclusiones
		let resultado = Object.values(OK);
		let resultadoTrue = resultado.length
			? resultado.reduce((a, b) => {
					return !!a && !!b;
			  })
			: false;
		// Alterar el botón submit
		resultadoTrue && resultado.length == sectores.length
			? botonSubmit.classList.remove("inactivo")
			: botonSubmit.classList.add("inactivo");
	};

	// Add Event Listeners **************
	dataEntry.addEventListener("input", (e) => {
		let campo = e.target.name;
		// Campos para todos los RCLV
		if (campo == "nombre") {
			if (nombre.value.length > 30) nombre.value = nombre.value.slice(0, 30);
			wiki.href = url_wiki + nombre.value;
			santopedia.href = url_santopedia + nombre.value;
		}
		if (campo == "ano") {
			if (ano.value > new Date().getFullYear()) ano.value = new Date().getFullYear();
			if (ano.value < -32768) ano.value = -32768;
		}
	});

	dataEntry.addEventListener("change", async (e) => {
		let campo = e.target.name;
		//console.log(campo);
		// Campos para todos los RCLV
		if (campo == "nombre") [OK, errores] = await funcionNombre();
		if (campo == "mes_id") diasDelMes();
		if (
			(campo == "mes_id" || campo == "dia" || campo == "desconocida") &&
			((mes_id.value && dia.value) || desconocida.checked)
		)
			[OK, errores] = await funcionFechas();
		if (campo == "repetido") [OK, errores] = funcionRepetido();
		// Campos para entidad != 'valores'
		if (campo == "ano") [OK, errores] = await funcionAno();
		// Campos para entidad == 'personajes'
		if (entidad == "personajes") {
			let camposRCLI = [
				"categoria_id",
				"genero",
				"rol_iglesia_id",
				"enProcCan",
				"proceso_canonizacion_id",
				"contemp",
				"ap_mar",
				"ap_mar_id",
			].includes(campo);
			if (campo == "genero") funcionGenero();
			if (camposRCLI) esconderMostrarRCLI()
			if (camposRCLI) [OK, errores] = await funcionRCLI_personaje(false);
		}
		// Final de la rutina
		feedback(OK, errores);
	});

	botonSubmit.addEventListener("click", async (e) => {
		if (botonSubmit.classList.contains("inactivo")) {
			e.preventDefault();
			[OK, errores] = await funcionNombre();
			[OK, errores] = await funcionFechas();
			[OK, errores] = funcionRepetido();
			if (!valores) await funcionAno();
			if (personajes) [OK, errores] = await funcionRCLI_personaje(true);
			feedback(OK, errores);
		}
	});

	// Status inicial
	await startUp();
	feedback(OK, errores);
});

let cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
