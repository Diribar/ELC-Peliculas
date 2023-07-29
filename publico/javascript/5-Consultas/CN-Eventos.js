"use strict";
window.addEventListener("load", async () => {
	// Eventos - Cambio de Configuración o Preferencias
	DOM.cuerpo.addEventListener("input", async (e) => {
		// Variables
		const nombre = e.target.name;

		// Acciones si se cambia la configuración
		if (nombre == "configCons_id") {
			// Averigua si hay un error y en caso afirmativo, interrumpe la función
			const existe = await verifica.configCons_id();
			if (!existe) return;

			// Novedades
			await cambioDeConfig_id();
		}
		// Acciones en los demás casos
		else {
			// Layout
			if (nombre == "layout_id") {
				// Oculta los resultados anteriores
				actualiza.cartelComencemosVisible();
			}
			// Nombre de configuración
			else if (nombre == "nombreNuevo") {
				// Restringe el uso de caracteres a los aceptados
				basico.restringeCaracteres(e);

				// Restringe el largo del nombre
				const nombre = DOM.configNuevaNombre.value.slice(0, 30);
				DOM.configNuevaNombre.value = nombre;

				// Muestra/Oculta el ícono de confirmación
				const nombres = v.configsDeCabecera.map((n) => n.nombre);
				v.nombreOK = nombre.length && !basico.validaCaracteres(nombre) && !nombres.includes(nombre);
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

			// Cambios de campo
			v.hayCambiosDeCampo = true;
		}

		// Funciones
		await cambioDeCampos();

		// Fin
		return;
	});

	// Eventos - 'click'
	DOM.cuerpo.addEventListener("click", async (e) => {
		// Variables
		const elemento = e.target;
		const padre = elemento.parentNode;

		// Iconos de botonera y 'palabrasClave'
		if (elemento.tagName == "I") {
			// Si el ícono está inactivo, interrumpe la función
			if (elemento.className.includes("inactivo")) return;

			// Variable
			const nombre = elemento.id ? elemento.id : padre.id;

			// Iconos de botonera
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
					const existe = await verifica.configCons_id();
					if (!existe || !v.filtroPropio) return;

					// Acciones si existe
					await cambiosEnBD.eliminaConfigCons();
					await cambioDeConfig_id();
					await cambioDeCampos();
				} else if (nombre == "guardar") {
					guardarBotonera();
				}
			}
			// Icono de 'palabrasClave'
			else if (nombre == "palabrasClave") {
				palabrasClave();
			}
			// Preferencia por producto
			else if (nombre == "ppp" && (padre.id == "infoPeli" || padre.tagName == "TD")) {
				// Previene el efecto del anchor
				e.preventDefault();

				// Actualiza la 'ppp'
				await cambiosEnBD.ppp(elemento);
			}
			// Actualizar resultados (encabezado)
			else if (nombre == "actualizar") {
				if (v.mostrar) {
					await resultados.obtiene();
					if (!v.mostrarComencemos) resultados.muestra.generico();
				}
			}
		}

		// Botón 'comencemos'
		else if (padre.id == "comencemos" && elemento.id == "verde" && v.mostrar) resultados.muestra.generico();

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
		if (v.nuevo || v.edicion || v.propio) await cambiosEnBD.guardaUnaConfiguracion();
		v.hayCambiosDeCampo = false;
		actualiza.botoneraActivaInactiva();
		DOM.palClaveAprob.classList.add("inactivo");

		// Fin
		return;
	};
});
