window.addEventListener("load", () => {
	// Variables
	let mesDia = document.querySelectorAll("form .mesDia");
	mes = document.querySelector("form select[name='mes_id']");
	dia = document.querySelector("form select[name='dia']");
	let dia30 = document.querySelector(
		"form select[name='dia'] option[value='30']"
	);
	let dia31 = document.querySelector(
		"form select[name='dia'] option[value='31']"
	);
	let desconocida = document.querySelector("form input[name='desconocida']");
	let segundaCol = document.querySelector("form #segundaCol");
	let posiblesDuplicados = document.querySelector("form #posiblesDuplicados");

	// FUNCIONES *******************************
	// Aplicar cambios en los días 30 y 31
	cambio = () => {
		if (mes.value == 2 || mes.value == "") {
			dia30.classList.add("ocultar");
			dia31.classList.add("ocultar");
			if (dia.value > 29) dia.value = "";
		} else {
			dia30.classList.remove("ocultar");
			if (
				mes.value == 4 ||
				mes.value == 6 ||
				mes.value == 9 ||
				mes.value == 11
			) {
				dia31.classList.add("ocultar");
				if (dia.value > 30) dia.value = "";
			} else dia31.classList.remove("ocultar");
		}
	};
	// Posibles duplicados
	enBD_conEsaFecha = async (mes_id, dia) => {
		// Obtener los casos
		url = "/agregar/personaje/api/enBD/?mes_id=" + mes_id + "&dia=" + dia;
		casos = await fetch(url).then((n) => n.json());
		console.log(casos)
		// Si hay, mostrarlos
		// Si no hay, "no hay casos"
	};

	// ADD EVENT *******************************
	// Detectar cambios en mes
	if (mes.value != "") cambio();
	mes.addEventListener("change", () => {
		cambio();
		if (mes.value && dia.value) enBD_conEsaFecha(mes.value, dia.value);
	});

	// Detectar cambios en Fecha desconocida
	desconocida.addEventListener("change", () => {
		if (desconocida.checked) {
			for (i = 0; i < mesDia.length; i++) {
				mesDia[i].style.visibility = "hidden";
			}
			segundaCol.style.visibility = "hidden";
		} else {
			for (i = 0; i < mesDia.length; i++) {
				mesDia[i].style.visibility = "visible";
			}
			segundaCol.style.visibility = "visible";
		}
	});
});
