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
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),

		// Variables de país
		paisesID: document.querySelector("#paises_id input[name='paises_id']"), // Lugar donde almacenar los ID
		paisesMostrar: document.querySelector("#paises_id #mostrarPaises"), // Lugar donde mostrar los nombres
		paisesSelect: document.querySelector("#paises_id select"),

		// Temas de avatar
		imgsAvatar: document.querySelectorAll("#imgDerecha.inputError .imgAvatar"),
		imgAvatarInicial: document.querySelector("#imgDerecha.inputError #avatarEdicN"),
		inputAvatarEdicN: document.querySelector("#imgDerecha.inputError .input"),

		// Botones
		botonesActivarVersion: document.querySelectorAll("#cuerpo .flechas .activaVersion"),
		botonGuardar: document.querySelector("#cuerpo .flechas #guardar"),
		botonesEliminar: document.querySelectorAll("#cuerpo .flechas .elimina"),
		botones: {
			edicN: document.querySelectorAll("#cuerpo .flechas .edicN"),
			edicG: document.querySelectorAll("#cuerpo .flechas .edicG"),
		},

		// Varios
		flechasDiferencia: document.querySelectorAll(".inputError .fa-arrow-right-long"),
		linksRCLV: document.querySelectorAll(".inputError i.linkRCLV"),
		iconosAyuda: document.querySelectorAll(".inputError .ayudaClick"),
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
	};
	let varias = {
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
		avatarInicial: DOM.imgAvatarInicial.src,
	};
	let rutas = {
		rutaValidar: "/producto/api/valida/?",
		rutaVersiones: "/producto/api/obtiene-original-y-edicion/?entidad=" + varias.entidad + "&id=" + varias.prodID,
	};
	// Obtiene versiones ORIGINAL, EDICION GUARDADA, EDICION NUEVA
	let version = await versiones(rutas.rutaVersiones);

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
				else
					version.edicN.avatar = DOM.inputAvatarEdicN.files[0]
						? DOM.inputAvatarEdicN.files[0].name
						: version.edicG.avatar;
			}

			// Fin
			return;
		},
		senalaLasDiferencias: () => {
			// Variables
			const referencia = varias.versionActual == "edicN" ? "edicG" : "orig";

			// Marca dónde están las diferencias con la versión original
			varias.camposTodos.forEach((campo, i) => {
				varias.versionActual != "orig" &&
				version[varias.versionActual][campo] != version[referencia][campo] &&
				(version[varias.versionActual][campo] || version[referencia][campo])
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
			let objeto = "entidad=" + varias.entidad + "&id=" + varias.prodID;
			for (let campo of varias.camposTodos) {
				let indice = camposResp.indexOf(campo);
				let valor = indice > -1 ? inputsResp[indice].value : "";
				if (campo != "avatar") objeto += "&" + campo + "=" + valor;
			}
			if (varias.versionActual == "edicN" && (DOM.inputAvatarEdicN.value || !varias.esImagen)) {
				objeto += "&avatar=" + DOM.inputAvatarEdicN.value;
				objeto += "&esImagen=" + (varias.esImagen ? "SI" : "NO");
				if (DOM.inputAvatarEdicN.value) objeto += "&tamano=" + DOM.inputAvatarEdicN.files[0].size;
			}

			// Averigua los errores
			errores = await fetch(rutas.rutaValidar + encodeURI(objeto)).then((n) => n.json());

			// Actualiza los errores
			varias.camposError.forEach((campo, indice) => {
				// Variables
				let mensaje = errores[campo];
				DOM.mensajesError[indice].innerHTML = mensaje;
				// Acciones en función de si hay o no mensajes de error
				errores[campo]
					? DOM.iconosError[indice].classList.remove("ocultar")
					: DOM.iconosError[indice].classList.add("ocultar");
			});

			// Fin
			return errores;
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

			// Averigua si los campos input son iguales
			let sonIguales = true;
			const comparativa = version.edicG_existe ? version.edicG : version.orig;
			for (let campo of varias.camposTodos)
				if (version.edicN[campo] != comparativa[campo] && (version.edicN[campo] || comparativa[campo]))
					sonIguales = false;

			// Averigua si la imagen avatar es igual
			if (sonIguales) sonIguales = DOM.imgAvatarInicial.src == varias.avatarInicial;

			// Si los campos 'input' y la imagen avatar son iguales --> inactiva Guardar y Eliminar
			if (sonIguales) for (let edic of DOM.botones.edicN) edic.classList.add("inactivoVersion");
			// Acciones si los campos 'input' o la imagen avatar son distintos
			else {
				// Activa el botón Eliminar
				DOM.botonesEliminar[0].classList.remove("inactivoVersion");

				// Activa / Inactiva Guardar, dependiendo de si hay errores en la edición nueva
				let hayErrores = Array.from(DOM.iconosError)
					.map((n) => n.className)
					.some((n) => !n.includes("ocultar"));
				if (hayErrores) DOM.botonGuardar.classList.add("inactivoVersion");
				else DOM.botonGuardar.classList.remove("inactivoVersion");
			}

			// Fin
			return;
		},
		// Otros
		accionesPorCambioDeVersion: async function () {
			// Reemplaza los valores de 'input' e impide/permite que el usuario haga cambios según la versión
			(() => {
				// Variables
				varias.estamosEnEdicNueva = varias.versionActual == "edicN";
				// Rutina para cada campo
				for (let input of DOM.inputsTodos) {
					// Reemplaza los valores que no sean el avatar
					if (input.name != "avatar") {
						if (input.type != "radio")
							input.value =
								version[varias.versionActual][input.name] !== undefined &&
								version[varias.versionActual][input.name] !== null
									? version[varias.versionActual][input.name]
									: "";
						else if (input.type == "radio") input.checked = input.value == version[varias.versionActual][input.name];
					}
					// Oculta y muestra los avatar que correspondan
					else
						DOM.imgsAvatar.forEach((imgAvatar, indice) => {
							varias.versiones[indice] == varias.versionActual
								? imgAvatar.classList.remove("ocultar")
								: imgAvatar.classList.add("ocultar");
						});
					// Impide/permite que el usuario haga cambios según la versión
					input.disabled = !varias.estamosEnEdicNueva && !input.checked;
					if (input.name == "paises_id") {
						DOM.paisesMostrar.disabled = !varias.estamosEnEdicNueva;
						DOM.paisesSelect.disabled = !varias.estamosEnEdicNueva;
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
					varias.estamosEnEdicNueva ? link.classList.remove("inactivo") : link.classList.add("inactivo");
				// Muestra/oculta los íconos de ayuda
				for (let iconoAyuda of DOM.iconosAyuda)
					varias.estamosEnEdicNueva ? iconoAyuda.classList.remove("inactivo") : iconoAyuda.classList.add("inactivo");
				// Muestra/oculta los íconos de error
				for (let iconoError of DOM.iconosError)
					varias.estamosEnEdicNueva ? iconoError.classList.remove("inactivo") : iconoError.classList.add("inactivo");
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
					let paisNombre = varias.paisesListado.find((n) => n.id == pais_id).nombre;
					if (paisNombre) paisesNombre.push(paisNombre);
				});
			}
			// Convertir array en string
			DOM.paisesMostrar.value = paisesNombre.join(", ");
			// Fin
			return;
		},
		revisaAvatarNuevo: function () {
			// 1. Si se omitió ingresar un archivo, vuelve a la imagen original
			if (!DOM.inputAvatarEdicN.value) {
				// Actualiza el avatar
				DOM.imgsAvatar[0].src = varios.avatarInicial;
				// Actualiza los errores
				varias.esImagen = true;
				this.actualizaVarios();
				// Fin
				return;
			}
			// 2. De lo contrario, actualiza los errores y el avatar
			let reader = new FileReader();
			reader.readAsDataURL(DOM.inputAvatarEdicN.files[0]);
			reader.onload = () => {
				let image = new Image();
				image.src = reader.result;
				// Acciones si es realmente una imagen
				image.onload = async () => {
					// Actualiza la imagen del avatar en la vista
					DOM.imgsAvatar[0].src = reader.result;
					// Actualiza la variable 'avatar' en la versión 'edicN'
					if (DOM.inputAvatarEdicN.value) version.edicN.avatar = DOM.inputAvatarEdicN.files[0].name;
					// Actualiza los errores
					varias.esImagen = true;
					FN.actualizaVarios();
					// Fin
					return;
				};
				// Acciones si no es una imagen
				image.onerror = () => {
					// Limpia el avatar
					DOM.imgsAvatar[0].src = "/imagenes/0-Base/Avatar/Sin-Avatar.jpg";
					// Limpia el input
					DOM.inputAvatarEdicN.value = "";
					// Actualiza la variable 'avatar' en la versión 'edicN'
					if (DOM.inputAvatarEdicN.value) version.edicN.avatar = "";
					// Actualiza los errores
					varias.esImagen = false;
					FN.actualizaVarios();
					// Fin
					return;
				};
			};
		},
	};

	// ADD EVENT LISTENERS --------------------------------------------------
	// Revisa los campos
	DOM.form.addEventListener("input", async (e) => {
		// Si la versión actual no es la esperada para 'inputs', interrumpe
		if (varias.versionActual != varias.versiones[0]) return;

		// Validaciones estándar (función genérica)
		input(e);

		// Acciones si se cambió el país
		if (e.target == DOM.paisesSelect) {
			FN.actualizaPaisesID();
			FN.actualizaPaisesNombre();
		}

		// Acciones si se cambió el avatar
		if (e.target == DOM.inputAvatarEdicN) FN.revisaAvatarNuevo();
		else FN.actualizaVarios();

		// Fin
		return;
	});

	// Botones - 1. Activa las versiones
	DOM.botonesActivarVersion.forEach((boton, indice) => {
		boton.addEventListener("click", () => {
			// Interrumpe si las versiones son iguales
			if (varias.versionActual == varias.versiones[indice]) return;
			// Interrumpe si el botón está inactivo
			if (boton.className.includes("inactivoVersion")) return;
			// Cambia la versión
			let aux = varias.versionActual;
			varias.versionActual = varias.versiones[indice];
			// Cambia los valores
			FN.accionesPorCambioDeVersion();
			// Cambia el boton activo
			DOM.botonesActivarVersion.forEach((revisar, i) => {
				if (i != indice) revisar.classList.remove("activo");
				else revisar.classList.add("activo");
			});
			// Cambiar la versión anterior
			varias.versionAnt = aux;
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
				varias.esImagen = true;

				// Elimina Session y Cookies
				fetch("/producto/api/edicion-nueva/eliminar");
			}
			// 2. Acciones exclusivas para edicG
			else {
				// Actualiza la información de que ya no existe la edicG
				version.edicG_existe = false;

				// Elimina los datos de edicG en la BD
				await fetch("/producto/api/edicion-guardada/eliminar/?entidad=" + varias.entidad + "&id=" + varias.prodID);

				// Recarga la vista para actualizar el url sin el ID de la edición
				const origen = varias.origen ? "&origen=" + varias.origen : "";
				location.href = location.pathname + "?entidad=" + varias.entidad + "&id=" + varias.prodID + origen;
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
	let origPendAprobar = orig.status_registro.gr_creado;
	// Fin
	return {orig, edicG, edicN: {}, edicG_existe, origPendAprobar};
};
