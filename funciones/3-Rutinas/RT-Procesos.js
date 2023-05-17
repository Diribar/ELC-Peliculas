"use strict";
// Variables
const comp = require("../1-Procesos/Compartidas");
const BD_genericas = require("../2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const variables = require("../1-Procesos/Variables");

// Exportar ------------------------------------
module.exports = {
	// Interacciones con el archivo Rutinas.json
	lecturaRutinasJSON: () => {
		// Obtiene información del archivo 'json'
		const rutaNombre = path.join(__dirname, "Rutinas.json");
		const existe = comp.gestionArchivos.existe(rutaNombre);
		const json = existe ? fs.readFileSync(rutaNombre, "utf8") : "";
		let info = json ? JSON.parse(json) : {};

		// Fin
		return info;
	},
	actualizaRutinasJSON: function (datos) {
		// Obtiene la informacion vigente
		let info = this.lecturaRutinasJSON();

		// Actualiza la información
		info = {...info, ...datos};

		// Guarda la información actualizada
		const rutaNombre = path.join(__dirname, "Rutinas.json");
		fs.writeFileSync(rutaNombre, JSON.stringify(info), function writeJSON(err) {
			if (err) return console.log("Actualiza Rutinas JSON:", err, datos);
		});

		// Fin
		return;
	},

	// Imagen Derecha
	borraLosArchivosDeImgDerechaObsoletos: (fechas) => {
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
	},
	obtieneImgDerecha: async function (fechaNum) {
		// Variables
		const fecha = new Date(fechaNum);
		let resultado;

		// Obtiene el 'dia_del_ano_id'
		const dia = fecha.getDate();
		const mes_id = fecha.getMonth() + 1;
		const dia_del_ano = dias_del_ano.find((n) => n.dia == dia && n.mes_id == mes_id);
		delete dia_del_ano.epoca_del_ano;

		// Obtiene los RCLV
		let rclvs = await this.obtieneLosRCLV(dia_del_ano);

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
		const imgDerecha = this.datosImgDerecha(resultado);

		// Fin
		return imgDerecha;
	},
	diaMesAno: (fecha) => {
		fecha = new Date(fecha);
		let dia = ("0" + fecha.getDate()).slice(-2);
		let mes = mesesAbrev[fecha.getMonth()];
		let ano = fecha.getFullYear().toString().slice(-2);
		fecha = dia + "-" + mes + "-" + ano;
		return fecha;
	},
	datosImgDerecha: (resultado) => {
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
	},
	obtieneLosRCLV: async (dia_del_ano) => {
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
	},

	// Borra imágenes obsoletas
	borraImagenesSinRegistro1: async function (entidad) {
		// Variables
		const familias = comp.obtieneDesdeEntidad.familias(entidad);
		const petitFamilia = comp.obtieneDesdeEntidad.petitFamilia(entidad);
		const entidadEdic = comp.obtieneDesdeEntidad.nombreEdicion(entidad);
		let consolidado = [];
		let carpeta, avatars;

		// Borra los avatar de EDICIONES
		carpeta = "2-" + familias + "/Revisar";
		avatars = await BD_especificas.nombresDeAvatarEnBD(entidadEdic);
		this.borraImagenesSinRegistro2(avatars, carpeta);

		// Borra los avatar de ORIGINAL
		carpeta = "2-" + familias + "/Final";
		avatars = [];
		for (let entidad of variables.entidades[petitFamilia]) avatars.push(BD_especificas.nombresDeAvatarEnBD(entidad));
		await Promise.all(avatars).then((n) => n.map((m) => consolidado.push(...m)));
		this.borraImagenesSinRegistro2(consolidado, carpeta);

		// Fin
		return;
	},
	borraImagenesSinRegistro2: (avatars, carpeta) => {
		// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
		const archivos = fs.readdirSync("./publico/imagenes/" + carpeta);

		// Rutina para borrar archivos
		for (let archivo of archivos)
			if (!avatars.includes(archivo)) comp.gestionArchivos.elimina("./publico/imagenes/" + carpeta, archivo);

		// Rutina para detectar nombres sin archivo
		for (let nombre of avatars) if (!archivos.includes(nombre)) console.log("Avatars sin archivo:", nombre);

		// Fin
		return;
	},
	borraImagenesProvisorio: () => {
		// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
		let archivos = fs.readdirSync("./publico/imagenes/9-Provisorio");

		// Rutina para borrar archivos
		for (let archivo of archivos) {
			const fechaHora = fs.statSync("./publico/imagenes/9-Provisorio/" + archivo).birthtime;
			if (fechaHora < Date.now() - unDia * 3) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio", archivo);
		}

		// Fin
		return;
	},

	// Mail de Feedback
	mailDeFeedback: {
		obtieneRegistros: async () => {
			// Variables
			const entidades = ["cambios_de_status", "edics_aprob", "edics_rech"];
			let registros = [];
			let resultado = [];

			// Obtiene los registros
			for (let entidad of entidades)
				registros.push(
					BD_genericas.obtieneTodos(entidad, "sugerido_por_id").then((n) => n.map((m) => ({...m, entidad})))
				);
			await Promise.all(registros).then((n) => n.map((m) => resultado.push(...m)));

			// Ordena los registros por usuario, de menor a mayor
			resultado.sort((a, b) => a.sugerido_por_id - b.sugerido_por_id);

			// Fin
			return resultado;
		},
		hoyUsuario: (usuario) => {
			// Variables
			const ahora = new Date();

			// Obtiene la hora del usuario, y si no son las 0hs, interrumpe la rutina
			const horaUsuario = ahora.getUTCHours() + usuario.pais.zona_horaria;

			// Obtiene la fecha en que se le envió el último comunicado y si coincide con el día de hoy, interrumpe la rutina
			const aux = ahora.getTime() + usuario.pais.zona_horaria * unaHora;
			const hoyUsuario = comp.fechaHora.fechaFormatoBD(aux);

			// Fin
			return {hoyUsuario, saltear: horaUsuario % 24 || usuario.fecha_revisores == hoyUsuario};
		},
		mensajeAB: async (regsAB) => {
			// Variables
			const titulo = "<h2>Altas y Bajas</h2>";
			let regsEntidad=[]
			let mensajesAprob = "";
			let mensajesRech = "";

			// Proceso de los mensajes
			for (let regAB of regsAB)
				regsEntidad.push(
					BD_genericas.obtienePorId(regAB.entidad, regAB.entidad_id).then((n) => (n.aprobado = regAB.aprobado))
				);
			regsEntidad=await Promise.all(regsEntidad)

			for (let regEntidad of regsEntidad) {
				const nombre = comp.nombresPosibles(regEntidad);
				const mensaje = "<p>" + nombre + "</p>";
				regEntidad.aprobado ? (mensajesAprob += mensaje) : (mensajesRech += mensaje);
			}

			// Detalles finales
			if (mensajesAprob) mensajesAprob = "<h2>SUGERENCIAS APROBADAS</h2>" + mensajesAprob;
			if (mensajesRech) mensajesRech = "<h2>SUGERENCIAS RECHAZADAS</h2>" + mensajesRech;
			const mensajeGlobal = titulo + mensajesAprob + mensajesRech;

			// Fin
			return mensajeGlobal;
		},
		enviaMail: async (usuario) => {
			// Prepara los datos
			const asunto = "Feedback de la revisión de sugerencias";
			const direccionMail = usuario.email;
			// Envía el mail al usuario con la contraseña
			let comentario = "";
			let feedbackEnvioMail = await comp.enviarMail(asunto, direccionMail, comentario, req);
			// Obtiene el horario de envío de mail
			let ahora = comp.fechaHora.ahora().setSeconds(0); // Descarta los segundos en el horario
			// Genera el registro
			contrasena = bcryptjs.hashSync(contrasena, 10);
			// Fin
			return {ahora, contrasena, feedbackEnvioMail};
		},
	},

	// Funciones - Otras
	fechaHoraUTC: () => {
		// Obtiene la fecha y la hora y las procesa
		const ahora = new Date();
		const FechaUTC = diasSemana[ahora.getUTCDay()] + ". " + comp.fechaHora.fechaDiaMes(ahora);
		const HoraUTC = ahora.getUTCHours() + ":" + ("0" + ahora.getUTCMinutes()).slice(-2);

		// Fin
		return {FechaUTC, HoraUTC};
	},
	semanaUTC: () => {
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
	},
	obtieneLaHora: (dato) => {
		// Obtiene la ubicación de los dos puntos
		const ubicDosPuntos = dato.indexOf(":");
		if (ubicDosPuntos < 1) return 0;

		// Obtiene la hora
		let hora = dato.slice(0, ubicDosPuntos);
		hora = parseInt(hora);

		// Fin
		return hora;
	},
	medicionDelTiempo: (horarioInicial) => {
		const horarioFinal = new Date().getTime();

		// Fin
		return horarioFinal;
	},
	rutinasFinales: function (campo) {
		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({[campo]: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = this.fechaHoraUTC();
		console.log(FechaUTC, HoraUTC + "hs. -", "Rutina '" + campo + "' actualizada y datos guardados en JSON");

		// Fin
		return;
	},
};
