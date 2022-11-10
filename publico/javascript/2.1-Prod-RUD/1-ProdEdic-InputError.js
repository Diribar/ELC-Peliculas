"use strict";
window.addEventListener("load", async () => {
	// VARIABLES -----------------------------------------------------------------------
	let errores;
	let v = {
		// Pointer del producto
		entidad: new URL(window.location.href).searchParams.get("entidad"),
		prodID: new URL(window.location.href).searchParams.get("id"),
		// Datos del formulario
		form: document.querySelector("form"),
		inputs: document.querySelectorAll(".inputError .input"),
		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
		rutaValidar: "/producto/api/edicion/validar/?",
		// Variables de país
		paisesID: document.querySelector("#paises_id input[name='paises_id']"), // Lugar donde almacenar los ID
		paisesMostrar: document.querySelector("#paises_id #mostrarPaises"), // Lugar donde mostrar los nombres
		paisesSelect: document.querySelector("#paises_id select"),
		paisesListado: Array.from(document.querySelectorAll("#paises_id option")).map((n) => {
			return {id: n.value, nombre: n.innerHTML};
		}),
		// Categoría y subcategoría
		categoria: document.querySelector("select[name='categoria_id']"),
		subcategoria: document.querySelector("select[name='subcategoria_id']"),
		subcategoriaOpciones: document.querySelectorAll("select[name='subcategoria_id'] option"),
		// Versiones de datos
		versiones: ["edicN", "edicG", "orig"],
		versionActual: "edicN",
		estamosEnEdicNueva: true,
		versionAnt: null, // Se usa más adelante, no se debe borrar
		flechasDiferencia: document.querySelectorAll(".inputError .fa-arrow-right-long"),
		rutaVersiones: "/producto/api/edicion/obtiene-original-y-edicion/",
		// Temas de avatar
		imgsAvatar: document.querySelectorAll("#imagenDerecha.inputError .imgAvatar"),
		avatarInicial: document.querySelector("#imagenDerecha.inputError #avatarEdicN").src,
		inputAvatarEdicN: document.querySelector("#imagenDerecha.inputError .input"),
		esImagen: true,
		// Botones
		botonesActivarVersion: document.querySelectorAll("#cuerpo #comandos .activar"),
		botonesDescartar: document.querySelectorAll("#cuerpo #comandos .descartar"),
		botonGuardar: document.querySelector("#cuerpo #comandos .guardar"),
		botones: {
			edicN: document.querySelectorAll("#cuerpo #comandos .edicN"),
			edicG: document.querySelectorAll("#cuerpo #comandos .edicG"),
		},
		// Varios
		linksRCLV: document.querySelectorAll(".inputError i.linkRCLV"),
		iconosAyuda: document.querySelectorAll(".inputError .ayudaClick"),
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
	};
	v.campos = Array.from(v.inputs).map((n) => n.name);
	v.rutaVersiones += "?entidad=" + v.entidad + "&id=" + v.prodID;
	// Obtiene versiones ORIGINAL, EDICION GUARDADA, EDICION NUEVA y si existe la edición guardada
	let version = await versiones(v.rutaVersiones);

	// Funciones Data-Entry
	let FN = {
		obtieneLosValoresEdicN: () => {
			// Actualiza los valores
			v.campos.forEach((campo, i) => {
				if (campo != "avatar") version.edicN[campo] = v.inputs[i].value;
				else
					version.edicN.avatar = v.inputAvatarEdicN.files[0]
						? v.inputAvatarEdicN.files[0].name
						: version.edicG.avatar;
			});
			// Fin
			return;
		},
		senalaLasDiferencias: () => {
			// Marcar dónde están las diferencias con la versión original
			let referencia = v.versionActual == "edicN" ? "edicG" : "orig";
			v.campos.forEach((campo, i) => {
				v.versionActual != "orig" &&
				version[v.versionActual][campo] != version[referencia][campo] &&
				(version[v.versionActual][campo] || version[referencia][campo])
					? v.flechasDiferencia[i].classList.remove("ocultar")
					: v.flechasDiferencia[i].classList.add("ocultar");
			});
		},
		averiguaMuestraLosErrores: async () => {
			// Prepara la información
			let objeto = "entidad=" + v.entidad + "&id=" + v.prodID;
			for (let input of v.inputs)
				if (input.name != "avatar") objeto += "&" + input.name + "=" + input.value;
			if (v.versionActual == "edicN" && (v.inputAvatarEdicN.value || !v.esImagen)) {
				objeto += "&avatar=" + v.inputAvatarEdicN.value;
				objeto += "&esImagen=" + (v.esImagen ? "SI" : "NO");
				if (v.inputAvatarEdicN.value) objeto += "&tamano=" + v.inputAvatarEdicN.files[0].size;
			}

			// Averigua los errores
			errores = await fetch(v.rutaValidar + objeto).then((n) => n.json());
			// Actualiza los errores
			v.campos.forEach((campo, indice) => {
				// Variables
				let mensaje = errores[campo];
				v.mensajesError[indice].innerHTML = mensaje;
				// Acciones en función de si hay o no mensajes de error
				errores[campo]
					? v.iconosError[indice].classList.add("error")
					: v.iconosError[indice].classList.remove("error");
				errores[campo]
					? v.iconosError[indice].classList.remove("ocultar")
					: v.iconosError[indice].classList.add("ocultar");
			});
			return errores;
		},
		actualizaBotones: () => {
			// Acciones sobre la edición guardada
			if (version.edicG_existe) {
				v.botonesActivarVersion[1].classList.remove("inactivoVersion");
				if (!version.origPendAprobar) v.botonesDescartar[1].classList.remove("inactivoVersion");
				else v.botonesDescartar[1].classList.add("inactivoVersion");
			} else {
				v.botonesActivarVersion[1].classList.add("inactivoVersion");
				v.botonesDescartar[1].classList.add("inactivoVersion");
			}
			// Acciones sobre la edición nueva
			// 1. Funciones
			let detectaSiHayErrores = () => {
				// Detectar la cantidad de 'errores' ocultos
				let hayErrores = Array.from(v.iconosError)
					.map((n) => n.className)
					.some((n) => n.includes("error"));
				// Fin
				return hayErrores;
			};
			let averiguaSiLaEdicionTieneNovedades = () => {
				for (let campo of v.campos) if (version.edicN[campo] != version.edicG[campo]) return "";
				return "Iguales";
			};
			// 2. Averigua si hay errores
			let hayErrores = detectaSiHayErrores();
			// 3. Averigua si es igual a la edicion
			let sonIguales = averiguaSiLaEdicionTieneNovedades();
			// Si se cumple alguna de las anteriores -> inactiva
			// Else -> activa
			if (hayErrores || sonIguales) v.botones.edicN.forEach((n) => n.classList.add("inactivoVersion"));
			else v.botones.edicN.forEach((n) => n.classList.remove("inactivoVersion"));
			// Fin
			return;
		},
		actualizaVarios: async function () {
			this.obtieneLosValoresEdicN();
			this.senalaLasDiferencias();
			await this.averiguaMuestraLosErrores();
			this.actualizaBotones();
		},
		accionesPorCambioDeVersion: async function () {
			// Reemplaza los valores de 'input' e impide/permite que el usuario haga cambios según la versión
			(() => {
				// Variables
				v.estamosEnEdicNueva = v.versionActual == "edicN";
				// Rutina para cada campo
				v.campos.forEach((campo, i) => {
					// Reemplaza los valores que no sean el avatar
					if (campo != "avatar")
						v.inputs[i].value = version[v.versionActual][campo]
							? version[v.versionActual][campo]
							: "";
					// Oculta y muestra los avatar que correspondan
					else
						v.imgsAvatar.forEach((imgAvatar, indice) => {
							v.versiones[indice] == v.versionActual
								? imgAvatar.classList.remove("ocultar")
								: imgAvatar.classList.add("ocultar");
						});
					// Impide/permite que el usuario haga cambios según la versión
					v.inputs[i].disabled = !v.estamosEnEdicNueva;
					if (campo == "paises_id") {
						v.paisesMostrar.disabled = !v.estamosEnEdicNueva;
						v.paisesSelect.disabled = !v.estamosEnEdicNueva;
					}
				});
				// Fin
				return;
			})();
			// Actualiza la subcategoría
			if (v.estamosEnEdicNueva) this.actualizaOpcionesSubcat();
			// Actualiza los nombres de país
			this.actualizaPaisesNombre();
			// Muestra/oculta los íconos de RCLV, ayuda y error
			(() => {
				// Muestra/oculta los íconos de RCLV
				for (let link of v.linksRCLV)
					v.estamosEnEdicNueva ? link.classList.remove("inactivo") : link.classList.add("inactivo");
				// Muestra/oculta los íconos de ayuda
				for (let iconoAyuda of v.iconosAyuda)
					v.estamosEnEdicNueva
						? iconoAyuda.classList.remove("inactivo")
						: iconoAyuda.classList.add("inactivo");
				// Muestra/oculta los íconos de error
				for (let iconoError of v.iconosError)
					v.estamosEnEdicNueva
						? iconoError.classList.remove("inactivo")
						: iconoError.classList.add("inactivo");
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
		actualizaOpcionesSubcat: () => {
			let categ = v.categoria.value;
			v.subcategoriaOpciones.forEach((opcion) => {
				if (opcion.className.includes(categ)) opcion.classList.remove("ocultar");
				else opcion.classList.add("ocultar");
			});
		},
		actualizaPaisesID: () => {
			// Variables
			let paisID = v.paisesSelect.value;
			// Verificar si figura en paisesID
			if (paisID == "borrar") {
				v.paisesSelect.value = "";
				v.paisesMostrar.value = "";
				v.paisesID.value = "";
				return;
			}
			let agregar = !v.paisesID.value.includes(paisID);
			let aux = v.paisesID.value.split(" ");
			if (agregar && aux.length >= 5) return; // Limita la cantidad máxima de países a 5
			if (agregar) aux.push(paisID); // Agrega el país
			else aux.splice(aux.indexOf(paisID), 1); // Quita el país
			v.paisesID.value = aux.join(" "); // Actualiza el input
			// Fin
			return;
		},
		actualizaPaisesNombre: () => {
			// Actualiza los países a mostrar
			let paisesNombre = [];
			// Convertir 'IDs' en 'nombres'
			if (v.paisesID.value) {
				let paises_idArray = v.paisesID.value.split(" ");
				paises_idArray.forEach((pais_id) => {
					let paisNombre = v.paisesListado.find((n) => n.id == pais_id).nombre;
					if (paisNombre) paisesNombre.push(paisNombre);
				});
			}
			// Convertir array en string
			v.paisesMostrar.value = paisesNombre.join(", ");
			// Fin
			return;
		},
		revisaAvatarNuevo: function () {
			// 1. Si se omitió ingresar un archivo, vuelve a la imagen original
			if (!v.inputAvatarEdicN.value) {
				// Actualiza el avatar
				v.imgsAvatar[0].src = v.avatarInicial;
				// Actualiza lo que será el avatar anterior
				// Actualiza los errores
				v.esImagen = true;
				this.actualizaVarios();
				// Fin
				return;
			}
			// 2. De lo contrario, actualiza los errores y el avatar
			let reader = new FileReader();
			reader.readAsDataURL(v.inputAvatarEdicN.files[0]);
			reader.onload = () => {
				var image = new Image();
				image.src = reader.result;
				// Acciones si es realmente una imagen
				image.onload = async () => {
					// Actualiza la imagen del avatar en la vista
					v.imgsAvatar[0].src = reader.result;
					// Actualiza la variable 'avatar' en la versión 'edicN'
					if (v.inputAvatarEdicN.value) version.edicN.avatar = v.inputAvatarEdicN.files[0].name;
					// Actualiza los errores
					v.esImagen = true;
					FN.actualizaVarios();
					// Fin
					return;
				};
				// Acciones si no es una imagen
				image.onerror = () => {
					// Limpia el avatar
					v.imgsAvatar[0].src = "/imagenes/0-Base/sinAfiche.jpg";
					// Limpia el input
					v.inputAvatarEdicN.value = "";
					// Actualiza la variable 'avatar' en la versión 'edicN'
					if (v.inputAvatarEdicN.value) version.edicN.avatar = "";
					// Actualiza los errores
					v.esImagen = false;
					FN.actualizaVarios();
					// Fin
					return;
				};
			};
		},
	};

	// ADD EVENT LISTENERS --------------------------------------------------
	// Botones
	v.botonesActivarVersion.forEach((boton, indice) => {
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
			v.botonesActivarVersion.forEach((revisar, i) => {
				if (i != indice) revisar.classList.remove("activo");
				else revisar.classList.add("activo");
			});
			// Cambiar la versión anterior
			v.versionAnt = aux;
		});
	});
	v.botonesDescartar.forEach((boton, indice) => {
		boton.addEventListener("click", () => {
			// Si está inactivo aborta la operación
			if (boton.className.includes("inactivo")) return;
			// Acciones si es la edición nueva
			else if (v.versiones[indice] == "edicN") version.edicN = {...version.orig, ...version.edicG};
			// Acciones si es la edición guardada
			else if (v.versiones[indice] == "edicG") {
				// Elimina los datos de edicG en la BD
				fetch("/producto/api/edicion/eliminar/?entidad=" + v.entidad + "&id=" + v.prodID);
				// Actualiza los datos de edicG con los originales
				version.edicG = {...version.orig};
				// Actualiza el avatar de edicG
				v.imgsAvatar[1].src = v.imgsAvatar[2].src;
				// Si corresponde, actualiza el avatar de edicN
				if (!v.inputAvatarEdicN.value && v.esImagen) {
					version.edicN.avatar = version.orig.avatar;
					v.imgsAvatar[0].src = v.imgsAvatar[2].src;
				}
				// Avisa que ya no existe la edicG
				version.edicG_existe = false;
			}
			// Tareas finales
			FN.accionesPorCambioDeVersion();
			FN.actualizaBotones();
		});
	});
	v.botonGuardar.addEventListener("click", (e) => {
		// Si el botón está inactivo, concluye la función
		if (v.botonGuardar.className.includes("inactivo")) e.preventDefault();
	});
	// Revisar campos en forma INDIVIDUAL
	v.form.addEventListener("input", async (e) => {
		// Si la versión actual no es la esperada para 'inputs', interrumpe
		if (v.versionActual != v.versiones[0]) return;

		// Acciones si se cambió la categoría
		if (e.target.name == "categoria_id") {
			FN.actualizaOpcionesSubcat(); // Actualiza subcategoría
			v.subcategoria.value = ""; // Limpia la subcategoría
		}
		// Acciones si se cambió el país
		if (e.target == v.paisesSelect) {
			FN.actualizaPaisesID();
			FN.actualizaPaisesNombre();
		}

		// Acciones si se cambió el avatar
		if (e.target == v.inputAvatarEdicN) FN.revisaAvatarNuevo();
		else FN.actualizaVarios();
	});

	// Startup
	FN.obtieneLosValoresEdicN(); // Obtiene los valores para EdicN
	FN.actualizaBotones(); // ActualizaBotones
	FN.actualizaOpcionesSubcat(); // Actualiza las opciones de Sub-categoría
	FN.accionesPorCambioDeVersion(); // Acciones varias
});

// Estas funciones deben estar afuera, para estar disponibles para las variables
let versiones = async (rutaVersiones) => {
	// Obtiene las versiones original y de edición
	let [orig, edicG] = await fetch(rutaVersiones).then((n) => n.json());
	// Procesa la versión de edición guardada
	let edicG_existe = !!edicG;
	edicG = {...orig, ...edicG};
	// Obtiene la versión de edición nueva
	let edicN = {...orig, ...edicG};
	// Averigua si el original está pendiente de ser aprobado
	let origPendAprobar = orig.status_registro.gr_creado;
	// Fin
	return {orig, edicG, edicN, edicG_existe, origPendAprobar};
};
