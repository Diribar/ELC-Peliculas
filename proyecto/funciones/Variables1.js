"use strict";

const unaHora = 60 * 60 * 1000;
const unDia = unaHora * 24;
const unaSemana = unDia * 7;
const unAno = unDia * 365;

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
	linkSemInicial: 1,
	...{linksSemsPrimRev, linksSemsEstrRec, linksSemsEstandar},
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
	requestsTriviales: ["WhatsApp", "Postman", "TelegramBot", "Zabbix"],
};
