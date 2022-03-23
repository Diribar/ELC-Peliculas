"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let entidad = document.querySelector("#dataEntry #entidad").innerHTML;
	let submit = document.querySelector("#dataEntry button[type='submit']");
	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconoError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Variables de país
	let paisesSelect = document.querySelector("#paises_id select");
	if (paisesSelect) {
		paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
		paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
		paisesListado = Array.from(document.querySelectorAll("#paises_id select option")).map(
			(n) => {
				return {id: n.value, nombre: n.innerHTML};
			}
		);
	}
	// Otras variables
	let ruta = "/producto/agregar/api/validar-datos-duros/?";

	// Revisar campos en forma INDIVIDUAL
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		if (e.target == paisesSelect) funcionPaises();
		let campo = e.target == paisesSelect ? paisesID.name : e.target.name;
		let valor = e.target == paisesSelect ? paisesID.value : encodeURIComponent(e.target.value);
		let indice = campos.indexOf(campo);
		// Averiguar si hay algún error
		let errores = await fetch(ruta + campo + "=" + valor).then((n) => n.json());
		mensajesError[indice].innerHTML = errores[campo];
		// Acciones en función de si hay o no mensajes de error
		errores[campo]
			? iconoError[indice].classList.remove("ocultar")
			: iconoError[indice].classList.add("ocultar");

		botonSubmit();
	});

	// Revisar campos COMBINADOS
	form.addEventListener("change", async (e) => {
		// Obtener el valor para 'campo'
		let campo = e.target.name;
		let datos
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
		// Fin
		botonSubmit();
	});

	// Submit
	form.addEventListener("submit", (e) => {
		if (submit.classList.contains("inactivo")) e.preventDefault();
	});

	// Funciones
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
		paisesNombre = "";
		if (paisesID.value) {
			paises_idArray = paisesID.value.split(", ");
			for (let pais_id of paises_idArray) {
				let paisNombre = paisesListado.find((n) => n.id == pais_id).nombre;
				paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
			}
		}
		paisesMostrar.value = paisesNombre;
	};

	// Botón 'submit'
	let botonSubmit = () => {
		Array.from(mensajesError).find((n) => n.innerHTML)
			? submit.classList.add("inactivo")
			: submit.classList.remove("inactivo");
	};

	let funcionDosCampos = async (datos, campo) => {
		let campo1 = datos.campo1;
		let campo2 = datos.campo2;
		let indice1 = campos.indexOf(campo1);
		let indice2 = campos.indexOf(campo2);
		if (
			(campo == campo1 || campo == campo2) &&
			inputs[indice1].value &&
			!mensajesError[indice1].innerHTML &&
			inputs[indice2].value &&
			!mensajesError[indice2].innerHTML
		)
			funcionCamposCombinados([campo1, campo2], campo1);
	};

	let funcionCamposCombinados = async (valores, campo) => {
		// Armado de la ruta
		let dato = "entidad=" + entidad;
		let indice = [];
		for (let i = 0; i < valores.length; i++) {
			indice.push(campos.indexOf(valores[i]));
			dato += "&" + valores[i] + "=" + inputs[indice[i]].value;
		}
		// Obtener el mensaje para el campo
		let errores = await fetch(ruta + dato).then((n) => n.json());
		let mensaje = errores[campo];
		indice = campos.indexOf(campo);
		// Reemplaza
		mensajesError[indice].innerHTML = mensaje;
		// Acciones en función de si hay o no mensajes de error
		mensaje
			? iconoError[indice].classList.remove("ocultar")
			: iconoError[indice].classList.add("ocultar");
		return;
	};

	// Status inicial
	botonSubmit();
});
