"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Variables generales
		form: document.querySelector("#dataEntry"),
		submit: document.querySelector("#dataEntry #submit"),
		inputs: document.querySelectorAll(".inputError .input"),

		// 1a columna - cfc y bhr
		cfcSI: document.querySelector("input[name='bhr']#bhrSI"),
		cfcNO: document.querySelector("input[name='bhr']#bhrNO"),
		bhrSI: document.querySelector("input[name='bhr']#bhrSI"),
		bhrNO: document.querySelector("input[name='bhr']#bhrNO"),
		radioSI: document.querySelectorAll(".inputError .radioSI"),
		radioNO: document.querySelectorAll(".inputError .radioNO"),

		// RCLV
		checkRCLV: document.querySelector("#RCLV #checkBox input"),
		selectsRCLV: document.querySelector("#RCLV #selectsRCLV"),
		errorRCLV: document.querySelector(".inputError #errorRCLV"),
		inputsRCLV: document.querySelectorAll("#RCLV .inputError .input"),

		// RCLV - Sectores
		sectorRCLV: document.querySelector("#RCLV"),
		sectorPers: document.querySelector("#RCLV #personaje_id"),
		sectorHecho: document.querySelector("#RCLV #hecho_id"),
		sectorValor: document.querySelector("#RCLV #tema_id"),

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

		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
	};
	let rutas = {
		validar: "/producto/agregar/api/valida/datos-adicionales/?",
		guardaDatosAdics: "/producto/agregar/api/DA-guarda-datos-adics/?",
	};
	const camposRCLV = ["personaje_id", "hecho_id", "tema_id"];

	// Otras variables
	let camposError = ["cfc", "bhr", "tipoActuacion_id", "RCLV"];
	DOM.opcionesPers = [];
	for (let grupo of DOM.optgroupPers) DOM.opcionesPers.push(grupo.children);
	DOM.opcionesHechos = [];
	for (let grupo of DOM.optgroupHecho) DOM.opcionesHechos.push(grupo.children);

	// Comunes a todos los campos
	let funcionesGrales = {
		obtieneLosDatos: () => {
			// Variables
			let datosUrl = "";

			// Busca todos los valores 'radio'
			DOM.radioSI.forEach((radioSI, i) => {
				let respuesta = radioSI.checked ? "1" : DOM.radioNO[i].checked ? "0" : "";
				datosUrl += radioSI.name + "=" + respuesta + "&";
				if (radioSI.name == "bhr" && respuesta) DOM.errorRCLV.classList.remove("ocultar");
			});

			// Busca el checkbox de RCLV
			if (DOM.checkRCLV.checked) datosUrl += "sinRCLV=on&";

			//Busca todos los valores 'input'
			DOM.inputs.forEach((input, i) => {
				// Particularidad para RCLV
				if (camposRCLV.includes(input.name) && DOM.checkRCLV.checked) return;

				// Agrega el campo y el valor
				datosUrl += input.name + "=" + encodeURIComponent(input.value) + "&";
			});

			// Fin
			return datosUrl;
		},
		muestraLosErrores: async (datos, mostrarIconoError) => {
			let errores = await fetch(rutas.validar + datos).then((n) => n.json());
			// return;
			camposError.forEach((campo, indice) => {
				if (errores[campo] !== undefined) {
					DOM.mensajesError[indice].innerHTML = errores[campo];
					// Acciones en función de si hay o no mensajes de error
					errores[campo]
						? DOM.iconosError[indice].classList.add("error")
						: DOM.iconosError[indice].classList.remove("error");
					errores[campo] && mostrarIconoError
						? DOM.iconosError[indice].classList.remove("ocultar")
						: DOM.iconosError[indice].classList.add("ocultar");
					errores[campo]
						? DOM.iconosOK[indice].classList.add("ocultar")
						: DOM.iconosOK[indice].classList.remove("ocultar");
				}
			});
			// Fin
			return;
		},
		actualizaBotonSubmit: () => {
			// Detectar la cantidad de 'errores' ocultos
			let hayErrores = Array.from(DOM.iconosError)
				.map((n) => n.className)
				.some((n) => n.includes("error"));
			// Consecuencias
			hayErrores ? DOM.submit.classList.add("inactivo") : DOM.submit.classList.remove("inactivo");
		},
		statusInicial: async function (mostrarIconoError) {
			// Variables
			let datosUrl = this.obtieneLosDatos();
			// Consecuencias de la validación de errores
			await this.muestraLosErrores(datosUrl, mostrarIconoError);
			this.actualizaBotonSubmit();
			// Impactos en RCLV
			for (let metodo in impactoVisualEnRCLV) impactoVisualEnRCLV[metodo]();
			// Fin
			return;
		},
		submitForm: async function (e) {
			e.preventDefault();
			if (DOM.submit.className.includes("inactivo")) this.statusInicial(true);
			else DOM.form.submit();
		},
		urlRCLV: (campo) => {
			// Variables
			let bhr = DOM.bhrSI.checked ? "1" : DOM.bhrNO.checked ? "0" : "";
			let checkRCLV = DOM.checkRCLV.checked;

			// Agrega el valor del campo 'sin' o de los demás campos
			let url = "";
			checkRCLV
				? (url += campo + "=on" + "&")
				: camposRCLV.forEach((n, i) => (url += n + "=" + DOM.inputsRCLV[i].value + "&"));

			// Agrega 'ocurrió'
			if (bhr) url += "bhr=" + bhr;

			// Fin
			return url;
		},
		guardaLosValoresEnSessionCookies: function () {
			let params = this.obtieneLosDatos();
			// Guardar los valores en session y cookies
			if (params.length) fetch(rutas.guardaDatosAdics + params);
			// Fin
			return;
		},
	};
	// RCLV
	let impactoVisualEnRCLV = {
		cfc: () => {
			// Variables
			const categoria = cfcSI.checked ? "CFC" : cfcNO.checked ? "VPC" : "";
			if (categoria) console.log(categoria);

			// Si no hay respuesta, agrega el 'oculta' de RCLVs
			if (!categoria) return DOM.sectorRCLV.classList.add("ocultaCfc");

			// Opciones para Personajes
			DOM.selectPers.innerHTML = "";
			console.log(...DOM.opcionesPers.map((n) => n.length));

			DOM.optgroupPers.forEach((grupo, i) => {
				// Acciones si el grupo tiene la clase
				if (grupo.className.includes(categoria)) {
					// Borra todas las opciones y agrega las que van
					console.log(grupo);
					grupo.innerHTML = "";
					console.log(...DOM.opcionesPers.map((n) => n.length));
					for (let opcion of DOM.opcionesPers[i])
						if (opcion.className.includes(categoria)) {
							grupo.appendChild(opcion);
						}
					// Si tiene opciones, agrega el grupo
					if (grupo.childElementCount) DOM.selectPers.appendChild(grupo);
				}
			});

			// Opciones para Hechos
			DOM.selectHecho.innerHTML = "";
			DOM.optgroupHecho.forEach((grupo, i) => {
				// Acciones si el grupo tiene la clase
				if (grupo.className.includes(categoria)) {
					// Borra todas las opciones y agrega las que van
					grupo.innerHTML = "";
					for (let opcion of DOM.opcionesHechos[i]) if (opcion.className.includes(categoria)) grupo.appendChild(opcion);
					// Si tiene opciones, agrega el grupo
					if (grupo.childElementCount) DOM.selectHecho.appendChild(grupo);
				}
			});

			// Quita el 'oculta' de RCLVs
			DOM.sectorRCLV.classList.remove("ocultaCfc");
			// Fin
			return;
		},
		bhr: () => {
			// Averigua si es verdadero o falso
			const bhrSI = DOM.bhrSI.checked && !DOM.bhrNO.checked;
			const bhrNO = DOM.bhrNO.checked && !DOM.bhrSI.checked;

			// Oculta o muestra el sector de RCLVs
			bhrSI || bhrNO ? DOM.sectorRCLV.classList.remove("ocultaOcurrio") : DOM.sectorRCLV.classList.add("ocultaOcurrio");

			// Acciones si ocurrió
			if (bhrSI) {
				// Muestra 'personaje_id' y 'hecho_id'
				DOM.sectorPers.classList.remove("ocultar");
				DOM.sectorHecho.classList.remove("ocultar");
				// Ayudas
				DOM.ayudaRCLV[0].classList.remove("ocultaAyudaRCLV");
				DOM.ayudaRCLV[1].classList.add("ocultaAyudaRCLV");
			}
			// Acciones si no ocurrió
			if (bhrNO) {
				// Oculta 'personaje_id' y 'hecho_id'
				DOM.sectorPers.classList.add("ocultar");
				DOM.sectorHecho.classList.add("ocultar");
				// Ayudas
				DOM.ayudaRCLV[0].classList.add("ocultaAyudaRCLV");
				DOM.ayudaRCLV[1].classList.remove("ocultaAyudaRCLV");
				// Valores de RCLV
				DOM.selectPers.value = 1;
				DOM.selectHecho.value = 1;
			}
		},
		sinRCLV: () => {
			// Muestra u oculta el sector RCLV
			DOM.checkRCLV.checked ? DOM.selectsRCLV.classList.add("ocultar") : DOM.selectsRCLV.classList.remove("ocultar");
			// Fin
			return;
		},
		edicJesusNinguno: () => {
			// Acciones si el valor es 'Ninguno' o 'Jesús'
			DOM.inputsRCLV.forEach((inputRCLV, indice) => {
				inputRCLV.value == "1" || (indice == 0 && inputRCLV.value == "11")
					? DOM.linksRCLV_Edic[indice].classList.add("ocultar")
					: DOM.linksRCLV_Edic[indice].classList.remove("ocultar");
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
			for (var opcion of DOM.opcionesPers) if (opcion.value == DOM.inputsRCLV[0].value) break;
			let clases = opcion.className.split(" ");
			let indice = clases.indexOf("AMA");
			clases.splice(indice, 1);
			let id = clases[indice].slice(2);
			// Cambia el contenido del Hecho
			DOM.inputsRCLV[1].value = id;
		}
		// Acciones si se cambia el hecho
		if (campo == "hecho_id") {
			// Muestra los personajes que hayan presenciado la aparición y oculta los demás
			for (let opcion of DOM.opcionesPers) {
				if (opcion.className.includes("AM" + DOM.inputsRCLV[1].value)) opcion.classList.remove("ocultar");
				else opcion.classList.add("ocultar");
			}
			// Cambia el contenido del Personaje
			verificaUnaSolaOpcionRCLV();
		}
	};

	// ADD EVENT LISTENERS *********************************
	// Averigua si hubieron cambios
	DOM.form.addEventListener("change", async (e) => {
		// Define los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = encodeURIComponent(e.target.value);
		let datosUrl = "";

		// Particularidades
		// 1. Para campos 'cfc', 'ocurrió', 'sinRCLV'
		if (campo == "cfc" || campo == "bhr" || campo == "sinRCLV") impactoVisualEnRCLV[campo]();
		if (campo == "cfc") {
			// Le asigna a los selects un valor estandar
			DOM.selectPers.value = "1";
			DOM.selectHecho.value = "1";
		}

		// 2. Para campos 'RCLV'
		if (camposRCLV.includes(campo)) impactoVisualEnRCLV.edicJesusNinguno();
		if (campo == "sinRCLV" || camposRCLV.includes(campo)) DOM.errorRCLV.classList.remove("ocultar");

		// Prepara los datos a validar
		if ([...camposRCLV, "sinRCLV", "bhr"].includes(campo)) datosUrl += funcionesGrales.urlRCLV(campo);
		else datosUrl += campo + "=" + valor;

		// Valida errores
		await funcionesGrales.muestraLosErrores(datosUrl, true);
		// Actualiza botón Submit
		funcionesGrales.actualizaBotonSubmit();
	});

	// Links a RCLV - Alta
	DOM.linksRCLV_Alta.forEach((link) => {
		link.addEventListener("click", () => {
			// Guardar los valores en Session y Cookies
			funcionesGrales.guardaLosValoresEnSessionCookies();
			// Obtiene la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Para ir a la vista RCLV
			location.href = "/rclv/agregar/" + entidad + "&origen=DA";
		});
	});
	// Links a RCLV - Edición
	DOM.linksRCLV_Edic.forEach((link, i) => {
		link.addEventListener("click", () => {
			// Guardar los valores en Session y Cookies
			funcionesGrales.guardaLosValoresEnSessionCookies();
			// Obtiene la RCLV_entidad
			let entidad = "?entidad=" + entidades(link);
			// Obtiene el RCLV_id
			let id = "&id=" + DOM.inputsRCLV[i].value;
			// Para ir a la vista RCLV
			location.href = "/rclv/edicion/" + entidad + id + "&origen=DA";
		});
	});

	// Submit
	DOM.form.addEventListener("submit", async (e) => {
		funcionesGrales.submitForm(e);
	});
	DOM.submit.addEventListener("click", async (e) => {
		funcionesGrales.submitForm(e);
	});
	DOM.submit.addEventListener("keydown", async (e) => {
		if (e.key == "Enter" || e.key == "Space") funcionesGrales.submitForm(e);
	});

	// STATUS INICIAL
	funcionesGrales.statusInicial();
});

let entidades = (link) => {
	return link.className.includes("personaje") ? "personajes" : link.className.includes("hecho") ? "hechos" : "temas";
};
