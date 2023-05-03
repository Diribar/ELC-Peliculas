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
			let horario = 1 + i;
			cron.schedule(horario + " * * * *", async () => await this[rutina](), {timezone: "Etc/Greenwich"});
		});

		// Rutinas diarias
		if (!info.HorariosUTC || !Object.keys(info.HorariosUTC).length) return;
		await this.rutinasDiarias();
		const rutinasDiarias = Object.keys(info.HorariosUTC);
		for (let rutina of rutinasDiarias) {
			let hora = obtieneLaHora(info.HorariosUTC[rutina]);
			cron.schedule("0 " + hora + " * * *", async () => await this[rutina](), {timezone: "Etc/Greenwich"});
		}
		// Rutinas semanales
		if (!info.DiasUTC || !Object.keys(info.DiasUTC).length) return;
		await this.rutinasSemanales();
		const rutinasSemanales = Object.keys(info.DiasUTC);
		for (let rutina of rutinasSemanales) {
			let diaSem = info.DiasUTC[rutina];
			cron.schedule("1 0 * * " + diaSem, async () => await this[rutina](), {timezone: "Etc/Greenwich"});
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

	// Actualizaciones horarias
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

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHora();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Prods en RCLV' actualizados y datos guardados en JSON");

		// Fin
		return;
	},
	MomentoDelAno: async function () {
		// Actualiza el dia actual
		diaActualID();

		// Proceso para las 3 entidades
		const entidadesProd = variables.entidadesProd;
		const entidadesRCLV = variables.entidadesRCLV;
		const asociacionesRCLV = entidadesRCLV.map((n) => comp.obtieneAsociacion(n));
		for (let entidad of entidadesProd) {
			// Obtiene todos los registros aprobados y se queda solo con los que tienen algún RCLV
			let productos = await BD_genericas.obtieneTodosPorCondicionConInclude(
				entidad,
				{status_registro_id: aprobado_id},
				asociacionesRCLV
			).then((n) => n.filter((m) => m.personaje_id != 1 || m.hecho_id != 1 || m.tema_id != 1));
			// Actualiza el campo 'momento' - Envía a la rutina CRUD
			for (let producto of productos) procsCRUD.momentoDelAno({entidad, producto});
		}

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHora();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Momento del Año' actualizado y datos guardados en JSON");

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
		const milisegs = new Date().getTime() + (new Date().getTimezoneOffset() / 60) * unaHora;
		const fechas = [diaMesAno(milisegs - unDia), diaMesAno(milisegs), diaMesAno(milisegs + unDia)];
		console.log(fechas);

		// Borra los archivos de imagen que no se corresponden con los titulos
		const carpetaImagen = "./publico/imagenes/4-ImagenDerecha/";
		const archivosDeImagen = fs.readdirSync(carpetaImagen);
		for (let archivo of archivosDeImagen) {
			const dot = archivo.lastIndexOf(".");
			if (dot < 0) dato = archivo.length;
			if (!fechas.includes(archivo.slice(0, dot))) comp.borraUnArchivo(carpetaImagen, archivo);
		}

		// Actualiza los títulos de la imagen derecha
		TitulosImgDer = {}; // para limpiar el historial
		await fechas.forEach(async (fecha, i) => {
			// Obtiene la fecha en numero
			const fechaNum = milisegs + (i - 1) * unDia;
			TitulosImgDer[fecha] =
				info.TitulosImgDer && info.TitulosImgDer[fecha]
					? info.TitulosImgDer[fecha]
					: await obtieneImagenDerecha(fechaNum);
			info.TitulosImgDer = TitulosImgDer;
		});

		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({TitulosImgDer, ImagenDerecha: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHora();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Imagen Derecha' actualizada y datos guardados en JSON");

		// Fin
		return;
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
		BD_genericas.actualizaTodosPorCondicion("links", condiciones, objeto);

		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({LinksVencidos: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHora();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Links vencidos' actualizados y datos guardados en JSON");

		// Fin
		return;
	},
	BorraImagenesSinRegistro: async () => {
		let entidad, carpeta, nombresDeAvatar;

		// Obtiene el nombre de todas las imagenes de los registros de edicion
		entidad = "prods_edicion";
		nombresDeAvatar = await BD_especificas.nombresDeAvatarEnBD(entidad);

		// Borra los avatar de Revisar
		carpeta = "2-Productos/Revisar";
		borraImagenesSinRegistro(nombresDeAvatar, carpeta);

		// Obtiene el nombre de todas las imagenes de los registros de productos
		const entidades = variables.entidadesProd;
		nombresDeAvatar = [];
		let consolidado = [];
		for (let entidad of entidades) nombresDeAvatar.push(BD_especificas.nombresDeAvatarEnBD(entidad));
		await Promise.all(nombresDeAvatar).then((n) => n.map((m) => consolidado.push(...m)));
		// Borra los avatar de Final
		carpeta = "2-Productos/Final";
		borraImagenesSinRegistro(consolidado, carpeta);

		// Fin
		return;
	},

	// Conjunto de tareas
	rutinasDiarias: async function () {
		let horarioInicial = new Date().getTime();

		// Obtiene la información del archivo JSON
		let info = this.lecturaRutinasJSON();
		const rutinasDiarias = Object.keys(info.HorariosUTC);

		// Obtiene la fecha procesada
		const {FechaUTC, HoraUTC} = fechaHora();

		// Acciones si la 'FechaUTC' es distinta

		if (info.FechaUTC != FechaUTC) {
			// Actualiza todas las rutinas horarias
			const rutinasHorarias = info.RutinasHorarias;
			for (let rutina of rutinasHorarias) {
				await this[rutina]();
				horarioInicial = medicionDelTiempo(horarioInicial);
			}
			// Actualiza todas las rutinas diarias
			for (let rutina of rutinasDiarias) {
				await this[rutina]();
				horarioInicial = medicionDelTiempo(horarioInicial);
			}
		}
		// Si la 'FechaUTC' está bien, actualiza las rutinas que correspondan en función del horario
		else
			for (let rutina of rutinasDiarias)
				if (info[rutina] != "SI" && HoraUTC > info.HorariosUTC[rutina]) {
					await this[rutina]();
					horarioInicial = medicionDelTiempo(horarioInicial);
				}

		// Fin
		return;
	},
	rutinasSemanales: async function () {
		// Obtiene la información del archivo JSON
		let info = this.lecturaRutinasJSON();
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
// Funciones
let obtieneImagenDerecha = async (fechaNum) => {
	// Variables
	let rclvs = [];
	let resultados = [];
	let resultado;
	let epoca_del_ano = {};
	let imgDerecha = {};

	// Obtiene el 'dia_del_ano_id'
	const dia = fechaNum.getDate();
	const mes_id = fechaNum.getMonth() + 1;
	const dia_del_ano = dias_del_ano.find((n) => n.dia == dia && m.mes_id == mes_id);
	const dia_del_ano_id = dia_del_ano.id;

	// Busca los RCLVs con esa fecha, para las entidades diferentes a 'epocas_del_ano'
	for (let entidad of variables.entidadesRCLV) {
		// Salteo de la rutina para 'epocas_del_ano'
		if (entidad == "epocas_del_ano") continue;

		// Condicion estandar
		let condicion = {dia_del_ano_id, status_registro_id: aprobado_id};

		// Para "personajes", deja solamente aquellos que tengan proceso de canonizacion
		let valores = BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
			.then((n) => n.filter((m) => m.avatar))
			.then((n) => (entidad == "personajes" ? n.filter((m) => m.canon_id && !m.canon_id.startsWith("NN")) : n));
		rclvs.push(valores);
	}

	// Busca el registro de 'epoca_del_ano'
	if (dia_del_ano.epoca_del_ano_id != 1) {
		const condicion = {id: dia_del_ano.epoca_del_ano_id, status_registro_id: aprobado_id};
		epoca_del_ano = BD_genericas.obtieneTodosPorCondicion("epocas_del_ano", condicion)
			.then((n) => n.filter((m) => m.avatar))
			.then((n) => n.map((m) => ({entidad: "epocas_del_ano", ...m})));
	}

	// Consolida los rclvs
	await Promise.all([...rclvs, ...epoca_del_ano]).then((n) => n.map((m) => resultados.push(...m)));

	// Acciones si se encontraron resultados
	if (resultados.length > 1) {
		// Ordena por prioridad_id
		resultados.sort((a, b) => b.prioridad_id - a.prioridad_id);

		// Filtra por los que tienen la maxima prioridad_id
		const prioridad_id = resultados[0].prioridad_id;
		resultados = resultados.filter((n) => n.prioridad_id == prioridad_id);

		// Asigna el resultado
		const indice = parseInt(Math.random() * resultados.length);
		resultado = resultados[indice];
	}
	// Si se encontro un solo resultado, lo asigna
	else if (resultados.length == 1) resultado = resultados[0];

	// Obtiene los datos para la imgDerecha
	if (resultado) {
		// Nombre de la imagen
		imgDerecha.nombre = resultado.apodo ? resultado.apodo : resultado.nombre;

		// Datos del archivo, dependiendo de la entidad
		if (!resultado.entidad) {
			imgDerecha.carpeta = "2-RCLVs/Final";
			imgDerecha.nombre_archivo = resultado.avatar;
		} else {
			imgDerecha.carpeta = resultado.carpeta_avatars;
			imgDerecha.nombre_archivo = comp.imagenAlAzar("3-EpocasDelAno/" + resultado.carpeta_avatars);
		}
	}
	// Acciones si no encontró una imagen para la fecha
	else
		imgDerecha = {
			nombre: "ELC - Películas",
			carpeta: "0-Base/Varios/",
			nombre_archivo: "Institucional-Imagen.jpg",
		};

	// Guarda la nueva imagen como 'imgDerecha'
	await comp.copiaUnArchivoDeImagen(imgDerecha.carpeta + imgDerecha.nombre_archivo, "4-ImagenDerecha/" + fecha + ".jpg");

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
let diaActualID = () => {
	// Obtiene el mes y dia
	const milisegs = new Date().getTime() - 12 * unaHora;
	const fecha = new Date(milisegs);
	const dia = fecha.getDate();
	const mes = fecha.getMonth() + 1;

	// Obtiene el dia_actual_id
	dia_actual_id = dias_del_ano.find((n) => n.dia == dia && n.mes_id == mes).id;

	// Fin
	return;
};
let medicionDelTiempo = (horarioInicial) => {
	const horarioFinal = new Date().getTime();

	// Fin
	return horarioFinal;
};
let borraImagenesSinRegistro = async (nombresDeAvatar, carpeta) => {
	// Obtiene el nombre de todas las imagenes de los archivos de la carpeta "Revisar"
	let archivosDeAvatar = fs.readdirSync("./publico/imagenes/" + carpeta);

	// Rutina para borrar archivos
	for (let archivo of archivosDeAvatar)
		if (!nombresDeAvatar.includes(archivo)) comp.borraUnArchivo("./publico/imagenes/" + carpeta, archivo);

	// Rutina para detectar nombres sin archivo
	for (let nombre of nombresDeAvatar) if (!archivosDeAvatar.includes(nombre)) console.log(nombre);

	// Fin
	return;
};
