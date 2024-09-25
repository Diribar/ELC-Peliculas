"use strict";

const unaHora = 60 * 60 * 1000;
const unDia = unaHora * 24;
const unaSemana = unDia * 7;
const unAno = unDia * 365;

const linkSemInicial = 1;
const linksSemsPrimRev = 4;
const linksSemsEstrRec = 5;
const linksSemsEstandar = 26;
const iconos = {
	...{faSolid: "fa-solid", inicio: "fa-house", ayuda: "fa-circle-question"}, // Uso general
	...{triangulo: "fa-triangle-exclamation", entendido: "fa-thumbs-up"}, // Carteles
	...{izquierda: "fa-circle-left", derecha: "fa-circle-right", check: "fa-circle-check", xMark: "fa-circle-xmark"}, // Formularios

	// Ocasionales
	...{agregar: "fa-circle-plus", calificar: "fa-chart-simple", eliminar: "fa-trash-can"},
	...{edicion: "fa-pen", edicionCambiada: "fa-arrow-right-long", rotar: "fa-rotate-90"},
	detalle: "fa-circle-info",
};

module.exports = {
	// Institucional
	vistasInstitucs: {
		inicio: {titulo: "ELC | Películas con Valores", codigo: "inicio", icono: iconos.inicio, hr: true}, // 'hr' significa que pone una línea divisoria en el menú del header
		"quienes-somos": {titulo: "ELC | Quiénes somos", codigo: "quienesSomos", icono: "fa-people-group"},
		"mision-y-vision": {titulo: "ELC | Nuestra Misión y Visión", codigo: "misionVision", icono: "fa-heart", hr: true},
		"en-que-consiste-este-sitio": {titulo: "ELC | En qué consiste este sitio", codigo: "enQueConsiste", icono: "fa-question"},
		"nuestro-perfil-de-peliculas": {
			titulo: "ELC | Nuestro Perfil de Películas",
			codigo: "perfilPelis",
			icono: "fa-trophy",
			hr: true,
		},
		"derechos-de-autor": {titulo: "ELC | Derechos de Autor", codigo: "derechosAutor", icono: "fa-copyright"},
	},

	// Productos
	dibujosAnimados: "Dibujos Animados",
	documental: "Documental",

	// RCLV
	prefijosSanto: ["Domingo", "Tomás", "Tomas", "Tomé", "Toribio"], // ponemos 'Tomas' sin acento, por si alguien lo escribe mal
	idMinRclv: 10,
	prioridadesRclv: [
		{id: 1, nombre: "Menor", codigo: "menor"},
		{id: 2, nombre: "Estándar", codigo: "estandar"},
		{id: 3, nombre: "Mayor", codigo: "mayor"},
	],
	prefijos: [
		...["Ven", "Venerable"],
		...["Beata", "Beato"],
		...["San", "Santo", "Santa"],
		...["Padre", "Obispo", "Cardenal", "Papa", "Don"],
		...["Madre", "Hna", "Sor"],
	],

	// Links
	...{linkSemInicial, linksSemsPrimRev, linksSemsEstrRec, linksSemsEstandar},
	linksVU_primRev: unaSemana * linksSemsPrimRev,
	linksVU_estrRec: unaSemana * linksSemsEstrRec,
	linksVU_estandar: unaSemana * linksSemsEstandar,
	...{sinLinks: 0, linksTalVez: 1, conLinks: 2},
	linkAnoReciente: 2,
	cantLinksVencPorSem: null,
	provsListaNegra: ["gloria.tv"],
	provsQueNoRespetanCopyright: [
		{nombre: "Cuevana", url: "cuevana"},
		{nombre: "Google Drive", url: "drive.google.com/"},
	],
	calidadesDeLink: [240, 360, 480, 720, 1080],

	// Usuario
	...{maxIntentosCookies: 3, maxIntentosBD: 3, usAutom_id: 2},

	// Tiempo
	rutinasDeInicio: Date.now(),
	...{unaHora, unDia, unaSemana, unAno},
	diasSemana: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
	hoy: new Date().toISOString().slice(0, 10),
	...{primerLunesDelAno: null, semanaUTC: null, lunesDeEstaSemana: null, fechaDelAnoHoy_id: null, anoHoy: null},
	setTimeOutStd: 1000,

	// Mensajes
	inputVacio: "Necesitamos que completes este campo",
	selectVacio: "Necesitamos que elijas una opción",
	radioVacio: "Necesitamos que elijas una opción",
	rclvSinElegir: "Necesitamos que respondas alguna de las opciones",
	ayudaLinks: {
		parrafo: "<em>Color de los bordes (simil semáforo):</em>",
		mensajes: [
			"<i class='" + iconos.faSolid + " fa-circle enCast'></i> hablada en <b>castellano</b>",
			"<i class='" + iconos.faSolid + " fa-circle subtCast'></i> <b>subtitulos</b> en castellano",
			"<i class='" + iconos.faSolid + " fa-circle otroIdioma'></i> hablada en <b>otro</b> idioma",
			"<i class='" + iconos.faSolid + " fa-circle elegi'></i> <b>elegí</b> el idioma",
		],
	},
	mensajeAptoInput:[
		"Vemos con agrado que nuestros usuarios colaboren con el ingreso de información.",
		"Para obtener ese permiso, debés gestionar el rol 'Apto Input'",
		"Ese rol te permitirá aportar películas a nuestra base de datos, calificarlas, y contactarnos",
		"Es un rol que requiere responsabilidad, y por eso te vamos a pedir algunos datos.",
		"Para hacer la gestión, elegí el ícono de abajo de la flecha hacia la derecha.",

	],

	// Otras
	tamMaxImagen: 1024000, // 1Mb
	imgInstitucional: "/publico/imagenes/Varios/Institucional.jpg",
	largoComentario: 150,
	statusErrores: [],
	iconos,
	asuntosContactanos: [
		{descripcion: "Comentario sobre nuestro sitio", codigo: "sitio"},
		{descripcion: "Comentario sobre una película", codigo: "producto"},
		{descripcion: "Otro motivo", codigo: "varios"},
	],
	origenDeUrls: [
		// Productos
		{codigo: "PDA", url: "/producto/agregar/datos-adicionales"},
		{codigo: "PDT", url: "/producto/detalle", cola: true},
		{codigo: "PED", url: "/producto/edicion", cola: true},
		{codigo: "RPA", url: "/revision/producto/alta", cola: true},
		{url: "/producto/calificar", cola: true},
		{url: "/producto/historial", cola: true},
		{url: "/revision/producto/edicion", cola: true},
		// RCLVs
		{codigo: "RDT", url: "/rclv/detalle", cola: true},
		{codigo: "RRA", url: "/revision/rclv/alta", cola: true},
		// Links
		{url: "/links/abm", cola: true},
		{codigo: "RL", url: "/revision/links", cola: true},
		// Tableros
		{codigo: "TE", url: "/revision/tablero-de-entidades"},
		{codigo: "TM", url: "/revision/tablero-de-mantenimiento"},
		{codigo: "TU", url: "/revision/usuarios/tablero-de-usuarios"},
		{codigo: "CN", url: "/consultas"},
	],
	coloresConfigs: {
		azul: ["#8BC1F7", "#519DE9", "#06C", "#004B95", "#002F5D"], // 1. Blue
		celeste: ["#A2D9D9", "#73C5C5", "#009596", "#005F60", "#003737"], // 3. Cyan
		purpura: ["#B2B0EA", "#8481DD", "#5752D1", "#3C3D99", "#2A265F"], // 4. Purple
		dorado: ["#F9E0A2", "#F6D173", "#F4C145", "#F0AB00", "#C58C00"], // 5. Gold
		naranja: ["#F4B678", "#EF9234", "#EC7A08", "#C46100", "#8F4700"], // 6. Orange
		verde: ["#BDE2B9", "#7CC674", "#4CB140", "#38812F", "#23511E"], // 2. Green
		rojo: ["#C9190B", "#A30000", "#7D1007", "#470000", "#2C0000"], // 7. Red
		negro: ["#F0F0F0", "#D2D2D2", "#B8BBBE", "#8A8D90", "#6A6E73"], // 8. Black
	},
	eliminarCuandoSinEntidadId: ["statusHistorial", "histEdics", "misConsultas", "pppRegistros", "calRegistros"],

};
