"use strict";
// Variables
const cron = require("node-cron");
const procsCRUD = require("../../rutas_y_controladores/2.0-Familias-CRUD/FM-Procesos");
const comp = require("../../funciones/3-Procesos/Compartidas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const variables = require("./Variables");

// Exportar ------------------------------------
module.exports = {
	// Coordinación general
	coordinacGeneral: async function () {
		// Rutinas programadas
		const info = this.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;

		// Rutinas horarias
		if (!info.RutinasHorarias || !info.RutinasHorarias.length) return;
		const rutinasHorarias = info.RutinasHorarias;
		rutinasHorarias.forEach((rutina, i) => {
			let horario = 30 + i;
			cron.schedule(horario + " * * * *", async () => await this[rutina](), {timezone: "Etc/Greenwich"});
		});

		// Rutinas diarias
		await this.rutinasDiarias();
		if (!info.HorariosUTC || !Object.keys(info.HorariosUTC).length) return;
		const rutinasDiarias = Object.keys(info.HorariosUTC);
		for (let rutina of rutinasDiarias) {
			let hora = obtieneLaHora(info.HorariosUTC[rutina]);
			cron.schedule("0 " + hora + " * * *", async () => await this[rutina](), {timezone: "Etc/Greenwich"});
		}
		// Rutinas semanales
		await this.rutinasSemanales();
		if (!info.rutinasSemanales || !Object.keys(info.rutinasSemanales).length) return;
		const rutinasSemanales = Object.keys(info.DiasUTC);
		for (let rutina of rutinasSemanales) {
			let diaSem = obtieneLaHora(info.DiasUTC[rutina]);
			cron.schedule("1 " + diaSem + " * * *", async () => await this[rutina](), {timezone: "Etc/Greenwich"});
		}
	},
	// Lectura del archivo Rutinas.json
	lecturaRutinasJSON: () => {
		// Obtiene información del archivo 'json'
		const rutaNombre = path.join(__dirname, "Rutinas.json");
		const existe = comp.averiguaSiExisteUnArchivo(rutaNombre);
		const json = existe ? fs.readFileSync(rutaNombre, "utf8") : "";
		let info = json ? JSON.parse(json) : {};

		// Fin
		return info;
	},
	actualizaRutinasJSON: function (datos) {
		// Consolida la información actualizada
		let info = this.lecturaRutinasJSON();
		info = {...info, ...datos};

		// Guarda la información actualizada
		const rutaNombre = path.join(__dirname, "Rutinas.json");
		fs.writeFileSync(rutaNombre, JSON.stringify(info), function writeJSON(err) {
			if (err) return console.log("Actualiza Rutinas JSON:", err, datos);
		});

		// Fin
		return;
	},

	// Actualizaciones diarias
	FechaHoraUTC: function () {
		// Obtiene la fecha y la hora procesados
		const {FechaUTC, HoraUTC} = fechaHora();

		// Obtiene las rutinas del archivo JSON
		let info = this.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.HorariosUTC || !Object.keys(info.HorariosUTC).length) return;
		const rutinas = Object.keys(info.HorariosUTC);

		// Establece el status de los procesos de rutina
		const statusRutinas = {};
		for (let rutina of rutinas) statusRutinas[rutina] = "NO";
		statusRutinas.FechaHoraUTC = "SI";

		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({FechaUTC, HoraUTC, ...statusRutinas});

		// Feedback del proceso
		console.log(FechaUTC, HoraUTC + "hs. -", "'Fecha y Hora' actualizadas y datos guardados en JSON");

		// Fin
		return;
	},
	ImagenDerecha: async function () {
		// Variables
		let info = this.lecturaRutinasJSON();
		const milisegs = new Date().getTime();
		const fechas = [diaMesAno(milisegs - unDia), diaMesAno(milisegs), diaMesAno(milisegs + unDia)];

		// Actualiza los títulos de la imagen derecha
		TitulosImgDer = {};
		for (let fecha of fechas)
			TitulosImgDer[fecha] =
				info.TitulosImgDer && info.TitulosImgDer[fecha] ? info.TitulosImgDer[fecha] : await obtieneImagenDerecha(fecha);
		info.TitulosImgDer = TitulosImgDer;

		// Borra los archivos de imagen que no se corresponden con los titulos
		let archivosDeImagen = fs.readdirSync("./publico/imagenes/5-ImagenDerecha/");
		for (let archivo of archivosDeImagen) {
			let dot = archivo.lastIndexOf(".");
			if (dot < 0) dato = archivo.length;
			if (!fechas.includes(archivo.slice(0, dot))) comp.borraUnArchivo("./publico/imagenes/5-ImagenDerecha/", archivo);
		}

		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({TitulosImgDer, ImagenDerecha: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHora();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Imagen Derecha' actualizada y datos guardados en JSON");

		// Fin
		return;
	},
	LinksEnProd: async function () {
		// return;
		const entidadesProd = variables.entidadesProd;

		// Rutina por entidad
		for (let entidad of entidadesProd) {
			// Obtiene los ID de los registros de la entidad
			let IDs = await BD_genericas.obtieneTodos(entidad, "id").then((n) => n.map((m) => m.id));

			// Rutina por ID: ejecuta la función linksEnProd
			for (let id of IDs) procsCRUD.linksEnProd({entidad, id});
		}

		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({LinksEnProd: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHora();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Links en Producto' actualizados y datos guardados en JSON");

		// Fin
		return;
	},
	ProdsEnRCLV: async function () {
		// Obtiene las entidadesRCLV
		const entidadesRCLV = variables.entidadesRCLV;

		// Rutina por entidad
		for (let entidad of entidadesRCLV) {
			// Obtiene los ID de los registros de la entidad
			let IDs = await BD_genericas.obtieneTodos(entidad, "id").then((n) => n.map((m) => m.id));

			// Rutina por ID: ejecuta la función prodEnRCLV
			for (let id of IDs) procsCRUD.prodEnRCLV({entidad, id});
		}

		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({ProdsEnRCLV: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHora();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Prods en RCLV' actualizados y datos guardados en JSON");

		// Fin
		return;
	},
	momentoDelAno: () => {
		// Obtiene el día de referencia
		// Compara el 'día_del_ano_id' de los 3 RCLVs, sumandole 366 al que dé negativo
		// Actualiza el registro de producto con el menor de los 3
	},

	// Actualizaciones semanales
	SemanaUTC: function () {
		// Obtiene la fecha y la hora procesados
		const {FechaUTC, HoraUTC} = fechaHora();
		const semana = semanaUTC();

		// Obtiene las rutinas del archivo JSON
		let info = this.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.DiasUTC || !Object.keys(info.DiasUTC).length) return;
		const rutinas = Object.keys(info.DiasUTC);

		// Establece el status de los procesos de rutina
		const statusRutinas = {};
		for (let rutina of rutinas) statusRutinas[rutina] = "NO";
		statusRutinas.SemanaUTC = "SI";

		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({semanaUTC: semana, FechaSemUTC: FechaUTC, HoraSemUTC: HoraUTC, ...statusRutinas});

		// Feedback del proceso
		console.log(FechaUTC, HoraUTC + "hs. -", "'Semana UTC' actualizada y datos guardados en JSON");

		// Fin
		return;
	},
	LinksVencidos: async function () {
		// Obtiene la condición de cuáles son los links vencidos
		const condiciones = await BD_especificas.linksVencidos();

		// Prepara la información
		const objeto = {
			status_registro_id: creado_aprob_id,
			sugerido_en: comp.ahora(),
			sugerido_por_id: 2,
		};
		// Actualiza el status de los links vencidos
		BD_genericas.actualizaTodosPorCampos("links", condiciones, objeto);

		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({LinksVencidos: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHora();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Links vencidos' actualizados y datos guardados en JSON");

		// Fin
		return;
	},

	// Conjunto de tareas
	rutinasDiarias: async function () {
		// Obtiene la información del archivo JSON
		let info = this.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.HorariosUTC || !Object.keys(info.HorariosUTC).length) return;
		const rutinasDiarias = Object.keys(info.HorariosUTC);

		// Obtiene la fecha procesada
		const {FechaUTC, HoraUTC} = fechaHora();

		// Acciones si la 'FechaUTC' es distinta
		if (info.FechaUTC != FechaUTC) {
			// Actualiza todas las rutinas horarias
			const rutinasHorarias = info.RutinasHorarias;
			for (let rutina of rutinasHorarias) await this[rutina]();
			// Actualiza todas las rutinas diarias
			for (let rutina of rutinasDiarias) await this[rutina]();
		}
		// Si la 'FechaUTC' está bien, actualiza las rutinas que correspondan en función del horario
		else
			for (let rutina of rutinasDiarias)
				if (info[rutina] != "SI" && HoraUTC > info.HorariosUTC[rutina]) await this[rutina]();

		// Fin
		return;
	},
	rutinasSemanales: async function () {
		// Obtiene la información del archivo JSON
		let info = this.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.DiasUTC || !Object.keys(info.DiasUTC).length) return;
		const rutinas = Object.keys(info.DiasUTC);

		// Obtiene la semana y el día de la semana
		const SemanaUTC = semanaUTC();
		const diaSem = new Date().getDay();

		// Si la 'SemanaUTC' es distinta, actualiza todas las rutinas
		if (info.semanaUTC != SemanaUTC) for (let rutina of rutinas) await this[rutina]();
		// Si la 'SemanaUTC' está bien, actualiza las rutinas que correspondan en función del día de la semana
		else for (let rutina of rutinas) if (info[rutina] != "SI" && diaSem >= info.DiasUTC[rutina]) await this[rutina]();

		// Fin
		return;
	},
};
let obtieneImagenDerecha = async (fecha) => {
	// Obtiene el dia_del_ano
	let nombre = fecha.slice(0, 6).replace("-", "/");
	if (nombre.startsWith("0")) nombre = nombre.slice(1);
	const dia_del_ano_id = dias_del_ano.find((n) => n.nombre == nombre).id;

	// Obtiene la imagen derecha
	let imgDerecha;
	(() => {
		// Variable de la nueva fecha
		let nuevaFecha_id;
		let restaUnAno = 0;
		// Rutina para encontrar la fecha más cercana a la actual, que tenga una imagen
		for (let i = 0; i < 3; i++) {
			// Si terminó el año, continúa desde el 1/ene
			if (dia_del_ano_id + i - restaUnAno > 366) restaUnAno = 366;
			// Busca una imagen con la fecha
			let imagen = banco_de_imagenes.find((n) => n.dia_del_ano_id == dia_del_ano_id + i - restaUnAno);
			// Si la encuentra, termina de buscar
			if (imagen) {
				nuevaFecha_id = imagen.dia_del_ano_id;
				break;
			}
		}

		// Acciones si encontró una imagen para la fecha
		if (nuevaFecha_id) {
			// Variables
			let registros;
			// Busca registros dentro de los de fecha 'movil'
			registros = banco_de_imagenes.filter((n) => n.dia_del_ano_id == nuevaFecha_id && n.cuando);
			// Si no los encuentra, los busca dentro de los de fecha 'fija'
			if (!registros.length) registros = banco_de_imagenes.filter((n) => n.dia_del_ano_id == nuevaFecha_id);
			// Elije al azar de entre las opciones
			let indice = parseInt(Math.random() * registros.length);
			if (indice == registros.length) indice--; // Por si justo tocó el '1' en el sorteo
			imgDerecha = registros[indice];
			imgDerecha.carpeta = "4-RCLVs-Final/";
		}
		// Acciones si no encontró una imagen para la fecha
		else
			imgDerecha = {
				nombre: "ELC - Películas",
				nombre_archivo: "Institucional-Imagen.jpg",
				carpeta: "0-Base/",
			};
	})();

	// Guarda la nueva imagen
	await (async () => {
		// Borra la 'imagenAnterior'
		await comp.borraUnArchivo("./publico/imagenes/5-ImagenDerecha", fecha + ".jpg");
		// Copia la nueva imagen como 'imgDerecha'
		await comp.copiaUnArchivoDeImagen(imgDerecha.carpeta + imgDerecha.nombre_archivo, "5-ImagenDerecha/" + fecha + ".jpg");

		// Fin
		return;
	})();

	// Fin
	return imgDerecha.nombre;
};
let diaMesAno = (fecha) => {
	fecha = new Date(fecha);
	let dia = ("0" + fecha.getDate()).slice(-2);
	let mes = mesesAbrev[fecha.getMonth()];
	let ano = fecha.getFullYear().toString().slice(-2);
	fecha = dia + "-" + mes + "-" + ano;
	return fecha;
};
let fechaHora = () => {
	// Obtiene la fecha y la hora y las procesa
	const ahora = new Date();
	const FechaUTC = diasSemana[ahora.getUTCDay()] + ". " + comp.fechaDiaMes(ahora);
	const HoraUTC = ahora.getUTCHours() + ":" + ("0" + ahora.getUTCMinutes()).slice(-2);

	// Fin
	return {FechaUTC, HoraUTC};
};
let semanaUTC = () => {
	// Obtiene el primer día del año
	const fecha = new Date();
	const comienzoAno = new Date(fecha.getUTCFullYear(), 0, 1).getTime();

	// Obtiene el dia de la semana (lun: 1 a dom: 7)
	let diaSem = new Date(comienzoAno).getDay();
	if (diaSem < 1) diaSem = diaSem + 7;

	// Obtiene el primer domingo del año
	const adicionarDias = 7 - diaSem;
	const primerDomingo = comienzoAno + adicionarDias * unDia;

	// Obtiene la semana del año
	const semana = parseInt((fecha.getTime() - primerDomingo) / unDia / 7);

	// Fin
	return semana;
};
let obtieneLaHora = (dato) => {
	// Obtiene la ubicación de los dos puntos
	const ubicDosPuntos = dato.indexOf(":");
	if (ubicDosPuntos < 1) return 0;

	// Obtiene la hora
	let hora = dato.slice(0, ubicDosPuntos);
	hora = parseInt(hora);

	// Fin
	return hora;
};
