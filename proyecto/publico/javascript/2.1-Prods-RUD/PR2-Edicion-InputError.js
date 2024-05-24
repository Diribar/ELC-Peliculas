"use strict";
window.addEventListener("load", async () => {
	// Variables
	let errores;
	let DOM = {
		// Datos del formulario
		form: document.querySelector("form"),
		inputsSimples: document.querySelectorAll(".inputError .input"),
		inputsTodos: document.querySelectorAll(".inputError :is(.input, input[type='radio'])"),

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
		botonesActivarVersion: document.querySelectorAll("#cuerpo .iconos .activaVersion"),
		botonGuardar: document.querySelector("#cuerpo .iconos #guardar"),
		botonesEliminar: document.querySelectorAll("#cuerpo .iconos .elimina"),
		botones: {
			edicN: document.querySelectorAll("#cuerpo .iconos .edicN"),
			edicG: document.querySelectorAll("#cuerpo .iconos .edicG"),
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
		variablesBE: "/producto/api/edicion/obtiene-variables/?entidad=" + v.entidad + "&id=" + v.prodID,
	};
	v = {...v, ...(await fetch(rutas.variablesBE).then((n) => n.json()))};

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
			let inputsRadioChecked = document.querySelectorAll(".inputError input[type='radio']:checked");
			let inputs = Array.prototype.concat.call(...DOM.inputsSimples, ...inputsRadioChecked);

			// Almacena los valores
			version.edicN = {};
			for (let input of inputs) {
				if (input.name != "avatar")
					version.edicN[input.name] = input.type == "checkbox" ? (input.checked ? 1 : 0) : input.value;
				else version.edicN.avatar = DOM.inputAvatar.files[0] ? DOM.inputAvatar.files[0].name : version.edicG.avatar;
			}

			// Fin
			return;
		},
		senalaLasDiferencias: () => {
			// Variables
			const referencia = v.estamosEnEdicNueva ? "edicG" : "orig";

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
			let inputsRadioChecked = document.querySelectorAll(".inputError input[type='radio']:checked");
			let inputsResp = Array.prototype.concat.call(...DOM.inputsSimples, ...inputsRadioChecked);
			let camposResp = Array.from(inputsResp).map((n) => n.name);

			// Prepara la información
			let objeto = "entidad=" + v.entidad + "&id=" + v.prodID + "&statusRegistro_id=" + statusRegistro_id;
			if (v.coleccion_id) objeto += "&coleccion_id=" + v.coleccion_id;
			for (let campo of v.camposTodos) {
				const indice = camposResp.indexOf(campo);
				const valor =
					indice > -1
						? inputsResp[indice].value != "on"
							? inputsResp[indice].value
							: inputsResp[indice].checked
							? 1
							: 0
						: "";
				if (campo != "avatar") objeto += "&" + campo + "=" + valor;
			}
			if (v.estamosEnEdicNueva && (DOM.inputAvatar.value || !v.esImagen)) {
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
			// Si la versión actual no es la edición nueva, inactiva y termina
			if (!v.estamosEnEdicNueva) {
				for (let edic of DOM.botones.edicN) edic.classList.add("inactivoVersion");
				return;
			}

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
		versiones: async (rutaVersiones) => {
			// Obtiene las versiones original y de edición
			let [orig, edicG] = await fetch(rutaVersiones).then((n) => n.json());

			// Procesa la versión de edición guardada
			let edicG_existe = !!edicG.id;
			edicG = {...orig, ...edicG};

			// Averigua si el original está pendiente de ser aprobado
			let origPendAprobar = v.creados_ids.includes(orig.statusRegistro_id);

			// Fin
			return {orig, edicG, edicN: {}, edicG_existe, origPendAprobar};
		},
		accionesPorCambioDeVersion: async function () {
			// Funciones
			this.reemplazaInputs(); // reemplaza los valores de 'input' e impide/permite que el usuario haga cambios según la versión
			this.actualizaPaisesNombre();
			this.muestraOcultaIconosRclv();
			this.senalaLasDiferencias();
			await this.averiguaMuestraLosErrores();
			this.actualizaBotones();

			// Fin
			return;
		},
		reemplazaInputs: () => {
			// Variables
			v.estamosEnEdicNueva = v.versionActual == "edicN";

			// Rutina para cada campo
			for (let input of DOM.inputsTodos) {
				// Oculta y muestra los avatar que correspondan
				if (input.name == "avatar")
					DOM.imgsAvatar.forEach((imgAvatar, indice) => {
						v.versiones[indice] == v.versionActual
							? imgAvatar.classList.remove("ocultar")
							: imgAvatar.classList.add("ocultar");
					});
				else if (input.type == "radio") input.checked = input.value == version[v.versionActual][input.name];
				else if (input.type == "checkbox") input.checked = version[v.versionActual][input.name] == 1;
				// Reemplaza los valores que no sean el avatar
				else
					input.value = ![undefined, null].includes(version[v.versionActual][input.name])
						? version[v.versionActual][input.name]
						: "";

				// Impide/permite que el usuario haga cambios según la versión
				input.disabled = !v.estamosEnEdicNueva && !input.checked;
				if (input.checked) v.estamosEnEdicNueva ? input.classList.remove("inactivar") : input.classList.add("inactivar");

				if (input.name == "paises_id") {
					DOM.paisesMostrar.disabled = !v.estamosEnEdicNueva;
					DOM.paisesSelect.disabled = !v.estamosEnEdicNueva;
				}
			}

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
		muestraOcultaIconosRclv: () => {
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
	};

	// ADD EVENT LISTENERS --------------------------------------------------
	// Revisa los campos
	DOM.form.addEventListener("input", async (e) => {
		// Acciones si la versión actual no es la edición nueva
		if (!v.estamosEnEdicNueva) {
			if ((e.target.type = "checkbox")) e.target.checked = !e.target.checked;
			return;
		}

		// Validaciones estándar (función genérica)
		amplio.restringeCaracteres(e);

		// Acciones si se cambió el país
		if (e.target == DOM.paisesSelect) {
			FN.actualizaPaisesID();
			FN.actualizaPaisesNombre();
		}

		// Acciones si se cambió el tipo de actuación
		if (e.target.name == "tipoActuacion_id") {
			if ([v.anime_id, v.documental_id].includes(Number(e.target.value))) {
				DOM.actores.value = e.target.value == v.anime_id ? "Dibujos Animados" : "Documental";
				DOM.actores.readOnly = true;
			} else DOM.actores.readOnly = false;
		}

		// Acciones si se cambió el avatar
		if (e.target == DOM.inputAvatar) await revisaAvatar({DOM, v, version, FN});
		else FN.actualizaVarios();

		// Fin
		return;
	});
	// Botones - 1. Activa las versiones
	DOM.botonesActivarVersion.forEach((boton, indice) => {
		boton.addEventListener("click", () => {
			// Interrupciones
			if (v.versionActual == v.versiones[indice]) return; // si las versiones son iguales
			if (boton.className.includes("inactivoVersion")) return; // si el botón está inactivo

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

			// Cambia la versión anterior
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
			// Si está inactivo interrumpe la operación
			if (boton.className.includes("inactivo")) return;
			boton.classList.add("inactivo")

			// 1. Acciones exclusivas para edicN
			if (!indice) {
				// Vuelve al status original la condición del avatar
				v.esImagen = true;

				// Elimina Session y Cookies
				fetch("/producto/api/edicion-nueva/eliminar");

				// Vuelve al status de la versión anterior
				version[!indice ? "edicN" : "edicG"] = {...version[!indice ? "edicG" : "orig"]};

				// Actualiza el avatar
				DOM.imgsAvatar[indice].src = DOM.imgsAvatar[indice + 1].src;

				// Tareas finales
				FN.accionesPorCambioDeVersion();
				FN.actualizaBotones();
			}
			// 2. Acciones exclusivas para edicG
			else {
				// Elimina los datos de edicG en la BD
				await fetch("/producto/api/edicion-guardada/eliminar/?entidad=" + v.entidad + "&id=" + v.prodID);

				// Recarga la vista para quitar el ID de la edición en el url
				const origen = v.origen ? "&origen=" + v.origen : "";
				location.href = location.pathname + "?entidad=" + v.entidad + "&id=" + v.prodID + origen;
			}

			// Fin
			return;
		});
	});

	// Startup - Obtiene versiones ORIGINAL, EDICION GUARDADA, EDICION NUEVA
	let version = await FN.versiones(rutas.versiones);
	const statusRegistro_id = version.orig.statusRegistro_id;

	// Startup - Otras
	FN.obtieneLosValoresEdicN();
	await FN.accionesPorCambioDeVersion(); // Hace falta el await para leer los errores en el paso siguiente
	FN.actualizaBotones();
});
