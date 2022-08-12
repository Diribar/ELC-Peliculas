"use strict";
window.addEventListener("load", async () => {
	// VARIABLES -----------------------------------------------------------------------
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	// Datos del formulario
	let form = document.querySelector("form");
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconosOK = document.querySelectorAll(".input-error .fa-circle-check");
	let iconosError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");

	// VERSIONES DE DATOS -------------------------------------------------------------------------
	let flechasAviso = document.querySelectorAll(".input-error .fa-arrow-right-long");
	let rutaVE = "/producto/api/edicion/validar/?";
	// Obtener versiones EDICION GUARDADA y ORIGINAL
	let rutaVersiones =
		"/producto/api/edicion/obtener-original-y-edicion/?entidad=" + entidad + "&id=" + prodID;
	let [datosOrig, datosEdicG] = await fetch(rutaVersiones).then((n) => n.json());
	let avatar_eg = avatar_obtenerRutaNombre(datosEdicG.avatar, "edicion", datosOrig.avatar);
	datosEdicG = {...datosOrig, ...datosEdicG};
	// Temas de la versión ORIGINAL
	let botonOriginal = document.querySelector("#cuerpo #comandos .fa-house");
	let avatar_or = avatar_obtenerRutaNombre(datosOrig.avatar, "original");
	// Temas de la version GUARDADA
	let botonVerGuardada = document.querySelector("#cuerpo #comandos .fa-pencil");
	let botonEliminarGuardada = document.querySelector("#cuerpo #comandos #guardada .fa-trash-can");
	let inactivo_EdicGua = document.querySelectorAll("#cuerpo #comandos .inactivo_EdicGua");
	let producto_id =
		entidad == "peliculas" ? "pelicula_id" : entidad == "colecciones" ? "coleccion_id" : "capitulo_id";
	let existeEdicG = !!datosEdicG[producto_id];
	let statusPendAprobar = existeEdicG ? datosOrig.status_registro.gr_pend_aprob : false;
	// Temas de la versión SESSION
	let botonVerSession = document.querySelector("#cuerpo #comandos .fa-pen-to-square");
	let botonEliminarSession = document.querySelector("#cuerpo #comandos #session .fa-trash-can");
	let botonGuardarSession = document.querySelector("#cuerpo #comandos .fa-floppy-disk");
	let rutaSession = "/producto/api/edicion/obtener-de-req-session/?entidad=" + entidad + "&id=" + prodID;
	let datosEdicS = await fetch(rutaSession).then((n) => n.json());
	datosEdicS = datosEdicS ? datosEdicS : datosEdicG;
	let rutaRQ = "/producto/api/edicion/enviar-a-req-session/?";

	// OTRAS VARIABLES --------------------------------------------------------------------------
	// Variables de país
	let paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
	let paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
	let paisesSelect = document.querySelector("#paises_id select");
	let paisesListado = Array.from(document.querySelectorAll("#paises_id option")).map((n) => {
		return {id: n.value, nombre: n.innerHTML};
	});
	// Categoría y subcategoría
	let categoria = document.querySelector("select[name='categoria_id']");
	let subcategoria = document.querySelector("select[name='subcategoria_id']");
	let subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");

	// FUNCIONES ---------------------------------------------
	let comandos_ActualizarInput = async (botonVersion, datosVersion, disabled) => {
		// Rutina para cada input
		for (let i = 0; i < inputs.length; i++) {
			actualizarInput_valores(botonVersion, datosVersion, i, disabled);
			actualizarInput_flechas(botonVersion, i);
		}
		// Activar la botonera de comandos con la versión activa
		actualizarInput_clasePlus(botonVersion);
		// Actualizar los links RCLV
		actualizarInput_linksRCLV(disabled);
		// Actualizar los errores
		let errores = await fetch(rutaVE + actualizarInput_dataEntry()).then((n) => n.json());
		actualizarInput_errores(errores, campos, false);
	};
	let actualizarInput_flechas = (botonVersion, i) => {
		if (inputs[i].name != "avatar")
			inputs[i].value != datosOrig[inputs[i].name] && (inputs[i].value || datosOrig[inputs[i].name])
				? flechasAviso[i].classList.remove("ocultar")
				: flechasAviso[i].classList.add("ocultar");
		else {
			// Obtener los avatar ACTUAL y NUEVO
			let avatarActual = document.querySelector("#imagenProducto img").getAttribute("src");
			let avatarNuevo = actualizarInput_AvatarDeLaNuevaVersion(botonVersion);
			// Compararlos y tomar acciones
			avatarActual != avatarNuevo
				? flechasAviso[i].classList.remove("ocultar")
				: flechasAviso[i].classList.add("ocultar");
		}
	};
	let actualizarInput_valores = (botonVersion, datosVersion, i, trueFalse) => {
		// Actualizar los valores en los inputs
		if (inputs[i].name != "avatar") {
			datosVersion[inputs[i].name] != undefined
				? (inputs[i].value = datosVersion[inputs[i].name])
				: (inputs[i].value = "");
			if (inputs[i].name == "paises_id") {
				paisesMostrar.disabled = trueFalse;
				paisesSelect.disabled = trueFalse;
			}
		} else {
			// Actualizar el avatar
			let avatar = actualizarInput_AvatarDeLaNuevaVersion(botonVersion);
			avatar_cambiarEnLaVista(avatar, "#imagen #imagenProducto");
			let imgAvatar = document.querySelector(".input-error #imagenProducto img");
			trueFalse ? imgAvatar.classList.remove("pointer") : imgAvatar.classList.add("pointer");
		}
		// Activar o desactivar todos los inputs, incluyendo el avatar
		inputs[i].disabled = trueFalse;
	};
	let actualizarInput_clasePlus = (boton) => {
		// Variable de botones versiones
		let botonesVersion = document.querySelectorAll("#cuerpo #comandos .version");
		// Colocarle la clase 'plus' al ícono que corresponde
		for (let botonVersion of botonesVersion) {
			botonVersion == boton
				? botonVersion.classList.add("plus")
				: botonVersion.classList.remove("plus");
		}
	};
	let actualizarInput_linksRCLV = (trueFalse) => {
		let links = document.querySelectorAll(".input-error i.linkRCLV");
		for (let link of links) {
			trueFalse ? link.classList.add("ocultar") : link.classList.remove("ocultar");
		}
		let iconosAyuda = document.querySelectorAll("main .fa-circle-question");
		for (let iconoAyuda of iconosAyuda) {
			trueFalse ? iconoAyuda.classList.add("ocultar") : iconoAyuda.classList.remove("ocultar");
		}
	};
	let actualizarInput_errores = (errores, camposEspecificos, mostrarOK) => {
		for (let campo of camposEspecificos) {
			// Guarda el mensaje de error
			let mensaje = errores[campo];
			// Reemplaza
			let indice = campos.indexOf(campo);
			mensajesError[indice].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			mensaje
				? iconosError[indice].classList.remove("ocultar")
				: iconosError[indice].classList.add("ocultar");
			mensaje || !mostrarOK
				? iconosOK[indice].classList.add("ocultar")
				: iconosOK[indice].classList.remove("ocultar");
		}
	};
	let actualizarInput_AvatarDeLaNuevaVersion = (botonVersion) => {
		let avatar_es = document.querySelector("#imagenProducto2 img").getAttribute("src");
		return botonVersion == botonOriginal
			? avatar_or
			: botonVersion == botonVerGuardada
			? avatar_eg
			: avatar_es;
	};
	let actualizarInput_dataEntry = () => {
		let objeto = "entidad=" + entidad + "&id=" + prodID;
		for (let input of inputs) {
			if (input.name != "avatar") objeto += "&" + input.name + "=" + input.value;
		}
		return objeto;
	};
	let formInputChange_botonGuardar = () => {
		let OK =
			Array.from(iconosOK)
				.map((n) => n.className)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar < iconosOK.length;
		let error =
			Array.from(iconosError)
				.map((n) => n.className)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar < iconosError.length;
		OK && !error
			? botonGuardarSession.classList.remove("inactivoErrores")
			: botonGuardarSession.classList.add("inactivoErrores");
	};
	let formInputChange_consecuenciaError = (error, campo) => {
		// Guarda el mensaje de error
		let mensaje = error[campo];
		// Reemplaza el mensaje
		let indice = campos.indexOf(campo);
		mensajesError[indice].innerHTML = mensaje;
		// Acciones en función de si hay o no mensajes de error
		mensaje
			? iconosError[indice].classList.remove("ocultar")
			: iconosError[indice].classList.add("ocultar");
		!mensaje ? iconosOK[indice].classList.remove("ocultar") : iconosOK[indice].classList.add("ocultar");
	};
	let formInput_paises = () => {
		let paisID = paisesSelect.value;
		if (paisID == "borrar") {
			paisesSelect.value = "";
			paisesMostrar.value = "";
			paisesID.value = "";
			return;
		}
		// Verificar si figura en paisesID
		let agregar = !paisesID.value.includes(paisID);
		// Si no figura en paisesID, agregárselo
		if (agregar) {
			// Limita la cantidad máxima de países a 1+4 = 5, para permitir el mensaje de error
			if (paisesID.value.length >= 2 * 1 + 4 * 4) return;
			paisesID.value += !paisesID.value ? paisID : ", " + paisID;
		} else {
			// Si sí figura, quitárselo
			let paises_idArray = paisesID.value.split(", ");
			let indice = paises_idArray.indexOf(paisID);
			paises_idArray.splice(indice, 1);
			paisesID.value = paises_idArray.join(", ");
		}
		// Agregar los países a mostrar
		let paisesNombre = "";
		if (paisesID.value) {
			let paises_idArray = paisesID.value.split(", ");
			for (let pais_id of paises_idArray) {
				let paisNombre = paisesListado.find((n) => n.id == pais_id).nombre;
				paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
			}
		}
		paisesMostrar.value = paisesNombre;
	};
	let formInput_activarEdicionSession = () => {
		// Quitar la clase 'inactivo_EdicSess'
		let inactivo_EdicSess = document.querySelectorAll("#cuerpo #comandos .inactivo_EdicSess");
		for (let inactivo of inactivo_EdicSess) {
			if (Array.from(inactivo.classList).includes("inactivo_EdicSess"))
				inactivo.classList.remove("inactivo_EdicSess");
		}
	};
	let formInput_mostrarValoresSubcat = () => {
		for (let opcion of subcategoriaOpciones) {
			opcion.className.includes(categoria.value)
				? opcion.classList.remove("ocultar")
				: opcion.classList.add("ocultar");
		}
	};
	let formChange_dosCampos = async (datos, campo) => {
		let campo1 = datos.campo1;
		let campo2 = datos.campo2;
		let indice1 = campos.indexOf(campo1);
		let indice2 = campos.indexOf(campo2);
		if (
			(campo == campo1 || campo == campo2) &&
			inputs[indice1].value &&
			!mensajesError[indice1].innerHTML &&
			inputs[indice2].value &&
			!mensajesError[indice2].innerHTML
		)
			formChange_camposCombinados([campo1, campo2], campo1);
	};
	let formChange_camposCombinados = async (camposEspecificos, campo) => {
		// Armado de la ruta
		let dato = "entidad=" + entidad;
		let indices = [];
		for (let i = 0; i < camposEspecificos.length; i++) {
			indices.push(campos.indexOf(camposEspecificos[i]));
			dato += "&" + camposEspecificos[i] + "=" + inputs[indices[i]].value;
		}
		// Obtener el mensaje para el campo
		let errores = await fetch(rutaVE + dato).then((n) => n.json());
		campo
			? formInputChange_consecuenciaError(errores, campo)
			: actualizarInput_errores(errores, camposEspecificos, true);
	};
	let startup_activarEdicionGuardado = () => {
		// Quita 'inactivo_EdicGua' si existe una versión 'guardada'
		if (existeEdicG) {
			for (let inactivo of inactivo_EdicGua) {
				if (inactivo != botonEliminarGuardada || !statusPendAprobar)
					inactivo.classList.remove("inactivo_EdicGua");
			}
		}
	};

	// EVENT LISTENERS ---------------------------------------
	// Revisar campos en forma INDIVIDUAL
	form.addEventListener("input", async (e) => {
		// Averiguar si hay ERRORES
		// 1. Definir los valores para 'campo' y 'valor'
		if (e.target == paisesSelect) formInput_paises();
		let campo = e.target == paisesSelect ? paisesID.name : e.target.name;
		let valor = e.target == paisesSelect ? paisesID.value : e.target.value;
		// 2. Averiguar si hay algún error y aplicar las consecuencias
		let error = await fetch(rutaVE + campo + "=" + valor).then((n) => n.json());
		formInputChange_consecuenciaError(error, campo);
		// Si se cambia la categoría --> actualiza subcategoría
		if (campo == "categoria_id") {
			// Cambiar los valores que se pueden mostrar en la subcategoría
			formInput_mostrarValoresSubcat();
			// Borrar el valor anterior
			subcategoria.value = "";
			// Marcar que hay que elegir un valor
			let indiceSC = campos.indexOf("subcategoria_id");
			let erroresSC = await fetch(rutaVE + "subcategoria_id=").then((n) => n.json());
			mensajesError[indiceSC].innerHTML = erroresSC.subcategoria_id;
			iconosOK[indiceSC].classList.add("ocultar");
			iconosError[indiceSC].classList.remove("ocultar");
		}
		// Tareas varias
		if (campo == "avatar" && !error.hay) avatar_nuevoIngresado(e); // Cambia el avatar
		formInputChange_botonGuardar(); // Activa/Desactiva el botón 'Guardar'
		fetch(rutaRQ + actualizarInput_dataEntry()); // Guarda el Data-Entry en session
		formInput_activarEdicionSession(); // Activa las opciones de session

		// Le pone la flecha al campo cambiado
		let indice = campos.indexOf(campo);
		actualizarInput_flechas(botonVerSession, indice);
	});
	// Revisar campos COMBINADOS
	form.addEventListener("change", async (e) => {
		// Obtener el valor para 'campo'
		let campo = e.target.name;
		let datos;
		// (Título botonOriginal / castellano) + año lanzamiento
		if (campo == "nombre_original" || campo == "nombre_castellano" || campo == "ano_estreno") {
			datos = {campo1: "nombre_original", campo2: "ano_estreno"};
			await formChange_dosCampos(datos, campo);
			datos = {campo1: "nombre_castellano", campo2: "ano_estreno"};
			await formChange_dosCampos(datos, campo);
		}
		// Año de lanzamiento + año de finalización
		if ((campo == "ano_estreno" && campos.includes("ano_fin")) || campo == "ano_fin") {
			datos = {campo1: "ano_estreno", campo2: "ano_fin"};
			await formChange_dosCampos(datos, campo);
		}
		// Subcategoría + RCLV
		if (
			campo == "subcategoria_id" ||
			campo == "personaje_id" ||
			campo == "hecho_id" ||
			campo == "valor_id"
		)
			await formChange_camposCombinados(["subcategoria_id", "personaje_id", "hecho_id", "valor_id"]);
		// Fin
		formInputChange_botonGuardar();
	});

	// BOTONERA DE COMANDOS ----------------------------------
	// Edición Session
	botonVerSession.addEventListener("click", async () => {
		// Obtener Data-Entry de session
		let datosEdicS = await fetch(rutaSession).then((n) => n.json());
		// Fin
		if (!datosEdicS) datosEdicS = existeEdicG ? datosEdicG : datosOrig;
		comandos_ActualizarInput(botonVerSession, datosEdicS, false);
	});
	botonEliminarSession.addEventListener("click", (e) => {
		// Si el botón está inactivo, concluye la función
		if (Array.from(botonEliminarSession.classList).includes("inactivo")) return;
		fetch(rutaRQ); // Elimina el Data-Entry en session
		window.location.reload();
	});
	botonGuardarSession.addEventListener("click", (e) => {
		// Si el botón está inactivo, concluye la función
		if (Array.from(botonGuardarSession.classList).includes("inactivo")) e.preventDefault();
	});
	// Edición Guardada
	botonVerGuardada.addEventListener("click", () => {
		// Si el botón está inactivo, concluye la función
		if (Array.from(botonVerGuardada.classList).includes("inactivo") || !datosEdicG) return;
		// Ejecuta la función 'Input'
		comandos_ActualizarInput(botonVerGuardada, datosEdicG, true);
	});
	botonEliminarGuardada.addEventListener("click", (e) => {
		if (Array.from(botonEliminarGuardada.classList).includes("inactivo")) {
			e.preventDefault();
		}
	});
	// Original
	botonOriginal.addEventListener("click", () => {
		// Si el botón está inactivo, concluye la función
		if (Array.from(botonOriginal.classList).includes("inactivo") || !datosOrig) return;
		// Ejecuta la función 'Input'
		comandos_ActualizarInput(botonOriginal, datosOrig, true);
	});

	// STARTUP ------------------------------------------------------------------
	// Activa "Edición Guardada' si existe esa versión
	startup_activarEdicionGuardado();
	// Activa "Edición Session' si existe esa versión
	if (datosEdicS != datosEdicG) formInput_activarEdicionSession();
	// Actualiza 'subcategoría' si existe una categoría
	if (categoria.value) formInput_mostrarValoresSubcat();
	// Actualizar las flechas
	for (let i = 0; i < inputs.length; i++) actualizarInput_flechas(botonVerSession, i);
});

// FUNCIONES QUE SE PUEDEN CARGAR ANTES DEL ON-LOAD
let avatar_obtenerRutaNombre = (imagen, status, imagenOriginal) => {
	return imagen
		? (imagen.slice(0, 4) != "http"
				? status == "original"
					? "/imagenes/2-Productos/"
					: "/imagenes/3-ProdRevisar/"
				: "") + imagen
		: imagenOriginal && status == "edicion"
		? (imagenOriginal.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagenOriginal
		: "/imagenes/8-Agregar/IM.jpg";
};
let avatar_nuevoIngresado = async (e) => {
	// Creamos el objeto de la clase FileReader
	let reader = new FileReader();
	// Leemos el archivo subido y se lo pasamos a nuestro fileReader
	reader.readAsDataURL(e.target.files[0]);
	// Le decimos que cuando esté listo ejecute el código interno
	reader.onload = () => {
		let avatar = reader.result;
		avatar_cambiarEnLaVista(avatar, "#imagen #imagenProducto");
		avatar_cambiarEnLaVista(avatar, "#imagen #imagenProducto2");
	};
};
let avatar_cambiarEnLaVista = (avatar, identificadorElemento) => {
	// Crear elementos
	let preview = document.querySelector(identificadorElemento);
	let image = document.createElement("img");
	preview.innerHTML = "";
	image.src = avatar;
	// Cambiar el avatar visible
	preview.append(image);
};
