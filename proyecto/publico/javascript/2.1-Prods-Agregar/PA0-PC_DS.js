"use strict";

// Si corresponde, completa los datos de sesion
const rutas = {
	pre: "/producto/api/pa-",
	buscaInfo: "busca-info-de-session-" + pathname.slice(-2),
};
const sessions = {
	"agregar-pc": "palabrasClave",
	"agregar-ds": "desambiguar",
};
const indice = pathname.lastIndexOf("/");
const paso = pathname.slice(indice + 1);
const session = sessions[paso];

const APIs_buscar = [
	{ruta: "busca-los-productos/?session=" + session, duracion: 2000},
	{ruta: "reemplaza-las-peliculas-por-su-coleccion", duracion: 2000},
	{ruta: "organiza-la-info", duracion: 1000},
	{ruta: "agrega-hallazgos-de-IM-y-FA", duracion: 200},
	{ruta: "obtiene-el-mensaje", duracion: 200},
	{ruta: rutas.buscaInfo, duracion: 200},
];
