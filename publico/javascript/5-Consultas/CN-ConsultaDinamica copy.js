"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		asegurate: document.querySelector("#cuerpo #comencemos button#rojo"),
		comencemos: document.querySelector("#cuerpo #comencemos button#verde"),
		prefsSimples: document.querySelectorAll("#cuerpo .prefSimple .input"),

		// Filtro personalizado

		// Encabezado
		layout_idSelect: document.querySelector("#encabezado select[name='layout_id']"),
		orden_idSelect: document.querySelector("#encabezado select[name='orden_id']"),
		opcionesOrdenVista: document.querySelectorAll("#encabezado select[name='orden_id'] option:not(option[value=''])"),
		ascDesSector: document.querySelector("#encabezado #ascDes"),
		ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),
		contador_de_prods: document.querySelector("#encabezado #derecha #contador_de_prods"),

		// Filtros
		camposTitulo: document.querySelector("#filtros #campos div:has(h2)"),
		camposNav: document.querySelector("#filtros #campos div nav"),
		cfcSelect: document.querySelector("#filtros #campos div nav #cfc select"),
		bhrSector: document.querySelector("#filtros #campos #bhr"),
		bhrSelect: document.querySelector("#filtros #campos #bhr select"),
		bhrSISectores: document.querySelectorAll("#filtros #campos .bhrSI"),
		epocasSector: document.querySelector("#filtros #campos #epocas"),
		epocasSelect: document.querySelector("#filtros #campos #epocas select"),
		apMarSector: document.querySelector("#filtros #campos #apMar"),
		apMarSelect: document.querySelector("#filtros #campos #apMar select"),
		canonsSector: document.querySelector("#filtros #campos #canons"),
		canonsSelect: document.querySelector("#filtros #campos #canons select"),
		rolesIglSector: document.querySelector("#filtros #campos #rolesIglesia"),
		rolesIglesiaSelect: document.querySelector("#filtros #campos #rolesIglesia select"),
		mostrarSiempre: document.querySelectorAll("#filtros #campos .mostrarSiempre .input"),
		palabrasClave: document.querySelector("#filtros #campos #palabrasClave"),

		// Zona de Productos
		vistaProds: document.querySelector("#zona_de_prods #vistaProds"),
		listado: document.querySelector("#zona_de_prods #vistaProds #listado"),
	};
	let varias = {
		comencemos: true,
		...(await fetch(rutas.layoutsOrdenes).then((n) => n.json())),
		diasDelAno: await fetch(rutas.diasDelAno).then((n) => n.json()),
	};
	let elegibles = {};

	// Obtiene tabla de layouts y ordenes

	// Funciones
	let filtroPers = {
		impactosDeFiltroPers: async function () {
			// Variables
			const configCons_id = DOM.filtroPers.value;
			if (!configCons_id) return;

			// Actualiza el configCons_id en la cookie y el usuario (session y BD)
			fetch(rutas.guardaFiltroID + configCons_id);

			// Obtiene las opciones de la BD
			const opciones = await fetch(rutas.opcionesFiltroPers + configCons_id).then((n) => n.json());

			// Actualiza los elegibles simples (Encabezado + Filtros)
			for (let prefSimple of DOM.prefsSimples)
				prefSimple.value = opciones[prefSimple.name] ? opciones[prefSimple.name] : "";

			// Actualiza los elegibles 'AscDes'
			for (let input of DOM.ascDesInputs) input.checked = opciones.ascDes && input.value == opciones.ascDes;

			// Actualiza los botones
			this.statusInicialBotonera();

			// Fin
			return;
		},
		statusInicialBotonera: () => {
			// 1. Inactiva las opciones 'nuevo', 'reinicio' y 'actualiza'
			DOM.nuevo.classList.add("inactivo");
			DOM.reinicio.classList.add("inactivo");
			DOM.actualiza.classList.add("inactivo");

			// 2. Activa los íconos 'modificaNombre' y 'elimina', salvo para el filtro Estándar
			const filtroElegido = DOM.filtroPers.value;
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
			if (DOM.filtroPers.value != 1) DOM.actualiza.classList.remove("inactivo");

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
		// Variables
		let clickEnFiltrosPers = e.target.name == "filtroPers";
		elegibles = {};

		// Novedades en el Filtro Personalizado
		if (clickEnFiltrosPers) await filtroPers.impactosDeFiltroPers();

		// Impacto en Encabezado y Filtros
		encabFiltros.impactosDeLayout();
		if (e.target.name == "palabrasClave")
			e.target.value ? DOM.palabrasClave.classList.add("verde") : DOM.palabrasClave.classList.remove("verde");

		// Botones en Filtros Personalizados
		if (!clickEnFiltrosPers) {
			if (!apoyo.condicionesMinimas()) filtroPers.impactoEnBotonesPorCondicMins();
			else filtroPers.impactosEnBotonesPorElegibles();
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
		await filtroPers.impactosDeFiltroPers();

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
		else filtroPers.statusInicialBotonera();

		// Variables
		const configCons_id = DOM.filtroPers.value;
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
