window.addEventListener("load", async () => {
	// Variables
	let entidad = document.querySelector("select[name='entidad']");
	let coleccion_id = document.querySelector("select[name='coleccion_id']");
	let temporada = document.querySelector("select[name='temporada']");
	let capitulo = document.querySelector("select[name='capitulo']");
	let submit = document.querySelectorAll(".submit");

	// Interacción con los DataEntry
	entidad.addEventListener("change", () => {
		console.log(entidad.value);
		if (entidad.value != "capitulos") {
			inutilizar(entidad);
			if (entidad.value == "colecciones" || entidad.value == "peliculas") {
				for (i = 0; i < submit.length; i++) {
					submit[i].classList.remove("botonSinLink");
				}
			} else
				for (i = 0; i < submit.length; i++) {
					submit[i].classList.add("botonSinLink");
				}
		} else {
			inutilizar(entidad);
			utilizar(entidad);
			console.log("off");
			for (i = 0; i < submit.length; i++) {
				submit[i].classList.add("botonSinLink");
			}
		}
	});
	coleccion_id.addEventListener("change", () => {
		if ("sin errores") {
			inutilizar(coleccion_id);
			utilizar(coleccion_id);
		}
	});
	temporada.addEventListener("change", () => {
		if ("sin errores") {
			utilizar(temporada);
		}
	});
	capitulo.addEventListener("change", () => {
		if ("sin errores") {
			for (i = 0; i < submit.length; i++) {
				submit[i].classList.remove("botonSinLink");
			}
		}
	});
});

let inutilizar = (campo) => {
	let inputs = document.querySelectorAll(".input");
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i] == campo) break;
	}
	for (j = i + 1; j < inputs.length; j++) {
		inputs[j].setAttribute("disabled", "disabled");
		inputs[j].value = "";
		inputs[j].style.opacity = "30%";
	}
	return;
};

let utilizar = (campo) => {
	let inputs = document.querySelectorAll(".input");
	console.log(campo);
	for (i = 0; i < inputs.length - 1; i++) {
		console.log(inputs[i]);
		if (inputs[i] == campo) {
			inputs[i + 1].removeAttribute("disabled");
			inputs[i + 1].style.opacity = "100%";
			break;
		}
	}
	return;
};
