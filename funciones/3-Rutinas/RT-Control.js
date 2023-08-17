"use strict";
// Variables
const cron = require("node-cron");
const procsCRUD = require("../../rutas_y_controladores/2.0-Familias-CRUD/FM-Procesos");
const comp = require("../2-Procesos/Compartidas");
const BD_genericas = require("../1-BD/Genericas");
const variables = require("../2-Procesos/Variables");
const procesos = require("./RT-Procesos");

// Exportar ------------------------------------
module.exports = {
	// 0. Start-up y Configuracion de Rutinas
	startupMasConfiguracion: async function () {
		// Variables
		this.FechaPrimerLunesDelAno();
		semanaUTC = parseInt((Date.now() - fechaPrimerLunesDelAno) / unDia / 7);
		lunesDeEstaSemana = fechaPrimerLunesDelAno + semanaUTC * unaSemana;

		// Rutinas programadas
		const info = procesos.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;

		// Rutinas diarias
		if (!info.RutinasDiarias || !Object.keys(info.RutinasDiarias).length) return;
		cron.schedule("0 0 * * *", async () => this.FechaHoraUTC(), {timezone: "Etc/Greenwich"});

		// Rutinas horarias
		if (!info.RutinasHorarias || !info.RutinasHorarias.length) return;
		const rutinasHorarias = info.RutinasHorarias;
		cron.schedule("1 * * * *", async () => this.RutinasHorarias(), {timezone: "Etc/Greenwich"});

		// Start-up
		await this.FechaHoraUTC();

		// Fin
		return;
		this.LinksVencidos();
		this.LinksEnProd();
	},

	// 1. Rutinas horarias
	RutinasHorarias: async function () {
		// Obtiene la información del archivo JSON
		const info = procesos.lecturaRutinasJSON();
		const rutinasHorarias = info.RutinasHorarias;

		// Actualiza todas las rutinas horarias
		for (let rutinaHoraria of rutinasHorarias) await this[rutinaHoraria]();

		// Fin
		return;
	},
	LinksEnProd: async function () {
		// Variables
		let esperar = [];

		// Rutina por peliculas y capitulos
		for (let entidad of ["peliculas", "capitulos"]) {
			// Obtiene los ID de los registros de la entidad
			const IDs = await BD_genericas.obtieneTodos(entidad).then((n) => n.map((m) => m.id));

			// Ejecuta la función linksEnProd
			for (let id of IDs) esperar.push(procsCRUD.revisiones.linksEnProd({entidad, id}));
		}
		await Promise.all(esperar);

		// Rutina por colecciones
		const IDs = await BD_genericas.obtieneTodos("colecciones").then((n) => n.map((m) => m.id));
		for (let id of IDs) procsCRUD.revisiones.linksEnColec(id);

		// Fin
		procesos.finRutinasHorarias("LinksEnProd");
		return;
	},
	MailDeFeedback: async () => {
		// Obtiene de la base de datos, la información de todo el historial pendiente de comunicar, y si no hay pendientes interrumpe
		const {regsStatus, regsEdic} = await procesos.mailDeFeedback.obtieneElHistorial();
		const regsTodos = [...regsStatus, ...regsEdic];

		// Si no hay registros a comunicar, termina el proceso
		if (!regsTodos.length) {
			// Outputs
			console.log("Sin mails para enviar");
			procesos.finRutinasHorarias("MailDeFeedback");

			// Fin
			return;
		}

		// Variables
		const asunto = "Resultado de las sugerencias realizadas";
		let mailsEnviados = [];

		// Obtiene los usuarios relacionados con esos registros
		let usuarios_id = [...new Set(regsTodos.map((n) => n.sugeridoPor_id))];
		const usuarios = await BD_genericas.obtieneTodosConInclude("usuarios", "pais").then((n) =>
			n.filter((m) => usuarios_id.includes(m.id))
		);

		// Rutina por usuario
		for (let usuario of usuarios) {
			// Obtiene la fecha en que se le envió el último comunicado y si coincide con el día de hoy, saltea al siguiente usuario
			const hoyUsuario = procesos.mailDeFeedback.hoyUsuario(usuario);

			// Si la fecha local es igual que la fecha del último comunicado, se saltea el usuario
			if (hoyUsuario == usuario.fechaRevisores) continue;

			// Variables
			const email = usuario.email;
			const regsStatus_user = regsStatus.filter((n) => n.sugeridoPor_id == usuario.id);
			const regsEdic_user = regsEdic.filter((n) => n.sugeridoPor_id == usuario.id);
			let cuerpoMail = "";

			// Arma el cuerpo del mail
			if (regsStatus_user.length) cuerpoMail += await procesos.mailDeFeedback.mensajeStatus(regsStatus_user);
			if (regsEdic_user.length) cuerpoMail += await procesos.mailDeFeedback.mensajeEdic(regsEdic_user);

			// Envía el mail y actualiza la BD
			mailsEnviados.push(
				comp
					.enviarMail(asunto, email, cuerpoMail) // Envía el mail
					.then((n) => n.OK) // Averigua si el mail fue enviado
					.then(async (n) => {
						// Acciones si el mail fue enviado
						if (n) {
							if (regsStatus_user.length) procesos.mailDeFeedback.eliminaRegsStatusComunica(regsStatus_user); // Borra los registros prescindibles
							if (regsEdic_user.length) procesos.mailDeFeedback.eliminaRegsEdicComunica(regsEdic_user); // Borra los registros prescindibles
							BD_genericas.actualizaPorId("usuarios", usuario.id, {fechaRevisores: hoyUsuario}); // Actualiza el registro de usuario en el campo fecha_revisor
						}
						console.log("Mail enviado a " + email);
						return n; // Conserva el valor de si el mail fue enviado
					})
			);
		}

		// Avisa que está procesando el envío de los mails
		console.log("Procesando el envío de mails...");
		await Promise.all(mailsEnviados);

		// Fin
		procesos.finRutinasHorarias("MailDeFeedback");
		return;
	},
	ProdsEnRCLV: async function () {
		// Obtiene las entidadesRCLV
		const entidadesRCLV = variables.entidades.rclvs;

		// Rutina por entidad
		for (let entidad of entidadesRCLV) {
			// Obtiene los ID de los registros de la entidad
			let IDs = await BD_genericas.obtieneTodos(entidad).then((n) => n.map((m) => m.id));

			// Rutina por ID: ejecuta la función prodsEnRCLV
			for (let id of IDs) procsCRUD.revisiones.prodsEnRCLV({entidad, id});
		}

		// Fin
		procesos.finRutinasHorarias("ProdsEnRCLV");
		return;
	},

	// 2. Rutinas diarias
	FechaHoraUTC: async function () {
		// Obtiene la información del archivo JSON
		let info = procesos.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.RutinasDiarias || !Object.keys(info.RutinasDiarias).length) return;
		const rutinasDiarias = info.RutinasDiarias;

		// Obtiene la fecha y hora UTC actual
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();

		// Si la 'FechaUTC' actual es igual a la del archivo JSON, termina la función
		if (info.FechaUTC == FechaUTC) return;

		// Actualiza los campos de fecha
		const feedback = {FechaUTC, HoraUTC, FechaHoraUTC: "NO"}; // Con el paso de 'finRutinasDiariasSemanales', se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback);
		procesos.finRutinasDiariasSemanales("FechaHoraUTC");

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
		const milisegs = Date.now() + (new Date().getTimezoneOffset() / 60) * unaHora;
		const fechaInicial = milisegs - 2 * unDia; // Arranca desde 2 días atrás
		const cantFechas = 5; // Incluye 5 días
		let fechas = [];
		let tituloNuevo;

		// Limpia el historial de ImagenesDerecha en 'global'
		ImagenesDerecha = {};

		// Actualiza los títulos de la imagen derecha para cada fecha y descarga las imágenes nuevas
		for (let i = 0; i < cantFechas; i++) {
			// Variables
			const fechaNum = fechaInicial + unDia * i;
			const fechaArchivo = procesos.diaMesAno(fechaNum);

			// Arma el array de fechas
			fechas.push(fechaArchivo);

			// Obtiene los títulos ya vigentes de las 'ImagenesDerecha'
			if (info.ImagenesDerecha && info.ImagenesDerecha[fechaArchivo])
				ImagenesDerecha[fechaArchivo] = info.ImagenesDerecha[fechaArchivo];
			// Obtiene los títulos nuevos de las 'ImagenesDerecha' y descarga los archivos
			else {
				// Variables
				const {titulo, entidad, id, carpeta, nombreArchivo} = await procesos.obtieneImgDerecha(fechaNum);
				tituloNuevo = true;

				// Actualiza los datos para esa fecha
				ImagenesDerecha[fechaArchivo] = entidad && id ? {titulo, entidad, id} : {titulo};

				// Guarda el archivo de la 'imgDerecha' para esa fecha
				comp.gestionArchivos.copiaImagen(carpeta + nombreArchivo, "4-ImagenDerecha/" + fechaArchivo + ".jpg");
			}
		}

		// Guarda los títulos de las imágenes nuevas
		if (tituloNuevo) {
			procesos.guardaArchivoDeRutinas({ImagenesDerecha});
			const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();
			console.log(FechaUTC, HoraUTC + "hs. -", "Titulos de 'Imagen Derecha' actualizados y  guardados en JSON");
		}

		// Borra los archivos de imagen que no se corresponden con los títulos
		procesos.borraLosArchivosDeImgDerechaObsoletos(fechas);

		// Fin
		procesos.finRutinasDiariasSemanales("ImagenDerecha", "RutinasDiarias");
		return;
	},
	PaisesConMasProductos: async () => {
		// Variables
		const condicion = {statusRegistro_id: aprobado_id};
		const entidades = ["peliculas", "colecciones"];
		let paisesID = {};
		let espera = [];

		// Obtiene la frecuencia por país
		for (let entidad of entidades) {
			// Obtiene todos los registros de la entidad
			await BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
				.then((n) => n.filter((m) => m.paises_id))
				.then((n) =>
					n.map((m) => {
						for (let n of m.paises_id.split(" ")) paisesID[n] ? paisesID[n]++ : (paisesID[n] = 1);
					})
				);
		}

		// Actualiza la frecuencia por país
		for (let pais of paises) {
			const cantProds = paisesID[pais.id] ? paisesID[pais.id] : 0;
			espera.push(BD_genericas.actualizaPorId("paises", pais.id, {cantProds}));
		}
		await Promise.all(espera);

		// Fin
		procesos.finRutinasDiariasSemanales("PaisesConMasProductos", "RutinasDiarias");
		return;
	},
	ProductosAlAzar: async () => {
		// Establece la condición en que sean productos aprobados y con calificación superior o igual al 70%
		const condics = {calificacion: {[Op.gte]: 70}, statusRegistro_id: aprobado_id};

		// Rastrilla las películas y colecciones
		for (let entidad of ["peliculas", "colecciones"]) {
			// Obtiene los productos
			const productos = await BD_genericas.obtieneTodos(entidad);

			// Rastrilla los productos
			for (let producto of productos) {
				let azar =
					producto.statusRegistro_id == aprobado_id // Averigua si el producto está aprobado y su calificación es superior o igual al 70%
						? parseInt(Math.random() * Math.pow(10, 6)) // Le asigna un n° entero al azar, donde 10^6 es el máximo posible
						: null; // Para los demás, les limpia el campo azar

				// Actualiza el campo en el registro
				BD_genericas.actualizaPorId(entidad, producto.id, {azar});
			}
		}

		// Fin
		procesos.finRutinasDiariasSemanales("ProductosAlAzar", "RutinasDiarias");
		return;
	},
	EliminaRegistrosAntiguos: async () => {
		// Variables
		const ahora = Date.now();
		const tablas = [
			{nombre: "histEdics", campo: "revisadoEn", antiguedad: unDia * 365},
			{nombre: "histStatus", campo: "revisadoEn", antiguedad: unDia * 365},
			{nombre: "historialPelis", campo: "visitadaEn", antiguedad: unDia * 183},
		];

		// Elimina registros antiguos
		for (let tabla of tablas) {
			const fechaDeCorte = new Date(ahora - tabla.antiguedad);
			BD_genericas.eliminaTodosPorCondicion(tabla.nombre, {[tabla.campo]: {[Op.lt]: fechaDeCorte}});
		}

		// Fin
		return;
	},

	// 3. Rutinas semanales
	SemanaUTC: async function () {
		// Obtiene la información del archivo JSON
		let info = procesos.lecturaRutinasJSON();
		if (!Object.keys(info).length) return;
		if (!info.RutinasSemanales || !Object.keys(info.RutinasSemanales).length) return;
		const rutinasSemanales = info.RutinasSemanales;

		// Obtiene la fecha y hora UTC actual
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();

		// Obtiene la semanaUTC actual
		this.FechaPrimerLunesDelAno();
		semanaUTC = parseInt((Date.now() - fechaPrimerLunesDelAno) / unDia / 7);
		lunesDeEstaSemana = fechaPrimerLunesDelAno + semanaUTC * unaSemana;

		// Si la 'semanaUTC' actual es igual a la del archivo JSON, termina la función
		if (info.semanaUTC == semanaUTC) return;

		// Actualiza los campos de semana
		const feedback = {FechaSemUTC: FechaUTC, HoraSemUTC: HoraUTC, semanaUTC, SemanaUTC: "NO"}; // Con el paso de 'finRutinasDiariasSemanales', se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback);
		procesos.finRutinasDiariasSemanales("SemanaUTC");

		// Actualiza los campos de Rutinas Semanales
		const feedback_RS = {};
		for (let rutinaSemanal in rutinasSemanales) feedback_RS[rutinaSemanal] = "NO"; // Cuando se ejecuta cada rutina, se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback_RS, "RutinasSemanales");
		await this.RutinasSemanales();

		// Fin
		return;
	},
	FechaPrimerLunesDelAno: () => {
		// Obtiene el primer día del año
		const fecha = new Date();
		const diferenciaHoraria = (fecha.getTimezoneOffset() / 60) * unaHora;
		const comienzoAno = new Date(fecha.getUTCFullYear(), 0, 1).getTime() - diferenciaHoraria; // Resta la diferencia horaria para tener el 1/ene de Greenwich

		// Obtiene el dia de semana del primer día del año (domingo: 0, sábado:6)
		const primerDiaDelAno = new Date(comienzoAno + diferenciaHoraria); // Suma la diferencia horaria para tener el día correcto
		const diaSem_primerDiaDelAno = primerDiaDelAno.getDay();

		// Obtiene el primer lunes del año
		let diasAdicsPorLunes = 1 - diaSem_primerDiaDelAno;
		if (diasAdicsPorLunes < 0) diasAdicsPorLunes += 7;
		fechaPrimerLunesDelAno = comienzoAno + diasAdicsPorLunes * unDia;

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
	AprobadoConAvatarLink: async () => {
		// Variables
		const condicion = {statusRegistro_id: aprobado_id, avatar: {[Op.like]: "%/%"}};
		let espera = [];

		// Revisa, descarga, actualiza
		for (let entidad of ["peliculas", "colecciones", ...variables.entidades.rclvs]) {
			// Variables
			const familias = comp.obtieneDesdeEntidad.familias(entidad);
			const ruta = "./publico/imagenes/2-" + familias + "/Final/";

			// Descarga el avatar y actualiza el valor en el campo del registro original
			espera.push(
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
		}
		await Promise.all(espera);

		// Fin
		procesos.finRutinasDiariasSemanales("AprobadoConAvatarLink", "RutinasSemanales");
		return;
	},
	BorraImagenesSinRegistro: async () => {
		// Funciones
		await procesos.eliminaImagenesDeFamiliasSinRegistro("productos");
		await procesos.eliminaImagenesDeFamiliasSinRegistro("rclvs");
		procesos.borraImagenesProvisorio();

		// Fin
		procesos.finRutinasDiariasSemanales("BorraImagenesSinRegistro", "RutinasSemanales");
		return;
	},
	LinksVencidos: async function () {
		// Variables
		const fechaPrimeraRevision = new Date(lunesDeEstaSemana - vidaPrimRevision);
		const fechaVidaUtil = new Date(lunesDeEstaSemana - vidaUtilLinks);

		// Condiciones
		const condiciones = [
			{statusRegistro_id: aprobado_id},
			{
				[Op.or]: [
					{statusSugeridoEn: {[Op.lt]: fechaPrimeraRevision}, yaTuvoPrimRev: false}, // Necesita su primera revisión
					{statusSugeridoEn: {[Op.lt]: fechaVidaUtil}, yaTuvoPrimRev: true}, // Concluyó su vida útil
				],
			},
		];

		// Actualiza el status de los links
		const objeto = {
			statusSugeridoPor_id: usAutom_id,
			// statusSugeridoEn: ahora, // no se lo pone, para poder observar la fecha original que deriva en este status
			statusRegistro_id: creadoAprob_id,
		};
		await BD_genericas.actualizaTodosPorCondicion("links", condiciones, objeto);

		// Fin
		procesos.finRutinasDiariasSemanales("LinksVencidos", "RutinasSemanales");
		return;
	},
	RCLV_idEnCapitulos: async () => {
		// Variables
		const rclvs_id = variables.entidades.rclvs_id;

		// Obtiene todas las colecciones
		const colecciones = await BD_genericas.obtieneTodos("colecciones");

		// Rutinas
		for (let coleccion of colecciones) // Rutina por colección
			for (let rclv_id of rclvs_id) // Rutina por rclv_id
				if (coleccion[rclv_id] > 10) {
					// Variables
					const condiciones = {coleccion_id: coleccion.id, [rclv_id]: coleccion[rclv_id]}; // Averigua si alguno de sus capítulos tiene el mismo rclv_id
					const objeto = {[rclv_id]: 1}; // En los casos que encuentra, convierte el rclv_id en 1

					// Actualiza los capítulos que correspondan
					BD_genericas.actualizaTodosPorCondicion("capitulos", condiciones, objeto);
				}

		// Fin
		procesos.finRutinasDiariasSemanales("RCLV_idEnCapitulos", "RutinasSemanales");
		return;
	},
	RCLVsSinEpocaPSTyConAno: async () => {
		// Variables
		const entidades = ["personajes", "hechos"];
		let verificador = [];

		// Establece la condición
		const condicion = {statusRegistro_id: aprobado_id, epocaOcurrencia_id: {[Op.ne]: "pst"}};

		// Busca
		for (let entidad of entidades) {
			const ano = entidad == "personajes" ? "anoNacim" : "anoComienzo";
			verificador.push(
				BD_genericas.obtieneTodosPorCondicion(entidad, {...condicion, [ano]: {[Op.ne]: null}})
					.then((n) => n.map((m) => BD_genericas.actualizaPorId(entidad, m.id, {anoNacim: null, anoComienzo: null})))
					.then(() => true)
			);
		}
		await Promise.all(verificador);

		// Fin
		procesos.finRutinasDiariasSemanales("RCLVsSinEpocaPSTyConAno", "RutinasSemanales");
		return;
	},
};

// Variables
let actualizaLaEpocaDeEstreno = async () => {
	const epocasEstrenoDesde = epocasEstreno.sort((a, b) => (a.desde > b.desde ? -1 : 1));
	const condicion = {anoEstreno: {[Op.ne]: null}};

	// Rutina
	for (let entidad of variables.entidades.prods) {
		// Obtiene los productos
		const productos = await BD_genericas.obtieneTodosPorCondicion(entidad, condicion);

		// Actualiza el ID
		for (let producto of productos) {
			const epocaEstreno_id = epocasEstrenoDesde.find((n) => producto.anoEstreno >= n.desde).id;
			BD_genericas.actualizaPorId(entidad, producto.id, {epocaEstreno_id});
		}
	}

	// Fin
	return;
};
