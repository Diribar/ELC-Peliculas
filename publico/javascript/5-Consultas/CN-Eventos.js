"use strict";
window.addEventListener("load", async () => {
	// Variables
	DOM = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		// Encabezado, Cabecera, Campos
		prefsSimples: document.querySelectorAll("#cuerpo :is(#encabezado, #configsDeCampo) select"),
		encabezado: document.querySelector("#encabMasPelis #encabezado"),
		configCons: document.querySelector("#configCons"),
		configCabecera: document.querySelector("#configCons #configDeCabecera"),
		configCampos: document.querySelector("#configCons #configsDeCampo nav"),
		// Zona de productos
		zonaProds: document.querySelector("#zonaDeProds"),
	};
	DOM = {
		...DOM,

		// Encabezado
		layout_id: DOM.encabezado.querySelector("select[name='layout_id']"),
		orden_id: DOM.encabezado.querySelector("select[name='orden_id']"),
		orden_idOpciones: DOM.encabezado.querySelectorAll("select[name='orden_id'] option:not(option[value=''])"),
		ascDes: DOM.encabezado.querySelector("#ascDes"),
		contador_de_prods: DOM.encabezado.querySelector("#derecha #contador_de_prods"),

		// Configuracion
		iconos: DOM.configCons.querySelectorAll("i"),

		// Configuración de Cabecera
		configNuevaNombre: DOM.configCabecera.querySelector("#configNueva input[name='nombreNuevo']"),
		configCons_id: DOM.configCabecera.querySelector("select[name='configCons_id']"),
		configsConsPropios: DOM.configCabecera.querySelector("select[name='configCons_id'] optgroup#propios"),
		iconosBotonera: DOM.configCabecera.querySelectorAll("#iconosBotonera i"),

		// Configuración de Campos
		camposPresenciaEventual: DOM.configCampos.querySelectorAll("select:not(.presenciaEstable)"),
		camposPresenciaEstable: DOM.configCampos.querySelectorAll(".presenciaEstable"),
		palClave: DOM.configCampos.querySelector("#palabrasClave input"),
		palClaveAprob: DOM.configCampos.querySelector("#palabrasClave i"),

		// Zona de productos
		asegurate: DOM.zonaProds.querySelector("#comencemos button#rojo"),
		comencemos: DOM.zonaProds.querySelector("#comencemos button#verde"),
		vistaProds: DOM.zonaProds.querySelector("#vistaProds"),
	};
	for (let icono of DOM.iconosBotonera) DOM[icono.id] = icono;
	for (let campo of DOM.camposPresenciaEventual) DOM[campo.name] = campo;
	v = {
		...(await obtiene.opcionesDeLayoutMasOrden()),
		configsDeCabecera: await obtiene.configsDeCabecera(),
		mostrarComencemos: true,
	};

	// Eventos - Cambio de Configuración o Preferencias
	DOM.cuerpo.addEventListener("input", async (e) => {
		// Variables
		const campoNombre = e.target.name;

		// Acciones si se cambia la configuración
		if (campoNombre == "configCons_id") {
			// Averigua si hay un error y en caso afirmativo, interrumpe la función
			const existe = await verifica.configCons_id();
			if (!existe) return;

			// Novedades
			await cambioDeConfig_id();
		}
		// Nombre de configuración, Palabras clave, Campos
		else {
			if (campoNombre == "nombreNuevo") {
				// Restringe el uso de caracteres a los aceptados
				basico.restringeCaracteres(e);

				// Muestra/Oculta el ícono de confirmación
				const nombre = DOM.configNuevaNombre.value;
				const nombres = v.configsDeCabecera.map((n) => n.nombre);
				v.nombreOK = nombre.length && !basico.validaCaracteres(nombre) && !nombres.includes(nombre);
				actualiza.botoneraActivaInactiva();

				// Fin
				return;
			}
			// Palabras clave
			else if (campoNombre == "palabrasClave") {
				// Restringe el uso de caracteres a los aceptados
				amplio.restringeCaracteres(e, true);

				// Valida los caracteres ingresados
				const nombre = DOM.palClave.value;
				const errores = nombre.length ? amplio.validaCaracteres(nombre) : true;

				// Muestra/Oculta el ícono de confirmación
				errores ? DOM.palClaveAprob.classList.add("inactivo") : DOM.palClaveAprob.classList.remove("inactivo");

				// Fin
				return;
			}

			// Cambios de campo
			v.hayCambiosDeCampo = true;
		}

		// Funciones
		await cambioDeCampos();
		await resultados.obtiene();
		if (!v.mostrarComencemos) resultados.muestra();

		// Fin
		return;
	});

	// Eventos - 'click'
	DOM.cuerpo.addEventListener("click", async (e) => {
		// Variables
		const elemento = e.target;
		const padre = elemento.parentNode;

		// Iconos
		if (elemento.tagName == "I" && ["iconosBotonera", "palabrasClave"].includes(padre.id)) {
			// Si el ícono está inactivo, interrumpe la función
			if (elemento.className.includes("inactivo")) return;
			const nombre = elemento.id ? elemento.id : padre.id;

			// Acciones
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
				await actualiza.valoresInicialesDeObjetoV();
				await actualiza.statusInicialCampos();
				await cambioDeCampos();
			} else if (nombre == "guardar") {
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
				if (v.nuevo || v.edicion || v.propio) await cambiosEnBD.guardaUnaConfiguracion();
			} else if (nombre == "eliminar") {
				// Si hay un error, interrumpe la función
				const existe = await verifica.configCons_id();
				if (!existe || !v.filtroPropio) return;

				// Acciones si existe
				await cambiosEnBD.eliminaConfigCons();
				await cambioDeConfig_id();
				await cambioDeCampos();
			} else if (nombre == "palabrasClave") {
				await cambioDeCampos();
			}

			// Fin
			return;
		}

		// Comencemos
		if (padre.id == "comencemos" && elemento.id == "verde") resultados.muestra();
	});

	// Start-up
	await actualiza.valoresInicialesDeObjetoV();
	actualizaConfigCons.consolidado();
	actualiza.botoneraActivaInactiva();
});

// Variables
const ruta = "/consultas/api/";
let configCons; // donde se consolida la configuración de la consulta
let DOM; // donde se guarda la info de las partes del documento
let v; // variables generales
