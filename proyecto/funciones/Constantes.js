"use strict";

const unaHora = 60 * 60 * 1000;
const unDia = unaHora * 24;
const unaSemana = unDia * 7;
const unAno = unDia * 365;

const linkSemInicial = 1;
const linksSemsPrimRev = 4;
const linksSemsEstrRec = 5;
const linksSemsEstandar = 26;

module.exports = {
	// Productos
	dibujosAnimados: "Dibujos Animados",
	documental: "Documental",

	// RCLV
	prefijosSanto: ["Domingo", "Tomás", "Tomas", "Tomé", "Toribio"], // ponemos 'Tomas' sin acento, por si alguien lo escribe mal
	idMinRclv: 10,

	// Links
	...{linkSemInicial, linksSemsPrimRev, linksSemsEstrRec, linksSemsEstandar},
	linksVU_primRev: unaSemana * linksSemsPrimRev,
	linksVU_estrRec: unaSemana * linksSemsEstrRec,
	linksVU_estandar: unaSemana * linksSemsEstandar,
	...{sinLinks: 0, linksTalVez: 1, conLinks: 2},
	linkAnoReciente: 2,
	cantLinksVencPorSem: null,

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
	iconos: {
		// Uso general
		faSolid: "fa-solid",
		inicio: "fa-house",
		ayuda: "fa-circle-question",

		// Carteles / Formularios
		izquierda: "fa-circle-left",
		derecha: "fa-circle-right",
		check: "fa-circle-check",
		xMark: "fa-circle-xmark",
		triangulo: "fa-triangle-exclamation",

		// Ocasionales
		entendido: "fa-thumbs-up",
		edicion: "fa-pen",
		calificar: "fa-chart-simple",
		eliminar: "fa-trash-can",
		detalle: "fa-circle-info",
		edicionCambiada: "fa-arrow-right-long",
		agregar: "fa-circle-plus",
		rotar: "fa-rotate-90",
	},
	asuntosContactanos: [
		{descripcion: "Comentario sobre nuestro sitio", codigo: "sitio"},
		{descripcion: "Comentario sobre una película", codigo: "producto"},
		{descripcion: "Otro motivo", codigo: "varios"},
	],

};
