"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Variables generales
		form: document.querySelector("#dataEntry"),
		submit: document.querySelector("#dataEntry #submit"),
		inputs: document.querySelectorAll(".inputError .input"),
		radioSI: document.querySelectorAll(".inputError .radioSI"),
		radioNO: document.querySelectorAll(".inputError .radioNO"),
		tiposActuacion: document.querySelectorAll(".inputError .tipoActuacion"),
		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
		// CFC
		cfcSI: document.querySelector("input[name='ocurrio']#ocurrioSI"),
		cfcNO: document.querySelector("input[name='ocurrio']#ocurrioNO"),
		// Ocurrió
		ocurrioSI: document.querySelector("input[name='ocurrio']#ocurrioSI"),
		ocurrioNO: document.querySelector("input[name='ocurrio']#ocurrioNO"),
		// RCLV
		camposRCLV: ["personaje_id", "hecho_id", "valor_id"],
		inputsRCLV: document.querySelectorAll("#RCLV .inputError .input"),
		checkRCLV: document.querySelector("#RCLV #checkbox input"),
		selectsRCLV: document.querySelector("#RCLV #selectsRCLV"),
		errorRCLV: document.querySelector(".inputError #errorRCLV"),
		// RCLV - Sectores
		sectorRCLV: document.querySelector("#RCLV"),
		sectorPers: document.querySelector("#RCLV #personaje_id"),
		sectorHecho: document.querySelector("#RCLV #hecho_id"),
		sectorValor: document.querySelector("#RCLV #valor_id"),
		// RCLV - Selects y Opciones
		selectPers: document.querySelector("select[name='personaje_id']"),
		selectHecho: document.querySelector("select[name='hecho_id']"),
		optgroupPers: document.querySelectorAll("select[name='personaje_id'] optgroup"),
		optgroupHecho: document.querySelectorAll("select[name='hecho_id'] optgroup"),
		// RCLV - Varios
		ayudaRCLV: document.querySelectorAll("#RCLV .ocultaAyudaRCLV"),
		iconosOK_RCLV: document.querySelectorAll("#RCLV .inputError .fa-circle-check"),
		iconosError_RCLV: document.querySelectorAll("#RCLV .inputError .fa-circle-xmark"),
		// RCLV - Links
		linksRCLV_Alta: document.querySelectorAll("#RCLV .inputError .linkRCLV.alta"),
		linksRCLV_Edic: document.querySelectorAll("#RCLV .inputError .linkRCLV.edicion"),
		// Rutas
		rutaValidar: "/producto/agregar/api/valida/datos-adicionales/?",
		rutaGuardaDatosAdics: "/producto/agregar/api/DA-guarda-datos-adics/?",
	};
	(() => {
		// Campos de error
		v.camposError = [...Array.from(v.radioSI).map((n) => n.name), ...["tipo_actuacion_id", "publico_id", "RCLV"]];

		// Opciones para personajes
		v.opcionesPers = (() => {
			let respuesta = [];
			for (let grupo of v.optgroupPers) respuesta.push([...grupo.children]);
			return respuesta;
		})();

		// Opciones para hechos
		v.opcionesHechos = (() => {
			let respuesta = [];
			for (let grupo of v.optgroupHecho) respuesta.push([...grupo.children]);
			return respuesta;
		})();

	})();

	// FUNCIONES *******************************************
	// Comunes a todos los campos
	let obtieneLosDatos = () => {
		// Variables
		let datosUrl = "";
		//Busca todos los valores 'radio'
		v.radioSI.forEach((radioSI, i) => {
			// Variables
			let respuesta = radioSI.checked ? "1" : v.radioNO[i].checked ? "0" : "";
			// Acción
			datosUrl += radioSI.name + "=" + respuesta + "&";
			if (radioSI.name == "ocurrio" && respuesta) v.errorRCLV.classList.remove("ocultar");
		});
		//Busca todos los valores 'tipoActuacion'
		let respuesta = "";
		for (let tipo of v.tiposActuacion) if (tipo.checked) respuesta = tipo.value;
		datosUrl += "tipo_actuacion_id=" + respuesta + "&";
		//Busca todos los valores 'input'
		v.inputs.forEach((input, i) => {
			// Particularidad para RCLV
			if (v.camposRCLV.includes(input.name) && v.checkRCLV.checked) return;
			// Agrega el campo y el valor
			datosUrl += input.name + "=" + encodeURIComponent(input.value) + "&";
		});
		// Fin
		return datosUrl;
	};
	let statusInicial = async (mostrarIconoError) => {
		// Variables
		let datosUrl = obtieneLosDatos();
		// Consecuencias de la validación de errores
		await muestraLosErrores(datosUrl, mostrarIconoError);
		actualizaBotonSubmit();
		// Impactos en RCLV
		for (let metodo in impactoVisualEnRCLV) impactoVisualEnRCLV[metodo]();
		// Fin
		return;
	};
	let muestraLosErrores = async (datos, mostrarIconoError) => {
		let errores = await fetch(v.rutaValidar + datos).then((n) => n.json());
		// return;
		v.camposError.forEach((campo, indice) => {
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
		if (v.submit.classList.contains("inactivo")) statusInicial(true);
		else v.form.submit();
	};
	// RCLV
	let impactoVisualEnRCLV = {
		cfc: () => {
			// Variables
			let categoria = cfcSI.checked ? "CFC" : cfcNO.checked ? "VPC" : "";
			// Si no hay respuesta, agrega el 'oculta' de RCLVs
			if (!categoria) v.sectorRCLV.classList.add("ocultaCfc");
			// Acciones si hay respuesta
			else {
				// Opciones para Personajes
				v.selectPers.innerHTML = "";
				v.optgroupPers.forEach((grupo, i) => {
					// Acciones si el grupo tiene la clase
					if (grupo.className.includes(categoria)) {
						// Borra todas las opciones y agrega las que van
						grupo.innerHTML = "";
						for (let opcion of v.opcionesPers[i]) if (opcion.className.includes(categoria)) grupo.appendChild(opcion);
						// Si tiene opciones, agrega el grupo
						if (grupo.childElementCount) v.selectPers.appendChild(grupo);
					}
				});

				// Opciones para Hechos
				v.selectHecho.innerHTML = "";
				v.optgroupHecho.forEach((grupo, i) => {
					// Acciones si el grupo tiene la clase
					if (grupo.className.includes(categoria)) {
						// Borra todas las opciones y agrega las que van
						grupo.innerHTML = "";
						for (let opcion of v.opcionesHechos[i]) if (opcion.className.includes(categoria)) grupo.appendChild(opcion);
						// Si tiene opciones, agrega el grupo
						if (grupo.childElementCount) v.selectHecho.appendChild(grupo);
					}
				});

				// Quita el 'oculta' de RCLVs
				v.sectorRCLV.classList.remove("ocultaCfc");
				// Fin
				return;
			}
		},
		ocurrio: () => {
			// Variables
			let ocurrio = ocurrioSI.checked ? "1" : ocurrioNO.checked ? "0" : "";

			// Oculta o muestra el sector de RCLVs
			ocurrio ? v.sectorRCLV.classList.remove("ocultaOcurrio") : v.sectorRCLV.classList.add("ocultaOcurrio");

			// Acciones si ocurrió
			if (ocurrio == "1") {
				// Muestra 'personaje_id' y 'hecho_id'
				v.sectorPers.classList.remove("ocultar");
				v.sectorHecho.classList.remove("ocultar");
				// Oculta 'valor_id'
				v.sectorValor.classList.add("ocultar");
				// Ayudas
				v.ayudaRCLV[0].classList.remove("ocultaAyudaRCLV");
				v.ayudaRCLV[1].classList.add("ocultaAyudaRCLV");
			}
			// Acciones si no ocurrió
			if (ocurrio == "0") {
				// Muestra 'valor_id
				v.sectorValor.classList.remove("ocultar");
				// Oculta 'personaje_id' y 'hecho_id'
				v.sectorPers.classList.add("ocultar");
				v.sectorHecho.classList.add("ocultar");
				// Ayudas
				v.ayudaRCLV[0].classList.add("ocultaAyudaRCLV");
				v.ayudaRCLV[1].classList.remove("ocultaAyudaRCLV");
			}
		},
		sinRCLV: () => {
			// Muestra u oculta el sector RCLV
			v.checkRCLV.checked ? v.selectsRCLV.classList.add("ocultar") : v.selectsRCLV.classList.remove("ocultar");
			// Fin
			return;
		},
		edicJesusNinguno: () => {
			// Acciones si el valor es 'Ninguno' o 'Jesús'
			v.inputsRCLV.forEach((inputRCLV, indice) => {
				inputRCLV.value == "1" || (indice == 0 && inputRCLV.value == "11")
					? v.linksRCLV_Edic[indice].classList.add("ocultar")
					: v.linksRCLV_Edic[indice].classList.remove("ocultar");
			});
			// Fin
			return;
		},
	};
	let interaccionesApMar = (campo) => {
		// Cambia el contenido del Personaje o Hecho
		// Acciones si se cambia el personaje
		if (campo == "personaje_id") {
			// Obtiene del personaje, el 'id' de la Aparición Mariana
			for (var opcion of v.opcionesPers) if (opcion.value == v.inputsRCLV[0].value) break;
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
			v.opcionesPers.forEach((opcion) => {
				if (opcion.className.includes("AM" + v.inputsRCLV[1].value)) opcion.classList.remove("ocultar");
				else opcion.classList.add("ocultar");
			});
			// Cambia el contenido del Personaje
			verificaUnaSolaOpcionRCLV();
		}
	};
	let urlRCLV = (campo) => {
		// Variables
		let ocurrio = v.ocurrioSI.checked ? "1" : v.ocurrioNO.checked ? "0" : "";
		let checkRCLV = v.checkRCLV.checked;
		// Agrega el valor del campo 'sin' o de los demás campos
		let url = "";
		checkRCLV
			? (url += campo + "=on" + "&")
			: v.camposRCLV.forEach((n, i) => {
					url += n + "=" + v.inputsRCLV[i].value + "&";
			  });
		// Agrega 'ocurrió'
		if (ocurrio) url += "ocurrio=" + ocurrio;
		// Fin
		return url;
	};
	let guardaLosValoresEnSessionCookies = () => {
		let params = obtieneLosDatos();
		// Guardar los valores en session y cookies
		if (params.length) fetch(v.rutaGuardaDatosAdics + params);
		// Fin
		return;
	};

	// ADD EVENT LISTENERS *********************************
	// Averigua si hubieron cambios
	v.form.addEventListener("change", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = encodeURIComponent(e.target.value);
		let datosUrl = "";

		// Particularidades
		// 1. Para campos 'cfc', 'ocurrió', 'sinRCLV'
		if (campo == "cfc" || campo == "ocurrio" || campo == "sinRCLV") impactoVisualEnRCLV[campo]();
		if (campo == "cfc") {
			// Le asigna a los selects un valor estandar
			v.selectPers.value = "1";
			v.selectHecho.value = "1";
		}
		// 2. Para campos 'RCLV'
		if (v.camposRCLV.includes(campo)) impactoVisualEnRCLV.edicJesusNinguno();
		if (campo == "sinRCLV" || v.camposRCLV.includes(campo)) v.errorRCLV.classList.remove("ocultar");

		// Prepara los datos a validar
		if ([...v.camposRCLV, "sinRCLV"].includes(campo)) datosUrl += urlRCLV(campo);
		else datosUrl += campo + "=" + valor;

		// Valida errores
		await muestraLosErrores(datosUrl, true);
		// Actualiza botón Submit
		actualizaBotonSubmit();
	});

	// Links a RCLV - Alta
	v.linksRCLV_Alta.forEach((link) => {
		link.addEventListener("click", () => {
			// Guardar los valores en Session y Cookies
			guardaLosValoresEnSessionCookies();
			// Obtiene la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Para ir a la vista RCLV
			window.location.href = "/rclv/agregar/" + entidad + "&origen=DA";
		});
	});
	// Links a RCLV - Edición
	v.linksRCLV_Edic.forEach((link, i) => {
		link.addEventListener("click", () => {
			// Guardar los valores en Session y Cookies
			guardaLosValoresEnSessionCookies();
			// Obtiene la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Obtiene el RCLV_id
			let id = "&id=" + v.inputsRCLV[i].value;
			// Para ir a la vista RCLV
			window.location.href = "/rclv/edicion/" + entidad + id + "&origen=DA";
		});
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

	// STATUS INICIAL
	statusInicial();
});

let entidades = (link) => {
	return link.className.includes("personaje") ? "personajes" : link.className.includes("hecho") ? "hechos" : "valores";
};
