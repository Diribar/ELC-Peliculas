"use strict";
window.addEventListener("load", async () => {
	// Averigua el 'paso'
	let url = window.location.pathname;
	let paso = url.slice(url.lastIndexOf("/") + 1);
	paso = {paso, PC: paso == "palabras-clave", DD: paso == "datos-duros"};
	// Variables
	let v = {
		// Variables generales
		form: document.querySelector("#dataEntry"),
		submit: document.querySelector("#dataEntry #submit"),
		// Datos
		inputs: document.querySelectorAll(".inputError .input"),
		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
	};
	let campos = Array.from(v.inputs).map((n) => n.name);
	if (paso.PC) {
		v.resultado = document.querySelector("#dataEntry #resultado");
		v.rutaObtieneCantProds = (input) => {
			let palabrasClave = input.trim();
			// Procesando la información
			v.resultado.innerHTML = "Procesando la información...";
			v.resultado.classList.remove(...v.resultado.classList);
			v.resultado.classList.add("resultadoEnEspera");
			// Obtiene el link
			return "/producto/agregar/api/PC-cant-prods/?palabrasClave=" + palabrasClave;
		};
		v.mostrarResultados = async (resultados) => {
			// Variables
			let {cantProds, cantProdsNuevos, hayMas} = resultados;
			// Determinar oracion y formato
			let formatoVigente = "resultadoInvalido";
			let oracion;
			// Resultado exitoso
			if (cantProds && !hayMas) {
				let plural = cantProdsNuevos > 1 ? "s" : "";
				oracion = cantProdsNuevos
					? "Encontramos " + cantProdsNuevos + " coincidencia" + plural + " nueva" + plural
					: "No encontramos ninguna coincidencia nueva";
				if (cantProds > cantProdsNuevos) oracion += ", y " + (cantProds - cantProdsNuevos) + " ya en BD";
				if (cantProdsNuevos) formatoVigente = "resultadoExitoso";
			} else {
				// Resultados inválidos
				oracion = hayMas
					? "Hay demasiadas coincidencias (+" + cantProds + "), intentá ser más específico"
					: cantProds == 0
					? "No encontramos ninguna coincidencia"
					: oracion;
			}
			v.resultado.innerHTML = oracion;
			v.resultado.classList.remove(...v.resultado.classList);
			v.resultado.classList.add(formatoVigente);
		};
		v.avanzar = () => {
			v.submit.classList.remove("fa-circle-question");
			v.submit.classList.add("fa-circle-check");
			v.submit.classList.remove("naranja");
			v.submit.classList.add("verde");
			v.submit.title = "Avanzar";
			return;
		};
		v.verificar = () => {
			v.submit.classList.remove("fa-circle-check");
			v.submit.classList.add("fa-circle-question");
			v.submit.classList.remove("verde");
			v.submit.classList.add("naranja");
			v.submit.title = "Verificar";
			v.submit.style = "background";
			return;
		};
	}
	if (paso.DD) {
		v.entidad = document.querySelector("#dataEntry #entidad").innerHTML;
		// Variables de país
		v.paisesSelect = document.querySelector("#paises_id select");
		if (v.paisesSelect) {
			v.paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
			v.paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
			v.paisesListado = Array.from(document.querySelectorAll("#paises_id select option")).map((n) => {
				return {id: n.value, nombre: n.innerHTML};
			});
		}
		// Imagen derecha
		v.sinAvatar = document.querySelector("#imgDerecha img").src.includes("imagenes/0-Base");
	}
	// Ruta
	let rutaValidar = "/producto/agregar/api/valida/" + paso.paso + "/?";

	// FUNCIONES *******************************************
	let statusInicial = async (mostrarIconoError) => {
		//Buscar todos los valores
		let datosUrl = "";
		v.inputs.forEach((input, i) => {
			// Caracter de unión para i>0
			if (i) datosUrl += "&";
			// Particularidad para DD
			if (paso.DD && input.name == "avatar" && !v.sinAvatar) return;
			// Agrega el campo y el valor
			datosUrl += input.name + "=" + encodeURIComponent(input.value);
		});
		// Consecuencias de las validaciones de errores
		await muestraLosErrores(datosUrl, mostrarIconoError);
		actualizaBotonSubmit();
		// Fin
		return;
	};
	let muestraLosErrores = async (datos, mostrarIconoError) => {
		let errores = await fetch(rutaValidar + datos).then((n) => n.json());
		campos.forEach((campo, indice) => {
			if (errores[campo] !== undefined) {
				v.mensajesError[indice].innerHTML = errores[campo];
				// Acciones en función de si hay o no mensajes de error
				errores[campo] ? v.iconosError[indice].classList.add("error") : v.iconosError[indice].classList.remove("error");
				errores[campo] && mostrarIconoError
					? v.iconosError[indice].classList.remove("ocultar")
					: v.iconosError[indice].classList.add("ocultar");
				errores[campo] ? v.iconosOK[indice].classList.add("ocultar") : v.iconosOK[indice].classList.remove("ocultar");
			}
		});
		// Fin
		return;
	};
	let actualizaBotonSubmit = () => {
		// Detectar la cantidad de 'errores' ocultos
		let hayErrores = Array.from(v.iconosError)
			.map((n) => n.className)
			.some((n) => n.includes("error"));
		// Consecuencias
		hayErrores ? v.submit.classList.add("inactivo") : v.submit.classList.remove("inactivo");
	};
	let submitForm = async (e) => {
		e.preventDefault();
		if (paso.PC)
			if (v.submit.classList.contains("fa-circle-question")) {
				if (!v.submit.classList.contains("inactivo")) {
					v.submit.classList.add("inactivo");
					let ruta = v.rutaObtieneCantProds(v.inputs[0].value);
					let resultados = await fetch(ruta).then((n) => n.json());
					v.mostrarResultados(resultados);
					v.submit.classList.remove("inactivo");
					v.avanzar();
				} else statusInicial(true);
			} else v.form.submit();
		else if (v.submit.classList.contains("inactivo")) statusInicial(true);
		else v.form.submit();
	};
	let DD = {
		dosCampos: async function (datos, campo) {
			let campo1 = datos.campo1;
			let campo2 = datos.campo2;
			let indice1 = campos.indexOf(campo1);
			let indice2 = campos.indexOf(campo2);
			let camposComb = [campo1, campo2];
			if (
				(campo == campo1 || campo == campo2) &&
				v.inputs[indice1].value &&
				!v.mensajesError[indice1].innerHTML &&
				v.inputs[indice2].value &&
				!v.mensajesError[indice2].innerHTML
			)
				this.camposCombinados(camposComb);
			return;
		},
		camposCombinados: async (camposComb) => {
			// Armado de la ruta
			let datosUrl = "entidad=" + v.entidad;
			for (let i = 0; i < camposComb.length; i++) {
				let indice = campos.indexOf(camposComb[i]);
				datosUrl += "&" + camposComb[i] + "=" + v.inputs[indice].value;
			}
			// Obtiene el mensaje para el campo
			await muestraLosErrores(datosUrl, true);
			actualizaBotonSubmit();
			return;
		},
		actualizaPaises: () => {
			// Actualizar los ID del input
			// Variables
			let paisID = v.paisesSelect.value;
			// Si se eligió 'borrar', borra todo
			if (paisID == "borrar") {
				v.paisesSelect.value = "";
				v.paisesMostrar.value = "";
				v.paisesID.value = "";
				return;
			}
			// Verificar si figura en paisesID
			let agregar = !v.paisesID.value.includes(paisID);
			if (agregar) {
				if (v.paisesID.value.length >= 2 * 1 + 3 * 4) return; // Limita la cantidad máxima de países a 1 + 4 = 5
				v.paisesID.value += (v.paisesID.value ? " " : "") + paisID; // Actualiza el input
			} else v.paisesID.value = v.paisesID.value.replace(paisID, "").replace("  ", " ").trim(); // Quita el paisID solicitado

			// Actualizar los países a mostrar
			let paisesNombre = "";
			if (v.paisesID.value) {
				let paises_idArray = v.paisesID.value.split(" ");
				paises_idArray.forEach((pais_id) => {
					let paisNombre = v.paisesListado.find((n) => n.id == pais_id).nombre;
					paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
				});
			}
			v.paisesMostrar.value = paisesNombre;
			// Fin
			return;
		},
	};

	// ADD EVENT LISTENERS *********************************
	// Averigua si hubieron cambios
	v.form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		e.target.value = e.target.value.trim();
		let valor = encodeURIComponent(e.target.value);
		let datosUrl = "";
		// Particularidades por paso
		if (paso.PC) {
			// Cambiar submit por '?'
			v.verificar();
			// Borrar los resultados anteriores
			v.resultado.innerHTML = "<br>";
			// Borrar las clases anteriores
			v.resultado.classList.remove(...v.resultado.classList);
			v.resultado.classList.add("sinResultado");
			// Prepara el datosUrl con los datos a validar
			datosUrl = campo + "=" + valor;
		}
		if (paso.DD) {
			// Primera letra en mayúscula (sólo para Datos Duros)
			if ((e.target.localName == "input" && e.target.type == "text") || e.target.localName == "textarea") {
				valor = e.target.value;
				e.target.value = valor.slice(0, 1).toUpperCase() + valor.slice(1);
				valor = encodeURIComponent(e.target.value);
			}

			// Convierte los ID de los países elegidos, en un texto
			if (e.target == v.paisesSelect) {
				DD.actualizaPaises();
				// Definir los valores para 'campo' y 'valor'
				campo = v.paisesID.name;
				valor = v.paisesID.value;
			}
			datosUrl = campo + "=" + valor;
		}
		// Validar errores
		await muestraLosErrores(datosUrl, true);
		// Actualiza botón Submit
		actualizaBotonSubmit();
	});
	// Submit
	v.form.addEventListener("submit", async (e) => {
		submitForm(e);
	});
	v.submit.addEventListener("click", async (e) => {
		submitForm(e);
	});
	v.submit.addEventListener("keydown", async (e) => {
		if (e.key == "Enter" || e.key == "Space") submitForm(e);
	});

	// STATUS INICIAL *************************************
	let mostrarIconoError = paso.DD; // En DD se muestran los errores iniciales siempre;
	statusInicial(mostrarIconoError);
});
