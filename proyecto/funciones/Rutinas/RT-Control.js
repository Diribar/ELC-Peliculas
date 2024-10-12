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
		await comp.actualizaStatusErrores.consolidado();
		await this.FechaHoraUTC();

		// Stoppers
		const info = {...rutinasJson};
		if (!Object.keys(info).length) return;
		if (!info.RutinasDiarias || !Object.keys(info.RutinasDiarias).length) return;
		if (!info.RutinasHorarias || !info.RutinasHorarias.length) return;

		// Comunica el fin de las rutinas
		await this.rutinas.historialClientes();
		// await obsoletas.actualizaCapEnCons()
		// await this.RutinasSemanales();

		// Rutinas programadas
		cron.schedule("0 0 * * *", () => this.FechaHoraUTC(), {timezone: "Etc/Greenwich"}); // Rutinas diarias (a las 0:00hs)
		cron.schedule("1 * * * *", () => this.RutinasHorarias(), {timezone: "Etc/Greenwich"}); // Rutinas horarias (a las 0:01hs)

		// Fin
		const tiempoTranscurrido = (Date.now() - rutinasDeInicio).toLocaleString("pt"); // 'es' no coloca el separador de miles
		console.log();
		console.log("Rutinas de inicio terminadas en " + tiempoTranscurrido + " mseg., el " + new Date().toLocaleString());
		return;
	},

	// Consolidados
	FechaHoraUTC: async function () {
		// Variables
		hoy = new Date().toISOString().slice(0, 10);
		const info = {...rutinasJson};
		const minutos = new Date().getMinutes();

		// Filtros
		if (!Object.keys(info).length || !info.RutinasDiarias || !Object.keys(info.RutinasDiarias).length) return;

		// Si la 'FechaUTC' actual es igual a la del archivo JSON, termina la función
		const {FechaUTC, HoraUTC} = procesos.fechaHoraUTC();
		if (info.FechaUTC == FechaUTC) return;

		// Encabezado de las rutinas diarias
		console.log();
		console.log("Rutinas diarias:");
		const comienzo = Date.now();

		// Actualiza los valores de la rutina "FechaHoraUTC" en el archivo JSON
		const feedback = {FechaUTC, HoraUTC, FechaHoraUTC: "NO"};
		procesos.guardaArchivoDeRutinas(feedback); // Actualiza la fecha y hora, más el valor "NO" en el campo "FechaHoraUTC"
		const duracion = Date.now() - comienzo;
		procesos.finRutinasDiariasSemanales("FechaHoraUTC", duracion); // Actualiza el valor "SI" en el campo "FechaHoraUTC", y avisa que se ejecutó

		// Actualiza los campos de Rutinas Diarias
		const feedback_RD = {};
		for (let rutinaDiaria in info.RutinasDiarias) feedback_RD[rutinaDiaria] = "NO"; // cuando se ejecute cada rutina, se va a actualizar a 'SI'
		procesos.guardaArchivoDeRutinas(feedback_RD, "RutinasDiarias"); // actualiza el valor "NO" en los campos de "RutinasDiarias"
		await this.RutinasDiarias(); // ejecuta las rutinas diarias

		// Verifica si se deben correr las rutinas horarias
		if (minutos) await this.RutinasHorarias();

		// Rutinas semanales
		await this.SemanaUTC();

		// Fin
		return;
	},
	SemanaUTC: async function () {
		comp.variablesSemanales();

		// Obtiene la información del archivo JSON
		let info = {...rutinasJson};
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
		procesos.finRutinasDiariasSemanales("SemanaUTC", duracion);

		// Actualiza los campos de Rutinas Semanales
		const feedback_RS = {};
		for (let rutinaSemanal in rutinasSemanales) feedback_RS[rutinaSemanal] = "NO"; // Cuando se ejecuta cada rutina, se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback_RS, "RutinasSemanales");
		await this.RutinasSemanales();

		// Fin
		return;
	},
	RutinasHorarias: async function () {
		// No aplica para el entorno de test
		if (entorno == "test") return;

		// Obtiene la información del archivo JSON
		const {RutinasHorarias} = rutinasJson;

		// Actualiza todas las rutinas horarias
		console.log();
		console.log("Rutinas horarias:");
		for (let rutina of RutinasHorarias) {
			const comienzo = Date.now();
			await this.rutinas[rutina]();
			const duracion = Date.now() - comienzo;
			procesos.finRutinasHorarias(rutina, duracion);
		}
		console.log("Fin de rutinas horarias");

		// Fin
		return;
	},
	RutinasDiarias: async function () {
		// Actualiza las variables diarias
		procesos.variablesDiarias();

		// Actualiza todas las rutinas diarias
		const {RutinasDiarias} = rutinasJson;
		for (let rutinaDiaria in RutinasDiarias) {
			// No aplica para el entorno de test
			if (entorno == "test" && rutinaDiaria != "imagenDerecha") continue; // sólo se debe ejecutar la rutina 'imagenDerecha'

			// Realiza la rutina
			const comienzo = Date.now();
			await this.rutinas[rutinaDiaria](); // ejecuta la rutina
			const duracion = Date.now() - comienzo;
			procesos.finRutinasDiariasSemanales(rutinaDiaria, duracion, "RutinasDiarias"); // actualiza el archivo JSON
		}
		console.log("Fin de rutinas diarias");

		// Fin
		return;
	},
	RutinasSemanales: async function () {
		// No aplica para el entorno de test
		if (entorno == "test") return;

		// Actualiza las rutinasSemanales
		const {RutinasSemanales} = rutinasJson;
		for (let rutinaSemanal in RutinasSemanales) {
			const comienzo = Date.now();
			await this.rutinas[rutinaSemanal]();
			const duracion = Date.now() - comienzo;
			procesos.finRutinasDiariasSemanales(rutinaSemanal, duracion, "RutinasSemanales");
		}
		console.log("Fin de rutinas semanales");

		// Fin
		return;
	},

	// Rutinas
	rutinas: {
		// Gestiones horarias
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
			const usuarios_id = [...new Set(regsTodos.map((n) => n.sugeridoPor_id || n.statusOriginalPor_id))]; // obtiene el id de los usuarios a los que hay que notificarles
			const usuarios = await baseDeDatos.obtieneTodosPorCondicion("usuarios", {id: usuarios_id}, "pais");
			const asunto = "Revisión de las sugerencias realizadas";
			let mailsEnviados = [];

			// Rutina por usuario
			for (let usuario of usuarios) {
				// Si corresponde, saltea la rutina
				const stopper = stoppersFeedbackParaUsers(usuario);
				if (stopper) continue;

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
					usuario.id != usAutom_id && // si es el usuario automático, no envía el mail
					(entorno != "development" || [1, 11].includes(usuario.id)) // en development, sólo envía el mail a los usuarios del programador
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
		actualizaProdsAlAzar: async () => {
			// Variables
			const condicion = {statusRegistro_id: aprobados_ids};
			const entidades = variables.entidades.prods;
			const camposNulos = {pelicula_id: null, coleccion_id: null, grupoCol_id: null, capitulo_id: null};
			let id = 0;

			// Rastrilla los productos
			for (let entidad of entidades) {
				// Variables
				const productos = await baseDeDatos.obtieneTodosPorCondicion(entidad, condicion);
				const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);

				// Rastrilla los productos
				for (let producto of productos) {
					// Crea los datos
					id++;
					const azar = comp.azar();
					const datos = {id, ...camposNulos, [campo_id]: producto.id, azar};

					// Guarda los cambios
					baseDeDatos.actualizaPorCondicion("prodsComplem", {id}, datos); // actualiza el campo 'azar' en el registro
				}
			}

			// Elimina los sobrantes
			baseDeDatos.eliminaPorCondicion("prodsComplem", {id: {[Op.gt]: id}});

			// Fin
			return;
		},
		eliminaCapturasVencidas: async () => {
			// Variables
			const haceDosHoras = comp.fechaHora.nuevoHorario(-2);
			const condicion = {capturadoEn: {[Op.lt]: haceDosHoras}};

			// Actualiza la BD
			baseDeDatos.eliminaPorCondicion("capturas", condicion);

			// Fin
			return;
		},

		// Gestiones diarias
		imagenDerecha: async () => {
			// Variables
			let {ImagenesDerecha: imgsYaProcs} = rutinasJson;
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
				if (imgsYaProcs && imgsYaProcs[fechaArchivo]) ImagenesDerecha[fechaArchivo] = imgsYaProcs[fechaArchivo];
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
		historialNavegs: async () => {
			// Navegantes diarios, quitando los duplicados
			const diarioNavegs = await baseDeDatos
				.obtieneTodosPorCondicion("diarioNavegs", {fecha: {[Op.lt]: hoy}})
				.then((n) => n.sort((a, b) => (a.fecha < b.fecha ? -1 : 1)));
			if (!diarioNavegs.length) return;

			// Variables
			const primFechaDiarioNavegs = diarioNavegs[0].fecha;
			const ultRegHistNavegs = await baseDeDatos.obtienePorCondicionElUltimo("historialNavegs");
			const ultFechaHistNavegs = ultRegHistNavegs && ultRegHistNavegs.fecha;

			// Si hay una inconsistencia, termina
			if (ultFechaHistNavegs && primFechaDiarioNavegs <= ultFechaHistNavegs) {
				const mensaje = primFechaDiarioNavegs == ultFechaHistNavegs ? "IGUAL" : "MENOR";
				console.log("Inconsistencia: Fecha Diaria", mensaje, "a Fecha Acumulada");
				return;
			}

			// Obtiene la fecha inicial para acumulados
			let proximaFecha = ultFechaHistNavegs // condición si hay logins acums
				? procesos.sumaUnDia(ultFechaHistNavegs) // le suma un día al último registro
				: primFechaDiarioNavegs; // la fecha del primer registro

			// Loop mientras el día sea menor al actual
			while (proximaFecha < hoy) {
				// Variables
				const diaSem = diasSemana[new Date(proximaFecha).getUTCDay()];
				const anoMes = proximaFecha.slice(0, 7);
				const navegantes = diarioNavegs.filter((n) => n.fecha == proximaFecha);

				// Cantidad y fidelidad de navegantes
				const logins = navegantes.filter((n) => n.usuario_id).length;
				const usSinLogin = navegantes.filter((n) => !n.usuario_id && n.cliente_id.startsWith("U")).length;
				const visitas = navegantes.filter((n) => !n.usuario_id && n.cliente_id.startsWith("V")).length;

				// Guarda el resultado
				await baseDeDatos.agregaRegistro("historialNavegs", {
					...{fecha: proximaFecha, diaSem, anoMes},
					...{logins, usSinLogin, visitas},
				});

				// Obtiene la fecha siguiente
				proximaFecha = procesos.sumaUnDia(proximaFecha);
			}

			// Elimina los 'diarioNavegs' anteriores
			baseDeDatos.eliminaPorCondicion("diarioNavegs", {fecha: {[Op.lt]: hoy}});

			// Fin
			return;
		},
		historialClientes: async () => {
			// Obtiene la última fecha del historial
			const ultRegHistClientes = await baseDeDatos.obtienePorCondicionElUltimo("historialClientes");
			const ultFechaHistClientes = ultRegHistClientes ? ultRegHistClientes.fecha : "2024-09-30";
			let proximaFecha = procesos.sumaUnDia(ultFechaHistClientes); // le suma un día al último registro
			if (proximaFecha >= hoy) return;

			// Obtiene los clientes
			const usuarios = baseDeDatos.obtieneTodos("usuarios");
			const visitas = baseDeDatos.obtieneTodos("visitas");
			const clientes = await Promise.all([usuarios, visitas])
				.then((n) => n.flat())
				.then((n) => n.map((m) => ({...m, visitaCreadaEn: m.visitaCreadaEn.toISOString().slice(0, 10)})));

			// Loop mientras el día sea menor al actual
			while (proximaFecha < hoy) {
				// Obtiene los tipos de cliente según el día
				const tiposDeCliente = procesos.tiposDeCliente(clientes, proximaFecha);

				// Guarda el resultado
				await baseDeDatos.agregaRegistro("historialClientes", tiposDeCliente);

				// Obtiene la fecha siguiente
				proximaFecha = procesos.sumaUnDia(proximaFecha);
			}

			// Fin
			return;
		},
		rutinasDiariasEnUsuario: async () => {
			// Lleva a cero el valor de algunos campos
			await baseDeDatos.actualizaTodos("usuarios", {intentosLogin: 0, intentosDP: 0});

			// Elimina usuarios antiguos que no confirmaron su contraseña
			const fechaDeCorte = new Date(new Date().getTime() - unDia);
			const condicion = {statusRegistro_id: mailPendValidar_id, fechaContrasena: {[Op.lt]: fechaDeCorte}};
			await baseDeDatos.eliminaPorCondicion("usuarios", condicion);

			// Fin
			return;
		},
		eliminaLinksInactivos: async () => {
			const fechaDeCorte = comp.fechaHora.nuevoHorario(-25);
			const condicion = {statusRegistro_id: inactivo_id, statusSugeridoEn: {[Op.lt]: fechaDeCorte}};
			await baseDeDatos.eliminaPorCondicion("links", condicion);
			return;
		},
		ABM_noRevisores: async () => {
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

		// Rutinas semanales - Gestiones
		estableceLosNuevosLinksVencidos: async () => {
			await comp.linksVencPorSem.actualizaFechaVencimNull(); // actualiza la fecha de los links sin fecha
			await comp.linksVencPorSem.actualizaStatus(); // pasa a 'creadoAprob' los links con fechaVencim < semActual
			await comp.linksVencPorSem.actualizaCantLinksPorSem();

			// Fin
			return;
		},
		actualizaPaisesConMasProductos: async () => {
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
				const cantidad = paisesID[pais.id] ? paisesID[pais.id] : 0;
				paises[i].cantProds.cantidad = cantidad;
				baseDeDatos.actualizaPorCondicion("paisesCantProds", {pais_id: pais.id}, {cantidad});
			});

			// Fin
			return;
		},
		actualizaLinksPorProv: async () => {
			// Obtiene todos los links activos
			const linksTotales = await baseDeDatos.obtieneTodosPorCondicion("links", {statusRegistro_id: aprobados_ids});

			// Links por proveedor
			for (let linkProv of linksProvs.filter((n) => n.urlDistintivo)) {
				const cantidad = linksTotales.filter((n) => n.url.startsWith(linkProv.urlDistintivo)).length;
				baseDeDatos.actualizaPorCondicion("linksProvsCantLinks", {link_id: linkProv.id}, {cantidad});
			}

			// Fin
			return;
		},

		// Rutinas semanales - Desvíos del estándar
		revisaCorrigeSolapam: async () => await comp.actualizaSolapam(),
		revisaCorrigeLinksEnProd: async () => {
			// Variables
			let esperar = [];
			let IDs;

			// Rutina por peliculas y capitulos
			for (let entidad of ["peliculas", "capitulos"]) {
				// Obtiene los ID de los registros de la entidad
				IDs = await baseDeDatos
					.obtieneTodosPorCondicion(entidad, {statusRegistro_id: aprobados_ids})
					.then((n) => n.map((m) => m.id));

				// Ejecuta la función linksEnProd
				for (let id of IDs) esperar.push(comp.linksEnProd({entidad, id}));
			}
			await Promise.all(esperar).then(async () => {
				// Rutina por colecciones
				IDs = await baseDeDatos
					.obtieneTodosPorCondicion("colecciones", {statusRegistro_id: aprobados_ids})
					.then((n) => n.map((m) => m.id));
				for (let id of IDs) await comp.actualizaCalidadesDeLinkEnCole(id);
			});

			// Fin
			return;
		},
		revisaCorrigeCalidadesDeLinkEnColes: async () => {
			// Variables
			const colecciones = await baseDeDatos.obtieneTodos("colecciones");

			// Rutina
			for (let coleccion of colecciones) await comp.actualizaCalidadesDeLinkEnCole(coleccion.id);

			// Fin
			return;
		},
		revisaCorrigeProdAprobEnLink: async () => {
			// Obtiene todos los links con su producto asociado
			const links = await baseDeDatos.obtieneTodos("links", variables.entidades.asocProds);

			// Actualiza su valor
			comp.actualizaProdAprobEnLink(links);

			// Fin
			return;
		},
		revisaCorrigeProdsEnRCLV: async () => {
			// Obtiene las entidadesRCLV
			const entidadesRCLV = variables.entidades.rclvs;

			// Rutina por entidad
			for (let entidad of entidadesRCLV) {
				// Obtiene los ID de los registros de la entidad
				const IDs = await baseDeDatos.obtieneTodos(entidad).then((n) => n.map((m) => m.id));

				// Rutina por ID
				for (let id of IDs) comp.actualizaProdsEnRCLV({entidad, id});
			}

			// Fin
			return;
		},
		revisaCorrigeAprobadoConAvatarLink: async () => {
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
		revisaCorrigeRclv_idEnCapsSiLaColeTieneUnValor: async () => {
			// Variables
			const rclvs_id = variables.entidades.rclvs_id;

			// Obtiene todas las colecciones
			const colecciones = await baseDeDatos.obtieneTodos("colecciones");

			// Rutinas
			for (let coleccion of colecciones) // Rutina por colección
				for (let rclv_id of rclvs_id) // Rutina por rclv_id
					if (coleccion[rclv_id] > 10) {
						const condicion = {coleccion_id: coleccion.id};
						const datos = {[rclv_id]: 1};
						baseDeDatos.actualizaPorCondicion("capitulos", condicion, datos);
					}

			// Fin
			return;
		},
		revisaCorrigeRclvsSinEpocaPSTyConAno: async () => {
			// Variables
			const entidades = ["personajes", "hechos"];
			const condicion = {statusRegistro_id: aprobado_id, epocaOcurrencia_id: {[Op.ne]: "pst"}};

			// Busca
			for (let entidad of entidades) {
				const ano = entidad == "personajes" ? "anoNacim" : "anoComienzo";
				await baseDeDatos.actualizaPorCondicion(entidad, {...condicion, [ano]: {[Op.ne]: null}}, {[ano]: null});
			}

			// Fin
			return;
		},
		revisaCorrigeProdsComplem: async () => {
			// Variables
			const condicion = {statusRegistro_id: aprobados_ids};
			const entidades = variables.entidades.prods;
			const prodsComplem = await baseDeDatos.obtieneTodos("prodsComplem");

			// Rastrilla los productos
			for (let entidad of entidades) {
				// Variables
				const productos = await baseDeDatos.obtieneTodosPorCondicion(entidad, condicion);
				const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);

				// Rastrilla los productos
				for (let producto of productos) {
					// Crea los datos
					const azar = comp.azar();
					const datos = {[campo_id]: producto.id, azar};
					if (entidad != "peliculas")
						datos.grupoCol_id = entidad == "colecciones" ? producto.id : producto.coleccion_id;

					// Agrega los registros que faltan
					const prodComplem = prodsComplem.find((n) => n[campo_id] == producto.id);
					if (!prodComplem) await baseDeDatos.agregaRegistro("prodsComplem", datos);
				}
			}

			// Fin
			return;
		},

		// Rutinas semanales - Eliminaciones de mantenimiento
		eliminaImagenesSinRegistro: async () => {
			// Variables
			const statusDistintoCreado_id = statusRegistros.filter((n) => n.id != creado_id).map((n) => n.id);
			const statusCualquiera_id = {[Op.ne]: null};

			const objetos = [
				// Carpetas REVISAR
				{carpeta: "2-Productos/Revisar", familias: "productos", entidadEdic: "prodsEdicion"}, // para los prods, sólo pueden estar en 'Edición'
				{carpeta: "3-RCLVs/Revisar", familias: "rclvs", entidadEdic: "rclvsEdicion", status_id: creado_id},

				// Carpetas FINAL
				{carpeta: "2-Productos/Final", familias: "productos", status_id: statusDistintoCreado_id},
				{carpeta: "3-RCLVs/Final", familias: "rclvs", status_id: statusDistintoCreado_id},

				// Carpetas USUARIOS
				{carpeta: "1-Usuarios", familias: "usuarios", status_id: statusCualquiera_id},
			];

			// Elimina las imágenes de las carpetas "Revisar" y "Final"
			for (let objeto of objetos) await procesos.eliminaImagenesSinRegistro(objeto);

			// Elimina las imágenes de "Provisorio"
			procesos.eliminaImagenesProvisorio();

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
		eliminaRegsSinEntidad_id: async () => {
			// Variables
			const entidades = [...variables.entidades.todos, "usuarios"];
			let idsPorEntidad = {};
			let aux = [];

			// Obtiene los registros por entidad
			for (let entidad of entidades) aux.push(baseDeDatos.obtieneTodos(entidad).then((n) => n.map((m) => m.id)));
			aux = await Promise.all(aux);
			entidades.forEach((entidad, i) => (idsPorEntidad[entidad] = aux[i])); // obtiene un objeto de ids por entidad

			// Elimina historial
			for (let tabla of eliminarCuandoSinEntidadId) {
				// Obtiene los registros de historial, para analizar si corresponde eliminar alguno
				const regsHistorial = await baseDeDatos.obtieneTodos(tabla);

				// Si no encuentra la "entidad + id", elimina el registro
				for (let regHistorial of regsHistorial)
					if (
						!regHistorial.entidad || // no existe la entidad
						!entidades.includes(regHistorial.entidad) || // entidad desconocida
						!regHistorial.entidad_id || // no existe la entidad_id
						!idsPorEntidad[regHistorial.entidad].includes(regHistorial.entidad_id) // no existe la combinacion de entidad + entidad_id
					)
						baseDeDatos.eliminaPorId(tabla, regHistorial.id);
			}

			// Fin
			return;
		},
		eliminaRegsDelHistStatus: async () => {
			const condicion = {statusOriginal_id: creadoAprob_id, statusFinal_id: aprobado_id};
			await baseDeDatos.eliminaPorCondicion("statusHistorial", condicion);
			return;
		},
		idDeTablas: async () => {
			// Variables
			const tablas = [
				...["histEdics", "statusHistorial"],
				...["prodsEdicion", "rclvsEdicion", "linksEdicion"],
				...["historialNavegs", "diarioNavegs", "historialClientes"],
				...["prodsComplem", "capturas"],
				...["calRegistros", "misConsultas", "consRegsPrefs", "pppRegistros"],
				...["capsSinLink", "novedadesELC"],
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
				const texto = process.env.DB_NAME + "." + db[tabla].tableName;
				await sequelize.query("ALTER TABLE " + texto + " AUTO_INCREMENT = 1;");
			}

			// Fin
			return;
		},
	},
};

// Funciones
const stoppersFeedbackParaUsers = (usuario) => {
	if (!usuario.pais || !usuario.email) return true;

	// Acciones para saltear la rutina, dependiendo de la hora
	const ahora = new Date();
	const zonaHoraria = usuario.pais.zonaHoraria;
	const ahoraUsuario = ahora.getTime() + zonaHoraria * unaHora;
	if (
		(entorno != "development" && new Date(ahoraUsuario).getUTCHours()) || // Producción: saltea si para el usuario no son las 0hs
		(entorno == "development" && !new Date(ahoraUsuario).getUTCHours()) // Development: saltea si para el usuario son las 0hs
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
const obsoletas = {
	actualizaCapEnCons: async () => {
		// Colecciones
		await baseDeDatos.actualizaPorCondicion("colecciones", {TMDB_entidad: "collection"}, {capEnCons: true});
		await baseDeDatos.actualizaPorCondicion("colecciones", {TMDB_entidad: "tv"}, {capEnCons: false});

		// Capítulos
		const colecciones = await baseDeDatos.obtieneTodos("colecciones");
		for (let coleccion of colecciones) {
			const capEnCons = coleccion.TMDB_entidad == "collection" ? true : coleccion.TMDB_entidad == "tv" ? false : null;
			baseDeDatos.actualizaPorCondicion("capitulos", {coleccion_id: coleccion.id}, {capEnCons});
		}

		// Fin
		return;
	},
};
