"use strict";
// Variables
const cron = require("node-cron");
const procsCRUD = require("../../rutas_y_controladores/2.0-Familias-CRUD/FM-Procesos");
const comp = require("../1-Procesos/Compartidas");
const BD_genericas = require("../2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const variables = require("../1-Procesos/Variables");
const procesos = require("./RT-Procesos");

// Exportar ------------------------------------
module.exports = {
	// 0. Start-up y Configuracion de Rutinas
	startupMasConfiguracion: async function () {
		// Rutinas programadas
		const info = procesos.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;

		// Rutinas diarias
		if (!info.RutinasDiarias || !Object.keys(info.RutinasDiarias).length) return;
		cron.schedule("0 0 * * *", async () => this.FechaHoraUTC(), {timezone: "Etc/Greenwich"});

		// Rutinas horarias
		if (!info.RutinasHorarias || !info.RutinasHorarias.length) return;
		const rutinasHorarias = info.RutinasHorarias;
		rutinasHorarias.forEach((rutina, i) => {
			let minuto = 1 + i;
			cron.schedule(minuto + " * * * *", async () => await this[rutina](), {timezone: "Etc/Greenwich"});
		});

		// Start-up
		await this.FechaHoraUTC();

		// Fin
		return;
		this.MailDeFeedback();
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
			for (let id of IDs) procsCRUD.revisiones.linksEnProd({entidad, id});
		}

		// Fin
		procesos.rutinasSinGuardar("LinksEnProd");
		return;
	},
	ProdsEnRCLV: async function () {
		// Obtiene las entidadesRCLV
		const entidadesRCLV = variables.entidades.rclvs;

		// Rutina por entidad
		for (let entidad of entidadesRCLV) {
			// Obtiene los ID de los registros de la entidad
			let IDs = await BD_genericas.obtieneTodos(entidad, "id").then((n) => n.map((m) => m.id));

			// Rutina por ID: ejecuta la función prodsEnRCLV
			for (let id of IDs) procsCRUD.revisiones.prodsEnRCLV({entidad, id});
		}

		// Fin
		procesos.rutinasSinGuardar("ProdsEnRCLV");
		return;
	},
	MailDeFeedback: async () => {
		// Obtiene información de la base de datos y si no hay pendientes, interrumpe
		const {regsAB, regsEdic} = await procesos.mailDeFeedback.obtieneRegistros();
		const regsTodos = [...regsAB, ...regsEdic];

		// Si no hay registros a comunicar, termina el proceso
		if (!regsTodos.length) {
			// Outputs
			console.log("Sin mails para enviar");
			procesos.rutinasSinGuardar("MailDeFeedback");

			// Fin
			return;
		}

		// Variables
		const asunto = "Resultado de las sugerencias realizadas";
		let mailsEnviados = [];

		// Usuarios
		let usuarios_id = [...new Set(regsTodos.map((n) => n.sugeridoPor_id))];
		const usuarios = await BD_genericas.obtieneTodosConInclude("usuarios", "pais").then((n) =>
			n.filter((m) => usuarios_id.includes(m.id))
		);

		// Rutina por usuario
		for (let usuario of usuarios) {
			// Obtiene la fecha en que se le envió el último comunicado y si coincide con el día de hoy, omite la rutina
			const {hoyUsuario, saltear} = procesos.mailDeFeedback.hoyUsuario(usuario);
			if (saltear) continue;

			// Variables
			const email = usuario.email;
			const regsAB_user = regsAB.filter((n) => n.sugeridoPor_id == usuario.id);
			const regsEdic_user = regsEdic.filter((n) => n.sugeridoPor_id == usuario.id);
			let cuerpoMail = "";

			// Arma el cuerpo del mail
			if (regsAB_user.length) cuerpoMail += await procesos.mailDeFeedback.mensajeAB(regsAB_user);
			if (regsEdic_user.length) cuerpoMail += await procesos.mailDeFeedback.mensajeEdic(regsEdic_user);

			// Envía el mail y actualiza la BD
			mailsEnviados.push(
				comp
					.enviarMail(asunto, email, cuerpoMail) // Envía el mail
					.then((n) => n.OK) // Averigua si el mail fue enviado
					.then(async (n) => {
						// Acciones si el mail fue enviado
						if (n) {
							if (regsAB_user.length) procesos.mailDeFeedback.eliminaRegsAB(regsAB_user); // Borra los registros prescindibles
							if (regsEdic_user.length) procesos.mailDeFeedback.eliminaRegsEdic(regsEdic_user); // Borra los registros prescindibles
							procesos.mailDeFeedback.actualizaHoraRevisorEnElUsuario(usuario, hoyUsuario); // Actualiza el registro de usuario en el campo fecha_revisor
						}
						console.log("Mail enviado a " + email);
						return n; // Conserva el valor de si el mail fue enviado
					})
			);
		}

		// Fin
		console.log("Enviando mails...");
		await Promise.all(mailsEnviados);
		procesos.rutinasSinGuardar("MailDeFeedback");
		return;
	},

	// 2. Rutinas diarias
	FechaHoraUTC: async function () {
		// Obtiene las rutinas del archivo JSON
		let info = procesos.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.RutinasDiarias || !Object.keys(info.RutinasDiarias).length) return;
		const rutinasDiarias = info.RutinasDiarias;

		// Obtiene la fecha y hora UTC actual
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();

		// Si la 'FechaUTC' actual es igual a la del archivo JSON, termina la función
		if (info.FechaUTC == FechaUTC) return;

		// Actualiza los campos de fecha
		const feedback = {FechaUTC, HoraUTC, FechaHoraUTC: "NO"}; // Con el paso de 'rutinasFinales', se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback);
		procesos.rutinasFinales("FechaHoraUTC");

		// Actualiza los campos de Rutinas Diarias
		const feedback_RD = {};
		for (let rutinaDiaria in rutinasDiarias) feedback_RD[rutinaDiaria] = "NO"; // Cuando se ejecuta cada rutina, se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback_RD, "RutinasDiarias");
		await this.RutinasDiarias();

		// Verifica si se deben correr las rutinas semanales
		await this.SemanaUTC();

		// Fin
		return;
	},
	RutinasDiarias: async function () {
		// Obtiene la información del archivo JSON
		const info = procesos.lecturaRutinasJSON();
		const rutinasDiarias = info.RutinasDiarias;

		// Actualiza todas las rutinas diarias
		for (let rutinaDiaria in rutinasDiarias) await this[rutinaDiaria]();

		// Fin
		return;
	},
	ImagenDerecha: async function () {
		// Variables
		let info = procesos.lecturaRutinasJSON();
		const milisegs = new Date().getTime() + (new Date().getTimezoneOffset() / 60) * unaHora;
		const fechaInicial = milisegs - 2 * unDia; // Arranca desde 2 días atrás
		const cantFechas = 5; // Incluye 5 días
		let fechas = [];
		let tituloNuevo;

		// Limpia el historial de ImagenesDerecha en 'global'
		ImagenesDerecha = {};

		// Actualiza los títulos de la imagen derecha para cada fecha
		for (let i = 0; i < cantFechas; i++) {
			// Variables
			const fechaNum = fechaInicial + unDia * i;
			const fechaArchivo = procesos.diaMesAno(fechaNum);

			// Arma el array de fechas
			fechas.push(fechaArchivo);

			// Obtiene las 'ImagenesDerecha'
			if (info.ImagenesDerecha && info.ImagenesDerecha[fechaArchivo])
				ImagenesDerecha[fechaArchivo] = info.ImagenesDerecha[fechaArchivo];
			else {
				// Variables
				const {titulo, entidad, id, carpeta, nombre_archivo} = await procesos.obtieneImgDerecha(fechaNum);
				tituloNuevo = true;

				// Actualiza los datos para esa fecha
				ImagenesDerecha[fechaArchivo] = entidad && id ? {titulo, entidad, id} : {titulo};

				// Guarda el archivo de la 'imgDerecha' para esa fecha
				comp.gestionArchivos.copiaImagen(carpeta + nombre_archivo, "4-ImagenDerecha/" + fechaArchivo + ".jpg");
			}
		}

		// Guarda los títulos de las imágenes
		if (tituloNuevo) {
			procesos.guardaArchivoDeRutinas({ImagenesDerecha});
			const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();
			console.log(FechaUTC, HoraUTC + "hs. -", "Titulos de 'Imagen Derecha' actualizados y  guardados en JSON");
		}

		// Borra los archivos de imagen que no se corresponden con los titulos
		procesos.borraLosArchivosDeImgDerechaObsoletos(fechas);

		// Fin
		procesos.rutinasFinales("ImagenDerecha", "RutinasDiarias");
		return;
	},
	BorraImagenesSinRegistro: async () => {
		// Funciones
		await procesos.eliminaImagenesDeFamiliasSinRegistro("productos");
		await procesos.eliminaImagenesDeFamiliasSinRegistro("rclvs");
		procesos.borraImagenesProvisorio();

		// Fin
		procesos.rutinasFinales("BorraImagenesSinRegistro", "RutinasDiarias");
		return;
	},
	PaisesConMasProductos: async () => {
		// Variables
		const condicion = {statusRegistro_id: aprobado_id};
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
		procesos.rutinasFinales("PaisesConMasProductos", "RutinasDiarias");
		return;
	},
	AprobadoConAvatarUrl: async () => {
		// Descarga el avatar en la carpeta 'Prods-Final'
		// Variables
		const ruta = "./publico/imagenes/2-Productos/Final/";
		const condicion = {statusRegistro_id: aprobado_id, avatar: {[Op.like]: "%/%"}};
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
		procesos.rutinasFinales("AprobadoConAvatarUrl", "RutinasDiarias");
		return;
	},

	// 3. Rutinas semanales
	SemanaUTC: async function () {
		// Obtiene las rutinas del archivo JSON
		let info = procesos.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.RutinasSemanales || !Object.keys(info.RutinasSemanales).length) return;
		const rutinasSemanales = info.RutinasSemanales;

		// Obtiene la fecha y hora UTC actual
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();
		const semanaUTC = procesos.semanaUTC();

		// Si la 'semanaUTC' actual es igual a la del archivo JSON, termina la función
		if (info.semanaUTC == semanaUTC) return;

		// Actualiza los campos de semana
		const feedback = {FechaSemUTC: FechaUTC, HoraSemUTC: HoraUTC, semanaUTC, SemanaUTC: "NO"}; // Con el paso de 'rutinasFinales', se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback);
		procesos.rutinasFinales("SemanaUTC");

		// Establece el status de los procesos de rutina
		const feedback_RS = {};
		for (let rutinaSemanal in rutinasSemanales) feedback_RS[rutinaSemanal] = "NO"; // Cuando se ejecuta cada rutina, se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback_RS, "RutinasSemanales");
		await this.RutinasSemanales();

		// Fin
		return;
	},
	RutinasSemanales: async function () {
		// Obtiene la información del archivo JSON
		const info = procesos.lecturaRutinasJSON();
		const rutinasSemanales = info.RutinasSemanales;

		// Si la 'semanaUTC' es distinta o la rutinaSemanal está pendiente, actualiza las rutinasSemanales
		for (let rutinaSemanal in rutinasSemanales) await this[rutinaSemanal]();

		// Fin
		return;
	},
	LinksVencidos: async function () {
		// Obtiene la fecha de corte
		const vidaUtil = 6 * unMes;
		const fechaCorte = new Date(comp.fechaHora.ahora().getTime() - vidaUtil);

		// Obtiene las condiciones de cuáles son los links vencidos
		const condiciones = {statusSugeridoEn: {[Op.lt]: fechaCorte}, statusRegistro_id: aprobado_id};

		// Prepara la información
		const objeto = {statusSugeridoPor_id: 2, statusRegistro_id: creadoAprob_id};

		// Actualiza el status de los links vencidos
		BD_genericas.actualizaTodosPorCondicion("links", condiciones, objeto);

		// Fin
		procesos.rutinasFinales("LinksVencidos", "RutinasSemanales");
		return;
	},
	RclvsSinEpocaPSTyConAno: async () => {
		// Variables
		const condicion = {statusRegistro_id: aprobado_id, epoca_id: {[Op.ne]: "pst"}, ano: {[Op.ne]: null}};
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
		procesos.rutinasFinales("RclvsSinEpocaPSTyConAno", "RutinasSemanales");
		return;
	},
};
let epoca = async () => {
	// Variables
	const entidades = variables.entidades.prods;
	const include = ["personaje", "hecho"];
	const nuevoStatus = {statusRegistro_id: creadoAprob_id};
	const condicion1 = {statusRegistro_id: aprobado_id, epoca_id: null};
	const condicion2 = {[Op.or]: [{personaje_id: {[Op.ne]: null}}, {hecho_id: {[Op.ne]: null}}]};

	// Revisa cada registro aprobado y sin epoca_id
	for (let entidad of entidades) {
		// Obtiene todos los registros con include personaje y hecho
		const registros = await BD_genericas.obtieneTodosPorCondicionConInclude(entidad, condicion1, include);

		for (let registro of registros) {
			const id = registro.id;
			// Revisa si tiene un personaje con epoca_id, y en caso afirmativo se la copia
			if (registro.personaje.epoca_id) BD_genericas.actualizaPorId(entidad, id, {epoca_id: registro.personaje.epoca_id});
			// Revisa si tiene un hecho con epoca_id, y en caso afirmativo se la copia
			else if (registro.hecho.epoca_id) BD_genericas.actualizaPorId(entidad, id, {epoca_id: registro.hecho.epoca_id});
			// En caso negativo, le cambia el status a creadoAprob
			else BD_genericas.actualizaPorId(entidad, id, nuevoStatus);
		}
	}

	// Obtiene las ediciones que pueden aportar el valor de la época
	const ediciones = await BD_genericas.obtieneTodosPorCondicionConInclude("prods_edicion", condicion2, include);

	for (let edicion of ediciones) {
		const id = edicion.id;
		// Revisa si tiene un personaje con epoca_id, y en caso afirmativo se la copia
		if (edicion.personaje && edicion.personaje.epoca_id)
			BD_genericas.actualizaPorId("prods_edicion", id, {epoca_id: edicion.personaje.epoca_id});
		// Revisa si tiene un hecho con epoca_id, y en caso afirmativo se la copia
		else if (edicion.hecho && edicion.hecho.epoca_id)
			BD_genericas.actualizaPorId("prods_edicion", id, {epoca_id: edicion.hecho.epoca_id});
	}
};
