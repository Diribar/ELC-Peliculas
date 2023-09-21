"use strict";
window.addEventListener("load", async () => {
	// Eventos
	DOM.cuerpo.addEventListener("input", async (e) => {
		// Variables
		const nombre = e.target.name;

		// Acciones si se cambia la configuración
		if (nombre == "configCons_id") {
			// Averigua si hay un error y en caso afirmativo, interrumpe la función
			const existe = await verificaConfigCons_id();
			if (!existe) return;

			// Novedades
			await cambioDeConfig_id();
		}
		// Acciones en los demás casos
		else {
			// Nombre de configuración
			if (nombre == "nombreNuevo") {
				// Restringe el uso de caracteres a los aceptados
				basico.restringeCaracteres(e);

				// Restringe el largo del nombre
				const nombre = DOM.configNuevaNombre.value.slice(0, 30);
				DOM.configNuevaNombre.value = nombre;

				// Averigua si el nombre está OK
				const nombres = v.configsDeCabecera.filter((n) => n.usuario_id == v.userID).map((n) => n.nombre);
				v.nombreOK =
					nombre.length && // que tenga algún caracter
					!basico.validaCaracteres(nombre) && // que sean caracteres aceptables
					!nombres.includes(nombre); // que no se repita con un nombre anterior

				// Muestra/Oculta el ícono de confirmación
				actualiza.botoneraActivaInactiva();

				// Fin
				return;
			}
			// Palabras clave
			else if (nombre == "palabrasClave") {
				// Restringe el uso de caracteres a los aceptados
				basico.restringeCaracteres(e, true);

				// Valida los caracteres ingresados
				const nombre = DOM.palClave.value;
				const errores = nombre.length ? basico.validaCaracteres(nombre) : false;

				// Activa/Inactiva el ícono de confirmación
				errores ? DOM.palClaveAprob.classList.add("inactivo") : DOM.palClaveAprob.classList.remove("inactivo");

				// Fin
				return;
			}
			// Para reemplazar 'quitar' por el 'placeholder'
			else if (e.target.tagName == "SELECT" && !e.target.value) e.target.value = "";

			// Cambios de campo
			v.hayCambiosDeCampo = true;
		}

		// Funciones
		await cambioDeCampos();

		// Fin
		return;
	});
	DOM.cuerpo.addEventListener("click", async (e) => {
		// Variables
		const elemento = e.target;
		const padre = elemento.parentNode;
		const nombre = elemento.id ? elemento.id : padre.id;

		// Iconos
		if (elemento.tagName == "I") {
			// Si el ícono está inactivo, interrumpe la función
			if (elemento.className.includes("inactivo")) return;

			// Botonera
			if (padre.id == "iconosBotonera") {
				if (["nuevo", "edicion"].includes(nombre)) {
					// Variables
					v.nombreOK = false;

					// Valor en el input
					DOM.configNuevaNombre.value =
						nombre == "edicion" ? DOM.configCons_id.options[DOM.configCons_id.selectedIndex].text : "";

					// Alterna la clase 'nuevo' o 'edicion' en el input
					DOM.configNuevaNombre.classList.toggle(nombre);

					// Actualiza la botonera
					actualiza.botoneraActivaInactiva();

					// Pone el cursor en el input
					DOM.configNuevaNombre.focus();
				} else if (nombre == "deshacer") {
					await actualiza.valoresInicialesDeVariables();
					await actualiza.statusInicialCampos();
					await cambioDeCampos();
				} else if (nombre == "eliminar") {
					// Si hay un error, interrumpe la función
					const existe = await verificaConfigCons_id();
					if (!existe || !v.filtroPropio) return;

					// Acciones si existe
					await cambiosEnBD.eliminaConfigCons();
					await cambioDeConfig_id();
					await cambioDeCampos();
				} else if (nombre == "guardar") {
					guardarBotonera();
				}
			}
			// 'palabrasClave'
			else if (nombre == "palabrasClave") palabrasClave();
			// Preferencia por producto
			else if (nombre == "ppp" && (padre.id == "infoPeli" || padre.tagName == "TD")) {
				// Previene el efecto del anchor
				e.preventDefault();

				// Actualiza la 'ppp'
				await cambiosEnBD.ppp(elemento);
			}
			// Actualizar resultados (encabezado)
			else if (nombre == "actualizar") {
				if (v.obtener) {
					await resultados.obtiene();
					if (!v.mostrarCartelQuieroVer) resultados.muestra.generico();
				}
			}
			// Cierra el cartel "pppOpciones"
			else if (nombre == "cierra") padre.classList.add("ocultar");
		}

		// Cartel 'mostrarFiltros'
		else if ([padre.id, padre.parentNode.id].includes("mostrarOcultarFiltros")) {
			// Cambia el status de los botones
			DOM.mostrarFiltros.classList.toggle("ocultaFiltros");
			DOM.ocultarFiltros.classList.toggle("ocultaFiltros");

			// Muestra u oculta los filtros vacíos
			v.mostrarFiltros = DOM.mostrarFiltros.className.includes("ocultaFiltros");
			if (v.mostrarFiltros) DOM.nav.classList.remove("startUp");
			actualiza.muestraOcultaFiltros();
		}

		// Caption
		else if ([elemento.tagName, padre.tagName].includes("CAPTION")) {
			// Obtiene el índice
			let indice = v.captions.findIndex((n) => n == elemento);
			if (indice < 0) indice = v.captions.findIndex((n) => n == padre);
			if (indice < 0) return;

			// Muestra / Oculta el 'tbody'
			v.mostrarTBody = DOM.expandeContraes[indice].className.includes("fa-square-plus");
			v.mostrarTBody
				? DOM.tbodies[indice].classList.replace("ocultar", "aparece")
				: DOM.tbodies[indice].classList.replace("aparece", "ocultar");

			// Alterna el signo 'plus' o 'minus'
			["plus", "minus"].map((n) => DOM.expandeContraes[indice].classList.toggle("fa-square-" + n));
		}
		// Botón 'quieroVer'
		else if (padre.id == "carteles" && nombre == "quieroVer" && v.obtener) resultados.muestra.generico();
		// Anchor 'verVideo'
		else if (elemento == DOM.anchorVerVideo) {
			v.videoConsVisto = true;
			DOM.cartelVerVideo.classList.add("ocultar");
		}

		// Fin
		return;
	});
	DOM.cuerpo.addEventListener("keypress", (e) => {
		if (e.key == "Enter") {
			// Variables
			const elemento = e.target;
			const padre = elemento.parentNode;
			const nombre = elemento.id ? elemento.id : padre.id;

			// Acciones
			if (nombre == "palabrasClave") palabrasClave();
			else if (nombre == "configNueva") guardarBotonera();
		}
	});

	// Funciones
	let palabrasClave = async () => {
		DOM.palClaveAprob.classList.add("inactivo");
		v.hayCambiosDeCampo = true;
		await cambioDeCampos();

		// Fin
		return;
	};
	let guardarBotonera = async () => {
		if (v.nuevo || v.edicion) {
			// Obtiene el nuevo nombre
			configCons.nombre = DOM.configNuevaNombre.value;

			// Si es una configuración nueva, agrega la cabecera
			if (v.nuevo) await cambiosEnBD.creaUnaConfiguracion();

			// Si es una edición, lo avisa para que no guarde los datos de campo en la BD, ya que no cambiaron
			if (v.edicion) configCons.edicion = true;

			// Quita la clase
			const clase = v.nuevo ? "nuevo" : "edicion";
			DOM.configNuevaNombre.classList.remove(clase);
		}

		// Guarda la información en la base de datos
		await cambiosEnBD.guardaUnaConfiguracion();

		// Acciones particulares
		if (v.nuevo || v.propio) DOM.palClaveAprob.classList.add("inactivo");
		if (v.nuevo) await actualiza.valoresInicialesDeVariables();
		if (v.propio) v.hayCambiosDeCampo = false;

		// Actualiza la botonera
		actualiza.botoneraActivaInactiva();

		// Fin
		return;
	};
});

// Consolidadas
let cambioDeConfig_id = async () => {
	// Funciones
	await actualiza.valoresInicialesDeVariables();
	cambiosEnBD.configCons_id();
	await actualiza.statusInicialCampos();
	// actualiza.cartelQuieroVerVisible();
	actualiza.muestraOcultaFiltros();

	// Fin
	return;
};
let cambioDeCampos = async () => {
	// Cambio de clases
	DOM.configNuevaNombre.classList.remove("nuevo");
	DOM.configNuevaNombre.classList.remove("edicion");

	// Funciones
	actualizaConfigCons.consolidado();
	actualiza.botoneraActivaInactiva();
	if (v.obtener) {
		await resultados.obtiene();
		if (!v.mostrarCartelQuieroVer) resultados.muestra.generico();
	}

	// Fin
	return;
};
let verificaConfigCons_id = async () => {
	// Variables
	const configCons_id = Number(DOM.configCons_id.value);

	// Obtiene los registros posibles de configuración para el usuario
	const configsCons_id = v.configsDeCabecera.map((m) => m.id);

	// Averigua si el valor está entre los valores posibles
	const existe = configsCons_id.includes(configCons_id);

	// Si no existe, devuelve a su configuración anterior
	if (!existe) DOM.configCons_id.value = v.configCons_id;

	// Fin
	return existe;
};
