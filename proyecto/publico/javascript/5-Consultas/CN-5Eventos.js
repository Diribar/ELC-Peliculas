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
		// Reemplaza 'quitar la opción elegida' por el 'placeholder'
		else {
			// Reemplaza entre las opciones sin valor
			if (e.target.tagName == "SELECT" && !e.target.value) e.target.value = "";

			// Cambios de campo
			v.hayCambiosDeCampo = true;
			await cambioDePrefs();

			// Guarda la configuración en session y cookie
			actualiza.guardaConfigEnSessionCookie();
		}

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
		// Configuración - Botonera
		else if (padre.id == "iconosBotonera") {
			if (["nuevo", "edicion"].includes(nombre)) {
				// Variables
				v.nombreOK = false; // cuando se elige el ícono, se debe empezar a escribir el nombre

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
				await actualiza.statusInicialCampos("deshacer");
				await cambioDePrefs();
			} else if (nombre == "eliminar") {
				// Si hay un error, interrumpe la función
				const existe = await verificaConfigCons_id();
				if (!existe || !v.filtroPropio) return;

				// Acciones si existe
				await cambiosEnBD.eliminaConfigCons();
				await cambioDeConfig_id();
				await cambioDePrefs();
			} else if (nombre == "guardar") guardarBotonera();
			return;
		}

		// Filtros - 'palabrasClave'
		else if (nombre == "palabrasClave") {
			palabrasClave();
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
			actualiza.toggleFiltros();

			// Fin
			return;
		}

		// Encabezado - Toggle filtros para celular parado
		else if (
			nombre == "toggleFiltrosGlobal" ||
			(DOM.configCons.className.includes("aumentaX") &&
				["zonaDisponible", "telonFondo", "contadorDeProds", "quieroVer", "vistaDeResults", ""].includes(nombre))
		) {
			// Averigua si será la primera
			const startUp = !DOM.iconoParaMostrarPrefs.className.split(" ").some((n) => ["flechaDer", "flechaIzq"].includes(n));
			if (startUp) {
				DOM.iconoParaMostrarPrefs.classList.add("flechaIzq");
				DOM.configCons.classList.add("aumentaX");
			} else {
				DOM.iconoParaMostrarPrefs.classList.toggle("flechaDer");
				DOM.iconoParaMostrarPrefs.classList.toggle("flechaIzq");
				DOM.configCons.classList.toggle("aumentaX");
				DOM.configCons.classList.toggle("disminuyeX");
			}
		}

		// Encabezado - Compartir las preferencias
		else if (nombre == "compartirPrefs") {
			// Si el 'ppp' es un combo, lo convierte a su 'id'
			let configConsComp = {...configCons};
			if (configConsComp.pppOpciones && Array.isArray(configConsComp.pppOpciones)) {
				const combo = configConsComp.pppOpciones.toString();
				const pppOpcion = v.pppOpcsArray.find((n) => n.combo == combo);
				if (pppOpcion) configConsComp.pppOpciones = pppOpcion.id;
				else delete configConsComp.pppOpciones;
			}
			if (v.entidadBD.id == v.layoutBD.entDefault_id) delete configConsComp.entidad; // si la entidad es la estándar, elimina el campo

			// Obtiene los 'camposUrl'
			let camposUrl = "";
			for (let prop in configConsComp)
				if (configConsComp[prop] == v.filtrosConDefault[prop]) delete configConsComp[prop];
				else camposUrl += prop + "=" + configConsComp[prop] + "&";
			if (!camposUrl.length) return;

			// Obtiene el 'url' y lo lleva al clipboard
			camposUrl = camposUrl.slice(0, -1);
			const url = location.href + "/?" + camposUrl;
			navigator.clipboard.writeText(url);

			// Muestra la leyenda 'Consulta copiada'
			DOM.consCopiada.classList.remove("ocultar");
			setTimeout(() => DOM.consCopiada.classList.add("ocultar"), 2000);
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
	await cambioDePrefs();

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
