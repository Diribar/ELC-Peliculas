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
		// RCLV - Sectores
		sectorRCLV: document.querySelector("#RCLV"),
		sectorPers: document.querySelector("#RCLV #personaje_id"),
		sectorHecho: document.querySelector("#RCLV #hecho_id"),
		sectorValor: document.querySelector("#RCLV #valor_id"),
		// RCLV - Selects y Opciones
		selectPers: document.querySelector("select[name='personaje_id']"),
		selectHecho: document.querySelector("select[name='hecho_id']"),
		opcionesPers: document.querySelectorAll("select[name='personaje_id'] option"),
		opcionesHecho: document.querySelectorAll("select[name='hecho_id'] option"),
		// RCLV - Varios
		ayudaRCLV: document.querySelectorAll("#RCLV .ocultaAyudaRCLV"),
		iconosOK_RCLV: document.querySelectorAll("#RCLV .inputError .fa-circle-check"),
		iconosError_RCLV: document.querySelectorAll("#RCLV .inputError .fa-circle-xmark"),
		linkPersAlta: document.querySelector(".inputError .linkRCLV.alta"),
		linksRCLVEdic: document.querySelectorAll(".inputError .linkRCLV.edicion"),
		// Ruta
		rutaValidar: "/producto/agregar/api/valida/datos-personalizados/?",
	};
	let campos = [
		...Array.from(v.inputs).map((n) => n.name),
		...Array.from(v.radioSI).map((n) => n.name),
		"tipo_actuacion_id",
	];

	// RCLV
	v.inputsRCLV = document.querySelectorAll("#RCLV .inputError .input");
	v.checkRCLV = document.querySelector("#RCLV #checkbox input");
	v.selectsRCLV = document.querySelector("#RCLV #selectsRCLV");

	// FUNCIONES *******************************************
	// Comunes a todos los campos
	let statusInicial = async (mostrarIconoError) => {
		// Variables
		let datosUrl = "";
		//Busca todos los valores 'input'
		v.inputs.forEach((input, i) => {
			// Caracter de unión para i > 0
			if (i) datosUrl += "&";
			// Particularidad para RCLV
			if (v.camposRCLV.includes(input.name) && v.checkRCLV.checked) return;
			// Agrega el campo y el valor
			datosUrl += input.name + "=" + encodeURIComponent(input.value);
		});
		//Busca todos los valores 'radio'
		v.radioSI.forEach((radioSI, i) => {
			// Variables
			let respuesta = radioSI.checked ? "SI" : v.radioNO[i].checked ? "NO" : "";
			// Acción
			datosUrl += "&" + radioSI.name + "=" + respuesta;
		});
		//Busca todos los valores 'tipoActuacion'
		let respuesta = "";
		for (let tipo of v.tiposActuacion) if (tipo.checked) respuesta = tipo.value;
		datosUrl += "&tipo_actuacion_id=" + respuesta;
		// Consecuencias de las validaciones de errores
		await muestraLosErrores(datosUrl, mostrarIconoError);
		actualizaBotonSubmit();
		// Impactos en RCLV
		for (let metodo in impactoVisualEnRCLV) impactoVisualEnRCLV[metodo]();
		// Fin
		return;
	};
	let muestraLosErrores = async (datos, mostrarIconoError) => {
		console.log(datos);
		return;
		let errores = await fetch(v.rutaValidar + datos).then((n) => n.json());
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
	// RCLV
	let impactoVisualEnRCLV = {
		cfc: () => {
			// Variables
			let categoria = cfcSI.checked ? "CFC" : cfcNO.checked ? "VPC" : "";
			// Si no hay respuesta, agrega el 'oculta' de RCLVs
			if (!categoria) v.sectorRCLV.classList.add("invisibleCfc");
			// Acciones si hay respuesta
			else {
				// 1. Personajes: muestra solamente las opciones de la categoría (CFC / VPC)
				v.selectPers.innerHTML = "";
				for (let opcion of v.opcionesPers)
					if (opcion.classList.contains(categoria) || opcion.value <= 2)
						v.selectPers.appendChild(opcion);
				// 2. Hechos: si la categoría es VPC, muestra solamente las opciones que no sean 'solo_cfc'
				v.selectHecho.innerHTML = "";
				for (let opcion of v.opcionesHecho)
					if (
						categoria == "CFC" ||
						(categoria == "VPC" && (opcion.classList.contains(categoria) || opcion.value <= 2))
					)
						v.selectHecho.appendChild(opcion);
				// Quita el 'oculta' de RCLVs
				v.sectorRCLV.classList.remove("invisibleCfc");
				// Fin
				return;
			}
		},
		ocurrio: () => {
			// Variables
			let ocurrio = ocurrioSI.checked ? "SI" : ocurrioNO.checked ? "NO" : "";

			// Oculta o muestra el sector de RCLVs
			ocurrio
				? v.sectorRCLV.classList.remove("invisibleOcurrio")
				: v.sectorRCLV.classList.add("invisibleOcurrio");

			// Acciones si ocurrió
			if (ocurrio == "SI") {
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
			if (ocurrio == "NO") {
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
			v.checkRCLV.checked
				? v.selectsRCLV.classList.add("ocultar")
				: v.selectsRCLV.classList.remove("ocultar");
			// Fin
			return;
		},
		edicJesusNinguno: () => {
			// Acciones si el valor es 'Ninguno' o 'Jesús'
			v.inputsRCLV.forEach((inputRCLV, indice) => {
				inputRCLV.value == "1" || (indice == 0 && inputRCLV.value == "11")
					? v.linksRCLVEdic[indice].classList.add("ocultar")
					: v.linksRCLVEdic[indice].classList.remove("ocultar");
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
				if (opcion.className.includes("AM" + v.inputsRCLV[1].value))
					opcion.classList.remove("ocultar");
				else opcion.classList.add("ocultar");
			});
			// Cambia el contenido del Personaje
			verificaUnaSolaOpcionRCLV();
		}
	};
	let urlRCLV = (campo) => {
		// Variables
		let ocurrio = v.ocurrioSI.checked ? "SI" : v.ocurrioNO.checked ? "NO" : "";
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

	// ADD EVENT LISTENERS *********************************
	// Averigua si hubieron cambios
	v.form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = encodeURIComponent(e.target.value);
		let datosUrl = "";

		// Particularidades 
		// 1. Para campos 'cfc', 'ocurrió', 'sinRCLV'
		if (campo == "cfc" || campo == "ocurrio" || campo == "sinRCLV") impactoVisualEnRCLV[campo]();
		// 2. Para campos 'RCLV'
		if (v.camposRCLV.includes(campo)) impactoVisualEnRCLV.edicJesusNinguno();

		// Prepara los datos a validar
		if ([...v.camposRCLV, "sinRCLV"].includes(campo)) datosUrl += urlRCLV(campo);
		else datosUrl += campo + "=" + valor;

		// Valida errores
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

	// STATUS INICIAL
	statusInicial();
});
