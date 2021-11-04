window.addEventListener("load", () => {
	// Variables
	let mesDia = document.querySelectorAll("form .mesDia");
	let mes = document.querySelector("form select[name='mes_id']");
	let dia = document.querySelector("form select[name='dia']");
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
	// Buscar otros casos en esa fecha
	registrosConEsaFecha = async (mes_id, dia) => {
		rubro = document.querySelector("#rubro").innerHTML;
		// Obtener los casos
		url =
			"/agregar/api/buscar-otros-casos-en-esa-fecha/?mes_id=" +
			mes_id +
			"&dia=" +
			dia +
			"&rubro=" +
			rubro;
		casos = await fetch(url).then((n) => n.json());
		// Si no hay, "no hay casos"
		if (!casos.length) {
			posiblesDuplicados.innerHTML = "¡No hay otros casos!";
			posiblesDuplicados.classList.add("sinCasos");
		} else {
			// Si hay, mostrarlos
			posiblesDuplicados.innerHTML = "";
			posiblesDuplicados.classList.remove("sinCasos");
			for (let i = 0; i < casos.length; i++) {
				posiblesDuplicados.innerHTML +=
					'<li type="none">' +
					'<input class="input" type="checkbox" name="caso' +
					i +
					'" id="caso' +
					i +
					'" checked>' +
					'<label for="caso' +
					i +
					'">' +
					casos[i] +
					"</label>" +
					"</li>";
			}
		}
	};

	// Status inicial
	if (mes.value && dia.value) registrosConEsaFecha(mes.value, dia.value);

	// ADD EVENT *******************************
	// Detectar cambios en mes
	if (mes.value != "") cambio();
	mes.addEventListener("change", () => {
		cambio();
		if (mes.value && dia.value) registrosConEsaFecha(mes.value, dia.value);
	});
	dia.addEventListener("change", () => {
		if (mes.value && dia.value) registrosConEsaFecha(mes.value, dia.value);
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
