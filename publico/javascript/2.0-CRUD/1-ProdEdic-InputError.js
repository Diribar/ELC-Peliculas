"use strict";
window.addEventListener("load", async () => {
	// VARIABLES -----------------------------------------------------------------------
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
		// Varios
		avatarVisible: document.querySelector(".inputError #avatarVisible"),
		avatarNuevo: document.querySelector(".inputError #avatarNuevo"),
		iconosAyuda: document.querySelectorAll("main .ayudaClick"),
		// Versiones de datos
		versiones: ["edicN", "edicG", "orig"],
		versionActual: "edicN",
		estamosEnEdicNueva: true,
		versionAnt: null, // Se usa más adelante, no se debe borrar
		flechasDiferencia: document.querySelectorAll(".inputError .fa-arrow-right-long"),
		rutaVersiones: "/producto/api/edicion/obtiene-original-y-edicion/",
		// Botones
		botonesActivarVersion: document.querySelectorAll("#cuerpo #comandos .activar"),
		botonesDescartar: document.querySelectorAll("#cuerpo #comandos .descartar"),
		botonGuardar: document.querySelector("#cuerpo #comandos .guardar"),
		botones: {
			edicN: document.querySelectorAll("#cuerpo #comandos .edicN"),
			edicG: document.querySelectorAll("#cuerpo #comandos .edicG"),
		},
		links: document.querySelectorAll(".inputError i.linkRCLV"),
	};
	v.campos = Array.from(v.inputs).map((n) => n.name);
	v.versionInput = v.versionActual;
	v.rutaVersiones += "?entidad=" + v.entidad + "&id=" + v.prodID;
	// Obtiene versiones ORIGINAL, EDICION GUARDADA, EDICION NUEVA y si existe la edición guardada
	let version = await versiones(v.rutaVersiones);

	// Funciones Data-Entry
	let DE = {
		obtieneLosValoresEdicN: () => {
			// Actualizar los valores
			v.campos.forEach((campo, i) => {
				if (campo != "avatar") version.edicN[campo] = v.inputs[i].value;
			});
			// Fin
			return;
		},
		accionesPorCambioDeVersion: function () {
			// Reemplaza los valores e impide/permite que el usuario haga cambios según la versión
			(() => {
				// Rutina para cada campo
				v.campos.forEach((campo, i) => {
					// Reemplaza los valores
					if (campo != "avatar") v.inputs[i].value = version[v.versionActual][campo];
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
			return
			// Actualiza la subcategoría
			if (v.estamosEnEdicNueva) this.actualizaOpcionesSubcat();
			// Actualiza los nombres de país
			this.actualizaPaisesNombre();
			// Activa/desactiva el mouse para el avatar
			AV.actualizaMouse;
			// Reemplaza el avatar visible
			AV.actualizaVisible([v.versionActual].avatar, v.avatarVisible);
			// Señala las diferencias con la versión original
			this.senalaLasDiferencias();
			// Muestra/oculta los íconos para RCLV y de ayuda
			(() => {
				for (let link of v.links)
					v.estamosEnEdicNueva ? link.classList.remove("inactivo") : link.classList.add("inactivo");
				for (let iconoAyuda of v.iconosAyuda)
					v.estamosEnEdicNueva
						? iconoAyuda.classList.remove("inactivo")
						: iconoAyuda.classList.add("inactivo");
				return;
			})();
			// Muestra los errores
			this.muestraLosErrores();
			// Fin
			return;
		},
		senalaLasDiferencias: () => {
			// Marcar dónde están las diferencias con la versión original
			v.campos.forEach((campo, i) => {
				v.versionActual != "orig" &&
				version[v.versionActual][campo] != version.orig[campo] &&
				(version[v.versionActual][campo] || version.orig[campo])
					? v.flechasDiferencia[i].classList.remove("ocultar")
					: v.flechasDiferencia[i].classList.add("ocultar");
				console.log(version[v.versionActual][campo] , version.orig[campo]);
			});
		},
		muestraLosErrores: async () => {
			// Preparar la información
			let objeto = "entidad=" + v.entidad + "&id=" + v.prodID;
			for (let input of v.inputs)
				if (input.name != "avatar") objeto += "&" + input.name + "=" + input.value;
			// Averigua los errores
			let errores = await fetch(v.rutaValidar + objeto).then((n) => n.json());
			// Actualiza los errores
			v.campos.forEach((campo, indice) => {
				// Guarda el mensaje de error
				let mensaje = errores[campo];
				// Reemplaza
				v.mensajesError[indice].innerHTML = mensaje;
				// Acciones en función de si hay o no mensajes de error
				errores[campo]
					? v.iconosError[indice].classList.add("error")
					: v.iconosError[indice].classList.remove("error");
				errores[campo]
					? v.iconosError[indice].classList.remove("ocultar")
					: v.iconosError[indice].classList.add("ocultar");
			});
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
		actualizaBotones: () => {
			// Acciones sobre la edición guardada
			if (version.edicG_existe) {
				// Versión
				v.botonesActivarVersion[1].classList.remove("inactivoVersion");
				// Descartar
				if (!v.origPendAprobar) v.botonesDescartar[1].classList.remove("inactivoVersion");
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
				for (let campo of v.campos)
					if (version.edicN[campo] != version.edicG[campo]) return "";
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
	};
	// Funciones Avatar
	let AV = {
		actualizaVisible: (avatar, preview) => {
			// Crear elementos
			let image = document.createElement("img");
			preview.innerHTML = "";
			image.src = avatar;
			// Cambiar el avatar visible
			preview.append(image);
			// Fin
			return;
		},
		nuevoIngreso: async function (e) {
			// Creamos el objeto de la clase FileReader
			let reader = new FileReader();
			// Leemos el archivo subido y se lo pasamos a nuestro fileReader
			reader.readAsDataURL(e.target.files[0]);
			// Le decimos que cuando esté listo ejecute el código interno
			reader.onload = () => {
				let avatar = reader.result;
				this.actualizaVisible(avatar, v.avatarVisible);
				this.actualizaVisible(avatar, v.avatarNuevo);
			};
		},
		actualizaMouse: () => {
			v.estamosEnEdicNueva
				? v.avatarVisible.classList.add("pointer")
				: v.avatarVisible.classList.remove("pointer");
			// Fin
			return;
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
			v.versionAnt = v.versionActual;
			v.versionActual = v.versiones[indice];
			// Cambia los valores
			DE.accionesPorCambioDeVersion();
			// Cambia el boton activo
			v.botonesActivarVersion.forEach((revisar, i) => {
				if (i != indice) revisar.classList.remove("activo");
				else revisar.classList.add("activo");
			});
		});
	});
	v.botonesDescartar.forEach((boton, indice) => {
		boton.addEventListener("click", () => {
			// Si está inactivo aborta la operación
			if (boton.className.includes("inactivo")) {
				return;
			}
			// Acciones si es la edición nueva
			else if (v.versiones[indice] == "edicN") {
				version.edicN = {...version.orig, ...version.edicG};
			}
			// Acciones si es la edición guardada
			else if (v.versiones[indice] == "edicG") {
				fetch("/producto/edicion/eliminar/?entidad=" + v.entidad + "&id=" + v.prodID);
				version.edicG = {...version.orig};
				version.edicN = {...version.orig};
			}
			// Inactiva los botones de la versión
			v.botones[v.versionActual].forEach((boton) => boton.classList.add("inactivoVersion"));
			// Si se descartó la versión actual, recarga los valores
			if (v.versiones[indice] == v.versionActual) DE.accionesPorCambioDeVersion();
		});
	});
	v.botonGuardar.addEventListener("click", () => {
		// Si el botón está inactivo, concluye la función
		if (v.botonGuardar.className.includes("inactivo")) e.preventDefault();
	});
	// Revisar campos en forma INDIVIDUAL
	v.form.addEventListener("input", async (e) => {
		// Acciones si hubieron novedades dentro de EdicN
		if (v.versionInput == "edicN") {
			if (e.target == "categoria_id") DE.actualizaOpcionesSubcat(); // Actualiza subcategoría
			if (e.target == "categoria_id") v.subcategoria.value = ""; // Limpia la subcategoría
			// Varios
			if (e.target == v.paisesSelect) {
				DE.actualizaPaisesID();
				DE.actualizaPaisesNombre();
			}
			DE.obtieneLosValoresEdicN();
			DE.senalaLasDiferencias();
			DE.muestraLosErrores();
			DE.actualizaBotones();
		} else v.versionInput = v.versionActual;
	});

	// Startup
	DE.obtieneLosValoresEdicN(); // Obtiene los valores para EdicN
	DE.actualizaBotones(); // ActualizaBotones
	// DE.actualizaOpcionesSubcat(); // Actualiza las opciones de Sub-categoría
	// DE.accionesPorCambioDeVersion(); // Acciones varias
});

// Estas funciones deben estar afuera, para estar disponibles para las variables
let agregaRutaAlAvatar = (imagenActual, status, imagenBackup) => {
	// Si existe una imagen actual, descarta la imagen de backup
	let imagen = imagenActual
		? (imagenActual.startsWith("http")
				? ""
				: status == "original"
				? "/imagenes/3-Productos/"
				: "/imagenes/4-ProdsRevisar/") + imagenActual
		: imagenBackup
		? imagenBackup
		: "/imagenes/8-Agregar/IM.jpg";
	// Fin
	return imagen;
};
let versiones = async (rutaVersiones) => {
	// Obtiene las versiones original y de edición
	let [orig, edicG] = await fetch(rutaVersiones).then((n) => n.json());
	// Obtiene el avatar original con su ruta
	orig.avatar = agregaRutaAlAvatar(orig.avatar, "original");
	// Procesa la versión de edición guardada
	let edicG_existe = !!edicG;
	edicG = {...orig, ...edicG};
	if (edicG_existe) edicG.avatar = agregaRutaAlAvatar(edicG.avatar_archivo, "edicion", orig.avatar);
	// Obtiene la versión de edición nueva
	let edicN = {...orig, ...edicG};
	edicN.avatar = document.querySelector("#avatarNuevo img").getAttribute("src");
	// Averigua si el original está pendiente de ser aprobado
	let origPendAprobar = orig.status_registro.gr_creado;
	// Fin
	return {orig, edicG, edicN, edicG_existe, origPendAprobar};
};
