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

	// Mensajes
	inputVacio: "Necesitamos que completes este campo",
	selectVacio: "Necesitamos que elijas una opción",
	radioVacio: "Necesitamos que elijas una opción",
	rclvSinElegir: "Necesitamos que respondas alguna de las opciones",
};
