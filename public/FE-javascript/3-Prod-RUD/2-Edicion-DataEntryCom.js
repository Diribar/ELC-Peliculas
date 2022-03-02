window.addEventListener("load", async () => {
	// VARIABLES GENERALES -----------------------------------------------------------------------
	// Pointer del producto
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	// Data Entry
	let form = document.querySelector("form");
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconoOK = document.querySelectorAll(".input-error .fa-circle-check");
	let iconoError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");

	// VERSIONES DE DATOS -------------------------------------------------------------------------
	// Obtener versiones GUARDADA y ORIGINAL
	let rutaVersiones =
		"/producto/edicion/api/obtener-versiones/?entidad=" + entidad + "&id=" + prodID;
	let [datosOriginales, datosEdicG] = await fetch(rutaVersiones).then((n) => n.json());
	let flechasAviso = document.querySelectorAll(".input-error .fa-arrow-right-long");
	let rutaVE = "/producto/edicion/api/validar-edicion/?";
	// Temas de la versión ORIGINAL
	let botonOriginal = document.querySelector("#cuerpo #comandos .fa-house");
	let avatar_or = avatar_obtenerRutaNombre(datosOriginales.avatar, "original");
	// Temas de la version GUARDADA
	let botonVerGuardada = document.querySelector("#cuerpo #comandos .fa-pencil");
	let botonEliminarGuardada = document.querySelector("#cuerpo #comandos #guardada .fa-trash-can");
	let inactivo_EdicGua = document.querySelectorAll("#cuerpo #comandos .inactivo_EdicGua");
	let existeEdicG = !!datosEdicG.ELC_id;
	let avatar_eg = datosEdicG.avatar
		? avatar_obtenerRutaNombre(datosEdicG.avatar, "edicion")
		: datosOriginales.imagen;
	let status_creada = existeEdicG ? datosEdicG.status_registro.creado : false;
	// Temas de la versión SESSION
	let botonVerSession = document.querySelector("#cuerpo #comandos .fa-pen-to-square");
	let botonEliminarSession = document.querySelector("#cuerpo #comandos #session .fa-trash-can");
	let botonGuardarSession = document.querySelector("#cuerpo #comandos .fa-floppy-disk");
	let rutaSession =
		"/producto/edicion/api/obtener-de-req-session/?entidad=" + entidad + "&id=" + prodID;
	let datosEdicS = await fetch(rutaSession).then((n) => n.json());
	datosEdicS = datosEdicS ? datosEdicS : existeEdicG ? datosEdicG : datosOriginales;
	let avatar_es = avatar_eg; // Porque al cargar la vista no hay archivo 'input'
	let rutaRQ = "/producto/edicion/api/enviar-a-req-session/?";

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
			iconoOK[indiceSC].classList.add("ocultar");
			iconoError[indiceSC].classList.remove("ocultar");
		}

		// Tareas varias
		if (campo == "avatar" && !error.hay) avatar_nuevoIngresado(e); // Cambia el avatar
		formInputChange_botonGuardar(); // Activa/Desactiva el botón 'Guardar'
		fetch(rutaRQ + actualizarInput_dataEntry()); // Guarda el Data-Entry en session
		formInput_activarEdicionSession(); // Activa las opciones de session

		// Le pone la flecha al campo cambiado
		let indice = campos.indexOf(campo);
		flechasAviso[indice].classList.remove("ocultar");
	});
	// Revisar campos COMBINADOS
	form.addEventListener("change", async (e) => {
		// Obtener el valor para 'campo'
		let campo = e.target.name;
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
			await formChange_camposCombinados([
				"subcategoria_id",
				"personaje_id",
				"hecho_id",
				"valor_id",
			]);
		// Fin
		formInputChange_botonGuardar();
	});

	// BOTONERA DE COMANDOS ----------------------------------
	// Edición Session
	botonVerSession.addEventListener("click", async () => {
		// Obtener Data-Entry de session
		let datosEdicS = await fetch(rutaSession).then((n) => n.json());
		// Obtener el avatar
		let imagen = document.querySelector("#imagenProducto img");
		//avatar_es=
		// Fin
		if (!datosEdicS) datosEdicS = existeEdicG ? datosEdicG : datosOriginales;
		comandos_ActualizarInput(botonVerSession, datosEdicS, (readOnly = false));
	});
	botonEliminarSession.addEventListener("click", (e) => {
		// Si el botón está inactivo, concluye la función
		if (Array.from(botonEliminarSession.classList).join(" ").includes("inactivo")) return;
		fetch(rutaRQ); // Elimina el Data-Entry en session
		location.reload();
	});
	botonGuardarSession.addEventListener("click", (e) => {
		// Si el botón está inactivo, concluye la función
		if (Array.from(botonGuardarSession.classList).join(" ").includes("inactivo")) {
			e.preventDefault();
		}
	});
	// Edición Guardada
	botonVerGuardada.addEventListener("click", () => {
		// Si el botón está inactivo, concluye la función
		if (Array.from(botonVerGuardada.classList).join(" ").includes("inactivo") || !datosEdicG)
			return;
		// Ejecuta la función 'Input'
		comandos_ActualizarInput(botonVerGuardada, datosEdicG, (readOnly = true));
	});
	botonEliminarGuardada.addEventListener("click", (e) => {
		if (Array.from(botonEliminarGuardada.classList).join(" ").includes("inactivo")) {
			e.preventDefault();
		}
	});
	// Original
	botonOriginal.addEventListener("click", () => {
		// Si el botón está inactivo, concluye la función
		if (Array.from(botonOriginal.classList).join(" ").includes("inactivo") || !datosOriginales)
			return;
		// Ejecuta la función 'Input'
		comandos_ActualizarInput(botonOriginal, datosOriginales, (readOnly = true));
	});

	// FUNCIONES ---------------------------------------------
	let comandos_ActualizarInput = async (botonVersion, datosVersion, disabled) => {
		// Rutina para cada input
		for (let i = 0; i < inputs.length; i++) {
			actualizarInput_flechas(botonVersion, datosVersion, i);
			actualizarInput_valores(botonVersion, datosVersion, i, disabled);
		}
		// Rutinas para todo el form
		actualizarInput_clasePlus(botonVersion);
		// Actualizar los errores
		let rutaVE = "/producto/edicion/api/validar-edicion/?";
		let errores = await fetch(rutaVE + actualizarInput_dataEntry()).then((n) => n.json());
		actualizarInput_errores(errores, campos, (mostrarOK = false));
	};
	let actualizarInput_flechas = (botonVersion, datosVersion, i) => {
		if (inputs[i].name != "avatar")
			inputs[i].value != datosVersion[inputs[i].name] &&
			(inputs[i].value || datosVersion[inputs[i].name])
				? flechasAviso[i].classList.remove("ocultar")
				: flechasAviso[i].classList.add("ocultar");
		else {
			// Obtener los avatar ACTUAL y NUEVO
			avatarActual = document.querySelector("#imagenProducto img").src;
			avatarNuevo = actualizarInput_AvatarDeLaNuevaVersion(botonVersion);
			// Compararlos y tomar acciones
			avatarActual != avatarNuevo
				? flechasAviso[i].classList.remove("ocultar")
				: flechasAviso[i].classList.add("ocultar");
		}
	};
	let actualizarInput_valores = (botonVersion, datosVersion, i, disabled) => {
		// Actualizar los valores en los inputs
		if (inputs[i].name != "avatar")
			datosVersion[inputs[i].name] != undefined
				? (inputs[i].value = datosVersion[inputs[i].name])
				: (inputs[i].value = "");
		else {
			// Actualizar el avatar
			avatar = actualizarInput_AvatarDeLaNuevaVersion(botonVersion);
			avatar_cambiarEnLaVista(avatar, "#imagen #imagenProducto");
		}
		inputs[i].disabled = disabled;
	};
	let actualizarInput_clasePlus = (boton) => {
		// Variable de botones versiones
		let botonesVersion = document.querySelectorAll("#cuerpo #comandos .version");
		// Colocarle la clase 'plus' al ícono que corresponde
		for (botonVersion of botonesVersion) {
			botonVersion == boton
				? botonVersion.classList.add("plus")
				: botonVersion.classList.remove("plus");
		}
	};
	let actualizarInput_errores = (errores, camposEspecificos, mostrarOK) => {
		for (campo of camposEspecificos) {
			// Guarda el mensaje de error
			mensaje = errores[campo];
			// Reemplaza
			indice = campos.indexOf(campo);
			mensajesError[indice].innerHTML = mensaje;
			// Acciones en función de si hay o no mensajes de error
			mensaje
				? iconoError[indice].classList.remove("ocultar")
				: iconoError[indice].classList.add("ocultar");
			mensaje || !mostrarOK
				? iconoOK[indice].classList.add("ocultar")
				: iconoOK[indice].classList.remove("ocultar");
		}
	};
	let actualizarInput_AvatarDeLaNuevaVersion = (botonVersion) => {
		avatar_es = document.querySelector("#imagenProducto2 img").src;
		return botonVersion == botonOriginal
			? avatar_or
			: botonVersion == botonVerGuardada
			? avatar_eg
			: avatar_es;
	};
	let actualizarInput_dataEntry = () => {
		let objeto = "entidad=" + entidad + "&id=" + prodID;
		for (input of inputs) {
			if (input.name != "avatar") objeto += "&" + input.name + "=" + input.value;
		}
		return objeto;
	};
	let formInputChange_botonGuardar = () => {
		let OK =
			Array.from(iconoOK)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar < iconoOK.length;
		let error =
			Array.from(iconoError)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar < iconoError.length;
		OK && !error
			? botonGuardarSession.classList.remove("inactivoErrores")
			: botonGuardarSession.classList.add("inactivoErrores");
	};
	let formInputChange_consecuenciaError = (error, campo) => {
		// Guarda el mensaje de error
		mensaje = error[campo];
		// Reemplaza el mensaje
		indice = campos.indexOf(campo);
		mensajesError[indice].innerHTML = error[campo];
		// Acciones en función de si hay o no mensajes de error
		mensaje
			? iconoError[indice].classList.remove("ocultar")
			: iconoError[indice].classList.add("ocultar");
		!mensaje
			? iconoOK[indice].classList.remove("ocultar")
			: iconoOK[indice].classList.add("ocultar");
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
			paises_idArray = paisesID.value.split(", ");
			indice = paises_idArray.indexOf(paisID);
			paises_idArray.splice(indice, 1);
			paisesID.value = paises_idArray.join(", ");
		}
		// Agregar los países a mostrar
		paisesNombre = "";
		if (paisesID.value) {
			paises_idArray = paisesID.value.split(", ");
			for (pais_id of paises_idArray) {
				paisNombre = paisesListado.find((n) => n.id == pais_id).nombre;
				paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
			}
		}
		paisesMostrar.value = paisesNombre;
	};
	let formInput_activarEdicionSession = () => {
		// Quitar la clase 'inactivo_EdicSess'
		let inactivo_EdicSess = document.querySelectorAll("#cuerpo #comandos .inactivo_EdicSess");
		for (inactivo of inactivo_EdicSess) {
			if (inactivo.classList.contains("inactivo_EdicSess"))
				inactivo.classList.remove("inactivo_EdicSess");
		}
	};
	let formInput_mostrarValoresSubcat = () => {
		for (opcion of subcategoriaOpciones) {
			opcion.className.includes(categoria.value)
				? opcion.classList.remove("ocultar")
				: opcion.classList.add("ocultar");
		}
	};
	let formChange_dosCampos = async (datos, campo) => {
		campo1 = datos.campo1;
		campo2 = datos.campo2;
		indice1 = campos.indexOf(campo1);
		indice2 = campos.indexOf(campo2);
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
			: actualizarInput_errores(errores, camposEspecificos, (mostrarOK = true));
	};
	let startup_activarEdicionGuardado = () => {
		// Quita 'inactivo_EdicGua' si existe una versión 'guardada'
		if (existeEdicG) {
			for (inactivo of inactivo_EdicGua) {
				if (inactivo != botonEliminarGuardada || !status_creada)
					inactivo.classList.remove("inactivo_EdicGua");
			}
		}
	};

	// STARTUP ------------------------------------------------------------------
	// Activa "Edición Guardada' si existe esa versión
	startup_activarEdicionGuardado();
	// Activa "Edición Session' si existe esa versión
	if (datosEdicS == datosEdicG) formInput_activarEdicionSession()
	// Actualiza 'subcategoría' si existe una categoría
	if (categoria.value) formInput_mostrarValoresSubcat();
});

// FUNCIONES QUE SE PUEDEN CARGAR ANTES DEL ON-LOAD
let avatar_obtenerRutaNombre = (imagen, status) => {
	return imagen
		? (imagen.slice(0, 4) != "http"
				? status == "original"
					? "/imagenes/2-Productos/"
					: "/imagenes/3-ProdRevisar/"
				: "") + imagen
		: "/imagenes/8-Agregar/IM.jpg";
};
let avatar_nuevoIngresado = async (e) => {
	// Creamos el objeto de la clase FileReader
	reader = new FileReader();
	// Leemos el archivo subido y se lo pasamos a nuestro fileReader
	reader.readAsDataURL(e.target.files[0]);
	// Le decimos que cuando esté listo ejecute el código interno
	reader.onload = () => {
		avatar = reader.result;
		avatar_cambiarEnLaVista(avatar, "#imagen #imagenProducto");
		avatar_cambiarEnLaVista(avatar, "#imagen #imagenProducto2");
	};
};
let avatar_cambiarEnLaVista = (avatar, identificadorElemento) => {
	// Crear elementos
	image = document.createElement("img");
	preview = document.querySelector(identificadorElemento);
	preview.innerHTML = "";
	image.src = avatar;
	// Cambiar el avatar visible
	preview.append(image);
};
