"use strict";
// Variables
const cron = require("node-cron");
const procesos = require("./RT-Procesos");

// Exportar
module.exports = {
	// Start-up y Configuración de Rutinas
	startupMasConfiguracion: async function () {
		// Variables
		procesos.variablesDiarias();
		comp.variablesSemanales();
		await comp.linksVencPorSem.actualizaCantLinksPorSem();
		await comp.revisaStatus.consolidado();

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

		// Comunica el fin de las rutinas
		console.log();
		// await this.rutinasHorarias.feedbackParaUsers();
		// await this.rutinasDiarias.qqq();
		// await this.rutinasSemanales.eliminaRegsHistStatusIncorrectos();
		// await obsoletas.actualizaCategoriaLink()
		console.log("Rutinas de inicio terminadas en " + new Date().toLocaleString());

		// Fin
		return;
	},

	// Consolidados
	RutinasHorarias: async function () {
		// Obtiene la información del archivo JSON
		const info = {...rutinasJSON};
		const rutinas = info.RutinasHorarias;

		// Actualiza todas las rutinas horarias
		console.log();
		console.log("Rutinas horarias:");
		for (let rutina of rutinas) {
			const comienzo = Date.now();
			await this.rutinasHorarias[rutina]();
			const duracion = Date.now() - comienzo;
			procesos.finRutinasHorarias(rutina, duracion);
		}
		console.log("Fin de rutinas horarias");

		// Fin
		return;
	},
	RutinasDiarias: async function () {
		procesos.variablesDiarias();

		// Obtiene la información del archivo JSON
		const info = {...rutinasJSON};
		const rutinasDiarias = info.RutinasDiarias;

		// Actualiza todas las rutinas diarias
		for (let rutinaDiaria in rutinasDiarias) {
			const comienzo = Date.now();
			await this.rutinasDiarias[rutinaDiaria](); // ejecuta la rutina
			const duracion = Date.now() - comienzo;
			procesos.finRutinasDiariasSemanales(rutinaDiaria, "RutinasDiarias", duracion); // actualiza el archivo JSON
		}
		console.log("Fin de rutinas diarias");

		// Fin
		return;
	},
	RutinasSemanales: async function () {
		// Obtiene la información del archivo JSON
		const info = {...rutinasJSON};
		const rutinasSemanales = info.RutinasSemanales;

		// Actualiza las rutinasSemanales
		for (let rutinaSemanal in rutinasSemanales) {
			const comienzo = Date.now();
			await this.rutinasSemanales[rutinaSemanal]();
			const duracion = Date.now() - comienzo;
			procesos.finRutinasDiariasSemanales(rutinaSemanal, "RutinasSemanales", duracion);
		}
		console.log("Fin de rutinas semanales");

		// Fin
		return;
	},
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
		const comienzo = Date.now();
		procesos.guardaArchivoDeRutinas(feedback); // Actualiza la fecha y hora, más el valor "NO" en el campo "FechaHoraUTC"
		const duracion = Date.now() - comienzo;
		procesos.finRutinasDiariasSemanales("FechaHoraUTC", null, duracion); // Actualiza el valor "SI" en el campo "FechaHoraUTC", y avisa que se ejecutó

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
	SemanaUTC: async function () {
		comp.variablesSemanales();

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
		const comienzo = Date.now();
		procesos.guardaArchivoDeRutinas(feedback);
		const duracion = Date.now() - comienzo;
		procesos.finRutinasDiariasSemanales("SemanaUTC", null, duracion);

		// Actualiza los campos de Rutinas Semanales
		const feedback_RS = {};
		for (let rutinaSemanal in rutinasSemanales) feedback_RS[rutinaSemanal] = "NO"; // Cuando se ejecuta cada rutina, se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback_RS, "RutinasSemanales");
		await this.RutinasSemanales();

		// Fin
		return;
	},

	// Rutinas
	rutinasHorarias: {
		prodAprobEnLink: async () => {
			// Obtiene todos los links con su producto asociado
			const links = await baseDeDatos.obtieneTodos("links", variables.entidades.asocProds);

			// Actualiza su valor
			comp.prodAprobEnLink(links);

			// Fin
			return;
		},
		linksEnProd: async () => {
			// Variables
			let esperar = [];

			// Rutina por peliculas y capitulos
			for (let entidad of ["peliculas", "capitulos"]) {
				// Obtiene los ID de los registros de la entidad
				const IDs = await baseDeDatos
					.obtieneTodosPorCondicion(entidad, {statusRegistro_id: aprobados_ids})
					.then((n) => n.map((m) => m.id));

				// Ejecuta la función linksEnProd
				for (let id of IDs) esperar.push(comp.linksEnProd({entidad, id}));
			}
			await Promise.all(esperar);

			// Rutina por colecciones
			const IDs = await baseDeDatos
				.obtieneTodosPorCondicion("colecciones", {statusRegistro_id: aprobados_ids})
				.then((n) => n.map((m) => m.id));
			for (let id of IDs) comp.linksEnColec(id);

			// Fin
			return;
		},
		prodsEnRCLV: async () => {
			// Obtiene las entidadesRCLV
			const entidadesRCLV = variables.entidades.rclvs;

			// Rutina por entidad
			for (let entidad of entidadesRCLV) {
				// Obtiene los ID de los registros de la entidad
				const IDs = await baseDeDatos.obtieneTodos(entidad).then((n) => n.map((m) => m.id));

				// Rutina por ID: ejecuta la función prodsEnRCLV
				for (let id of IDs) comp.prodsEnRCLV({entidad, id});
			}

			// Fin
			return;
		},
		feedbackParaUsers: async () => {
			// Obtiene de la base de datos, la información de todo el historial pendiente de comunicar
			const {regsStatus, regsEdic} = await procesos.mailDeFeedback.obtieneElHistorial();
			const regsTodos = [...regsStatus, ...regsEdic];

			// Si no hay registros a comunicar, termina el proceso
			if (!regsTodos.length) {
				procesos.finRutinasHorarias("feedbackParaUsers", 0);
				return;
			}

			// Variables
			const usuarios_id = [...new Set(regsTodos.map((n) => n.sugeridoPor_id || n.statusOriginalPor_id))];
			const usuarios = await baseDeDatos.obtieneTodosPorCondicion("usuarios", {id: usuarios_id}, "pais");
			const asunto = "Revisión de las sugerencias realizadas";
			let mailsEnviados = [];

			// Rutina por usuario
			for (let usuario of usuarios) {
				// Si corresponde, saltea la rutina
				const stopper = stoppers(usuario);
				// if (stopper) continue;

				// Variables
				const email = usuario.email;
				const regsStatusUs = regsStatus.filter((n) => n.statusOriginalPor_id == usuario.id);
				const regsEdicUs = regsEdic.filter((n) => n.sugeridoPor_id == usuario.id);
				let cuerpoMail = "";

				// Arma el cuerpo del mail
				if (regsStatusUs.length) cuerpoMail += await procesos.mailDeFeedback.mensajeStatus(regsStatusUs);
				if (regsEdicUs.length) cuerpoMail += await procesos.mailDeFeedback.mensajeEdicion(regsEdicUs);

				// Envía el mail y actualiza la BD
				const otrosDatos = {regsStatusUs, regsEdicUs, usuario};
				const mailEnviado =
					usuario.id != usAutom_id
						? comp
								.enviaMail({asunto, email, comentario: cuerpoMail}) // Envía el mail
								.then((mailEnv) => procesos.mailDeFeedback.eliminaRegs.consolidado({mailEnv, ...otrosDatos}))
						: procesos.mailDeFeedback.eliminaRegs.consolidado({mailEnv: true, ...otrosDatos});
				mailsEnviados.push(mailEnviado);
			}

			// Espera a que se procese el envío de todos los emails
			await Promise.all(mailsEnviados);

			// Fin
			return;
		},
		productosAlAzar: async () => {
			// Rastrilla las películas y colecciones
			for (let entidad of ["peliculas", "colecciones"]) {
				// Obtiene los productos
				const productos = await baseDeDatos.obtieneTodos(entidad);

				// Rastrilla los productos
				for (let producto of productos) {
					let azar = aprobados_ids.includes(producto.statusRegistro_id) // Averigua si el producto está aprobado
						? parseInt(Math.random() * Math.pow(10, 6)) // Le asigna un n° entero al azar, donde 10^6 es el máximo posible
						: null; // Para los demás, les limpia el campo azar

					// Actualiza el campo en el registro
					baseDeDatos.actualizaPorId(entidad, producto.id, {azar});
				}
			}

			// Fin
			return;
		},
	},
	rutinasDiarias: {
		actualizaSolapam: async () => await comp.actualizaSolapam(),
		imagenDerecha: async () => {
			// Variables
			let info = {...rutinasJSON};
			const milisegs = Date.now() + (new Date().getTimezoneOffset() / 60) * unaHora;
			const fechaInicial = milisegs - 2 * unDia; // Arranca desde 2 días atrás
			const cantFechas = 5; // Incluye 5 días
			let fechas = [];
			let tituloNuevo;

			// Limpia el historial de ImagenesDerecha en 'global'
			ImagenesDerecha = {};

			// Actualiza los títulos de la imagen derecha para cada fecha y guarda las imágenes nuevas
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
					const {leyenda, entidad, id, carpeta, nombreArchivo} = await procesos.obtieneImgDerecha(fechaNum);
					tituloNuevo = true;

					// Actualiza los datos para esa fecha
					ImagenesDerecha[fechaArchivo] = entidad && id ? {leyenda, entidad, id} : {leyenda};

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
		infoRevsTablero: async () => {
			// Si no hay casos, termina
			const {regs, edics} = await procesos.ABM_noRevs();
			if (!(regs.perl.length + edics.perl.length + regs.links.length + edics.links.length)) return;

			// Arma el cuerpo del mensaje
			const cuerpoMail = procesos.mailDeFeedback.mensRevsTablero({regs, edics});

			// Obtiene los usuarios revisorPERL y revisorLinks
			let perl = baseDeDatos.obtieneTodosPorCondicion("usuarios", {rolUsuario_id: rolesRevPERL_ids});
			let links = baseDeDatos.obtieneTodosPorCondicion("usuarios", {rolUsuario_id: rolesRevLinks_ids});
			[perl, links] = await Promise.all([perl, links]);
			const revisores = {perl, links};

			// Rutina por usuario
			const asunto = {perl: "Productos y RCLVs prioritarios a revisar", links: "Links prioritarios a revisar"};
			let mailsEnviados = [];
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
		loginsAcums: async () => {
			// Variables
			const hoy = new Date().toISOString().slice(0, 10);

			// Logins diarios
			const loginsDiarios = await baseDeDatos.obtieneTodosPorCondicion("loginsDelDia", {fecha: {[Op.lt]: hoy}});
			const fechaLoginsDiarios = loginsDiarios.length
				? new Date(new Date(loginsDiarios[0].fecha).getTime()).toISOString().slice(0, 10)
				: null;

			// Logins acums
			const loginsAcums = await baseDeDatos.obtieneTodos("loginsAcums");
			let agregarFecha = loginsAcums.length // condición si hay logins acums
				? procesos.sumaUnDia(loginsAcums[loginsAcums.length - 1].fecha) // le suma un día al último registro
				: loginsDiarios.length // condición si no hay logins acums y sí 'loginsDiarios'
				? fechaLoginsDiarios // la fecha del primer registro
				: hoy; // la fecha de hoy

			// Si hay una inconsistencia, termina
			if (loginsAcums.length && loginsDiarios.length && fechaLoginsDiarios < agregarFecha) {
				console.log(410, "Inconsistencia:", "Fecha Diaria", fechaLoginsDiarios, "/ Agrega Fecha", agregarFecha);
				return;
			}

			// Loop mientras el día sea menor al actual
			while (agregarFecha < hoy) {
				// Variables
				const diaSem = diasSemana[new Date(agregarFecha).getUTCDay()];
				const anoMes = agregarFecha.slice(0, 7);
				const cantLogins = loginsDiarios.filter((n) => n.fecha == agregarFecha).length;

				// Agrega la cantidad de logins
				await baseDeDatos.agregaRegistro("loginsAcums", {fecha: agregarFecha, diaSem, anoMes, cantLogins});

				// Obtiene la fecha siguiente
				agregarFecha = procesos.sumaUnDia(agregarFecha);
			}

			// Elimina los logins anteriores
			baseDeDatos.eliminaTodosPorCondicion("loginsDelDia", {fecha: {[Op.lt]: hoy}});

			// Fin
			return;
		},
		rutinasEnUsuario: async () => {
			// Lleva a cero el valor de algunos campos
			await baseDeDatos.actualizaTodos("usuarios", {intentosLogin: 0, intentosDP: 0});

			// Elimina usuarios antiguos que no confirmaron su contraseña
			const fechaDeCorte = new Date(new Date().getTime() - unDia);
			const condicion = {statusRegistro_id: mailPendValidar_id, fechaContrasena: {[Op.lt]: fechaDeCorte}};
			await baseDeDatos.eliminaTodosPorCondicion("usuarios", condicion);

			// Fin
			return;
		},
		aprobadoConAvatarLink: async () => {
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
					baseDeDatos.obtieneTodosPorCondicion(entidad, condicion).then((n) =>
						n.map((m) => {
							const nombre = Date.now() + path.extname(m.avatar);
							comp.gestionArchivos.descarga(m.avatar, ruta + nombre);
							baseDeDatos.actualizaPorId(entidad, m.id, {avatar: nombre});
						})
					)
				);
			}
			await Promise.all(descargas);

			// Fin
			return;
		},
		eliminaLinksInactivos: async () => {
			const condicion = {statusRegistro_id: inactivo_id};
			await baseDeDatos.eliminaTodosPorCondicion("links", condicion);
			return;
		},
		eliminaCalifsSinPPP: async () => {
			// Variables
			const calRegistros = await baseDeDatos.obtieneTodos("calRegistros");
			const pppRegistros = await baseDeDatos.obtieneTodos("pppRegistros");

			// Si una calificación no tiene ppp, la elimina
			for (let calRegistro of calRegistros) {
				const {usuario_id, entidad, entidad_id} = calRegistro;
				if (!pppRegistros.find((n) => n.usuario_id == usuario_id && n.entidad == entidad && n.entidad_id == entidad_id))
					await baseDeDatos.eliminaPorId("calRegistros", calRegistro.id);
			}

			// Fin
			return;
		},
		eliminaImagenesSinRegistro: async () => {
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
		eliminaRegsSinEntidad_id: async () => {
			// Variables
			const tablas = ["histEdics", "statusHistorial", "misConsultas", "calRegistros"];
			const entidades = [...variables.entidades.todos, "usuarios"];
			let regsVinculados = {};
			let datos = [];

			// Obtiene los registros por entidad
			for (let entidad of entidades) datos.push(baseDeDatos.obtieneTodos(entidad).then((n) => n.map((m) => m.id)));
			datos = await Promise.all(datos);
			entidades.forEach((entidad, i) => (regsVinculados[entidad] = datos[i])); // de un array de arrays, los convierte en un objeto de arrays

			// Elimina historial
			for (let tabla of tablas) {
				// Obtiene los registros de historial, para analizar si corresponde eliminar alguno
				const regsHistorial = await baseDeDatos.obtieneTodos(tabla);

				// Si no encuentra la "entidad + id", elimina el registro
				for (let regHistorial of regsHistorial)
					if (!regsVinculados[regHistorial.entidad].includes(regHistorial.entidad_id))
						baseDeDatos.eliminaPorId(tabla, regHistorial.id);
			}

			// Fin
			return;
		},
		paisesConMasProductos: async () => {
			// Variables
			const condicion = {statusRegistro_id: aprobado_id};
			const entidades = ["peliculas", "colecciones"];
			let paisesID = {};

			// Obtiene la frecuencia por país
			for (let entidad of entidades) {
				// Obtiene todos los registros de la entidad
				await baseDeDatos
					.obtieneTodosPorCondicion(entidad, condicion)
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
				baseDeDatos.actualizaPorId("paises", pais.id, {cantProds});
			});

			// Fin
			return;
		},
		linksPorProv: async () => {
			// Obtiene todos los links
			const linksTotales = await baseDeDatos.obtieneTodos("links");

			// Links por proveedor
			for (let linkProv of linksProvs.filter((n) => n.urlDistintivo)) {
				let cantLinks = linksTotales.filter((n) => n.url.startsWith(linkProv.urlDistintivo)).length;
				baseDeDatos.actualizaPorId("linksProvs", linkProv.id, {cantLinks});
			}

			// Fin
			return;
		},
		linksEnColes: async () => {
			// Variables
			const colecciones = await baseDeDatos.obtieneTodos("colecciones");

			// Rutina
			for (let coleccion of colecciones) await comp.linksEnColec(coleccion.id);

			// Fin
			return;
		},
		iDdeTablas: async () => {
			// Variables
			const tablas = [
				"calRegistros",
				"capsSinLink",
				"consRegsPrefs",
				"histEdics",
				"statusHistorial",
				"linksEdicion",
				"loginsAcums",
				"loginsDelDia",
				"misConsultas",
				"novedadesELC",
				"pppRegistros",
				"prodsEdicion",
				"rclvsEdicion",
			];

			// Actualiza los valores de ID
			for (let tabla of tablas) {
				// Variables
				const registros = await baseDeDatos.obtieneTodos(tabla);
				let id = 1;

				// Actualiza los IDs - es crítico que sea un 'for', porque el 'forEach' no respeta el 'await'
				for (let registro of registros) {
					if (registro.id != id) await baseDeDatos.actualizaPorId(tabla, registro.id, {id}); // tiene que ser 'await' para no duplicar ids
					id++;
				}

				// Actualiza el próximo valor de ID
				await procesos.actualizaElProximoValorDeID(tabla);
			}

			// Fin
			return;
		},
	},
	rutinasSemanales: {
		actualizaStatusLinks: async () => {
			await comp.linksVencPorSem.actualizaFechaVencimNull(); // actualiza la fecha de los links sin fecha
			await comp.linksVencPorSem.actualizaStatus(); // pasa a 'creadoAprob' los links con fechaVencim < semActual
			await comp.linksVencPorSem.actualizaCantLinksPorSem();

			// Fin
			return;
		},
		eliminaMisConsultasExcedente: async () => {
			// Elimina misConsultas > límite
			let misConsultas = await baseDeDatos.obtieneTodosConOrden("misConsultas", "id", "DESC");
			const limite = 20;
			while (misConsultas.length) {
				// Obtiene los registros del primer usuario
				const usuario_id = misConsultas[0].usuario_id;
				const registros = misConsultas.filter((n) => n.usuario_id == usuario_id);

				// Elimina los registros sobrantes en la BD
				if (registros.length > limite) {
					const idsBorrar = registros.map((n) => n.id).slice(limite);
					baseDeDatos.eliminaPorId("misConsultas", idsBorrar);
				}

				// Revisa las consultas de otro usuario
				misConsultas = misConsultas.filter((n) => n.usuario_id != usuario_id);
			}

			// Fin
			return;
		},
		rclv_idEnCapitulos: async () => {
			// Variables
			const rclvs_id = variables.entidades.rclvs_id;

			// Obtiene todas las colecciones
			const colecciones = await baseDeDatos.obtieneTodos("colecciones");

			// Rutinas
			for (let coleccion of colecciones) // Rutina por colección
				for (let rclv_id of rclvs_id) // Rutina por rclv_id
					if (coleccion[rclv_id] > 10) {
						// Variables
						const condicion = {coleccion_id: coleccion.id, [rclv_id]: coleccion[rclv_id]}; // Averigua si alguno de sus capítulos tiene el mismo rclv_id
						const objeto = {[rclv_id]: 1}; // En los casos que encuentra, convierte el rclv_id en 1

						// Actualiza los capítulos que correspondan
						baseDeDatos.actualizaTodosPorCondicion("capitulos", condicion, objeto);
					}

			// Fin
			return;
		},
		rclvsSinEpocaPSTyConAno: async () => {
			// Variables
			const entidades = ["personajes", "hechos"];
			const condicion = {statusRegistro_id: aprobado_id, epocaOcurrencia_id: {[Op.ne]: "pst"}};

			// Busca
			for (let entidad of entidades) {
				const ano = entidad == "personajes" ? "anoNacim" : "anoComienzo";
				await baseDeDatos.actualizaTodosPorCondicion(entidad, {...condicion, [ano]: {[Op.ne]: null}}, {[ano]: null});
			}

			// Fin
			return;
		},
		eliminaLoginsAcumsRepetidos: async () => {
			// Variables
			const loginsAcums = await baseDeDatos.obtieneTodos("loginsAcums");

			// Elimina los loginsAcums repetidos
			let registroAnterior;
			for (let registro of loginsAcums) {
				if (registroAnterior && registro.fecha == registroAnterior.fecha)
					baseDeDatos.eliminaPorId("loginsAcums", registro.id);
				registroAnterior = registro;
			}

			// Fin
			return;
		},
		eliminaRegsHistStatusIncorrectos: async () => {
			const condicion = {statusOriginal_id: creadoAprob_id, statusFinal_id: aprobado_id};
			await baseDeDatos.eliminaTodosPorCondicion("statusHistorial", condicion);
			return;
		},
	},
};

// Funciones
const stoppers = (usuario) => {
	if (!usuario.pais || !usuario.email) return true;

	// Acciones para saltear la rutina, dependiendo de la hora
	const ahora = new Date();
	const zonaHoraria = usuario.pais.zonaHoraria;
	const ahoraUsuario = ahora.getTime() + zonaHoraria * unaHora;
	if (
		(new Date(ahoraUsuario).getUTCHours() && nodeEnv != "development") || // Producción: si para el usuario no son las 0hs
		(!new Date(ahoraUsuario).getUTCHours() && nodeEnv == "development") // Development: si para el usuario son las 0hs
	)
		return true;

	// Si ya se envió un comunicado en el día y en la misma franja horaria, saltea el usuario
	const hoyUsuario = comp.fechaHora.diaMesAno(ahora);
	const fechaRevisores = usuario.fechaRevisores ? comp.fechaHora.diaMesAno(usuario.fechaRevisores) : null;
	const horaUsuario = ahora.getUTCHours();
	const horaRevisores = usuario.fechaRevisores ? usuario.fechaRevisores.getUTCHours() : null;
	if (hoyUsuario === fechaRevisores && horaUsuario === horaRevisores) return true;

	// Fin
	return false;
};
let obsoletas = {
	actualizaLaEpocaDeEstreno: async () => {
		const condicion = {anoEstreno: {[Op.ne]: null}};

		// Rutina
		for (let entidad of variables.entidades.prods) {
			// Obtiene los productos
			const productos = await baseDeDatos.obtieneTodosPorCondicion(entidad, condicion);

			// Actualiza cada producto
			for (let producto of productos) {
				const epocaEstreno_id = epocasEstreno.find((n) => n.desde <= producto.anoEstreno).id;
				baseDeDatos.actualizaPorId(entidad, producto.id, {epocaEstreno_id});
			}
		}

		// Fin
		return;
	},
	corrigeStatusColeccionEnCapitulo: async () => {
		// Variables
		const registros = await baseDeDatos.obtieneTodos("capitulos", "coleccion");

		// Rutina por registro
		for (let registro of registros) {
			const {statusRegistro_id: statusColeccion_id} = registro.coleccion;
			if (registro.statusColeccion_id != statusColeccion_id)
				baseDeDatos.actualizaPorId("capitulos", registro.id, {statusColeccion_id});
		}

		// Fin
		return;
	},
	creaCapSinLink: async () => {
		// Obtiene las colecciones
		const colecciones = await baseDeDatos.obtieneTodos("colecciones");

		// Rutina para agregar un registro
		for (let coleccion of colecciones) baseDeDatos.agregaRegistro("capsSinLink", {coleccion_id: coleccion.id});

		// Fin
		return;
	},
};
