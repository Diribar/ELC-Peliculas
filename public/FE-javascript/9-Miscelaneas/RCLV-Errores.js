window.addEventListener("load", async () => {
	// Variables generales
	let entidad = window.location.href;
	entidad = entidad.slice(entidad.lastIndexOf("/") + 1);
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("#dataEntry button[type='submit']");
	let ruta = "/agregar/api/rclv/?RCLV=";

	// Links a otros sitios
	let wiki = document.querySelector("#dataEntry #wiki");
	let url_wiki = "https://es.wikipedia.org/wiki/";
	let santopedia = document.querySelector("#dataEntry #santopedia");
	let url_santopedia = "https://www.santopedia.com/buscar?q=";

	// Variables de errores
	let iconoOK = document.querySelectorAll("#dataEntry .fa-check-circle");
	let iconoError = document.querySelectorAll("#dataEntry .fa-times-circle");
	let mensajeError = document.querySelectorAll("#dataEntry .mensajeError");
	let OK = {};
	let errores = {};

	// Campos de NOMBRE
	let nombre = document.querySelector("#dataEntry input[name='nombre']");
	let genero = document.querySelectorAll("input[name='genero']");
	// Campos de FECHAS
	let mes_id = document.querySelector("#dataEntry select[name='mes_id']");
	let dia = document.querySelector("#dataEntry select[name='dia']");
	let desconocida = document.querySelector("#dataEntry input[name='desconocida']");
	// Campos de POSIBLES DUPLICADOS
	let posiblesDuplicados = document.querySelector("form #posiblesDuplicados");
	// Campos de RCLI
	if (entidad == "historicos_personajes") {
		santosanta = document.querySelector("#dataEntry #santosanta");
		ocultar = document.querySelector("#dataEntry #ocultar");
		enProcCan = document.querySelectorAll("input[name='enProcCan']");
		proceso_canonizacion_id = document.querySelector("select[name='proceso_canonizacion_id']");
		rol_iglesia_id = document.querySelector("select[name='rol_iglesia_id']");
	}

	form.addEventListener("change", async (e) => {
		campo = e.target.name;
		// Situaciones particulares
		if (campo == "genero" || campo == "enProcCan") funcionGenero();
		if (campo == "mes_id") diasDelMes();

		// NOMBRE ***********************************************
		if (campo == "nombre" || campo == "genero") {
			[OK, errores] = await funcionNombre();
		}
		// FECHAS ***********************************************
		if (campo == "mes_id" || campo == "dia" || campo == "desconocida") {
			[OK, errores] = await funcionFechas();
		}

		// REGISTROS DUPLICADOS **********************************
		if (campo == "repetido") {
			[OK, errores] = funcionRepetido();
		}

		// RCLI ******************************************
		if (
			entidad == "historicos_personajes" &&
			(campo == "enProcCan" ||
				campo == "proceso_canonizacion_id" ||
				campo == "rol_iglesia_id")
		) {
			[OK, errores] = await funcionRCLI();
		}

		// Final de la rutina
		feedback(OK, errores);
	});

	let feedback = (OK, errores) => {
		// Definir las variables
		let bloques = ["nombre", "fecha", "duplicados"];
		if (entidad == "historicos_personajes") bloques.push("RCLI");

		// Rutina
		for (i = 0; i < bloques.length; i++) {
			// Ícono de OK
			OK[bloques[i]]
				? iconoOK[i].classList.remove("ocultar")
				: iconoOK[i].classList.add("ocultar");
			// Ícono de error
			errores[bloques[i]]
				? iconoError[i].classList.remove("ocultar")
				: iconoError[i].classList.add("ocultar");
			// Mensaje de error
			errores[bloques[i]]
				? (mensajeError[i].innerHTML = errores[bloques[i]])
				: (mensajeError[i].innerHTML = "");
		}

		// Conclusiones
		resultado = Object.values(OK);
		resultadoTrue = resultado.length
			? resultado.reduce((a, b) => {
					return !!a && !!b;
			  })
			: false;

		// Alterar el botón submit
		resultadoTrue && resultado.length == bloques.length
			? button.classList.remove("botonSinLink")
			: button.classList.add("botonSinLink");

		// Logos de Wikipedia y Santopedia
		if (OK.nombre) {
			wiki.href = url_wiki + nombre.value;
			wiki.classList.remove("ocultar");
			if (entidad == "historicos_personajes" && enProcCan[0].checked) {
				santopedia.href = url_santopedia + nombre.value;
				santopedia.classList.remove("ocultar");
			} else santopedia.classList.add("ocultar");
		} else wiki.classList.add("ocultar");
	};

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("botonSinLink")) e.preventDefault();

		// No logré hacer funcionar lo siguiente, para hacer un API
		const data = new FormData(form);
	});

	// Funciones ************************
	let funcionNombre = async () => {
		url = "&nombre=" + nombre.value + "&entidad=" + entidad;
		errores.nombre = await fetch(ruta + "nombre" + url).then((n) => n.json());
		//OK.nombre = !errores.nombre ? true : false;
		if (entidad == "historicos_personajes" && !errores.nombre) {
			url = "&genero=" + (genero[0].checked ? "V" : genero[1].checked ? "M" : "");
			errores.genero = await fetch(ruta + "genero" + url).then((n) => n.json());
		}
		OK.nombre = !errores.nombre && !errores.genero;
		if (!nombre.value) errores.nombre = "";
		errores.genero = "";
		return [OK, errores];
	};

	let funcionFechas = async () => {
		// Si se desconoce la fecha...
		if (desconocida.checked) {
			errores.fecha = "";
			errores.duplicados = "";
			OK.fecha = true;
			OK.duplicados = true;
			mes_id.value = "";
			dia.value = "";
			posiblesDuplicados.innerHTML = "";
		} else {
			// Se averigua si hay un error con la fecha
			if (mes_id.value && dia.value) {
				url = "&mes_id=" + mes_id.value + "&dia=" + dia.value;
				url += "&desconocida=" + desconocida.checked;
				errores.fecha = await fetch(ruta + "fecha" + url).then((n) => n.json());
				OK.fecha = !errores.fecha ? true : false;
				// Agregar los registros que tengan esa fecha
				if (OK.fecha) {
					errores.duplicados = await registrosConEsaFecha(mes_id.value, dia.value);
					OK.duplicados = !errores.duplicados ? true : false;
				} else {
					errores.duplicados = "";
					OK.duplicados = false;
				}
			} else {
				OK.fecha = false;
				OK.duplicados = false;
			}
		}
		return [OK, errores];
	};

	let funcionRepetido = () => {
		casos = document.querySelectorAll("#posiblesDuplicados li input");
		errores.duplicados = "";
		for (caso of casos) {
			if (caso.checked) errores.duplicados = cartelDuplicado;
			break;
		}
		OK.duplicados = !errores.duplicados ? true : false;
		return [OK, errores];
	};

	let funcionRCLI = async () => {
		if (entidad != "historicos_personajes") return;
		// Ocultar / mostrar lo referido al status y género
		enProcCan[0].checked
			? ocultar.classList.remove("invisible")
			: ocultar.classList.add("invisible");
		// Armar la url
		url = "";
		// En proceso de canonización
		url += enProcCan[0].checked ? "&enProcCan=1" : enProcCan[1].checked ? "&enProcCan=0" : "";
		// Status del proceso de canonización
		url += "&proceso_canonizacion_id=" + proceso_canonizacion_id.value;
		// Rol en la Iglesia
		url += "&rol_iglesia_id=" + rol_iglesia_id.value;
		// Obtener los errores
		errores.RCLI = await fetch(ruta + "RCLI" + url).then((n) => n.json());
		OK.RCLI = !errores.RCLI ? true : false;
		errores.RCLI = "";
		return [OK, errores];
	};

	let funcionGenero = () => {
		if (entidad != "historicos_personajes") return;
		// Definir variables
		generoElegido = genero[0].checked
			? genero[0].value
			: genero[1].checked
			? genero[1].value
			: "";

		enProcCanElegido = enProcCan[0].checked;

		// Cambiar el género de una leyenda, si corresponde
		if (generoElegido) {
			letraActual = generoElegido == "V" ? "o" : "a";
			letraAnterior = generoElegido == "V" ? "a" : "o";
			cambiarGenero = !santosanta.innerHTML.includes("sant" + letraActual);
			if (cambiarGenero)
				santosanta.innerHTML = santosanta.innerHTML.replace(
					"sant" + letraAnterior,
					"sant" + letraActual
				);
		}

		// Detectar si no se debe usar la función
		if (!generoElegido || !enProcCanElegido) return;

		// Filtrar y dejar solamente los ID alineados con el género
		opciones_proc = document.querySelectorAll("select[name='proceso_canonizacion_id'] option");
		opciones_proc.forEach((n) =>
			n.value[2] != generoElegido ? n.classList.add("ocultar") : n.classList.remove("ocultar")
		);
		if (
			proceso_canonizacion_id.value &&
			proceso_canonizacion_id.value.length != 2 &&
			proceso_canonizacion_id.value[2] != generoElegido
		)
			proceso_canonizacion_id.value = "";

		// Filtrar y dejar solamente los ID alineados con el género
		opciones_rol = document.querySelectorAll("select[name='rol_iglesia_id'] option");
		opciones_rol.forEach((n) =>
			n.value[2] != generoElegido ? n.classList.add("ocultar") : n.classList.remove("ocultar")
		);
		if (
			rol_iglesia_id.value &&
			rol_iglesia_id.value.length != 2 &&
			rol_iglesia_id.value[2] != generoElegido
		)
			rol_iglesia_id.value = "";
	};

	// Aplicar cambios en los días 30 y 31
	let diasDelMes = () => {
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

	// Buscar otros casos en esa fecha
	registrosConEsaFecha = async () => {
		// Obtener los casos
		url =
			"/agregar/api/rclv-otros-casos/?mes_id=" +
			mes_id.value +
			"&dia=" +
			dia.value +
			"&entidad=" +
			entidad;
		casos = await fetch(url).then((n) => n.json());
		// Si no hay, mensaje de "no hay casos"
		if (!casos.length) {
			posiblesDuplicados.innerHTML = "¡No hay otros casos!";
			posiblesDuplicados.classList.add("sinCasos");
			return "";
		} else {
			// Si hay, mostrarlos
			posiblesDuplicados.innerHTML = "";
			posiblesDuplicados.classList.remove("sinCasos");
			for (caso of casos) {
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
				posiblesDuplicados.appendChild(li);
			}
			return "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
		}
	};

	// Status inicial
	if (entidad == "historicos_personajes") {
		funcionGenero();
		if (enProcCan[0].checked) ocultar.classList.remove("invisible");
		[OK, errores] = await funcionRCLI();
	}
	if (nombre.value) [OK, errores] = await funcionNombre();
	if (mes_id.value != "") diasDelMes(mes_id, dia);
	if (mes_id.value && dia.value) {
		[OK, errores] = await funcionFechas();
		[OK, errores] = funcionRepetido();
	}
	feedback(OK, errores);
});
