"use strict";
window.addEventListener("load", async () => {
	// VARIABLES -----------------------------------------------------------------------
	let errores;
	let DOM = {
		// Datos del formulario
		form: document.querySelector("form"),
		inputsSimples: document.querySelectorAll(".inputError .input"),
		inputsTodos: document.querySelectorAll(".inputError .input, .inputError input[type='radio']"),

		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosAdvertencia: document.querySelectorAll(".inputError .fa-triangle-exclamation"),
		mensajesError: document.querySelectorAll(".inputError .fa-circle-xmark .mensajeError"),
		mensajesAdvertencia: document.querySelectorAll(".inputError .fa-triangle-exclamation .mensajeError"),

		// Variables de país
		paisesID: document.querySelector("#paises_id input[name='paises_id']"), // Lugar donde almacenar los ID
		paisesMostrar: document.querySelector("#paises_id #mostrarPaises"), // Lugar donde mostrar los nombres
		paisesSelect: document.querySelector("#paises_id select"),

		// Temas de avatar
		imgsAvatar: document.querySelectorAll("#imgDerecha.inputError .imgAvatar"),
		imgAvatar: document.querySelector("#imgDerecha.inputError #imgEdicN.imgAvatar"),
		inputAvatar: document.querySelector("#imgDerecha.inputError #inputImagen.input"),

		// Botones
		botonesActivarVersion: document.querySelectorAll("#cuerpo .flechas .activaVersion"),
		botonGuardar: document.querySelector("#cuerpo .flechas #guardar"),
		botonesEliminar: document.querySelectorAll("#cuerpo .flechas .elimina"),
		botones: {
			edicN: document.querySelectorAll("#cuerpo .flechas .edicN"),
			edicG: document.querySelectorAll("#cuerpo .flechas .edicG"),
		},

		// Varios
		actores: document.querySelector(".inputError input[name=actores"),
		flechasDiferencia: document.querySelectorAll(".inputError .fa-arrow-right-long"),
		linksRCLV: document.querySelectorAll(".inputError i.linkRCLV"),
		iconosAyuda: document.querySelectorAll(".inputError .ayudaClick"),
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
	};
	let v = {
		// Pointer del producto
		entidad: new URL(location.href).searchParams.get("entidad"),
		prodID: new URL(location.href).searchParams.get("id"),
		origen: new URL(location.href).searchParams.get("origen"),
		paisesListado: Array.from(document.querySelectorAll("#paises_id option")).map((n) => {
			return {id: n.value, nombre: n.innerHTML};
		}),

		// Versiones de datos
		versiones: ["edicN", "edicG", "orig"],
		versionActual: "edicN",
		estamosEnEdicNueva: true,
		versionAnt: null, // Se usa más adelante, no se debe borrar
		esImagen: true,

		// Varias
		camposError: Array.from(document.querySelectorAll(".errores")).map((n) => n.id),
		camposTodos: [...new Set(Array.from(DOM.inputsTodos).map((n) => n.name))],
		avatarInicial: DOM.imgAvatar.src,
	};
	let rutas = {
		validar: "/producto/api/valida/?",
		versiones: "/producto/api/obtiene-original-y-edicion/?entidad=" + v.entidad + "&id=" + v.prodID,
		variablesBE: "/producto/api/obtiene-variables-del-back-end/?entidad=" + v.entidad + "&id=" + v.prodID,
	};
	v = {...v, ...(await fetch(rutas.variablesBE).then((n) => n.json()))};

	// Obtiene versiones ORIGINAL, EDICION GUARDADA, EDICION NUEVA
	let version = await versiones(rutas.versiones);
	const statusRegistro_id = version.orig.statusRegistro_id;

	// Funciones Data-Entry
	let FN = {
		// Grupo "Novedades de Data Entry"
		actualizaVarios: async function () {
			this.obtieneLosValoresEdicN();
			this.senalaLasDiferencias();
			await this.averiguaMuestraLosErrores();
			this.actualizaBotones();
		},
		obtieneLosValoresEdicN: () => {
			// Obtiene los valores
			let inputsChecked = document.querySelectorAll(".inputError input[type='radio']:checked");
			let inputs = Array.prototype.concat.call(...DOM.inputsSimples, ...inputsChecked);

			// Almacena los valores
			version.edicN = {};
			for (let input of inputs) {
				if (input.name != "avatar") version.edicN[input.name] = input.value;
				else version.edicN.avatar = DOM.inputAvatar.files[0] ? DOM.inputAvatar.files[0].name : version.edicG.avatar;
			}

			// Fin
			return;
		},
		senalaLasDiferencias: () => {
			// Variables
			const referencia = v.versionActual == "edicN" ? "edicG" : "orig";

			// Marca dónde están las diferencias con la versión original
			v.camposTodos.forEach((campo, i) => {
				v.versionActual != "orig" &&
				version[v.versionActual][campo] != version[referencia][campo] &&
				(version[v.versionActual][campo] || version[referencia][campo])
					? DOM.flechasDiferencia[i].classList.remove("ocultar")
					: DOM.flechasDiferencia[i].classList.add("ocultar");
			});
		},
		averiguaMuestraLosErrores: async () => {
			// Obtiene los valores simples más los chequeados
			let inputsChecked = document.querySelectorAll(".inputError input[type='radio']:checked");
			let inputsResp = Array.prototype.concat.call(...DOM.inputsSimples, ...inputsChecked);
			let camposResp = Array.from(inputsResp).map((n) => n.name);

			// Prepara la información
			let objeto = "entidad=" + v.entidad + "&id=" + v.prodID + "&statusRegistro_id=" + statusRegistro_id;
			if (v.coleccion_id) objeto += "&coleccion_id=" + v.coleccion_id;
			for (let campo of v.camposTodos) {
				let indice = camposResp.indexOf(campo);
				let valor = indice > -1 ? inputsResp[indice].value : "";
				if (campo != "avatar") objeto += "&" + campo + "=" + valor;
			}
			if (v.versionActual == "edicN" && (DOM.inputAvatar.value || !v.esImagen)) {
				objeto += "&avatar=" + DOM.inputAvatar.value;
				if (DOM.inputAvatar.value) {
					objeto += "&esImagen=" + (v.esImagen ? "SI" : "NO");
					objeto += "&tamano=" + DOM.inputAvatar.files[0].size;
				}
			}

			// Averigua los errores
			errores = await fetch(rutas.validar + encodeURI(objeto)).then((n) => n.json());

			// Actualiza los errores
			v.camposError.forEach((campo, indice) => {
				// Variables
				const mensaje = errores[campo] ? errores[campo] : "";
				const mensajeSensible = ![v.inputVacio, v.selectVacio, v.rclvSinElegir].includes(mensaje);
				const error = mensaje && mensajeSensible;
				const advertencia = mensaje && !error;

				// Actualiza los mensajes
				DOM.mensajesError[indice].innerHTML = error ? mensaje : "";
				DOM.mensajesAdvertencia[indice].innerHTML = advertencia ? mensaje : "";

				// Acciones en función de si hay o no mensajes de error
				error ? DOM.iconosError[indice].classList.remove("ocultar") : DOM.iconosError[indice].classList.add("ocultar");
				advertencia
					? DOM.iconosAdvertencia[indice].classList.remove("ocultar")
					: DOM.iconosAdvertencia[indice].classList.add("ocultar");
			});

			// Fin
			return;
		},
		actualizaBotones: () => {
			// Acciones sobre la edición guardada
			if (version.edicG_existe) {
				DOM.botonesActivarVersion[1].classList.remove("inactivoVersion");
				if (!version.origPendAprobar) DOM.botonesEliminar[1].classList.remove("inactivoVersion");
				else DOM.botonesEliminar[1].classList.add("inactivoVersion");
			} else {
				DOM.botonesActivarVersion[1].classList.add("inactivoVersion");
				DOM.botonesEliminar[1].classList.add("inactivoVersion");
			}

			// Averigua si los campos input son iguales entre la edicN y su referente anterior
			const comparativa = version.edicG_existe ? version.edicG : version.orig;
			let sonIguales = true;
			for (let campo of v.camposTodos)
				if (version.edicN[campo] != comparativa[campo] && (version.edicN[campo] || comparativa[campo]))
					sonIguales = false;

			// Averigua si la imagen avatar es igual
			if (sonIguales) sonIguales = DOM.imgAvatar.src == v.avatarInicial;

			// Si los campos 'input' y la imagen avatar son iguales --> inactiva Guardar y Eliminar
			if (sonIguales) for (let edic of DOM.botones.edicN) edic.classList.add("inactivoVersion");
			// Acciones si los campos 'input' o la imagen avatar son distintos
			else {
				// Activa el botón Eliminar
				DOM.botonesEliminar[0].classList.remove("inactivoVersion");

				// Activa / Inactiva Guardar, dependiendo de si hay errores en la edición nueva
				errores.sensible
					? DOM.botonGuardar.classList.add("inactivoVersion")
					: DOM.botonGuardar.classList.remove("inactivoVersion");
			}

			// Fin
			return;
		},
		// Otros
		accionesPorCambioDeVersion: async function () {
			// Reemplaza los valores de 'input' e impide/permite que el usuario haga cambios según la versión
			(() => {
				// Variables
				v.estamosEnEdicNueva = v.versionActual == "edicN";
				// Rutina para cada campo
				for (let input of DOM.inputsTodos) {
					// Reemplaza los valores que no sean el avatar
					if (input.name != "avatar") {
						if (input.type != "radio")
							input.value =
								version[v.versionActual][input.name] !== undefined &&
								version[v.versionActual][input.name] !== null
									? version[v.versionActual][input.name]
									: "";
						else if (input.type == "radio") input.checked = input.value == version[v.versionActual][input.name];
					}
					// Oculta y muestra los avatar que correspondan
					else
						DOM.imgsAvatar.forEach((imgAvatar, indice) => {
							v.versiones[indice] == v.versionActual
								? imgAvatar.classList.remove("ocultar")
								: imgAvatar.classList.add("ocultar");
						});
					// Impide/permite que el usuario haga cambios según la versión
					input.disabled = !v.estamosEnEdicNueva && !input.checked;
					if (input.name == "paises_id") {
						DOM.paisesMostrar.disabled = !v.estamosEnEdicNueva;
						DOM.paisesSelect.disabled = !v.estamosEnEdicNueva;
					}
				}
				// Fin
				return;
			})();
			// Actualiza los nombres de país
			this.actualizaPaisesNombre();
			// Muestra/oculta los íconos de RCLV, ayuda y error
			(() => {
				// Muestra/oculta los íconos de RCLV
				for (let link of DOM.linksRCLV)
					v.estamosEnEdicNueva ? link.classList.remove("inactivo") : link.classList.add("inactivo");
				// Muestra/oculta los íconos de ayuda
				for (let iconoAyuda of DOM.iconosAyuda)
					v.estamosEnEdicNueva ? iconoAyuda.classList.remove("inactivo") : iconoAyuda.classList.add("inactivo");
				// Muestra/oculta los íconos de error
				for (let iconoError of DOM.iconosError)
					v.estamosEnEdicNueva ? iconoError.classList.remove("inactivo") : iconoError.classList.add("inactivo");
				// Fin
				return;
			})();
			// Señala las diferencias con la versión original
			this.senalaLasDiferencias();
			// Muestra los errores
			await this.averiguaMuestraLosErrores();
			// Fin
			return;
		},
		actualizaPaisesID: () => {
			// Variables
			let paisID = DOM.paisesSelect.value;
			// Verificar si figura en paisesID
			if (paisID == "borrar") {
				DOM.paisesSelect.value = "";
				DOM.paisesMostrar.value = "";
				DOM.paisesID.value = "";
				return;
			}
			let agregar = !DOM.paisesID.value.includes(paisID);
			let aux = DOM.paisesID.value.length ? DOM.paisesID.value.split(" ") : [];
			if (agregar && aux.length >= 5) return; // Limita la cantidad máxima de países a 5
			if (agregar) aux.push(paisID); // Agrega el país
			else aux.splice(aux.indexOf(paisID), 1); // Quita el país
			DOM.paisesID.value = aux.join(" "); // Actualiza el input
			// Fin
			return;
		},
		actualizaPaisesNombre: () => {
			// Actualiza los países a mostrar
			let paisesNombre = [];
			// Convertir 'IDs' en 'nombres'
			if (DOM.paisesID.value) {
				let paises_idArray = DOM.paisesID.value.split(" ");
				paises_idArray.forEach((pais_id) => {
					let paisNombre = v.paisesListado.find((n) => n.id == pais_id).nombre;
					if (paisNombre) paisesNombre.push(paisNombre);
				});
			}
			// Convertir array en string
			DOM.paisesMostrar.value = paisesNombre.join(", ");
			// Fin
			return;
		},
	};

	// ADD EVENT LISTENERS --------------------------------------------------
	// Revisa los campos
	DOM.form.addEventListener("input", async (e) => {
		// Si la versión actual no es la esperada para 'inputs', interrumpe
		if (v.versionActual != v.versiones[0]) return;

		// Validaciones estándar (función genérica)
		amplio.restringeCaracteres(e);

		// Acciones si se cambió el país
		if (e.target == DOM.paisesSelect) {
			FN.actualizaPaisesID();
			FN.actualizaPaisesNombre();
		}

		// Acciones si se cambió el tipo de actuación
		if (e.target.name == "tipoActuacion_id")
			DOM.actores.value =
				e.target.value == v.anime_id ? "Dibujos Animados" : e.target.value == v.documental_id ? "Documental" : "";

		// Acciones si se cambió el avatar
		if (e.target == DOM.inputAvatar) await revisaAvatar({DOM, v, version, FN});
		else FN.actualizaVarios();

		// Fin
		return;
	});

	// Botones - 1. Activa las versiones
	DOM.botonesActivarVersion.forEach((boton, indice) => {
		boton.addEventListener("click", () => {
			// Interrumpe si las versiones son iguales
			if (v.versionActual == v.versiones[indice]) return;
			// Interrumpe si el botón está inactivo
			if (boton.className.includes("inactivoVersion")) return;
			// Cambia la versión
			let aux = v.versionActual;
			v.versionActual = v.versiones[indice];
			// Cambia los valores
			FN.accionesPorCambioDeVersion();
			// Cambia el boton activo
			DOM.botonesActivarVersion.forEach((revisar, i) => {
				if (i != indice) revisar.classList.remove("activo");
				else revisar.classList.add("activo");
			});
			// Cambiar la versión anterior
			v.versionAnt = aux;
		});
	});
	// Botones - 2. Guarda los cambios
	DOM.form.addEventListener("submit", async (e) => {
		// Si el botón está inactivo, impide el 'submit'
		if (DOM.botonGuardar.className.includes("inactivo")) e.preventDefault();
	});
	// Botones - 3. Elimina la edición
	DOM.botonesEliminar.forEach((boton, indice) => {
		boton.addEventListener("click", async () => {
			// Si está inactivo aborta la operación
			if (boton.className.includes("inactivo")) return;

			// 1. Acciones exclusivas para edicN
			if (!indice) {
				// Vuelve al status original la condición del avatar
				v.esImagen = true;

				// Elimina Session y Cookies
				fetch("/producto/api/edicion-nueva/eliminar");
			}
			// 2. Acciones exclusivas para edicG
			else {
				// Actualiza la información de que ya no existe la edicG
				version.edicG_existe = false;

				// Elimina los datos de edicG en la BD
				await fetch("/producto/api/edicion-guardada/eliminar/?entidad=" + v.entidad + "&id=" + v.prodID);

				// Recarga la vista para actualizar el url sin el ID de la edición
				const origen = v.origen ? "&origen=" + v.origen : "";
				location.href = location.pathname + "?entidad=" + v.entidad + "&id=" + v.prodID + origen;
			}

			// Vuelve al status de la versión anterior
			version[indice ? "edicG" : "edicN"] = {...version[indice ? "orig" : "edicG"]};

			// Actualiza el avatar
			DOM.imgsAvatar[indice].src = DOM.imgsAvatar[indice + 1].src;

			// Tareas finales
			FN.accionesPorCambioDeVersion();
			FN.actualizaBotones();
		});
	});

	// Startup
	FN.obtieneLosValoresEdicN();
	await FN.accionesPorCambioDeVersion(); // Hace falta el await para leer los errores en el paso siguiente
	FN.actualizaBotones();
});

// Estas funciones deben estar afuera, para estar disponibles para las variables
let versiones = async (rutaVersiones) => {
	// Obtiene las versiones original y de edición
	let [orig, edicG] = await fetch(rutaVersiones).then((n) => n.json());

	// Procesa la versión de edición guardada
	let edicG_existe = !!edicG.id;
	edicG = {...orig, ...edicG};

	// Averigua si el original está pendiente de ser aprobado
	let origPendAprobar = orig.statusRegistro.creados;

	// Fin
	return {orig, edicG, edicN: {}, edicG_existe, origPendAprobar};
};
