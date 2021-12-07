window.addEventListener("load", async () => {
	// Variables generales
	let entidad = document.querySelector("#entidad").innerHTML;
	let form = document.querySelector("#dataEntry");
	let ruta = "/agregar/api/rclv/?RCLV=";
	let button = document.querySelector("#dataEntry button[type='submit']");
	let OK = {};
	let errores = {};

	// Variables de errores
	let iconoOK = document.querySelectorAll(".validar .fa-check-circle");
	let iconoError = document.querySelectorAll(".validar .fa-times-circle");
	let mensajeError = document.querySelectorAll(".validar .mensajeError");

	// Campos específicos de fechas
	let mes_id = document.querySelector(".input-error select[name='mes_id']");
	let dia = document.querySelector(".input-error select[name='dia']");
	let desconocida = document.querySelector(".input-error input[name='desconocida']");
	// Campos específicos de adicionales
	let pais_id = document.querySelector(".input-error select[name='pais_id']");
	let catolico = document.querySelectorAll("input[name='catolico']");
	let canonizacion = document.querySelectorAll("input[name='canonizacion']");
	let vocacion_id = document.querySelector("select[name='vocacion_id']");
	// Otros campos de Data Entry
	let nombre = document.querySelector(".input-error input[name='nombre']");
	let posiblesDuplicados = document.querySelector("form #posiblesDuplicados");

	// Status inicial
	if (mes_id.value != "") diasDelMes(mes_id, dia);

	form.addEventListener("change", async (e) => {
		campo = e.target.name;

		// NOMBRE ***********************************************
		if (campo == "nombre") {
			url = "&nombre=" + nombre.value + "&entidad=" + entidad;
			errores.nombre = await fetch(ruta + "nombre" + url).then((n) => n.json());
			OK.nombre = !errores.nombre ? true : false;
		}

		// FECHAS ***********************************************
		if (campo == "mes_id") diasDelMes(mes_id, dia);
		if (campo == "mes_id" || campo == "dia" || campo == "desconocida") {
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
		}

		// REGISTROS DUPLICADOS **********************************
		if (campo == "repetido") {
			casos = document.querySelectorAll("#posiblesDuplicados li input");
			errores.duplicados = "";
			for (caso of casos) {
				if (caso.checked) errores.duplicados = cartelDuplicado;
				break;
			}
			OK.duplicados = !errores.duplicados ? true : false;
		}

		// ADICIONALES ******************************************
		if (
			campo == "pais_id" ||
			campo == "catolico" ||
			campo == "canonizacion" ||
			campo == "vocacion_id"
		) {
			// Ocultar / mostrar lo referido a si es católico
			catolico[0].checked
				? mostrarSiEsCatolico.classList.remove("invisible")
				: mostrarSiEsCatolico.classList.add("invisible");

			//
			url = "&pais_id=" + pais_id.value + "&vocacion_id=" + vocacion_id.value;
			if (catolico[0].checked) url += "&catolico=1";
			if (catolico[1].checked) url += "&catolico=0";
			if (canonizacion[0].checked) url += "&canonizacion=1";
			if (canonizacion[1].checked) url += "&canonizacion=0";
			errores.adicionales = await fetch(ruta + "adicionales" + url).then((n) => n.json());
			OK.adicionales = !errores.adicionales ? true : false;
			errores.adicionales = "";
		}
		// Final de la rutina
		feedback(OK, errores);
	});

	let feedback = (OK, errores) => {
		// Definir las variables
		let bloques = ["nombre", "fecha", "duplicados", "adicionales"];

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
		resultadoTrue = resultado.reduce((a, b) => {
			return !!a && !!b;
		});

		// Alterar el botón submit
		resultadoTrue && resultado.length == 4
			? button.classList.remove("botonSinLink")
			: button.classList.add("botonSinLink");
	};

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("botonSinLink")) e.preventDefault();
		
		// No logré hacer funcionar lo siguiente, para hacer un API
		const data = new FormData(form);

	});
});

// Buscar otros casos en esa fecha
registrosConEsaFecha = async (mes_id, dia) => {
	entidad = document.querySelector("#entidad").innerHTML;
	// Obtener los casos
	url = "/agregar/api/rclv-otros-casos/?mes_id=" + mes_id + "&dia=" + dia + "&entidad=" + entidad;
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

// Aplicar cambios en los días 30 y 31
let diasDelMes = (mes_id, dia) => {
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
