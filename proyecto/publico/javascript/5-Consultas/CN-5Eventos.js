"use strict";
window.addEventListener("load", async () => {
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
				const nombres = v.configCons_cabeceras.filter((n) => n.usuario_id == v.userID).map((n) => n.nombre);
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

		// Si el ícono está inactivo, interrumpe la función
		if (elemento.tagName == "I" && elemento.className.includes("inactivo")) return;

		// Toggle filtros para celular parado
		if (nombre == "toggleFiltrosGlobal" || (nombre == "zonaDisponible" && DOM.configCons.className.includes("aumentaX"))) {
			const startUp = !DOM.muestraFiltrosGlobal.className.split(" ").some((n) => ["flechaDer", "flechaIzq"].includes(n));
			if (startUp) {
				DOM.muestraFiltrosGlobal.classList.add("flechaIzq");
				DOM.configCons.classList.add("aumentaX");
			} else {
				DOM.muestraFiltrosGlobal.classList.toggle("flechaDer");
				DOM.muestraFiltrosGlobal.classList.toggle("flechaIzq");
				DOM.configCons.classList.toggle("aumentaX");
				DOM.configCons.classList.toggle("disminuyeX");
			}
		}

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
			} else if (nombre == "guardar") guardarBotonera();
			return;
		}

		// 'palabrasClave'
		if (nombre == "palabrasClave") {
			palabrasClave();
			return;
		}

		// Preferencia por producto
		if (nombre == "ppp" && (padre.id == "infoSup" || padre.tagName == "TD")) {
			e.preventDefault(); // Previene el efecto del anchor
			await cambiosEnBD.ppp(elemento); // Actualiza la 'ppp'
			return;
		}

		// Actualizar resultados (encabezado)
		if (nombre == "actualizar") {
			if (v.opcion_id) {
				await resultados.obtiene();
				if (!v.mostrarCartelQuieroVer) resultados.muestra.generico();
			}
			return;
		}

		// Cierra el cartel "pppOpciones"
		if (nombre == "cierra") {
			padre.classList.add("ocultar");
			return;
		}

		// Cartel 'muestraFiltros'
		if ([padre.id, padre.parentNode.id].includes("toggleFiltrosIndivs")) {
			// Cambia el status de los botones
			DOM.muestraFiltros.classList.toggle("ocultaFiltros");
			DOM.ocultaFiltros.classList.toggle("ocultaFiltros");

			// Muestra u oculta los filtros vacíos
			v.muestraFiltros = DOM.muestraFiltros.className.includes("ocultaFiltros");
			if (v.muestraFiltros) DOM.nav.classList.remove("startUp");
			actualiza.toggleFiltrosIndivs();

			// Fin
			return;
		}

		// Caption - expande/contrae la tabla
		if ([elemento.tagName, padre.tagName].includes("CAPTION")) {
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

			// Fin
			return;
		}

		// Botón 'quieroVer'
		if (padre.id == "carteles" && nombre == "quieroVer" && v.opcion_id) {
			resultados.muestra.generico();
			return;
		}

		// Anchor 'verVideo'
		if (elemento == DOM.anchorVerVideo) {
			v.videoConsVisto = true;
			DOM.cartelVerVideo.classList.add("ocultar");
			return;
		}
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
let cambioDeConfig_id = async () => {
	// Funciones
	await actualiza.valoresInicialesDeVariables();
	cambiosEnBD.configCons_id();
	await actualiza.statusInicialCampos();
	actualiza.toggleFiltrosIndivs();

	// Fin
	return;
};
let cambioDeCampos = async () => {
	// Cambio de clases
	DOM.configNuevaNombre.classList.remove("nuevo");
	DOM.configNuevaNombre.classList.remove("edicion");

	// Funciones
	actualizaConfigCons.consolidado(); // obtiene los resultados
	actualiza.botoneraActivaInactiva(); // actualiza la botonera
	if (v.opcion_id) {
		await resultados.obtiene(); // obtiene los resultados
		if (!v.mostrarCartelQuieroVer) resultados.muestra.generico(); // muestra los resultados
	}
	actualiza.guardaFiltrosActuales(); // guarda los filtros en session y cookie

	// Fin
	return;
};
let verificaConfigCons_id = async () => {
	// Variables
	const configCons_id = Number(DOM.configCons_id.value);

	// Obtiene los registros posibles de configuración para el usuario
	const configsCons_id = v.configCons_cabeceras.map((m) => m.id);

	// Averigua si el valor está entre los valores posibles
	const existe = configsCons_id.includes(configCons_id);

	// Si no existe, devuelve a su configuración anterior
	if (!existe) DOM.configCons_id.value = v.configCons_id;

	// Fin
	return existe;
};
