"use strict";
// Variables
const cron = require("node-cron");
const procsCRUD = require("../../rutas_y_controladores/2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./RT-Procesos");

// Exportar
module.exports = {
	// 0. Start-up y Configuración de Rutinas
	startupMasConfiguracion: async function () {
		// Variables
		this.variablesDiarias();
		this.variablesSemanales();

		// Rutinas programadas
		const info = {...rutinasJSON};
		if (!Object.keys(info).length) return;

		// Rutinas diarias (a las 0:00hs)
		if (!info.RutinasDiarias || !Object.keys(info.RutinasDiarias).length) return;
		cron.schedule("0 0 * * *", () => this.FechaHoraUTC(), {timezone: "Etc/Greenwich"});

		// Rutinas horarias (a las 0:01hs)
		if (!info.RutinasHorarias || !info.RutinasHorarias.length) return;
		cron.schedule("1 * * * *", () => this.RutinasHorarias(), {timezone: "Etc/Greenwich"}); // minuto 1

		// Start-up
		await this.FechaHoraUTC();

		// Fin
		console.log();
		console.log("Rutinas de inicio terminadas en " + new Date().toLocaleString());
		return;
	},

	// 1. Rutinas horarias
	RutinasHorarias: async function () {
		// Obtiene la información del archivo JSON
		const info = {...rutinasJSON};
		const rutinasHorarias = info.RutinasHorarias;

		// Actualiza todas las rutinas horarias
		console.log();
		console.log("Rutinas horarias:");
		for (let rutinaHoraria of rutinasHorarias) {
			await this[rutinaHoraria]();
			procesos.finRutinasHorarias(rutinaHoraria);
		}

		// Fin
		return;
	},
	ProdAprobEnLink: async () => {
		// Obtiene todos los links con su producto asociado
		const links = await BD_genericas.obtieneTodosConInclude("links", variables.entidades.asocProds);

		// Actualiza su valor
		comp.prodAprobEnLink(links);

		// Fin
		return;
	},
	LinksEnProd: async function () {
		// Variables
		let esperar = [];

		// Rutina por peliculas y capitulos
		for (let entidad of ["peliculas", "capitulos"]) {
			// Obtiene los ID de los registros de la entidad
			const IDs = await BD_genericas.obtieneTodosPorCondicion(entidad, {statusRegistro_id: aprobados_ids}).then((n) =>
				n.map((m) => m.id)
			);

			// Ejecuta la función linksEnProd
			for (let id of IDs) esperar.push(procsCRUD.revisiones.linksEnProd({entidad, id}));
		}
		await Promise.all(esperar);

		// Rutina por colecciones
		const IDs = await BD_genericas.obtieneTodosPorCondicion("colecciones", {statusRegistro_id: aprobados_ids}).then((n) =>
			n.map((m) => m.id)
		);
		for (let id of IDs) procsCRUD.revisiones.linksEnColec(id);

		// Fin
		return;
	},
	FeedbackParaUsers: async () => {
		// En 'development' interrumpe
		if (nodeEnv == "development") return;

		// Obtiene de la base de datos, la información de todo el historial pendiente de comunicar
		const {regsStatus, regsEdic} = await procesos.mailDeFeedback.obtieneElHistorial();
		const regsTodos = [...regsStatus, ...regsEdic];

		// Si no hay registros a comunicar, termina el proceso
		if (!regsTodos.length) {
			// Outputs
			console.log("Sin mails para enviar");
			procesos.finRutinasHorarias("FeedbackParaUsers");

			// Fin
			return;
		}

		// Variables
		const usuarios_id = [...new Set(regsTodos.map((n) => n.sugeridoPor_id))];
		const usuarios = await BD_genericas.obtieneTodosPorCondicionConInclude("usuarios", {id: usuarios_id}, "pais");
		const asunto = "Resultado de las sugerencias realizadas";
		const ahora = new Date();
		let mailsEnviados = [];

		// Rutina por usuario
		for (let usuario of usuarios) {
			if (!usuario.pais || !usuario.email) continue;

			// Variables
			const zonaHoraria = usuario.pais.zonaHoraria;
			const ahoraUsuario = ahora.getTime() + zonaHoraria * unaHora;

			// Si para el usuario no son las 0hs, lo saltea
			if (new Date(ahoraUsuario).getUTCHours()) continue;

			// Si ya se envió un comunicado en el día y en la misma franja horaria, saltea el usuario
			const hoyUsuario = comp.fechaHora.diaMesAno(ahora);
			const fechaRevisores = usuario.fechaRevisores ? comp.fechaHora.diaMesAno(usuario.fechaRevisores) : null;
			const horaUsuario = ahora.getUTCHours();
			const horaRevisores = usuario.fechaRevisores ? usuario.fechaRevisores.getUTCHours() : null;
			if (hoyUsuario === fechaRevisores && horaUsuario === horaRevisores) continue;

			// Variables
			const email = usuario.email;
			const regsStatus_user = regsStatus.filter((n) => n.sugeridoPor_id == usuario.id);
			const regsEdic_user = regsEdic.filter((n) => n.sugeridoPor_id == usuario.id);
			let cuerpoMail = "";

			// Arma el cuerpo del mail
			if (regsStatus_user.length) cuerpoMail += await procesos.mailDeFeedback.mensajeStatus(regsStatus_user);
			if (regsEdic_user.length) cuerpoMail += await procesos.mailDeFeedback.mensajeEdicion(regsEdic_user);

			// Envía el mail y actualiza la BD
			mailsEnviados.push(
				comp
					.enviaMail({asunto, email, comentario: cuerpoMail}) // Envía el mail
					.then((n) => {
						// Acciones si el mail fue enviado
						if (n) {
							if (regsStatus_user.length) procesos.mailDeFeedback.eliminaRegsStatusComunica(regsStatus_user); // Borra los registros prescindibles
							if (regsEdic_user.length) procesos.mailDeFeedback.eliminaRegsEdicComunica(regsEdic_user); // Borra los registros prescindibles
							BD_genericas.actualizaPorId("usuarios", usuario.id, {fechaRevisores: new Date()}); // Actualiza el registro de usuario en el campo fecha_revisor
							console.log("Mail enviado a " + email);
						}

						// Fin
						return;
					})
			);
		}

		// Avisa que está procesando el envío de los mails
		await Promise.all(mailsEnviados);

		// Fin
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
		return;
	},
	ProductosAlAzar: async () => {
		// Rastrilla las películas y colecciones
		for (let entidad of ["peliculas", "colecciones"]) {
			// Obtiene los productos
			const productos = await BD_genericas.obtieneTodos(entidad);

			// Rastrilla los productos
			for (let producto of productos) {
				let azar = aprobados_ids.includes(producto.statusRegistro_id) // Averigua si el producto está aprobado
					? parseInt(Math.random() * Math.pow(10, 6)) // Le asigna un n° entero al azar, donde 10^6 es el máximo posible
					: null; // Para los demás, les limpia el campo azar

				// Actualiza el campo en el registro
				BD_genericas.actualizaPorId(entidad, producto.id, {azar});
			}
		}

		// Fin
		return;
	},

	// 2. Rutinas diarias
	FechaHoraUTC: async function () {
		// Variables
		const info = {...rutinasJSON};
		const minutos = new Date().getMinutes();

		// Filtros
		if (!Object.keys(info).length || !info.RutinasDiarias || !Object.keys(info.RutinasDiarias).length) return;
		const rutinasDiarias = info.RutinasDiarias;

		// Si la 'FechaUTC' actual es igual a la del archivo JSON, termina la función
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();
		if (info.FechaUTC == FechaUTC) return;

		// Actualiza los valores de la rutina "FechaHoraUTC" en el archivo JSON
		console.log();
		console.log("Rutinas diarias:");
		const feedback = {FechaUTC, HoraUTC, FechaHoraUTC: "NO"};
		procesos.guardaArchivoDeRutinas(feedback); // Actualiza la fecha y hora, más el valor "NO" en el campo "FechaHoraUTC"
		procesos.finRutinasDiariasSemanales("FechaHoraUTC"); // Actualiza el valor "SI" en el campo "FechaHoraUTC", y avisa que se ejecutó

		// Actualiza los campos de Rutinas Diarias
		const feedback_RD = {};
		for (let rutinaDiaria in rutinasDiarias) feedback_RD[rutinaDiaria] = "NO"; // cuando se ejecute cada rutina, se va a actualizar a 'SI'
		procesos.guardaArchivoDeRutinas(feedback_RD, "RutinasDiarias"); // actualiza el valor "NO" en los campos de "RutinasDiarias"
		await this.RutinasDiarias(); // ejecuta las rutinas diarias

		// Verifica si se deben correr las rutinas horarias
		if (minutos) await this.RutinasHorarias();

		// Verifica si se deben correr las rutinas semanales
		await this.SemanaUTC();

		// Fin
		return;
	},
	RutinasDiarias: async function () {
		this.variablesDiarias();
		// Obtiene la información del archivo JSON
		const info = {...rutinasJSON};
		const rutinasDiarias = info.RutinasDiarias;

		// Actualiza todas las rutinas diarias
		for (let rutinaDiaria in rutinasDiarias) {
			await this[rutinaDiaria](); // ejecuta la rutina
			procesos.finRutinasDiariasSemanales(rutinaDiaria, "RutinasDiarias"); // actualiza el archivo JSON
		}

		// Fin
		return;
	},
	variablesDiarias: () => {
		// Startup
		anoHoy = new Date().getUTCFullYear();
		const dia = new Date().getUTCDate();
		const mes = new Date().getUTCMonth() + 1;
		fechaDelAnoHoy_id = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes).id;

		// Fin
		return;
	},
	ImagenDerecha: async function () {
		// Variables
		let info = {...rutinasJSON};
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
				comp.gestionArchivos.copiaImagen(
					carpeta + nombreArchivo,
					"./publico/imagenes/ImagenDerecha/" + fechaArchivo + ".jpg"
				);
			}
		}

		// Guarda los títulos de las imágenes nuevas
		if (tituloNuevo) procesos.guardaArchivoDeRutinas({ImagenesDerecha});

		// Borra los archivos de imagen que no se corresponden con los títulos
		procesos.borraLosArchivosDeImgDerechaObsoletos(fechas);

		// Fin
		return;
	},
	PaisesConMasProductos: async () => {
		// Variables
		const condicion = {statusRegistro_id: aprobado_id};
		const entidades = ["peliculas", "colecciones"];
		let paisesID = {};

		// Obtiene la frecuencia por país
		for (let entidad of entidades) {
			// Obtiene todos los registros de la entidad
			await BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
				.then((n) => n.filter((m) => m.paises_id))
				.then((n) =>
					n.map((m) => {
						for (let o of m.paises_id.split(" ")) paisesID[o] ? paisesID[o]++ : (paisesID[o] = 1);
					})
				);
		}

		// Actualiza la frecuencia por país
		paises.forEach((pais, i) => {
			const cantProds = paisesID[pais.id] ? paisesID[pais.id] : 0;
			paises[i].cantProds = cantProds;
			BD_genericas.actualizaPorId("paises", pais.id, {cantProds});
		});

		// Fin
		return;
	},
	EliminaLinksInactivos: async () => {
		const condicion = {statusRegistro_id: inactivo_id};
		await BD_genericas.eliminaTodosPorCondicion("links", condicion);
		return;
	},
	LinksPorProv: async () => {
		// Obtiene todos los links
		const linksTotales = await BD_genericas.obtieneTodos("links");

		// Links por proveedor
		for (let linkProv of linksProvs.filter((n) => n.urlDistintivo)) {
			let cantLinks = linksTotales.filter((n) => n.url.startsWith(linkProv.urlDistintivo)).length;
			BD_genericas.actualizaPorId("linksProvs", linkProv.id, {cantLinks});
		}

		// Fin
		return;
	},
	FeedbackParaRevisores: async () => {
		// Variables
		const asunto = {
			perl: "Productos y RCLVs prioritarios a revisar",
			links: "Links prioritarios a revisar",
		};
		const {regs, edics} = await procesos.ABM_noRevs();
		let mailsEnviados = [];

		// Si no hay casos, termina
		if (regs.perl.length + edics.perl.length + regs.links.length + edics.links.length == 0) return;

		// Arma el cuerpo del mensaje
		const cuerpoMail = procesos.mailDeFeedback.mensajeParaRevisores({regs, edics});

		// Obtiene los usuarios revisorPERL y revisorLinks
		let perl = BD_genericas.obtieneTodosPorCondicion("usuarios", {rolUsuario_id: rolesRevPERL_ids});
		let links = BD_genericas.obtieneTodosPorCondicion("usuarios", {rolUsuario_id: rolesRevLinks_ids});
		[perl, links] = await Promise.all([perl, links]);
		const revisores = {perl, links};

		// Rutina por usuario
		for (let tipo of ["perl", "links"])
			if (regs[tipo].length || edics[tipo].length)
				for (let revisor of revisores[tipo])
					mailsEnviados.push(
						comp.enviaMail({asunto: asunto[tipo], email: revisor.email, comentario: cuerpoMail[tipo]})
					); // Envía el mail y actualiza la BD

		// Avisa que está procesando el envío de los mails
		await Promise.all(mailsEnviados);

		// Fin
		return;
	},
	EliminaCalifsSinPPP: async () => {
		// Variables
		const calRegistros = await BD_genericas.obtieneTodos("calRegistros");
		const pppRegistros = await BD_genericas.obtieneTodos("pppRegistros");

		// Si una calificación no tiene ppp, la elimina
		for (let calRegistro of calRegistros) {
			const {usuario_id, entidad, entidad_id} = calRegistro;
			if (!pppRegistros.find((n) => n.usuario_id == usuario_id && n.entidad == entidad && n.entidad_id == entidad_id))
				await BD_genericas.eliminaPorId("calRegistros", calRegistro.id);
		}

		// Fin
		return;
	},
	LoginsAcums: async () => {
		// Variables
		const hoy = new Date().toISOString().slice(0, 10);

		// Obtiene los logins diarios y acumulados
		const loginsDiarios = await BD_genericas.obtieneTodos("loginsDelDia");
		let ultFecha = await BD_genericas.obtieneTodos("loginsAcums")
			.then((n) =>
				n.length
					? n[n.length - 1].fecha
					: loginsDiarios.length
					? new Date(new Date(loginsDiarios[0].fecha).getTime() - unDia).toISOString().slice(0, 10)
					: hoy
			)
			.then((n) => new Date(new Date(n).getTime() + unDia).toISOString().slice(0, 10));

		// Loop mientras el día sea menor al actual
		while (ultFecha < hoy) {
			// Variables
			const diaSem = diasSemana[new Date(ultFecha).getUTCDay()];
			const anoMes = ultFecha.slice(0, 7);
			const cantLogins = loginsDiarios.filter((n) => n.fecha == ultFecha).length;

			// Agrega la cantidad de logins
			await BD_genericas.agregaRegistro("loginsAcums", {fecha: ultFecha, diaSem, anoMes, cantLogins});

			// Obtiene la fecha siguiente
			ultFecha = new Date(new Date(ultFecha).getTime() + unDia).toISOString().slice(0, 10);
		}

		// Elimina los logins anteriores

		// Fin
		return;
	},
	IDdeTablas: async () => {
		// Variables
		const tablas = ["pppRegistros", "calRegistros", "prodsEdicion", "rclvsEdicion", "misConsultas", "configsConsCampos"];

		// Actualiza los valores de ID
		for (let tabla of tablas) {
			// Variables
			const registros = await BD_genericas.obtieneTodos(tabla);
			let id = 1;

			// Actualiza los IDs
			for (let registro of registros) {
				await BD_genericas.actualizaPorId(tabla, registro.id, {id});
				id++;
			}

			// Reduce el próximo valor de ID
			//BD_genericas.reduceElProximoValorDeID(tabla);
		}

		// Fin
		return;
	},

	// 3. Rutinas semanales
	SemanaUTC: async function () {
		this.variablesSemanales();

		// Obtiene la información del archivo JSON
		let info = {...rutinasJSON};
		if (!Object.keys(info).length) return;
		if (!info.RutinasSemanales || !Object.keys(info.RutinasSemanales).length) return;
		const rutinasSemanales = info.RutinasSemanales;

		// Obtiene la fecha y hora UTC actual
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();

		// Si la 'semanaUTC' actual es igual a la del archivo JSON, termina la función
		if (info.semanaUTC == semanaUTC) return;

		// Actualiza los campos de semana
		console.log();
		console.log("Rutinas semanales:");
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
	RutinasSemanales: async function () {
		// Obtiene la información del archivo JSON
		const info = {...rutinasJSON};
		const rutinasSemanales = info.RutinasSemanales;

		// Actualiza las rutinasSemanales
		for (let rutinaSemanal in rutinasSemanales) {
			await this[rutinaSemanal]();
			procesos.finRutinasDiariasSemanales(rutinaSemanal, "RutinasSemanales");
		}

		// Fin
		return;
	},
	AprobadoConAvatarLink: async () => {
		// Variables
		const condicion = {statusRegistro_id: aprobado_id, avatar: {[Op.like]: "%/%"}};
		let descargas = [];

		// Revisa, descarga, actualiza
		for (let entidad of ["peliculas", "colecciones", ...variables.entidades.rclvs]) {
			// Variables
			const familias = comp.obtieneDesdeEntidad.familias(entidad);
			const carpeta = familias == "productos" ? "2-Productos" : "3-RCLVs";
			const ruta = carpetaExterna + carpeta + "/Final/";

			// Descarga el avatar y actualiza el valor en el campo del registro original
			descargas.push(
				BD_genericas.obtieneTodosPorCondicion(entidad, condicion).then((n) =>
					n.map((m) => {
						const nombre = Date.now() + path.extname(m.avatar);
						comp.gestionArchivos.descarga(m.avatar, ruta + nombre);
						BD_genericas.actualizaPorId(entidad, m.id, {avatar: nombre});
					})
				)
			);
		}
		await Promise.all(descargas);

		// Fin
		return;
	},
	LinksVencidos: async function () {
		// Variables
		const fechaPrimeraRevision = new Date(lunesDeEstaSemana - vidaPrimRevision);
		const fechaVidaUtil = new Date(lunesDeEstaSemana - vidaUtilLinks);
		const ahora = new Date();

		// Condiciones y nuevo status
		const condiciones = [
			{statusRegistro_id: aprobado_id},
			{
				[Op.or]: [
					{statusSugeridoEn: {[Op.lt]: fechaPrimeraRevision}, yaTuvoPrimRev: false}, // Necesita su primera revisión
					{statusSugeridoEn: {[Op.lt]: fechaVidaUtil}, yaTuvoPrimRev: true}, // Concluyó su vida útil
				],
			},
		];
		const status = {
			statusSugeridoPor_id: usAutom_id,
			statusRegistro_id: creadoAprob_id,
			statusSugeridoEn: ahora,
		};

		// Actualiza el status de los links
		await BD_genericas.actualizaTodosPorCondicion("links", condiciones, status);

		// Fin
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
		return;
	},
	EliminaImagenesSinRegistro: async () => {
		// Variables
		const statusDistintoCreado_id = statusRegistros.filter((n) => n.id != creado_id).map((n) => n.id);
		const statusCualquiera_id = {[Op.ne]: null};

		const objetos = [
			// Carpetas REVISAR
			{carpeta: "2-Productos/Revisar", familia: "productos", entidadEdic: "prodsEdicion"}, // para los prods, sólo pueden estar en 'Edición'
			{carpeta: "3-RCLVs/Revisar", familia: "rclvs", entidadEdic: "rclvsEdicion", status_id: creado_id},

			// Carpetas FINAL
			{carpeta: "2-Productos/Final", familia: "productos", status_id: statusDistintoCreado_id},
			{carpeta: "3-RCLVs/Final", familia: "rclvs", status_id: statusDistintoCreado_id},

			// Carpetas USUARIOS
			{carpeta: "1-Usuarios", familia: "usuarios", status_id: statusCualquiera_id},
		];

		// Elimina las imágenes de las carpetas "Revisar" y "Final"
		for (let objeto of objetos) await procesos.eliminaImagenesSinRegistro(objeto);

		// Elimina las imágenes de "Provisorio"
		procesos.eliminaImagenesProvisorio();

		// Fin
		return;
	},
	EliminaHistorialAntiguo: async () => {
		// Variables
		const ahora = Date.now();
		const tablas = [
			{nombre: "histEdics", campo: "revisadoEn", antiguedad: unDia * 365},
			{nombre: "histStatus", campo: "revisadoEn", antiguedad: unDia * 365},
		];

		// Elimina historial antiguo
		for (let tabla of tablas) {
			const fechaDeCorte = new Date(ahora - tabla.antiguedad);
			BD_genericas.eliminaTodosPorCondicion(tabla.nombre, {[tabla.campo]: {[Op.lt]: fechaDeCorte}});
		}

		// Elimina misConsultas > límite
		let misConsultas = await BD_genericas.obtieneTodos("misConsultas").then((n) => n.reverse());
		const limite = 20;
		while (misConsultas.length) {
			// Obtiene los registros del primer usuario
			const usuario_id = misConsultas[0].usuario_id;
			const registros = misConsultas.filter((n) => n.usuario_id == usuario_id);

			// Elimina los registros sobrantes en la BD
			if (registros.length > limite)
				for (let i = limite; i < registros.length; i++) BD_genericas.eliminaPorId("misConsultas", registros[i].id);

			// Elimina los registros del usuario de la lectura
			misConsultas = misConsultas.filter((n) => n.usuario_id != usuario_id);
		}

		// Fin
		return;
	},
	EliminaHistorialDeRegsEliminados: async () => {
		// Variables
		const tablas = [
			{nombre: "histEdics", campoUsuario: "sugeridoPor_id"},
			{nombre: "histStatus", campoUsuario: "sugeridoPor_id"},
			{nombre: "misConsultas", campoUsuario: "usuario_id"},
		];
		const entidades = [...variables.entidades.prods, ...variables.entidades.rclvs, "links", "usuarios"];
		let available = {};
		let datos = [];

		// Agrega los registros de las entidades
		for (let entidad of entidades) datos.push(BD_genericas.obtieneTodos(entidad).then((n) => n.map((m) => m.id)));

		// Consolida la información
		datos = await Promise.all(datos);
		entidades.forEach((entidad, i) => (available[entidad] = datos[i]));

		// Elimina historial
		for (let tabla of tablas) {
			// Obtiene los registros de historial, para analizar si corresponde eliminar alguno
			const registros = await BD_genericas.obtieneTodos(tabla.nombre);

			// Revisa que esté presente la entidad y el ususario del registro
			for (let registro of registros)
				if (
					!available[registro.entidad].includes(registro.entidad_id) || // Lo busca en su entidad vinculada
					!available.usuarios.includes(registro[tabla.campoUsuario]) // Busca su usuario
				)
					// Si no lo encuentra en ambas tablas, elimina el registro
					BD_genericas.eliminaPorId(tabla.nombre, registro.id);
		}

		// Fin
		return;
	},
	variablesSemanales: function () {
		this.PrimerLunesDelAno();

		// Otras variables
		semanaUTC = parseInt((Date.now() - primerLunesDelAno) / unDia / 7) + 1;
		lunesDeEstaSemana = primerLunesDelAno + (semanaUTC - 1) * unaSemana;

		// Fin
		return;
	},
	PrimerLunesDelAno: function (fecha) {
		// Obtiene el primer día del año
		fecha = fecha ? new Date(fecha) : new Date();
		const diferenciaHoraria = (fecha.getTimezoneOffset() / 60) * unaHora;
		const comienzoAnoUTC = new Date(fecha.getUTCFullYear(), 0, 1).getTime() - diferenciaHoraria;

		// Obtiene el dia de semana del primer día del año (domingo: 0, sábado: 6)
		const diaSemComienzoAnoUTC = new Date(comienzoAnoUTC).getUTCDay();

		// Obtiene el primer lunes del año
		let diasAdicsPorLunes = 1 - diaSemComienzoAnoUTC;
		if (diasAdicsPorLunes < 0) diasAdicsPorLunes += 7;
		primerLunesDelAno = comienzoAnoUTC + diasAdicsPorLunes * unDia;

		// Fin
		if (primerLunesDelAno > fecha.getTime()) this.PrimerLunesDelAno(fecha.getTime() - unaSemana);
		return;
	},
};

// Variables
let actualizaLaEpocaDeEstreno = async () => {
	const condicion = {anoEstreno: {[Op.ne]: null}};

	// Rutina
	for (let entidad of variables.entidades.prods) {
		// Obtiene los productos
		const productos = await BD_genericas.obtieneTodosPorCondicion(entidad, condicion);

		// Actualiza cada producto
		for (let producto of productos) {
			const epocaEstreno_id = epocasEstreno.find((n) => n.desde <= producto.anoEstreno).id;
			BD_genericas.actualizaPorId(entidad, producto.id, {epocaEstreno_id});
		}
	}

	// Fin
	return;
};
let eliminaHistorialQueNoCorresponde = async () => {
	// Obtiene los calRegistros
	let calRegistros = await BD_genericas.obtieneTodos("calRegistros");

	// Rutina por registro
	for (let registro of calRegistros) {
		// Si el producto no existe, elimina el registro
		const producto = await BD_genericas.obtienePorId(registro.entidad, registro.entidad_id);
		if (!producto) BD_genericas.eliminaPorId("calRegistros", registro.id);
	}

	// Fin
	return;
};
let fechaVencimLinks=async()=>{
	// Variables
	const include=variables.entidades.asocProds

	// Obtiene todos los links con sus vínculos de prods
	const links=await BD_genericas.obtieneTodosConInclude("links",include)

	// Obtiene el anoEstreno de c/u

	// Se calcula la fechaVencim - primRev o reciente o null, 4 sems

	// Se actualiza el link con el anoEstreno y la fechaVencim


}