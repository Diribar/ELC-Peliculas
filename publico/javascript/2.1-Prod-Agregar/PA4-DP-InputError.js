"use strict";
window.addEventListener("load", async () => {
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
		// Ayuda Sub-categoría
		iconoAyudaSubcat: document.querySelector("#ayudaSubcat .ayudaClick"),
		mensajesAyudaSubcat: document.querySelectorAll("#ayudaSubcat ul li"),
		// Categoría y subcategoría
		categoriaSelect: document.querySelector("select[name='categoria_id']"),
		subcatSelect: document.querySelector("select[name='subcategoria_id']"),
		subcategoriaOpciones: document.querySelectorAll("select[name='subcategoria_id'] option"),
		subcategorias: await fetch("/producto/agregar/api/DP-obtiene-subcategs").then((n) => n.json()),
		// Calificaciones y RCLV
		camposCalif: ["fe_valores_id", "entretiene_id", "calidad_tecnica_id"],
		camposRCLV: ["personaje_id", "hecho_id", "valor_id"],
		// Datos RCLV
		RCLV: document.querySelector("#RCLV"),
		iconosOK_RCLV: document.querySelectorAll("#RCLV .inputError .fa-circle-check"),
		iconosError_RCLV: document.querySelectorAll("#RCLV .inputError .fa-circle-xmark"),
		opcionesPersonaje: document.querySelectorAll("select[name='personaje_id'] option"),
		opcionesHecho: document.querySelectorAll("select[name='hecho_id'] option"),
		linkPersAlta: document.querySelector(".inputError .linkRCLV.alta"),
		linksRCLVEdic: document.querySelectorAll(".inputError .linkRCLV.edicion"),
		// Ruta
		rutaValidar: "/producto/agregar/api/valida/datos-personalizados/?",
	};
	let campos = Array.from(v.inputs).map((n) => n.name);
	// Calificaciones y RCLV
	["Calif", "RCLV"].forEach((sector) => {
		v["inputs" + sector] = document.querySelectorAll("#" + sector + " .inputError .input");
		v["check" + sector] = document.querySelector("#" + sector + " #checkbox input");
		v["ocultar" + sector] = document.querySelector("#" + sector + " .selects");
	});

	// FUNCIONES *******************************************
	let statusInicial = async (mostrarIconoError) => {
		//Buscar todos los valores
		let datosUrl = "";
		v.inputs.forEach((input, i) => {
			// Caracter de unión para i>0
			if (i) datosUrl += "&";
			// Particularidades para Calif y RCLV
			for (let sector of ["Calif", "RCLV"])
				if (v["campos" + sector].includes(input.name) && v["check" + sector].checked) {
					datosUrl += input.name + "=OK";
					return;
				}
			// Agrega el campo y el valor
			datosUrl += input.name + "=" + encodeURIComponent(input.value);
		});
		// Consecuencias de las validaciones de errores
		await muestraLosErrores(datosUrl, mostrarIconoError);
		actualizaBotonSubmit();
		// Muestra u oculta el sector que corresponda
		for (let campo of ["sinCalif", "sinRCLV"]) muestraOcultaElSector(campo);
		// Fin
		return;
	};
	let muestraLosErrores = async (datos, mostrarIconoError) => {
		let errores = await fetch(rutaValidar + datos).then((n) => n.json());
		campos.forEach((campo, indice) => {
			if (errores[campo] !== undefined) {
				v.mensajesError[indice].innerHTML = errores[campo];
				// Acciones en función de si hay o no mensajes de error
				errores[campo]
					? v.iconosError[indice].classList.add("error")
					: v.iconosError[indice].classList.remove("error");
				errores[campo] && mostrarIconoError
					? v.iconosError[indice].classList.remove("ocultar")
					: v.iconosError[indice].classList.add("ocultar");
				errores[campo]
					? v.iconosOK[indice].classList.add("ocultar")
					: v.iconosOK[indice].classList.remove("ocultar");
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
		if (v.submit.classList.contains("inactivo")) statusInicial(true);
		else v.form.submit();
	};
			// Actualizar la subcategoría
		let actualizaOpsSubcat= () => {
			if (v.categoriaSelect.value) {
				// Actualiza las opciones de sub-categoría
				for (let opcion of v.subcategoriaOpciones) {
					opcion.className.includes(v.categoriaSelect.value)
						? opcion.classList.remove("ocultar")
						: opcion.classList.add("ocultar");
				}
				// Habilita la subcategoría
				v.subcatSelect.removeAttribute("disabled");
				// Habilita y actualiza el ayuda
				v.iconoAyudaSubcat.classList.remove("inactivo");
				// Deja visibles las ayudas correspondientes
				v.mensajesAyudaSubcat.forEach((mensaje) => {
					mensaje.className && !mensaje.className.includes(v.categoriaSelect.value)
						? mensaje.classList.add("ocultar")
						: mensaje.classList.remove("ocultar");
				});
			} else {
				// Borra la sub-categoría y la deja inactivada
				v.subcatSelect.setAttribute("disabled", "disabled");
				v.subcatSelect.value = "";
				// Inhabilita el ayuda
				v.iconoAyudaSubcat.classList.add("inactivo");
			}
			// Fin
			return;
		}
		// RCLV
		let limpiaInputsRCLV= () => {
			// Borra el valor de los inputsRCLV
			v.inputsRCLV.forEach((input, i) => {
				input.value = "1";
				v.iconosOK_RCLV[i].classList.add("ocultar");
				v.iconosError_RCLV[1].classList.add("ocultar");
			});
			// Fin
			return;
		}
		let actualizaOpsRCLV= () => {
			// Variables
			let clave;
			// Borra los iconosOK_RCLV y los iconosError_RCLV
			for (let icono of v.iconosOK_RCLV) icono.classList.add("ocultar");
			for (let icono of v.iconosError_RCLV) icono.classList.add("ocultar");

			// Si la subcategoría tiene valor --> restricción en las opciones
			if (v.subcatSelect.value) {
				// Actualiza las opciones de RCLV
				let categoriaValor = v.categoriaSelect.value;
				v.subcategoria = v.subcategorias.find((n) => n.id == v.subcatSelect.value);

				// Acciones para el PERSONAJE
				// 1. Restringido por subcategoría
				if (v.subcategoria.pers_codigo)
					v.opcionesPersonaje.forEach((opcion) => {
						opcion.classList.contains(v.subcategoria.id) || opcion.value == 2
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});
				// 2. Restringido por categoría
				else
					v.opcionesPersonaje.forEach((opcion) => {
						opcion.classList.contains(categoriaValor) || opcion.value == 2
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});

				// Acciones para el HECHO
				clave = v.subcategoria.hechos_codigo;
				// 1. Restringido por subcategoría
				if (clave)
					v.opcionesHecho.forEach((opcion) => {
						opcion.classList.contains(clave)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});
				// 2. Restringido por categoría
				else
					v.opcionesHecho.forEach((opcion) => {
						opcion.classList.contains(categoriaValor)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});

				// Muestra los campos RCLV
				RCLV.classList.remove("invisible");
			}
			// Si la subcategoría no tiene valor --> oculta los campos RCLV
			else RCLV.classList.add("invisible");

			// Fin
			return;
		}
		let verificaUnaSolaOpcionRCLV= () => {
			// Rutina para los 2 tipos de RCLV
			let opPer = Array.from(v.opcionesPersonaje).filter((n) => !n.classList.contains("ocultar"));
			let opHec = Array.from(v.opcionesHecho).filter((n) => !n.classList.contains("ocultar"));
			// Cambios en personaje
			if (opPer.length == 1) v.inputsRCLV[0].value = opPer[0].value;
			// Cambios en hechos
			if (opHec.length == 1) v.inputsRCLV[1].value = opHec[0].value;
			// Fin
			return;
		}
		let particsJesusNinguno= () => {
			// 1. Acciones para Editar
			// 1.1. Acciones si el valor es 'Ninguno'
			v.inputsRCLV.forEach((inputRCLV, indice) => {
				inputRCLV.value == "1"
					? v.linksRCLVEdic[indice].classList.add("ocultar")
					: v.linksRCLVEdic[indice].classList.remove("ocultar");
			});
			// 1.2. Acciones si elvalor es 'Jesús'
			if (v.inputsRCLV[0].value == "11") v.linksRCLVEdic[0].classList.add("ocultar");

			// 2. Acciones para Agregar
			v.subcatSelect.value == "JSS"
				? v.linkPersAlta.classList.add("ocultar")
				: v.linkPersAlta.classList.remove("ocultar");

			// Fin
			return;
		}
		let interaccionesApMar=  (campo) =>{
			// Cambia el contenido del Personaje o Hecho
			// Acciones si se cambia el personaje
			if (campo == "personaje_id") {
				// Obtiene del personaje, el 'id' de la Aparición Mariana
				for (var opcion of v.opcionesPersonaje) if (opcion.value == v.inputsRCLV[0].value) break;
				let clases = opcion.className.split(" ");
				let indice = clases.indexOf("AMA");
				clases.splice(indice, 1);
				let id = clases[indice].slice(2);
				// Cambia el contenido del Hecho
				v.inputsRCLV[1].value = id;
			}
			// Acciones si se cambia el hecho
			if (campo == "hecho_id") {
				// Muestra los personajes que hayan presenciado la aparición y oculta los demás
				v.opcionesPersonaje.forEach((opcion) => {
					if (opcion.className.includes("AM" + v.inputsRCLV[1].value))
						opcion.classList.remove("ocultar");
					else opcion.classList.add("ocultar");
				});
				// Cambia el contenido del Personaje
				verificaUnaSolaOpcionRCLV();
			}
		}
		let datosUrl= (campo) => {
			// Obtiene el sector (todos los demás campos son del sector 'RCLV')
			let sector = campo == "sinCalif" ? "Calif" : "RCLV";
			// Otras variables
			let checked = v["check" + sector].checked;
			// Agrega el valor del campo 'sin' o todos los campos
			let url = "";
			checked
				? (url += campo + "=on" + "&")
				: v["campos" + sector].forEach((n, i) => {
						url += n + "=" + v["inputs" + sector][i].value + "&";
				  });
			// Agrega la subcategoría, si corresponde
			if (sector == "RCLV" && v.subcatSelect.value) url += "subcategoria_id=" + v.subcatSelect.value;
			// Fin
			return url;
		}
		let muestraOcultaElSector= (campo) => {
			// Variables
			let sector = campo.slice(3);
			// Acción
			v["check" + sector].checked
				? v["ocultar" + sector].classList.add("ocultar")
				: v["ocultar" + sector].classList.remove("ocultar");
			// Fin
			return;
		}
	

	// ADD EVENT LISTENERS *********************************
	// Averigua si hubieron cambios
	v.form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = encodeURIComponent(e.target.value);
		let datosUrl = "";

		// Particularidades si se cambia la categoría
		if (campo == "categoria_id") {
			v.subcatSelect.value = "";
			actualizaOpsSubcat();
			limpiaInputsRCLV();
			actualizaOpsRCLV();
		}
		// Particularidades si se cambia la subcategoría
		if (campo == "subcategoria_id") {
			limpiaInputsRCLV();
			actualizaOpsRCLV();
			verificaUnaSolaOpcionRCLV();
		}

		// Particularidades si se elije el personaje 'Jesús' o 'Ninguno'
		if (["subcategoria_id", ...v.camposRCLV].includes(campo)) particsJesusNinguno();

		// Particularidades si la subcategoría es AMA y se elije un RCLV
		if (v.subcatSelect.value == "AMA" && v.camposRCLV.includes(campo)) interaccionesApMar(campo);

		// Prepara el datosUrl con los datos a validar
		if (campo == "sinCalif" || campo == "sinRCLV") muestraOcultaElSector(campo);
		if (["subcategoria_id", ...v.camposRCLV, "sinCalif", "sinRCLV"].includes(campo))
			datosUrl += datosUrl(campo);
		else datosUrl += campo + "=" + valor;

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

	// Rutinas de categoría / subcategoría
	actualizaOpsSubcat();
	if (v.subcatSelect.value) actualizaOpsRCLV();
	// Activar links RCLV
	particsJesusNinguno();

	// Errores y boton 'Submit'
	statusInicial(mostrarIconoError);
});
