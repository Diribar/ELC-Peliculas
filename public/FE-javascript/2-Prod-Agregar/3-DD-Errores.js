window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let button = document.querySelector("#dataEntry button[type='submit']");
	let entidad = document.querySelector("#dataEntry #entidad").innerHTML;
	let inputs = document.querySelectorAll(".input-error .input");
	let iconoError = document.querySelectorAll(".input-error .fa-times-circle");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Campos a controlar
	let ruta = "/producto/agregar/api/campos-DD-a-verificar/?entidad=" + entidad + "&change=";
	let campos_change = await fetch(ruta + "true").then((n) => n.json());
	let campos_input = await fetch(ruta + "false").then((n) => n.json());
	// Variables de país
	let selectPais = document.querySelector("#paises_id select");
	if (selectPais) {
		paises = Array.from(document.querySelectorAll("#paises_id select option")).map((n) => {
			return {id: n.value, nombre: n.innerHTML};
		});
		mostrarPaises = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
		inputPais = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
	}

	// Revisar el data-entry y comunicar los aciertos y errores
	form.addEventListener("change", async(e)=> {
		campo = e.target.name;
		console.log(campo);
		if (campo == "nombre_original" || campo == "ano_estreno") {

		}
		if (campo == "nombre_castellano" || campo == "ano_estreno") {}
	})

	// Submit
	form.addEventListener("submit", (e) => {
		if (button.classList.contains("botonSinLink")) e.preventDefault();
	});

	let funcionPaises = () => {
		let paisId = selectPais.value;
		if (paisId == "borrar") {
			selectPais.value = "";
			mostrarPaises.value = "";
			inputPais.value = "";
			return;
		}
		// Verificar si figura en inputPais
		let agregar = !inputPais.value.includes(paisId);
		// Si no figura en inputPais, agregárselo
		if (agregar) {
			// Limita la cantidad máxima de países a 1+4 = 5, para permitir el mensaje de error
			if (inputPais.value.length >= 2 * 1 + 4 * 4) return;
			inputPais.value += !inputPais.value ? paisId : ", " + paisId;
		} else {
			// Si sí figura, quitárselo
			paises_idArray = inputPais.value.split(", ");
			indice = paises_idArray.indexOf(paisId);
			paises_idArray.splice(indice, 1);
			inputPais.value = paises_idArray.join(", ");
		}
		// Agregar los países a mostrar
		paisesNombre = "";
		if (inputPais.value) {
			paises_idArray = inputPais.value.split(", ");
			for (pais_id of paises_idArray) {
				paisNombre = paises.find((n) => n.id == pais_id).nombre;
				paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
			}
		}
		mostrarPaises.value = paisesNombre;
	};
});
