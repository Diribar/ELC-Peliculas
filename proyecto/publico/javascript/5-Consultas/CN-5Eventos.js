"use strict";
window.addEventListener("load", async () => {
	DOM.cuerpo.addEventListener("input", async (e) => {
		// Variables
		const nombre = e.target.name;

		// Acciones si se cambia la configuración
		if (nombre == "cabecera_id") {
			// Averigua si hay un error y en caso afirmativo, interrumpe la función
			const existe = await verificaConfigCons_id();
			if (!existe) return;

			// Novedades
			await cambioDeConfig_id();
			await cambioDePrefs();
		}
		// Nombre de configuración
		else if (nombre == "nombreNuevo") {
			// Restringe el uso de caracteres a los aceptados
			basico.restringeCaracteres(e);

			// Restringe el largo del nombre
			const nombre = DOM.configNuevaNombre.value.slice(0, 30);
			DOM.configNuevaNombre.value = nombre;

			// Averigua si el nombre está OK
			const nombres = v.cabeceras.filter((n) => n.usuario_id == v.userID).map((n) => n.nombre);
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
			// Valida los caracteres ingresados
			const palabrasClave = DOM.palClaveInput.value;
			const errores = palabrasClave.length ? basico.validaCaracteres(palabrasClave) : false;

			// Acciones
			DOM.palClaveIcono.classList.remove("fa-circle-xmark");
			palabrasClave.length && !errores
				? DOM.palClaveIcono.classList.add("fa-circle-right") // si se puede confirmar
				: DOM.palClaveIcono.classList.remove("fa-circle-right"); // si no se puede confirmar

			// Fin
			return;
		}
		// Reemplaza 'quitar la opción elegida' por el 'placeholder'
		else {
			// Reemplaza entre las opciones sin valor
			if (e.target.tagName == "SELECT" && !e.target.value) e.target.value = "";
			await estandarParaInputs();
		}

		// Fin
		return;
	});
	DOM.cuerpo.addEventListener("keydown", async (e) => {
		// Variables
		const elemento = e.target;
		const padre = elemento.parentNode;
		const nombre = elemento.id ? elemento.id : padre.id;

		// Particularidades para 'palabrasClave'
		if (nombre == "palabrasClave") {
			// Tecla 'Enter'
			if (e.key == "Enter") {
				// Si está habilitado para confirmar
				if (DOM.palClaveIcono.className.includes("fa-circle-right")) {
					DOM.palClaveIcono.classList.replace("fa-circle-right", "fa-circle-xmark");
					await estandarParaInputs();
				}
				// Si se cancelan las 'palabrasClave'
				else if (DOM.palClaveIcono.className.includes("fa-circle-xmark")) {
					DOM.palClaveIcono.classList.remove("fa-circle-xmark");
					DOM.palClaveInput.value = "";
					await estandarParaInputs();
				}
			}

			// Restringe el uso de caracteres a los aceptados
			else if (basico.validaCaracteres(e.key)) e.preventDefault();
		}

		// Teclas - Enter
		if (e.key == "Enter" && nombre == "configNueva") await guardarBotonera();
		// Teclas - Escape
		else if (e.key == "Escape" && DOM.configNuevaNombre.className.split(" ").some((n) => ["nuevo", "edicion"].includes(n))) {
			DOM.configNuevaNombre.classList.remove("nuevo", "edicion"); // Oculta el input
			v.nombreOK = false; // Variables
			actualiza.botoneraActivaInactiva(); // Actualiza la botonera
		}

		// Fin
		return;
	});
	DOM.cuerpoFooterImgDer.addEventListener("click", async (e) => {
		// Variables
		const elemento = e.target;
		const padre = elemento.parentNode;
		const nombre = elemento.id ? elemento.id : padre.id;
		let muestraFiltros;

		// Si el ícono está inactivo, interrumpe la función
		if (elemento.tagName == "I" && elemento.className.includes("inactivo")) return;
		// Configuración - Botonera
		else if (padre.id == "iconosBotonera") {
			if (["nuevo", "edicion"].includes(nombre)) {
				// Variables
				v.nombreOK = false; // cuando se elige el ícono, se debe empezar a escribir el nombre

				// Valor inicial en el input, para la edición
				DOM.configNuevaNombre.value =
					nombre == "edicion" ? DOM.cabecera_id.options[DOM.cabecera_id.selectedIndex].text : "";

				// Alterna la clase 'nuevo' o 'edicion' en el input
				DOM.configNuevaNombre.classList.toggle(nombre);

				// Actualiza la botonera
				actualiza.botoneraActivaInactiva();

				// Pone el cursor en el input
				DOM.configNuevaNombre.focus();
			} else if (nombre == "deshacer") {
				await actualiza.valoresInicialesDeVariables();
				await actualiza.statusInicialCampos("deshacer");
				await cambioDePrefs();
			} else if (nombre == "eliminar") {
				// Si hay un error, interrumpe la función
				const existe = await verificaConfigCons_id();
				if (!existe || !v.filtroPropio) return;

				// Acciones si existe
				await cambiosEnBD.eliminaConfig();
				await cambioDeConfig_id();
				await cambioDePrefs();
			} else if (nombre == "guardar") guardarBotonera();

			// Fin
			return;
		}

		// Filtros - 'palabrasClave'
		else if (nombre == "palClaveIcono") {
			if (DOM.palClaveIcono.className.includes("fa-circle-xmark")) {
				DOM.palClaveIcono.classList.remove("fa-circle-xmark");
				DOM.palClaveInput.value = "";
			} else if (DOM.palClaveIcono.className.includes("fa-circle-right"))
				DOM.palClaveIcono.classList.replace("fa-circle-right", "fa-circle-xmark");

			// Actualiza el input
			await estandarParaInputs();

			// Fin
			return;
		}

		// Filtros - Cartel 'muestraFiltros'
		else if ([padre.id, padre.parentNode.id].includes("toggleFiltros")) {
			// Cambia el status de los botones
			DOM.muestraFiltros.classList.toggle("ocultaFiltros");
			DOM.ocultaFiltros.classList.toggle("ocultaFiltros");

			// Muestra u oculta los filtros vacíos
			v.muestraFiltros = DOM.muestraFiltros.className.includes("ocultaFiltros");
			if (v.muestraFiltros) DOM.nav.classList.remove("startUp");
			actualiza.toggleBotonFiltros();

			// Fin
			return;
		}

		// Encabezado - Muestra filtros para celular parado
		else if (nombre == "toggleFiltrosGlobal") {
			// Cambia la flecha
			DOM.iconoParaMostrarPrefs.classList.remove("flechaDer");
			DOM.iconoParaMostrarPrefs.classList.add("flechaIzq");

			// Muestra los filtros
			DOM.configCons.classList.remove("disminuyeX");
			DOM.configCons.classList.add("aumentaX");

			// Cambia la variable para que se muestren los filtros
			muestraFiltros = true;
		}

		// Encabezado - Compartir las preferencias
		else if (nombre == "compartirCons") {
			// Variables
			let configCons = {id: cabecera.id, ...prefs};

			// Si el 'ppp' es un combo, lo convierte a su 'id'
			if (configCons.pppOpciones && Array.isArray(configCons.pppOpciones)) {
				const combo = configCons.pppOpciones.toString();
				const pppOpcion = v.pppOpcsArray.find((n) => n.combo == combo);
				if (pppOpcion) configCons.pppOpciones = pppOpcion.id;
				else delete configCons.pppOpciones;
			}
			if (v.entidadBD.id == v.layoutBD.entDefault_id) delete configCons.entidad; // si la entidad es la estándar, elimina el campo

			// Obtiene los 'camposUrl'
			let camposUrl = "";
			for (let prop in configCons) camposUrl += prop + "=" + configCons[prop] + "&";
			if (!camposUrl.length) return;
			else camposUrl = camposUrl.slice(0, -1);

			// Obtiene el 'url' y lo lleva al clipboard
			const url = location.href + "/?" + camposUrl;
			navigator.clipboard.writeText(url);

			// Muestra la leyenda 'Consulta copiada'
			DOM.consCopiada.classList.remove("ocultar");
			setTimeout(() => DOM.consCopiada.classList.add("ocultar"), v.setTimeOutStd);
		}

		// Mostrar resultados - Preferencia por producto
		else if (nombre == "ppp" && (padre.id == "infoSup" || padre.tagName == "TD")) {
			e.preventDefault(); // Previene el efecto del anchor
			await cambiosEnBD.ppp(elemento); // Actualiza la 'ppp'
			return;
		}

		// Mostrar resultados - Actualizar resultados
		else if (nombre == "actualizar") {
			if (v.layout_id) {
				await resultados.obtiene();
				if (!v.mostrarCartelQuieroVer) resultados.muestra.generico();
			}
			return;
		}

		// Mostrar resultados - Cierra el cartel "pppOpciones"
		else if (nombre == "cierra") {
			padre.classList.add("ocultar");
			return;
		}

		// Mostrar resultados - Expande/contrae la tabla
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

			// Fin
			return;
		}

		// Mostrar resultados - Botón 'quieroVer'
		else if (padre.id == "carteles" && nombre == "quieroVer" && v.layout_id) {
			resultados.muestra.generico();
			return;
		}

		// Mostrar resultados - Anchor 'verVideo'
		else if (elemento == DOM.anchorVerVideo) {
			v.videoConsVisto = true;
			DOM.cartelVerVideo.classList.add("ocultar");
			return;
		}

		// Si los filtros para celular parado están visibles, los oculta
		if (DOM.configCons.className.includes("aumentaX")) {
			// Si el evento fue en la zona 'configCons', actualiza 'muestraFiltros'
			if (elemento.closest("#configCons")) muestraFiltros = true;

			// Acciones si se deben ocultar los filtros
			if (!muestraFiltros) {
				// Cambia la flecha
				DOM.iconoParaMostrarPrefs.classList.remove("flechaIzq");
				DOM.iconoParaMostrarPrefs.classList.add("flechaDer");

				// Oculta los filtros
				DOM.configCons.classList.remove("aumentaX");
				DOM.configCons.classList.add("disminuyeX");
			}
		}
		// De lo contrario, alterna entre lo que se muestra sobre la 'imagen derecha'
		else if (elemento == DOM.imgDerecha) {
			let seHicieronCambios;

			// 1. Si se ve 'vistaDeResults', lo oculta y muestra 'cartelRCLV'
			if (!DOM.vistaDeResults.className.includes("toggle")) {
				DOM.vistaDeResults.classList.add("toggle");
				if (DOM.cartelRCLV) DOM.cartelRCLV.classList.remove("toggle");
				seHicieronCambios = true;
			}

			// 2. Si se ve 'cartelRCLV', lo oculta
			if (!seHicieronCambios && DOM.cartelRCLV && !DOM.cartelRCLV.className.includes("toggle")) {
				DOM.vistaDeResults.classList.add("toggle");
				DOM.cartelRCLV.classList.add("toggle");
				seHicieronCambios = true;
			}

			// 3. Si no se hicieron cambios, muestra 'vistaDeResults'
			if (!seHicieronCambios) DOM.vistaDeResults.classList.remove("toggle");
		}
	});
});
// Funciones
let guardarBotonera = async () => {
	if (v.nuevo || v.edicion) {
		// Obtiene el nuevo nombre
		cabecera.nombre = DOM.configNuevaNombre.value;

		// Si es una configuración nueva, agrega la cabecera
		if (v.nuevo) await cambiosEnBD.creaConfig();

		// Si es una edición, lo avisa para que no guarde los datos de campo en la BD, ya que no cambiaron
		if (v.edicion) cabecera.edicion = true;

		// Quita la clase
		const clase = v.nuevo ? "nuevo" : "edicion";
		DOM.configNuevaNombre.classList.remove(clase);
	}

	// Guarda la información en la base de datos
	await cambiosEnBD.guardaConfig();

	// Acciones particulares
	if (v.nuevo || v.propio) DOM.palClaveIcono.classList.replace("fa-circle-right", "fa-circle-xmark");
	if (v.nuevo) await actualiza.valoresInicialesDeVariables();
	if (v.propio) v.hayCambiosDeCampo = false;

	// Actualiza la botonera
	actualiza.botoneraActivaInactiva();

	// Fin
	return;
};
let verificaConfigCons_id = async () => {
	// Variables
	const cabecera_id = Number(DOM.cabecera_id.value);

	// Obtiene los registros posibles de configuración para el usuario
	const cabeceras_id = v.cabeceras.map((m) => m.id);

	// Averigua si el valor está entre los valores posibles
	const existe = cabeceras_id.includes(cabecera_id);

	// Si no existe, devuelve a su configuración anterior
	if (!existe) DOM.cabecera_id.value = cabecera.id;

	// Fin
	return existe;
};
let estandarParaInputs = async () => {
	// Cambios de campo
	v.hayCambiosDeCampo = true;
	await cambioDePrefs();

	// Guarda la configuración en session y cookie
	sessionCookie.guardaConfig();

	// Fin
	return;
};
