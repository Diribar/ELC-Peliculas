"use strict";
// Variables
const cron = require("node-cron");
const procsCRUD = require("../../rutas_y_controladores/2.0-Familias-CRUD/FM-Procesos");
const comp = require("../../funciones/1-Procesos/Compartidas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const variables = require("./Variables");

// Exportar ------------------------------------
module.exports = {
	// 0.A. Start-up y Configuracion de Rutinas periodicas
	startupMasConfiguracion: async function () {
		// Rutinas programadas
		const info = lecturaRutinasJSON();
		if (!Object.keys(info).length) return;

		// Rutinas horarias
		if (!info.RutinasHorarias || !info.RutinasHorarias.length) return;
		const rutinasHorarias = info.RutinasHorarias;
		rutinasHorarias.forEach((rutina, i) => {
			let horario = 10 + i;
			cron.schedule(horario + " * * * *", async () => await this[rutina](), {timezone: "Etc/Greenwich"});
		});

		// Rutinas diarias
		if (!info.HorariosUTC || !Object.keys(info.HorariosUTC).length) return;
		const rutinasDiarias = Object.keys(info.HorariosUTC);
		for (let rutina of rutinasDiarias) {
			let hora = obtieneLaHora(info.HorariosUTC[rutina]);
			cron.schedule("0 " + hora + " * * *", async () => await this[rutina](), {timezone: "Etc/Greenwich"});
		}
		// Rutinas semanales
		if (!info.DiasUTC || !Object.keys(info.DiasUTC).length) return;
		const rutinasSemanales = Object.keys(info.DiasUTC);
		for (let rutina of rutinasSemanales) {
			let diaSem = info.DiasUTC[rutina];
			cron.schedule("1 0 * * " + diaSem, async () => await this[rutina](), {timezone: "Etc/Greenwich"});
		}
		// Start-up
		await this.conjuntoDeRutinasDiarias();
		await this.conjuntoDeRutinasSemanales();
	},

	// 0.B. Conjunto de tareas
	conjuntoDeRutinasHorarias: async function () {
		let horarioInicial = new Date().getTime();

		// Obtiene la información del archivo JSON
		let info = lecturaRutinasJSON();
		const rutinas = info.RutinasHorarias;

		// Obtiene la fecha UTC actual
		const {FechaUTC} = fechaHoraUTC();

		// Si la 'FechaUTC' actual es distinta a la del archivo JSON, actualiza todas las rutinas horarias
		if (info.FechaUTC != FechaUTC) {
			for (let rutina of rutinas) {
				await this[rutina]();
				horarioInicial = medicionDelTiempo(horarioInicial);
			}
		}

		// Fin
		return;
	},
	conjuntoDeRutinasDiarias: async function () {
		let horarioInicial = new Date().getTime();

		// Obtiene la información del archivo JSON
		let info = lecturaRutinasJSON();
		const rutinas = Object.keys(info.HorariosUTC);

		// Obtiene la fecha UTC actual
		const {FechaUTC, HoraUTC} = fechaHoraUTC();

		// Si la 'FechaUTC' actual es distinta a la del archivo JSON, actualiza todas las rutinas diarias
		if (info.FechaUTC != FechaUTC)
			for (let rutina of rutinas) {
				await this[rutina]();
				horarioInicial = medicionDelTiempo(horarioInicial);
			}
		// Si la 'FechaUTC' está bien, actualiza las rutinas que correspondan en función del horario
		else
			for (let rutina of rutinas)
				if (info[rutina] != "SI" && HoraUTC > info.HorariosUTC[rutina]) {
					await this[rutina]();
					horarioInicial = medicionDelTiempo(horarioInicial);
				}

		// Fin
		return;
	},
	conjuntoDeRutinasSemanales: async function () {
		// Obtiene la información del archivo JSON
		let info = lecturaRutinasJSON();
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

	// 1. Rutinas horarias
	LinksEnProd: async function () {
		// return;
		const entidadesProd = variables.entidades.prods;

		// Rutina por entidad
		for (let entidad of entidadesProd) {
			// Obtiene los ID de los registros de la entidad
			let IDs = await BD_genericas.obtieneTodos(entidad, "id").then((n) => n.map((m) => m.id));

			// Rutina por ID: ejecuta la función linksEnProd
			for (let id of IDs) procsCRUD.linksEnProd({entidad, id});
		}

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHoraUTC();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Links en Producto' actualizados y datos guardados en JSON");

		// Fin
		return;
	},
	ProdsEnRCLV: async function () {
		// Obtiene las entidadesRCLV
		const entidadesRCLV = variables.entidades.rclvs;

		// Rutina por entidad
		for (let entidad of entidadesRCLV) {
			// Obtiene los ID de los registros de la entidad
			let IDs = await BD_genericas.obtieneTodos(entidad, "id").then((n) => n.map((m) => m.id));

			// Rutina por ID: ejecuta la función prodEnRCLV
			for (let id of IDs) procsCRUD.prodEnRCLV({entidad, id});
		}

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHoraUTC();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Prods en RCLV' actualizados y datos guardados en JSON");

		// Fin
		return;
	},

	// 2. Rutinas diarias
	FechaHoraUTC: function () {
		// Obtiene la fecha y la hora procesados
		const {FechaUTC, HoraUTC} = fechaHoraUTC();

		// Obtiene las rutinas del archivo JSON
		let info = lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.HorariosUTC || !Object.keys(info.HorariosUTC).length) return;
		const rutinas = Object.keys(info.HorariosUTC);

		// Establece el status de los procesos de rutina
		const statusRutinas = {};
		for (let rutina of rutinas) statusRutinas[rutina] = "NO";
		statusRutinas.FechaHoraUTC = "SI";

		// Actualiza el archivo JSON
		actualizaRutinasJSON({FechaUTC, HoraUTC, ...statusRutinas});

		// Feedback del proceso
		console.log(FechaUTC, HoraUTC + "hs. -", "'Fecha y Hora' actualizadas y datos guardados en JSON");

		// Fin
		return;
	},
	BorraImagenesSinRegistro: async () => {
		// Funciones
		await borraImagenesSinRegistro1("peliculas");
		await borraImagenesSinRegistro1("personajes");
		borraImagenesProvisorio();

		// Actualiza el archivo JSON
		actualizaRutinasJSON({BorraImagenesSinRegistro: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHoraUTC();
		console.log(FechaUTC, HoraUTC + "hs. -", "'BorraImagenesSinRegistro' actualizada y datos guardados en JSON");

		// Fin
		return;
	},
	ImagenDerecha: async function () {
		// Variables
		let info = lecturaRutinasJSON();
		const milisegs = new Date().getTime() + (new Date().getTimezoneOffset() / 60) * unaHora;
		const fechas = [diaMesAno(milisegs - unDia), diaMesAno(milisegs), diaMesAno(milisegs + unDia)];

		// Borra los archivos de imagen que no se corresponden con los titulos
		borraLosArchivosDeImgDerechaObsoletos(fechas);

		// Limpia el historial de titulos en 'global'
		TitulosImgDer = {};

		// Actualiza los títulos de la imagen derecha para cada fecha
		for (let i = 0; i < fechas.length; i++) {
			const fecha = fechas[i];

			// Obtiene los 'TitulosImgDer'
			if (info.TitulosImgDer && info.TitulosImgDer[fecha]) TitulosImgDer[fecha] = info.TitulosImgDer[fecha];
			else {
				// Variables
				const fechaNum = milisegs + (i - 1) * unDia;
				const fechaArchivo = diaMesAno(fechaNum);

				// Obtiene los datos de la imagen derecha
				const {titulo, carpeta, nombre_archivo} = await obtieneImgDerecha(fechaNum);

				// Actualiza el titulo para esa fecha
				TitulosImgDer[fecha] = titulo;

				// Guarda el archivo de la 'imgDerecha' para esa fecha
				comp.gestionArchivos.copiaImagen(carpeta + nombre_archivo, "4-ImagenDerecha/" + fechaArchivo + ".jpg");
			}
		}

		// Actualiza el archivo JSON
		actualizaRutinasJSON({TitulosImgDer, ImagenDerecha: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHoraUTC();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Imagen Derecha' actualizada y datos guardados en JSON");

		// Fin
		return;
	},

	// 3. Rutinas semanales
	SemanaUTC: function () {
		// Obtiene la fecha y la hora procesados
		const {FechaUTC, HoraUTC} = fechaHoraUTC();
		const semana = semanaUTC();

		// Obtiene las rutinas del archivo JSON
		let info = lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.DiasUTC || !Object.keys(info.DiasUTC).length) return;
		const rutinas = Object.keys(info.DiasUTC);

		// Establece el status de los procesos de rutina
		const statusRutinas = {};
		for (let rutina of rutinas) statusRutinas[rutina] = "NO";
		statusRutinas.SemanaUTC = "SI";

		// Actualiza el archivo JSON
		actualizaRutinasJSON({semanaUTC: semana, FechaSemUTC: FechaUTC, HoraSemUTC: HoraUTC, ...statusRutinas});

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
			sugerido_en: comp.fechaHora.ahora(),
			sugerido_por_id: 2,
		};
		// Actualiza el status de los links vencidos
		BD_genericas.actualizaTodosPorCondicion("links", condiciones, objeto);

		// Actualiza el archivo JSON
		actualizaRutinasJSON({LinksVencidos: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = fechaHoraUTC();
		console.log(FechaUTC, HoraUTC + "hs. -", "'Links vencidos' actualizados y datos guardados en JSON");

		// Fin
		return;
	},
};
// Funciones 1 - Interacciones con el archivo Rutinas.json
let lecturaRutinasJSON = () => {
	// Obtiene información del archivo 'json'
	const rutaNombre = path.join(__dirname, "Rutinas.json");
	const existe = comp.gestionArchivos.existe(rutaNombre);
	const json = existe ? fs.readFileSync(rutaNombre, "utf8") : "";
	let info = json ? JSON.parse(json) : {};

	// Fin
	return info;
};
let actualizaRutinasJSON = function (datos) {
	// Obtiene la informacion vigente
	let info = lecturaRutinasJSON();

	// Actualiza la información
	info = {...info, ...datos};

	// Guarda la información actualizada
	const rutaNombre = path.join(__dirname, "Rutinas.json");
	fs.writeFileSync(rutaNombre, JSON.stringify(info), function writeJSON(err) {
		if (err) return console.log("Actualiza Rutinas JSON:", err, datos);
	});

	// Fin
	return;
};

// Funciones - Imagen Derecha
let borraLosArchivosDeImgDerechaObsoletos = (fechas) => {
	// Variables
	const carpetaImagen = "./publico/imagenes/4-ImagenDerecha/";
	const archivosDeImagen = fs.readdirSync(carpetaImagen);

	// Revisa si corresponde borrar los archivos
	for (let archivo of archivosDeImagen) {
		const dot = archivo.lastIndexOf(".");
		if (dot < 0) dato = archivo.length;
		if (!fechas.includes(archivo.slice(0, dot))) comp.gestionArchivos.elimina(carpetaImagen, archivo);
	}

	// Fin
	return;
};
let obtieneImgDerecha = async (fechaNum) => {
	// Variables
	const fecha = new Date(fechaNum);
	let resultado;

	// Obtiene el 'dia_del_ano_id'
	const dia = fecha.getDate();
	const mes_id = fecha.getMonth() + 1;
	const dia_del_ano = dias_del_ano.find((n) => n.dia == dia && n.mes_id == mes_id);
	delete dia_del_ano.epoca_del_ano;

	// Obtiene los RCLV
	let rclvs = await obtieneLosRCLV(dia_del_ano);
	// console.log(365,rclvs.map((n) => ({nombre: n.nombre, prioridad: n.prioridad_id})));

	// Acciones si se encontraron rclvs
	if (rclvs.length > 1) {
		// Ordena por prioridad_id
		rclvs.sort((a, b) => b.prioridad_id - a.prioridad_id);

		// Filtra por los que tienen la maxima prioridad_id
		const prioridad_id = rclvs[0].prioridad_id;
		rclvs = rclvs.filter((n) => n.prioridad_id == prioridad_id);

		// Asigna el resultado
		const indice = parseInt(Math.random() * rclvs.length);
		resultado = rclvs[indice];
	}
	// Si se encontro un solo resultado, lo asigna
	else if (rclvs.length == 1) resultado = rclvs[0];

	// Obtiene los datos para la imgDerecha
	const imgDerecha = datosImgDerecha(resultado);

	// Fin
	return imgDerecha;
};
let diaMesAno = (fecha) => {
	fecha = new Date(fecha);
	let dia = ("0" + fecha.getDate()).slice(-2);
	let mes = mesesAbrev[fecha.getMonth()];
	let ano = fecha.getFullYear().toString().slice(-2);
	fecha = dia + "-" + mes + "-" + ano;
	return fecha;
};
let obtieneLosRCLV = async (dia_del_ano) => {
	// Variables
	let rclvs = [];
	let resultados = [];

	// Obtiene los RCLV de las primeras cuatro entidades
	for (let entidad of variables.entidades.rclvs) {
		// Salteo de la rutina para 'epocas_del_ano'
		if (entidad == "epocas_del_ano") continue;

		// Condicion estandar: RCLVs del dia y en status aprobado
		let condicion = {dia_del_ano_id: dia_del_ano.id, status_registro_id: aprobado_id};

		// Obtiene los RCLVs
		rclvs.push(
			BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
				// Deja solo los que tienen avatar
				.then((n) => n.filter((m) => m.avatar))
				// Para "personajes", deja solamente aquellos que tienen proceso de canonizacion
				.then((n) => (entidad == "personajes" ? n.filter((m) => m.canon_id && !m.canon_id.startsWith("NN")) : n))
		);
	}

	// Busca el registro de 'epoca_del_ano'
	if (dia_del_ano.epoca_del_ano_id != 1) {
		const condicion = {id: dia_del_ano.epoca_del_ano_id, status_registro_id: aprobado_id};
		rclvs.push(BD_genericas.obtieneTodosPorCondicion("epocas_del_ano", condicion));
	}

	// Espera y consolida la informacion
	await Promise.all(rclvs).then((n) => n.map((m) => resultados.push(...m)));

	// Fin
	return resultados;
};
let datosImgDerecha = (resultado) => {
	// Variables
	let imgDerecha = {};

	// Acciones si se obtuvo un resultado
	if (resultado) {
		// Nombre de la imagen
		imgDerecha.titulo = resultado.apodo ? resultado.apodo : resultado.nombre;

		// Datos del archivo, dependiendo de la entidad
		if (!resultado.carpeta_avatars) {
			imgDerecha.carpeta = "2-RCLVs/Final/";
			imgDerecha.nombre_archivo = resultado.avatar;
		} else {
			imgDerecha.carpeta = "3-EpocasDelAno/" + resultado.carpeta_avatars + "/";
			imgDerecha.nombre_archivo = comp.gestionArchivos.imagenAlAzar(imgDerecha.carpeta);
		}
	}
	// Acciones si no encontró una imagen para la fecha
	else
		imgDerecha = {
			titulo: "ELC - Películas",
			carpeta: "0-Base/Varios/",
			nombre_archivo: "Institucional-Imagen.jpg",
		};

	// Fin
	return imgDerecha;
};

// Funciones - Otras
let fechaHoraUTC = () => {
	// Obtiene la fecha y la hora y las procesa
	const ahora = new Date();
	const FechaUTC = diasSemana[ahora.getUTCDay()] + ". " + comp.fechaHora.fechaDiaMes(ahora);
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
let medicionDelTiempo = (horarioInicial) => {
	const horarioFinal = new Date().getTime();

	// Fin
	return horarioFinal;
};
let borraImagenesSinRegistro1 = async (entidad) => {
	// Variables
	const familias = comp.obtieneDesdeEntidad.familias(entidad);
	const petitFamilia = comp.obtieneDesdeEntidad.petitFamilia(entidad);
	const entidadEdic = comp.obtieneDesdeEntidad.nombreEdicion(entidad);
	let consolidado = [];
	let carpeta, avatars;

	// Borra los avatar de EDICIONES
	carpeta = "2-" + familias + "/Revisar";
	avatars = await BD_especificas.nombresDeAvatarEnBD(entidadEdic);
	borraImagenesSinRegistro2(avatars, carpeta);

	// Borra los avatar de ORIGINAL
	carpeta = "2-" + familias + "/Final";
	avatars = [];
	for (let entidad of variables.entidades[petitFamilia]) avatars.push(BD_especificas.nombresDeAvatarEnBD(entidad));
	await Promise.all(avatars).then((n) => n.map((m) => consolidado.push(...m)));
	borraImagenesSinRegistro2(consolidado, carpeta);

	// Fin
	return;
};
let borraImagenesSinRegistro2 = (avatars, carpeta) => {
	// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
	const archivos = fs.readdirSync("./publico/imagenes/" + carpeta);

	// Rutina para borrar archivos
	for (let archivo of archivos)
		if (!avatars.includes(archivo)) comp.gestionArchivos.elimina("./publico/imagenes/" + carpeta, archivo);

	// Rutina para detectar nombres sin archivo
	for (let nombre of avatars) if (!archivos.includes(nombre)) console.log("Avatars sin archivo:", nombre);

	// Fin
	return;
};
let borraImagenesProvisorio = () => {
	// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
	let archivos = fs.readdirSync("./publico/imagenes/9-Provisorio");

	// Rutina para borrar archivos
	for (let archivo of archivos) {
		const fechaHora = fs.statSync("./publico/imagenes/9-Provisorio/" + archivo).birthtime;
		if (fechaHora < Date.now() - unDia * 3) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio", archivo);
	}

	// Fin
	return;
};
