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
	let iconosError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	let rutaValidar = "/producto/api/edicion/validar/?";

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
	// Varios
	let avatarVisible = document.querySelector(".input-error #avatarVisible");
	let avatarNuevo = document.querySelector(".input-error #avatarNuevo");
	let imgAvatar = document.querySelector(".input-error #avatarVisible img");
	let iconosAyuda = document.querySelectorAll("main .fa-circle-question");

	// VERSIONES DE DATOS -------------------------------------------------------------
	// Variables
	let versiones = ["edicN", "edicG", "orig"];
	let versionActual = "edicN";
	let versionInput = versionActual;
	let versionAnt;
	let datos = {};
	let flechasDiferencia = document.querySelectorAll(".input-error .fa-arrow-right-long");
	let rutaVersiones = "/producto/api/edicion/obtener-original-y-edicion/";
	rutaVersiones += "?entidad=" + entidad + "&id=" + prodID;
	let producto_id =
		entidad == "peliculas" ? "pelicula_id" : entidad == "colecciones" ? "coleccion_id" : "capitulo_id";
	// Obtener versiones ORIGINAL, EDICION GUARDADA, y EDICION NUEVA
	[datos.orig, datos.edicG] = await fetch(rutaVersiones).then((n) => n.json());
	datos.orig.avatar = avatarAgregarLaRutaAlNombre(datos.orig.avatar, "original");
	datos.edicG = {...datos.orig, ...datos.edicG};
	datos.edicG.avatar = avatarAgregarLaRutaAlNombre(datos.edicG.avatar, "edicion", datos.orig.avatar);
	datos.edicN = {...datos.edicG};
	datos.edicN.avatar = document.querySelector("#avatarNuevo img").getAttribute("src");
	let orig_PendAprobar = datos.orig.status_registro.gr_pend_aprob;
	let edicG_existe = !!datos.edicG[producto_id];

	// Botones
	let botonesActivarVersion = document.querySelectorAll("#cuerpo #comandos .activar");
	let botonesDescartar = document.querySelectorAll("#cuerpo #comandos .descartar");
	let botonGuardar = document.querySelector("#cuerpo #comandos .guardar");
	// Botones de la edición nueva

	// Funciones Data-Entry
	let DE = {
		obtieneLosValoresEdicN: () => {
			// Actualizar los valores
			campos.forEach((campo, i) => {
				if (campo != "avatar") datos.edicN[campo] = inputs[i].value;
			});
			// Fin
			return;
		},
		accionesPorCambioDeVersion: function () {
			// Variables
			let estamosEnEdicNueva = versionActual == "edicN";
			// Rutina para cada campo
			campos.forEach((campo, i) => {
				// Reemplaza los valores
				if (campo != "avatar") inputs[i].value = datos[versionActual][campo];
				// Impide/permite que el usuario haga cambios en los datos de la versión
				inputs[i].disabled = !estamosEnEdicNueva;
				if (campo == "paises_id") {
					paisesMostrar.disabled = !estamosEnEdicNueva;
					paisesSelect.disabled = !estamosEnEdicNueva;
				}
			});
			// Activa/desactiva el mouse para el avatar
			estamosEnEdicNueva
				? avatarVisible.classList.add("pointer")
				: avatarVisible.classList.remove("pointer");
			// Reemplaza el avatar visible
			AV.actualizaVisible(datos[versionActual].avatar, avatarVisible);
			// Señala las diferencias con la versión original
			this.senalaLasDiferencias();
			// Muestra/oculta los íconos para RCLV
			let links = document.querySelectorAll(".input-error i.linkRCLV");
			for (let link of links)
				estamosEnEdicNueva ? link.classList.remove("inactivo") : link.classList.add("inactivo");
			// Muestra/oculta los íconos de ayuda
			for (let iconoAyuda of iconosAyuda)
				estamosEnEdicNueva
					? iconoAyuda.classList.remove("inactivo")
					: iconoAyuda.classList.add("inactivo");
			// Muestra los errores
			this.muestraLosErrores();
			// Fin
			return;
		},
		senalaLasDiferencias: () => {
			// Marcar dónde están las diferencias con la versión original
			campos.forEach((campo, i) => {
				versionActual != "orig" &&
				datos[versionActual][campo] != datos.orig[campo] &&
				(datos[versionActual][campo] || datos.orig[campo])
					? flechasDiferencia[i].classList.remove("ocultar")
					: flechasDiferencia[i].classList.add("ocultar");
			});
		},
		muestraLosErrores: async () => {
			// Preparar la información
			let objeto = "entidad=" + entidad + "&id=" + prodID;
			for (let input of inputs)
				if (input.name != "avatar") objeto += "&" + input.name + "=" + input.value;
			// Averiguar los errores
			let errores = await fetch(rutaValidar + objeto).then((n) => n.json());

			campos.forEach((campo, i) => {
				// Guarda el mensaje de error
				let mensaje = errores[campo];
				// Reemplaza
				let indice = campos.indexOf(campo);
				mensajesError[indice].innerHTML = mensaje;
				// Acciones en función de si hay o no mensajes de error
				mensaje
					? iconosError[indice].classList.remove("ocultar")
					: iconosError[indice].classList.add("ocultar");
			});
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
				this.actualizaVisible(avatar, avatarVisible);
				this.actualizaVisible(avatar, avatarNuevo);
			};
		},
	};

	// ADD EVENT LISTENERS --------------------------------------------------
	// Botones
	botonesActivarVersion.forEach((boton, indice) => {
		boton.addEventListener("click", () => {
			// Interrumpe si las versiones son iguales
			if (versionActual == versiones[indice]) return;
			// Interrumpe si el botón está inactivo
			if (boton.className.includes("inactivoVersion")) return;
			// Cambia la versión
			versionAnt = versionActual;
			versionActual = versiones[indice];
			// Cambia los valores
			DE.accionesPorCambioDeVersion();
			// Cambia el boton activo
			botonesActivarVersion.forEach((revisar, i) => {
				if (i != indice) revisar.classList.remove("activo");
				else revisar.classList.add("activo");
			});
		});
	});
	botonesDescartar.forEach((boton, indice) => {
		boton.addEventListener("click", () => {
			// Si está inactivo aborta la operación
			if (boton.className.includes("inactivo")) {
				console.log("está inactivo");
				return;
			}
			// Acciones si es la edición nueva
			else if (versiones[indice] == "edicN") {
				console.log("eliminada");
				datos.edicN = {...datos.orig, ...datos.edicG};
			}
			// Acciones si es la edición guardada
			else if (versiones[indice] == "edicG") {
				fetch("/producto/edicion/eliminar/?entidad=" + entidad + "&id=" + prodID);
				datos.edicG = {};
				datos.edicN = {...datos.orig};
				botonActivarVersion[indice].classList.add("inactivoVersion");
				boton.classList.add("inactivoVersion");
			}
			// Si se descartó la versión actual, recarga los valores
			if (versiones[indice] == versionActual) DE.accionesPorCambioDeVersion();
		});
	});
	botonGuardar.addEventListener("click", () => {
		// Si el botón está inactivo, concluye la función
		if (botonGuardar.className.includes("inactivo")) e.preventDefault();
	});

	// Revisar campos en forma INDIVIDUAL
	form.addEventListener("input", async (e) => {
		// Acciones si no se cambió de versión
		if (versionInput == "edicN") {
			DE.obtieneLosValoresEdicN();
			DE.muestraLosErrores();
		} else versionInput = versionActual;
	});
	// Revisar campos COMBINADOS
	form.addEventListener("change", async (e) => {});

	// Startup
	// Obtiene los valores para EdicN
	DE.obtieneLosValoresEdicN();
	// Muestra los errores
	DE.muestraLosErrores();
	// Si corresponde, activa la botonera de edicG
	if (edicG_existe) {
		// Versión
		botonesActivarVersion[1].classList.remove("inactivoVersion");
		// Descartar
		if (!orig_PendAprobar) botonesDescartar[1].classList.remove("inactivoVersion");
	}
});
let avatarAgregarLaRutaAlNombre = (imagenActual, status, imagenBackup) => {
	return imagenActual
		? (imagenActual.startsWith("http")
				? ""
				: status == "original"
				? "/imagenes/2-Productos/"
				: "/imagenes/3-ProdRevisar/") + imagenActual
		: imagenBackup
		? imagenBackup
		: "/imagenes/8-Agregar/IM.jpg";
};
