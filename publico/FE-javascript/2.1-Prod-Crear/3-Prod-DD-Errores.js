"use strict";
window.addEventListener("load", async () => {

	// FUNCIONES *******************************************
	let statusInicial = async (mostrarIconoError) => {
		//Buscar todos los valores
		let url = "";
		inputs.forEach((input, i) => {
			if (i) url += "&";
			url += input.name + "=";
			url += encodeURIComponent(input.value);
		});
		// Consecuencias de las validaciones de errores
		if (mostrarIconoError) await funcionErrores(url, campos);
		botonSubmit();
	};
	let funcionErrores = async (url, campos_a_validar) => {
		let errores = await fetch(ruta + url).then((n) => n.json());
		// Reemplaza
		campos.forEach((campo, indice) => {
			if (errores[campo] !== undefined) {
				mensajesError[indice].innerHTML = errores[campo];
				errores[campo]
					? iconosOK[indice].classList.add("ocultar")
					: iconosOK[indice].classList.remove("ocultar");
				errores[campo]
					? iconosError[indice].classList.remove("ocultar")
					: iconosError[indice].classList.add("ocultar");
			}
		});
		// Fin
		return;
	};
	let funcionDosCampos = async (datos, campo) => {
		let campo1 = datos.campo1;
		let campo2 = datos.campo2;
		let indice1 = campos.indexOf(campo1);
		let indice2 = campos.indexOf(campo2);
		let camposComb = [campo1, campo2];
		if (
			(campo == campo1 || campo == campo2) &&
			inputs[indice1].value &&
			!mensajesError[indice1].innerHTML &&
			inputs[indice2].value &&
			!mensajesError[indice2].innerHTML
		)
			funcionCamposCombinados(camposComb, campo1);
	};
	let funcionCamposCombinados = async (camposComb, campo) => {
		// Armado de la ruta
		let datos = "entidad=" + entidad;
		let indice = [];
		for (let i = 0; i < camposComb.length; i++) {
			indice.push(campos.indexOf(camposComb[i]));
			datos += "&" + camposComb[i] + "=" + inputs[indice[i]].value;
		}
		// Obtener el mensaje para el campo
		await funcionErrores(datos, [campo]);
		botonSubmit();
		return;
	};
	let funcionPaises = () => {
		let paisID = paisesSelect.value;
		if (paisID == "borrar") {
			paisesSelect.value = "";
			paisesMostrar.value = "";
			paisesID.value = "";
			return;
		}
		// Verificar si figura en paisesID
		let agregar = !paisesID.value.includes(paisID);
		// Si no figura en paisesID, agregárselo
		if (agregar) {
			// Limita la cantidad máxima de países a 1+4 = 5, para permitir el mensaje de error
			if (paisesID.value.length >= 2 * 1 + 4 * 4) return;
			paisesID.value += !paisesID.value ? paisID : ", " + paisID;
		} else {
			// Si sí figura, quitárselo
			let paises_idArray = paisesID.value.split(", ");
			let indice = paises_idArray.indexOf(paisID);
			paises_idArray.splice(indice, 1);
			paisesID.value = paises_idArray.join(", ");
		}
		// Agregar los países a mostrar
		let paisesNombre = "";
		if (paisesID.value) {
			let paises_idArray = paisesID.value.split(", ");
			for (let pais_id of paises_idArray) {
				let paisNombre = paisesListado.find((n) => n.id == pais_id).nombre;
				paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
			}
		}
		paisesMostrar.value = paisesNombre;
	};
	// Botón submit
	let botonSubmit = () => {
		// Detectar la cantidad de 'no aciertos'
		let OK_ocultos =
			Array.from(iconosOK)
				.map((n) => n.className)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == 0;

		// Detectar la cantidad de 'no errores'
		let error = Array.from(iconosError)
			.map((n) => n.className)
			.join(" ")
			.split(" ")
			.reduce((a, b) => {
				return a[b] ? ++a[b] : (a[b] = 1), a;
			}, {}).ocultar; //== iconosError.length;
		// Consecuencias
		// console.log(OK_ocultos,error,iconosError.length);
		OK_ocultos && error ? submit.classList.remove("inactivo") : submit.classList.add("inactivo");
	};

	// ADD EVENT LISTENERS *********************************
	// Revisar campos en forma INDIVIDUAL
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		if (e.target == paisesSelect) funcionPaises();
		let campo = e.target == paisesSelect ? paisesID.name : e.target.name;
		let valor = e.target == paisesSelect ? paisesID.value : encodeURIComponent(e.target.value);
		// Averiguar si hay algún error
		let dato = campo + "=" + valor;
		await funcionErrores(dato, campo);
		botonSubmit();
	});
	// Revisar campos COMBINADOS
	form.addEventListener("change", async (e) => {
		// Obtener el valor para 'campo'
		let campo = e.target.name;
		let datos;
		// (Título original / castellano) + año lanzamiento
		if (campo == "nombre_original" || campo == "nombre_castellano" || campo == "ano_estreno") {
			datos = {campo1: "nombre_original", campo2: "ano_estreno"};
			funcionDosCampos(datos, campo);
			datos = {campo1: "nombre_castellano", campo2: "ano_estreno"};
			funcionDosCampos(datos, campo);
		}
		// Año de lanzamiento + año de finalización
		if ((campo == "ano_estreno" && campos.includes("ano_fin")) || campo == "ano_fin") {
			datos = {campo1: "ano_estreno", campo2: "ano_fin"};
			funcionDosCampos(datos, campo);
		}
	});
	// Submit
	form.addEventListener("submit", (e) => {
		e.preventDefault();
	});
	submit.addEventListener("click", () => {
		funcionSubmit();
	});

	// Status inicial
	botonSubmit();
});
