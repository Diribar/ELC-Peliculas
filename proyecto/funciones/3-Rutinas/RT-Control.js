"use strict";
// Variables
const cron = require("node-cron");
const procsCRUD = require("../../rutas_y_controladores/2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./RT-Procesos");

// Exportar
module.exports = {
	// 0. Start-up y Configuracion de Rutinas
	startupMasConfiguracion: async function () {
		// Variables
		this.variablesDiarias();
		this.variablesSemanales();

		// Rutinas programadas
		const info = {...rutinasJSON};
		if (!Object.keys(info).length) return;

		// Rutinas diarias (a las 0:00hs)
		if (!info.RutinasDiarias || !Object.keys(info.RutinasDiarias).length) return;
		cron.schedule("0 0 * * *", async () => this.FechaHoraUTC(), {timezone: "Etc/Greenwich"});

		// Rutinas horarias (a las 0:01hs)
		if (!info.RutinasHorarias || !info.RutinasHorarias.length) return;
		cron.schedule("1 * * * *", async () => this.RutinasHorarias(), {timezone: "Etc/Greenwich"}); // minuto 1

		// Start-up
		await this.FechaHoraUTC();

		// Fin
		// await this.LinksEnProd();
		console.log("Rutinas de inicio terminadas en " + new Date().toLocaleString());
		return;
	},

	// 1. Rutinas horarias
	RutinasHorarias: async function () {
		// Obtiene la información del archivo JSON
		const info = {...rutinasJSON};
		const rutinasHorarias = info.RutinasHorarias;

		// Actualiza todas las rutinas horarias
		console.log("Rutinas horarias:");
		for (let rutinaHoraria of rutinasHorarias) {
			await this[rutinaHoraria]();
			procesos.finRutinasHorarias(rutinaHoraria);
		}

		// Fin
		console.log();
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
		return;
	},
	MailDeFeedback: async () => {
		// En 'development' interrumpe
		if (nodeEnv == "development") return;

		// Obtiene de la base de datos, la información de todo el historial pendiente de comunicar
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
			// Variables
			const ahora = new Date();

			// Si para el usuario no son las 0hs, lo saltea
			const zonaHoraria = usuario.pais.zonaHoraria;
			const ahoraUsuario = ahora.getTime() + zonaHoraria * unaHora;
			if (new Date(ahoraUsuario).getUTCHours()) continue;

			// Si ya se envió un comunicado en el día y en la misma franja horaria, saltea el usuario
			const hoyUsuario = comp.fechaHora.fechaDiaMesAno(ahora);
			const fechaRevisores = comp.fechaHora.fechaDiaMesAno(usuario.fechaRevisores);
			const horaUsuario = ahora.getUTCHours();
			const horaRevisores = usuario.fechaRevisores.getUTCHours();
			if (hoyUsuario == fechaRevisores && horaUsuario == horaRevisores) continue;

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
		console.log("Procesando el envío de mails...");
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
		console.log("\n" + "Rutinas diarias:");
		const feedback = {FechaUTC, HoraUTC, FechaHoraUTC: "NO"};
		procesos.guardaArchivoDeRutinas(feedback); // Actualiza la fecha y hora, más el valor "NO" en el campo "FechaHoraUTC"
		procesos.finRutinasDiariasSemanales("FechaHoraUTC"); // Actualiza el valor "SI" en el campo "FechaHoraUTC", y avisa que se ejecutó

		// Actualiza los campos de Rutinas Diarias
		const feedback_RD = {};
		for (let rutinaDiaria in rutinasDiarias) feedback_RD[rutinaDiaria] = "NO"; // cuando se ejecute cada rutina, se va a actualizar a 'SI'
		procesos.guardaArchivoDeRutinas(feedback_RD, "RutinasDiarias"); // actualiza el valor "NO" en los campos de "RutinasDiarias"
		await this.RutinasDiarias(); // ejecuta las rutinas diarias
		console.log();

		// Verifica si se deben correr las rutinas horarias
		if (minutos > 1) await this.RutinasHorarias();

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
				comp.gestionArchivos.copiaImagen(carpeta + nombreArchivo, "./publico/imagenes/ImagenDerecha/" + fechaArchivo + ".jpg");
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
		const feedback = {FechaSemUTC: FechaUTC, HoraSemUTC: HoraUTC, semanaUTC, SemanaUTC: "NO"}; // Con el paso de 'finRutinasDiariasSemanales', se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback);
		procesos.finRutinasDiariasSemanales("SemanaUTC");

		// Actualiza los campos de Rutinas Semanales
		const feedback_RS = {};
		for (let rutinaSemanal in rutinasSemanales) feedback_RS[rutinaSemanal] = "NO"; // Cuando se ejecuta cada rutina, se actualiza a 'SI'
		procesos.guardaArchivoDeRutinas(feedback_RS, "RutinasSemanales");
		await this.RutinasSemanales();

		// Fin
		console.log();
		return;
	},
	RutinasSemanales: async function () {
		// Obtiene la información del archivo JSON
		const info = {...rutinasJSON};
		const rutinasSemanales = info.RutinasSemanales;

		// Si la 'semanaUTC' es distinta o la rutinaSemanal está pendiente, actualiza las rutinasSemanales
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
		let espera = [];

		// Revisa, descarga, actualiza
		for (let entidad of ["peliculas", "colecciones", ...variables.entidades.rclvs]) {
			// Variables
			const familias = comp.obtieneDesdeEntidad.familias(entidad);
			const carpeta = (familias == "productos" ? "2-" : "3-") + comp.convierteLetras.inicialMayus(familias);
			const ruta = carpetaExterna + carpeta + "/Final/";

			// Descarga el avatar y actualiza el valor en el campo del registro original
			espera.push(
				BD_genericas.obtieneTodosPorCondicion(entidad, condicion).then((n) =>
					n.map((m) => {
						const nombre = Date.now() + path.extname(m.avatar);
						comp.gestionArchivos.descarga(m.avatar, ruta + nombre);
						BD_genericas.actualizaPorId(entidad, m.id, {avatar: nombre});
					})
				)
			);
		}
		await Promise.all(espera);

		// Fin
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
			statusRegistro_id: creadoAprob_id,
			// statusSugeridoEn: ahora, // no se lo pone, para poder observar la fecha original que deriva en este status
		};
		await BD_genericas.actualizaTodosPorCondicion("links", condiciones, objeto);

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
	EliminaHistorialAntiguo: () => {
		// Variables
		const ahora = Date.now();
		const tablas = [
			{nombre: "histEdics", campo: "revisadoEn", antiguedad: unDia * 365},
			{nombre: "histStatus", campo: "revisadoEn", antiguedad: unDia * 365},
			{nombre: "histDetsPeli", campo: "visitadaEn", antiguedad: unDia * 183},
		];

		// Elimina historial antiguo
		for (let tabla of tablas) {
			const fechaDeCorte = new Date(ahora - tabla.antiguedad);
			BD_genericas.eliminaTodosPorCondicion(tabla.nombre, {[tabla.campo]: {[Op.lt]: fechaDeCorte}});
		}

		// Fin
		return;
	},
	EliminaHistorialDeRegsEliminados: async () => {
		// Variables
		const tablas = [
			{nombre: "histEdics", campoUsuario: "sugeridoPor_id"},
			{nombre: "histStatus", campoUsuario: "sugeridoPor_id"},
			{nombre: "histDetsPeli", campoUsuario: "usuario_id"},
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
					// Si no lo encuentra en alguna de las tablas, elimina el registro
					BD_genericas.eliminaPorId(tabla.nombre, registro.id);
		}

		// Fin
		return;
	},
	variablesSemanales: function () {
		this.primerLunesDelAno();

		// Otras variables
		semanaUTC = parseInt((Date.now() - fechaPrimerLunesDelAno) / unDia / 7);
		lunesDeEstaSemana = fechaPrimerLunesDelAno + semanaUTC * unaSemana;

		// Fin
		return;
	},
	primerLunesDelAno: () => {
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
let actualizaLinkDeProdAprob = async () => {
	// Variables
	const prodInactivo_id = motivosStatus.find((n) => n.codigo == "prodInactivo").id;
	const inactivo = {statusRegistro_id: inactivo_id, motivo_id: prodInactivo_id};

	// Obtiene todos los links con su producto asociado
	const links = await BD_genericas.obtieneTodosConInclude("links", variables.asocs.prods);

	// Rutina por link
	for (let link of links) {
		// Averigua el status de su producto
		let statusProd = link.pelicula
			? link.pelicula.statusRegistro_id
			: link.coleccion
			? link.coleccion.statusRegistro_id
			: link.capitulo
			? link.capitulo.statusRegistro_id
			: null;
		if (!statusProd) continue;

		// En caso que esté inactivo, inactiva el status del link y actualiza su motivo
		if (statusProd == inactivo_id) BD_genericas.actualizaPorId("links", link.id, inactivo);

		// En caso que esté aprobado, le actualiza el campo prodAprob a 'true'
		const prodAprob = aprobados.includes(statusProd);
		BD_genericas.actualizaPorId("links", link.id, {prodAprob});
	}

	// Fin
	return;
};
let eliminaHistorialQueNoCorresponde = async () => {
	// Obtiene los registros de histStatus en orden descendente
	let histStatus = await BD_genericas.obtieneTodos("histStatus", false, true);

	// Rutina por registro
	while (histStatus.length) {
		// Variables
		const registro = histStatus[0]; // obtiene el registro más antiguo de 'histStatus'
		const producto = await BD_genericas.obtienePorId(registro.entidad, registro.entidad_id); // obtiene el producto

		// Si el status coincide, quita de la variable su historial
		if (registro.statusFinal_id == producto.statusRegistro_id)
			histStatus = histStatus.filter((n) => n.entidad != registro.entidad || n.entidad_id != registro.entidad_id);
		// Si el status difiere, elimina el registro de la variable y de la BD
		else {
			BD_genericas.eliminaPorId("histStatus", registro.id);
			histStatus.splice(0, 1);
		}
	}

	// Fin
	return;
};
