"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Zona de Productos
		vistaProds: document.querySelector("#zona_de_prods #vistaProds"),
		listado: document.querySelector("#zona_de_prods #vistaProds #listado"),
	};
	let varias = {
		diasDelAno: await fetch(rutas.diasDelAno).then((n) => n.json()),
	};

	// Funciones
	let encabFiltros = {
		impactosDeCFC: function () {
			// IMPACTOS DE
			varias.cfc = DOM.cfcSelect.value ? DOM.cfcSelect.value : "";
			if (varias.cfc) elegibles.cfc = varias.cfc;

			this.impactosEnDeOcurrio();

			// Fin
			return;
		},
		// Impactos en/de bhr
		impactosEnDeOcurrio: function () {
			// IMPACTOS EN
			varias.bhr ? DOM.bhrSector.classList.add("ocultar") : DOM.bhrSector.classList.remove("ocultar");

			// IMPACTOS DE
			// 1. Actualiza el valor de 'bhr'
			if (!varias.bhr && DOM.bhrSelect.value) varias.bhr = DOM.bhrSelect.value;
			// 2. Muestra/Oculta los sectores dependientes
			for (let bhrSISector of DOM.bhrSISectores)
				varias.bhr && varias.bhr != "NO"
					? bhrSISector.classList.remove("bhrSI")
					: bhrSISector.classList.add("bhrSI");
			// 3. Asigna el valor para 'bhr'
			if (varias.bhr) elegibles.bhr = varias.bhr;

			this.impactosEnDeEpoca();

			// Fin
			return;
		},
		// Impactos en/de epocas
		impactosEnDeEpoca: function () {
			// IMPACTOS EN - Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio

			// IMPACTOS DE
			const sectorVisible = window.getComputedStyle(DOM.epocasSector).getPropertyValue("display") != "none";
			if (DOM.epocasSelect.value && sectorVisible) elegibles.epocas = DOM.epocasSelect.value;

			this.impactosEnDeApMar();

			// Fin
			return;
		},
		// Impactos en/de apMar
		impactosEnDeApMar: function () {
			// IMPACTOS EN
			// Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio
			// Sólo se muestra el sector si CFC='SI' y epocas='pst'
			if (elegibles.cfc == "CFC" && elegibles.epocas == "pst") DOM.apMarSector.classList.remove("ocultarApMar");
			else DOM.apMarSector.classList.add("ocultarApMar");

			// IMPACTOS DE
			const sectorVisible = window.getComputedStyle(DOM.apMarSector).getPropertyValue("display") != "none";
			if (DOM.apMarSelect.value && sectorVisible) elegibles.apMar = DOM.apMarSelect.value;

			this.impactosEnDeCanonsMasRolesIglesia();

			// Fin
			return;
		},
		// Impactos en/de canons y rolesIglesia
		impactosEnDeCanonsMasRolesIglesia: function () {
			// IMPACTOS EN
			// Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio
			// Sólo se muestra el sector si codigo='personajes' y CFC='SI'
			let sectorVisible;
			const SI = elegibles.bhr == "pers" && elegibles.cfc == "CFC";

			// Oculta/Muestra sectores
			SI ? DOM.canonsSector.classList.remove("ocultarCanons") : DOM.canonsSector.classList.add("ocultarCanons");
			SI
				? DOM.rolesIglSector.classList.remove("ocultarRolesIglesia")
				: DOM.rolesIglSector.classList.add("ocultarRolesIglesia");

			// IMPACTOS DE
			sectorVisible = window.getComputedStyle(DOM.canonsSector).getPropertyValue("display") != "none";
			if (DOM.canonsSelect.value && sectorVisible) elegibles.canons = DOM.canonsSelect.value;
			sectorVisible = window.getComputedStyle(DOM.rolesIglSector).getPropertyValue("display") != "none";
			if (DOM.rolesIglesiaSelect.value && sectorVisible) elegibles.rolesIglesia = DOM.rolesIglesiaSelect.value;

			this.impactosDeDemasElegibles();

			// Fin
			return;
		},
		// Impactos de Demás Elegibles
		impactosDeDemasElegibles: function () {
			for (let preferencia of DOM.mostrarSiempre) if (preferencia.value) elegibles[preferencia.name] = preferencia.value;

			apoyo.limpiaLineasConsecutivas();

			// Fin
			return;
		},
	};
	let configCabecera = {
		statusInicialBotonera: () => {
			// 1. Inactiva las opciones 'nuevo', 'reinicio' y 'actualiza'
			DOM.nuevo.classList.add("inactivo");
			DOM.reinicio.classList.add("inactivo");
			DOM.actualiza.classList.add("inactivo");

			// 2. Activa los íconos 'modificaNombre' y 'elimina', salvo para el filtro Estándar
			const filtroElegido = DOM.configCabecera.value;
			filtroElegido == 1 ? DOM.modificaNombre.classList.add("inactivo") : DOM.modificaNombre.classList.remove("inactivo");
			filtroElegido == 1 ? DOM.elimina.classList.add("inactivo") : DOM.elimina.classList.remove("inactivo");

			// Fin
			return;
		},
		impactosEnBotonesPorElegibles: () => {
			// Inactiva las opciones de 'modificaNombre' y 'elimina' en la vista
			DOM.modificaNombre.classList.add("inactivo");
			DOM.elimina.classList.add("inactivo");

			// Activa las opciones de 'nuevo', 'reinicio' y 'actualiza'
			DOM.nuevo.classList.remove("inactivo");
			DOM.reinicio.classList.remove("inactivo");
			if (DOM.configCabecera.value != 1) DOM.actualiza.classList.remove("inactivo");

			// Fin
			return;
		},
		impactoEnBotonesPorCondicMins: () => {
			// Variables
			const SI = apoyo.condicionesMinimas();

			// Si no están dadas las condiciones mínimas, se inactivan todos los botones
			if (!SI) for (let icono of DOM.iconos) icono.classList.add("inactivo");

			// Fin
			return;
		},
	};
	let zonaDeProds = {
		obtieneLosProductos: async () => {
			// Si no se hizo 'click' sobre el botón 'comencemos', frena
			if (varias.comencemos) return;

			// Variables
			let resultados;

			// Obtiene los resultados

			// Momento del ano
			if (elegibles.layout_id == 1 && elegibles.orden_id == 1) {
				// Obtiene el diaDelAno
				const ahora = new Date();
				const diaUsuario = ahora.getDate();
				const mes_idUsuario = ahora.getMonth() + 1;
				elegibles.diaDelAno_id = varias.diasDelAno.find((n) => n.dia == diaUsuario && n.mes_id == mes_idUsuario).id;

				//resultados =
				resultados = await fetch(rutas.momento + JSON.stringify(elegibles)).then((n) => n.json());
			}

			// Actualiza el contador
			contador_de_prods.innerHTML = resultados.length + " resultados";

			// Actualiza los resultados
			DOM.listado.innerHTML = "";
			if (!resultados.length) {
			} else {
				const tope = Math.min(4, resultados.length);
				for (let i = 0; i < tope; i++) {
					await botonPelicula(resultados[i]);
				}
			}

			// Actualiza la información mostrada
			vistaProds.classList.remove("ocultar");

			// Fin
			return;
		},
	};

	// Eventos
	DOM.cuerpo.addEventListener("change", async (e) => {


		// Botones en Filtros Personalizados
		if (!clickEnFiltrosPers) {
			if (!apoyo.condicionesMinimas()) configCabecera.impactoEnBotonesPorCondicMins();
			else configCabecera.impactosEnBotonesPorElegibles();
		}

		// Obtiene los productos
		await zonaDeProds.obtieneLosProductos();

		// Fin
		return;
	});
	// Comencemos
	DOM.comencemos.addEventListener("click", async () => {
		// Oculta el botón
		DOM.comencemos.classList.add("ocultar");
		varias.comencemos = false;

		// Siguientes pasos
		await zonaDeProds.obtieneLosProductos();

		// Fin
		return;
	});
	// Botonera de Filtros Personalizados
	DOM.reinicio.addEventListener("click", async () => {
		// Si está inactivo, interrumpe
		if (DOM.reinicio.classList.includes("inactivo")) return;

		// Variables
		elegibles = {};

		// Novedades en el Filtro Personalizado
		await configCabecera.impactosDeFiltroPers();

		// Impacto en Encabezado y Filtros, y Palabras Clave
		encabFiltros.impactosDeLayout();
		DOM.palabrasClave.value ? DOM.palabrasClave.classList.add("verde") : DOM.palabrasClave.classList.remove("verde");

		// Limpia líneas consecutivas
		apoyo.limpiaLineasConsecutivas();

		// Obtiene los productos
		await zonaDeProds.obtieneLosProductos();

		// Fin
		return;
	});
	DOM.actualiza.addEventListener("click", async () => {
		// Si está inactivo, interrumpe
		if (DOM.actualiza.className.includes("inactivo")) return;
		else configCabecera.statusInicialBotonera();

		// Variables
		const configCons_id = DOM.configCabecera.value;
		if (!configCons_id) return;
		let objeto = {...elegibles, configCons_id};
		delete objeto.codigo;

		// Guarda los cambios en el filtro personalizado
		fetch(rutas.actualiza + JSON.stringify(objeto));

		// Fin
		return;
	});

	// Start-up
	encabFiltros.impactosDeLayout();
});
let botonPelicula = async (producto) => {
	// Crea el elemento 'boton'. El 'true' es para incluir también a los hijos
	const botonPelicula = document.querySelector("#vistaProds #botonPelicula");
	let clon = botonPelicula.cloneNode(true);
	let boton = {
		anchor: clon.querySelector("a"),
		avatar: clon.querySelector("img"),
		nombreOriginal: clon.querySelector("#nombreOriginal"),
		nombreCastellano: clon.querySelector("#nombreCastellano"),
		anoEstreno: clon.querySelector("#anoEstreno"),
	};

	// Dirección del link
	boton.anchor.href += producto.entidad + "&id=" + producto.id;

	// Imagen
	const localhost = await fetch("/api/localhost").then((n) => n.json());
	let avatar = localhost + "/imagenes/2-Productos/Final/" + producto.avatar;
	boton.avatar.src = avatar;
	boton.avatar.alt = producto.nombreOriginal;
	boton.avatar.title = producto.nombreOriginal;

	// Demás datos
	boton.nombreCastellano.innerHTML = producto.nombreCastellano;
	if (producto.nombreCastellano != producto.nombreOriginal) boton.nombreOriginal.innerHTML = producto.nombreOriginal;
	boton.anoEstreno.innerHTML = producto.anoEstreno + " - " + producto.entidadNombre;

	// Quitar la clase 'ocultar'
	clon.classList.remove("ocultar");

	// Agrega el form
	const listado = document.querySelector("#listado");
	listado.append(clon);
};
