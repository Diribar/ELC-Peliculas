"use strict";
// Variables
const Op = require("../../base_de_datos/modelos").Sequelize.Op;
const cron = require("node-cron");
const procsCRUD = require("../../rutas_y_controladores/2.0-Familias-CRUD/FM-Procesos");
const comp = require("../1-Procesos/Compartidas");
const BD_genericas = require("../2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const variables = require("../1-Procesos/Variables");
const procesos = require("./RT-Procesos");

// Exportar ------------------------------------
module.exports = {
	// 0.A. Start-up y Configuracion de Rutinas periodicas
	startupMasConfiguracion: async function () {
		// Rutinas programadas
		const info = procesos.lecturaRutinasJSON();
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
			let hora = procesos.obtieneLaHora(info.HorariosUTC[rutina]);
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
		this.MailDeFeedback();
	},

	// 0.B. Conjunto de tareas
	conjuntoDeRutinasHorarias: async function () {
		let horarioInicial = new Date().getTime();

		// Obtiene la información del archivo JSON
		let info = procesos.lecturaRutinasJSON();
		const rutinas = info.RutinasHorarias;

		// Obtiene la fecha UTC actual
		const {FechaUTC} = procesos.fechaHoraUTC();

		// Si la 'FechaUTC' actual es distinta a la del archivo JSON, actualiza todas las rutinas horarias
		if (info.FechaUTC != FechaUTC) {
			for (let rutina of rutinas) {
				await this[rutina]();
				horarioInicial = procesos.medicionDelTiempo(horarioInicial);
			}
		}

		// Fin
		return;
	},
	conjuntoDeRutinasDiarias: async function () {
		let horarioInicial = new Date().getTime();

		// Obtiene la información del archivo JSON
		let info = procesos.lecturaRutinasJSON();
		const rutinas = Object.keys(info.HorariosUTC);

		// Obtiene la fecha UTC actual
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();

		// Si la 'FechaUTC' actual es distinta a la del archivo JSON, actualiza todas las rutinas diarias
		if (info.FechaUTC != FechaUTC)
			for (let rutina of rutinas) {
				await this[rutina]();
				horarioInicial = procesos.medicionDelTiempo(horarioInicial);
			}
		// Si la 'FechaUTC' está bien, actualiza las rutinas que correspondan en función del horario
		else
			for (let rutina of rutinas)
				if (info[rutina] != "SI" && HoraUTC > info.HorariosUTC[rutina]) {
					await this[rutina]();
					horarioInicial = procesos.medicionDelTiempo(horarioInicial);
				}

		// Fin
		return;
	},
	conjuntoDeRutinasSemanales: async function () {
		// Obtiene la información del archivo JSON
		let info = procesos.lecturaRutinasJSON();
		const rutinas = Object.keys(info.DiasUTC);

		// Obtiene la semana y el día de la semana
		const SemanaUTC = procesos.semanaUTC();
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

		// Fin
		procesos.rutinasFinales("LinksEnProd");
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

		// Fin
		procesos.rutinasFinales("ProdsEnRCLV");
		return;
	},
	MailDeFeedback: async () => {
		// Obtiene información de la base de datos y si no hay pendientes, interrumpe
		const regsTodos = await procesos.mailDeFeedback.obtieneRegistros();
		if (!regsTodos.length) {
			procesos.rutinasFinales("MailDeFeedback");
			return;
		}

		// Variables
		const normalize = procesos.mailDeFeedback.normalize;
		let mailsEnviados = [];

		// Usuarios
		let usuarios_id = [...new Set([...regsTodos.map((n) => n.sugerido_por_id)])];
		console.log(164, usuarios_id);
		const usuarios = await BD_genericas.obtieneTodosConInclude("usuarios", "pais").then((n) =>
			n.filter((m) => usuarios_id.includes(m.id))
		);

		// Rutina por usuario
		for (let usuario of usuarios) {
			// Variables
			let cuerpoMail;

			// Obtiene la fecha en que se le envió el último comunicado y si coincide con el día de hoy, omite la rutina
			const {hoyUsuario, saltear} = procesos.mailDeFeedback.hoyUsuario(usuario);
			// if (saltear) continue;

			// Variables
			cuerpoMail = "<h1 " + normalize + "font-size: 20px'>Resultado de las sugerencias realizadas</h1>";

			// Obtiene la información de los cambios de status
			const regsAB = regsTodos.filter((n) => n.sugerido_por_id == usuario.id && n.tabla == "cambios_de_status");
			if (regsAB.length) cuerpoMail += await procesos.mailDeFeedback.mensajeAB(regsAB);

			// Obtiene la información de los cambios de edición
			const regsEdic = regsTodos.filter((n) => n.sugerido_por_id == usuario.id && n.tabla == "ediciones");
			if (regsEdic.length) cuerpoMail += await procesos.mailDeFeedback.mensajeEdic(regsEdic);

			// Envía el mail y registra si fue enviado
			const asunto = "DADI - Resultado de las sugerencias realizadas";
			const email = usuario.email;
			mailsEnviados.push(
				comp
					.enviarMail(asunto, email, cuerpoMail)
					.then((n) => n.OK)
					.then(async (n) => {
						if (n) {
							if (regsAB.length) procesos.mailDeFeedback.eliminaRegsAB(regsAB);
							if (regsEdic.length) procesos.mailDeFeedback.eliminaRegsEdic(regsEdic);
							// await procesos.mailDeFeedback.actualizaHoraRevisorEnElUsuario(hoyUsuario);
						}
						return n;
					})
			);
		}

		// Fin
		console.log("Esperando...");
		await Promise.all(mailsEnviados);
		procesos.rutinasFinales("MailDeFeedback");
		return;
	},

	// 2. Rutinas diarias
	FechaHoraUTC: function () {
		// Obtiene las rutinas del archivo JSON
		let info = procesos.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.HorariosUTC || !Object.keys(info.HorariosUTC).length) return;
		const rutinas = Object.keys(info.HorariosUTC);

		// Obtiene la fecha UTC actual
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();

		// Establece el status de los procesos de rutina
		const archJSON = {FechaUTC, HoraUTC};
		for (let rutina of rutinas) archJSON[rutina] = "NO";
		archJSON.FechaHoraUTC = "SI";

		// Actualiza el archivo JSON
		procesos.actualizaRutinasJSON(archJSON);

		// Fin
		procesos.rutinasFinales("FechaHoraUTC");
		return;
	},
	BorraImagenesSinRegistro: async () => {
		// Funciones
		await procesos.borraImagenesSinRegistro1("peliculas");
		await procesos.borraImagenesSinRegistro1("personajes");
		procesos.borraImagenesProvisorio();

		// Fin
		procesos.rutinasFinales("BorraImagenesSinRegistro");
		return;
	},
	ImagenDerecha: async function () {
		// Variables
		let info = procesos.lecturaRutinasJSON();
		const milisegs = new Date().getTime() + (new Date().getTimezoneOffset() / 60) * unaHora;
		const fechas = [procesos.diaMesAno(milisegs - unDia), procesos.diaMesAno(milisegs), procesos.diaMesAno(milisegs + unDia)];

		// Borra los archivos de imagen que no se corresponden con los titulos
		procesos.borraLosArchivosDeImgDerechaObsoletos(fechas);

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
				const fechaArchivo = procesos.diaMesAno(fechaNum);

				// Obtiene los datos de la imagen derecha
				const {titulo, carpeta, nombre_archivo} = await procesos.obtieneImgDerecha(fechaNum);

				// Actualiza el titulo para esa fecha
				TitulosImgDer[fecha] = titulo;

				// Guarda el archivo de la 'imgDerecha' para esa fecha
				comp.gestionArchivos.copiaImagen(carpeta + nombre_archivo, "4-ImagenDerecha/" + fechaArchivo + ".jpg");
			}
		}

		// Actualiza el archivo JSON
		procesos.actualizaRutinasJSON({TitulosImgDer});

		// Fin
		procesos.rutinasFinales("ImagenDerecha");
		return;
	},
	PaisesConMasProductos: async () => {
		// Variables
		const condicion = {status_registro_id: aprobado_id};
		const entidades = ["peliculas", "colecciones"];
		let paisesID = {};
		let verificador = [];

		// Obtiene la frecuencia por país
		for (let entidad of entidades) {
			// Obtiene todos los registros de la entidad
			await BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
				.then((n) => n.filter((m) => m.paises_id))
				.then((n) =>
					n.map((m) => {
						for (let a of m.paises_id.split(" ")) paisesID[a] ? paisesID[a]++ : (paisesID[a] = 1);
					})
				);
		}

		// Actualiza la frecuencia por país
		for (let pais of paises) {
			const cantProds = paisesID[pais.id] ? paisesID[pais.id] : 0;
			verificador.push(BD_genericas.actualizaPorId("paises", pais.id, {cantProds}));
		}
		await Promise.all(verificador);

		// Fin
		procesos.rutinasFinales("PaisesConMasProductos");
		return;
	},
	AprobadoConAvatarUrl: async () => {
		// Descarga el avatar en la carpeta 'Prods-Final'
		// Variables
		const ruta = "./publico/imagenes/2-Productos/Final/";
		const condicion = {status_registro_id: aprobado_id, avatar: {[Op.like]: "%/%"}};
		let verificador = [];

		// Revisa, descarga, actualiza
		for (let entidad of ["peliculas", "colecciones"])
			verificador.push(
				BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
					.then((n) =>
						n.map((m) => {
							const nombre = Date.now() + path.extname(m.avatar);
							comp.gestionArchivos.descarga(m.avatar, ruta + nombre);
							BD_genericas.actualizaPorId(entidad, m.id, {avatar: nombre});
						})
					)
					.then(() => true)
			);
		await Promise.all(verificador);

		// Fin
		procesos.rutinasFinales("AprobadoConAvatarUrl");
		return;
	},

	// 3. Rutinas semanales
	SemanaUTC: function () {
		// Obtiene la fecha y la hora procesados
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();
		const semana = procesos.semanaUTC();

		// Obtiene las rutinas del archivo JSON
		let info = procesos.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.DiasUTC || !Object.keys(info.DiasUTC).length) return;
		const rutinas = Object.keys(info.DiasUTC);

		// Establece el status de los procesos de rutina
		const statusRutinas = {};
		for (let rutina of rutinas) statusRutinas[rutina] = "NO";
		statusRutinas.SemanaUTC = "SI";

		// Actualiza el archivo JSON
		procesos.actualizaRutinasJSON({semanaUTC: semana, FechaSemUTC: FechaUTC, HoraSemUTC: HoraUTC, ...statusRutinas});

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

		// Fin
		procesos.rutinasFinales("LinksVencidos");
		return;
	},
	RclvsSinEpocaPSTyConAno: async () => {
		// Variables
		const condicion = {status_registro_id: aprobado_id, epoca_id: {[Op.ne]: "pst"}, ano: {[Op.ne]: null}};
		const entidades = ["personajes", "hechos"];
		let verificador = [];

		for (let entidad of entidades)
			verificador.push(
				BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
					.then((n) => n.map((m) => BD_genericas.actualizaPorId(entidad, m.id, {ano: null})))
					.then(() => true)
			);
		await Promise.all(verificador);

		// Fin
		procesos.rutinasFinales("RclvsSinEpocaPSTyConAno");
		return;
	},
};
