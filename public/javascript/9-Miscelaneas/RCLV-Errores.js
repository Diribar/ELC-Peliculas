window.addEventListener("load", async () => {
	// Variables generales
	let entidad = document.querySelector("#entidad").innerHTML;
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("#dataEntry button[type='submit']");
	let ruta = "/agregar/api/rclv/?RCLV=";

	// Links a otros sitios
	let wiki = document.querySelector("#dataEntry #wiki");
	let url_wiki = "https://es.wikipedia.org/wiki/";
	let santopedia = document.querySelector("#dataEntry #santopedia");
	let url_santopedia = "https://www.santopedia.com/buscar?q=";

	// Variables de errores
	let iconoOK = document.querySelectorAll(".validar .fa-check-circle");
	let iconoError = document.querySelectorAll(".validar .fa-times-circle");
	let mensajeError = document.querySelectorAll(".validar .mensajeError");
	let OK = {};
	let errores = {};
	if (entidad != "historicos_personajes") OK.adicionales = true;

	// Campos específicos de fechas
	let mes_id = document.querySelector(".input-error select[name='mes_id']");
	let dia = document.querySelector(".input-error select[name='dia']");
	let desconocida = document.querySelector(".input-error input[name='desconocida']");
	// Campos específicos de adicionales
	let ocultar = document.querySelector("#ocultar");
	let enProcCan = document.querySelectorAll("input[name='enProcCan']");
	let statusProcCan = document.querySelectorAll("input[name='statusProcCan']");
	let genero = document.querySelectorAll("input[name='genero']");
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
		if (campo == "enProcCan" || campo == "statusProcCan" || campo == "genero") {
			// Ocultar / mostrar lo referido al status y género
			enProcCan[0].checked
				? ocultar.classList.remove("invisible")
				: ocultar.classList.add("invisible");
			// Armar la url
			url = "";
			url += enProcCan[0].checked ? "&enProcCan=1" : "&enProcCan=0";
			url += statusProcCan[0].checked
				? "&statusProcCan=4"
				: statusProcCan[1].checked
				? "&statusProcCan=3"
				: statusProcCan[2].checked
				? "&statusProcCan=2"
				: statusProcCan[3].checked
				? "&statusProcCan=1"
				: "";
			url += genero[0].checked ? "&genero=1" : genero[1].checked ? "&genero=2" : "";
			// Obtener los errores
			errores.adicionales = await fetch(ruta + "adicionales" + url).then((n) => n.json());
			OK.adicionales = !errores.adicionales ? true : false;
			errores.adicionales = "";
		}

		// Logos de Wikipedia y Santopedia
		if (OK.nombre) {
			wiki.href = url_wiki + nombre.value;
			wiki.classList.remove("ocultar");
			if (enProcCan[0].checked) {
				santopedia.href = url_santopedia + nombre.value;
				santopedia.classList.remove("ocultar");
			} else santopedia.classList.add("ocultar");
		} else wiki.classList.add("ocultar");

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
		resultadoTrue && resultado.length == bloques.length
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
