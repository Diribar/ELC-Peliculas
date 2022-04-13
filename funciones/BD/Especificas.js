"use strict";
// Definir variables
const db = require("../../base_de_datos/modelos");
const Op = db.Sequelize.Op;
const BD_genericas = require("./Genericas");
const especificas = require("../Varias/Especificas");
const validar = require("../../funciones/Prod-RUD/2-Validar");

module.exports = {
	// PRODUCTOS ------------------------------------------------------------------
	// Header
	quickSearchCondiciones: (palabras) => {
		palabras = palabras.split(" ");
		// Definir los campos en los cuales buscar
		let campos = ["nombre_original", "nombre_castellano"];
		// Crear el objeto literal con los valores a buscar
		let valoresOR = [];
		for (let campo of campos) {
			let CondicionesDeCampo = [];
			for (let palabra of palabras) {
				let CondiciondePalabra = {
					[Op.or]: [
						{[campo]: {[Op.like]: "% " + palabra + "%"}},
						{[campo]: {[Op.like]: palabra + "%"}},
					],
				};
				CondicionesDeCampo.push(CondiciondePalabra);
			}
			let ResumenDeCampo = {[Op.and]: CondicionesDeCampo};
			valoresOR.push(ResumenDeCampo);
		}
		let condiciones = {[Op.or]: valoresOR};
		return condiciones;
	},
	quickSearchProductos: async (condiciones) => {
		// Obtener las películas
		let peliculas = db.peliculas
			.findAll({where: condiciones, limit: 10})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {...m, entidad: "peliculas"};
				})
			);
		// Obtener las colecciones
		let colecciones = db.colecciones
			.findAll({where: condiciones, limit: 5})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {...m, entidad: "colecciones"};
				})
			);
		// Obtener los capítulos
		let capitulos = db.capitulos
			.findAll({where: condiciones, limit: 10})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) =>
				n.map((m) => {
					return {...m, entidad: "capitulos"};
				})
			);
		// Consolidar los hallazgos
		let resultado = await Promise.all([peliculas, colecciones, capitulos]).then(([a, b, c]) => {
			return [...a, ...b, ...c];
		});
		// Ordenar el resultado
		resultado.sort((a, b) => {
			return a.nombre_castellano < b.nombre_castellano
				? -1
				: a.nombre_castellano > b.nombre_castellano
				? 1
				: 0;
		});
		// Enviar el resultado
		return resultado;
	},
	// API-Agregar
	obtenerCapitulos: (coleccion_id, temporada) => {
		return db.capitulos
			.findAll({
				where: {coleccion_id: coleccion_id, temporada: temporada},
			})
			.then((n) => n.map((m) => m.toJSON()))
			.then((n) => n.map((m) => m.capitulo));
	},
	obtenerELC_id: (entidad, objeto) => {
		return db[entidad].findOne({where: objeto}).then((n) => {
			return n ? n.id : "";
		});
	},
	// API-RUD
	obtenerVersionesDeProducto: async (entidad, prodID, userID) => {
		// Definir los campos include
		let includes = [
			"idioma_original",
			"en_castellano",
			"en_color",
			"categoria",
			"subcategoria",
			"publico_sugerido",
			"personaje",
			"hecho",
			"valor",
			"editado_por",
			// A partir de acá, van los campos exclusivos de 'Original'
			"creado_por",
			"status_registro",
		];
		if (entidad == "capitulos") includes.push("coleccion");
		// Obtener el producto ORIGINAL
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
		// Obtener el producto EDITADO
		let prodEditado = "";
		let producto_id = especificas.entidad_id(entidad);
		if (prodOriginal) {
			// Quitarle los campos 'null'
			prodOriginal = especificas.quitarLosCamposSinContenido(prodOriginal);
			// Obtener los datos EDITADOS del producto
			if (entidad == "capitulos") includes.pop();
			prodEditado = await BD_genericas.obtenerPorCamposConInclude(
				"productos_edic",
				{[producto_id]: prodID, editado_por_id: userID},
				includes.slice(0, -2)
			);
			if (prodEditado) {
				// Quitarle los campos 'null'
				prodEditado = especificas.quitarLosCamposSinContenido(prodEditado);
			}
			// prodEditado = {...prodOriginal, ...prodEditado};
		}
		return [prodOriginal, prodEditado];
	},
	// Controlador-Revisar
	obtenerProductosARevisar: async (haceUnaHora, revisar, userID) => {
		// Obtener los registros del Producto, que cumplan ciertas condiciones
		// Declarar las variables
		let entidades = ["peliculas", "colecciones"];
		let resultados = [];
		// Obtener el resultado por entidad
		for (let i = 0; i < entidades.length; i++) {
			resultados.push();
			resultados[i] = db[entidades[i]]
				.findAll({
					where: {
						// Con status de 'revisar'
						status_registro_id: revisar,
						[Op.or]: [
							// Que no esté capturado
							{capturado_en: null},
							// Que la captura haya sido hace más de una hora
							{capturado_en: {[Op.lt]: haceUnaHora}},
							// Que esté capturado por este usuario
							{capturado_por_id: userID},
						],
						// Que esté en condiciones de ser capturado
						creado_en: {[Op.lt]: haceUnaHora},
						// Que esté creado por otro usuario
						creado_por_id: {[Op.ne]: userID},
					},
					include: "status_registro",
				})
				.then((n) =>
					n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad: entidades[i]})) : []
				);
		}
		// Consolidar y ordenar los resultados
		let resultado = await Promise.all([...resultados]).then(([a, b]) => {
			// Consolidarlos
			let casos = [...a, ...b];
			// Ordenarlos
			casos.sort((a, b) => {
				return new Date(a.creado_en) - new Date(b.creado_en);
			});
			return casos;
		});
		// Fin
		return resultado;
	},
	// Controlador-Redireccionar
	obtenerEdicionAjena: async (producto_id, prodID, userID) => {
		let haceUnaHora = especificas.haceUnaHora();
		return db.productos_edic
			.findOne({
				where: {
					// Que pertenezca al producto que nos interesa
					[producto_id]: prodID,
					// Que esté en condiciones de ser capturado
					editado_en: {[Op.lt]: haceUnaHora},
					// Que esté editado por otro usuario
					editado_por_id: {[Op.ne]: userID},
				},
			})
			.then((n) => (n ? n.toJSON().id : ""));
	},
	// Controlador-Revisar - SIN USO AÚN
	obtenerEdicionesARevisar: async (haceUnaHora, revisar, userID) => {
		// Obtener los registros del Producto, que cumplan ciertas condiciones
		// Declarar las variables
		let entidades = ["peliculas", "colecciones", "capitulos"];
		let resultados = [];

		// Se deben excluir las ediciones realizadas por el usuario
		// Obtener Ediciones de productos en status alta_aprob

		// Obtener Ediciones de productos en status gr_aprob
	},
	quedanCampos: async function (prodOriginal, prodEditado) {
		// Variables
		let edicion = {...prodEditado};
		let noSeComparan;
		let entidad = especificas.obtenerEntidad(prodEditado);
		let statusAprobado = false;
		// Pulir la información a tener en cuenta
		edicion = especificas.quitarLosCamposSinContenido(edicion);
		[edicion, noSeComparan] = especificas.quitarLosCamposQueNoSeComparan(edicion);
		edicion = especificas.quitarLasCoincidenciasConOriginal(prodOriginal, edicion);
		// Averiguar si queda algún campo
		let quedanCampos = !!Object.keys(edicion).length;
		// Si no quedan, eliminar el registro
		if (!quedanCampos) {
			// Eliminar el registro de la edición
			await BD_genericas.eliminarRegistro("productos_edic", prodEditado.id);
			// Averiguar si el original no tiene errores
			let errores = await validar.edicion(null, {...prodOriginal, entidad});
			// Si se cumple lo siguiente, cambiarle el status a 'aprobado'
			// 1. Que no tenga errores
			// 2. Que el status del original sea 'alta_aprob'
			if (!errores.hay && prodOriginal.status_registro.alta_aprob) {
				statusAprobado = true;
				// Obtener el 'id' del status 'aprobado'
				let aprobado_id = await this.obtenerELC_id("status_registro", {aprobado: 1});
				// Cambiarle el status al producto
				await BD_genericas.actualizarPorId(entidad, prodOriginal.id, {
					status_registro_id: aprobado_id,
				});
				// Si es una colección, cambiarle el status también a los capítulos
				if (entidad == "colecciones") this.cambiarleElStatusALosCapitulos(prodOriginal);
			}
		} else edicion = {...noSeComparan, ...edicion};
		// Fin
		return [quedanCampos, edicion, statusAprobado];
	},

	// LINKS -------------------------------------------------------------
	// Controlador-Revisar
	obtenerLinks: (haceUnaHora, revisar, userID) => {
		// Obtener todos los registros de links, excepto los que tengan status 'gr_aprobados' con 'cant_productos'
		// Declarar las variables
		let includes = ["pelicula", "coleccion", "capitulo"];
		// Obtener el resultado por entidad
		return db.links_originales
			.findAll({
				where: {
					// Con status de 'revisar'
					status_registro_id: revisar,
					// Que no esté capturado
					[Op.or]: [{capturado_en: null}, {capturado_en: {[Op.lt]: haceUnaHora}}],
					// Que esté en condiciones de ser capturado
					fecha_referencia: {[Op.lt]: haceUnaHora},
					// Que esté creado por otro usuario
					creado_por_id: {[Op.ne]: userID},
				},
				include: includes,
			})
			.then((n) => (n ? n.map((m) => m.toJSON()) : []));
	},

	// USUARIOS ---------------------------------------------------------
	// Controladora/Usuario/Login
	obtenerUsuarioPorID: (id) => {
		return db.usuarios.findByPk(id, {
			include: ["rol_usuario", "sexo", "status_registro", "pais", "rol_iglesia"],
		});
	},
	// Middleware/Usuario/loginConCookie - Controladora/Usuario/Login
	obtenerUsuarioPorMail: (email) => {
		return db.usuarios.findOne({
			where: {email: email},
			include: ["rol_usuario", "sexo", "status_registro", "pais", "rol_iglesia"],
		});
	},
	// Middleware/Usuario/autorizadoFA
	obtenerAutorizadoFA: (id) => {
		return db.usuarios.findByPk(id).then((n) => n.autorizado_fa);
	},
	// Middleware/RevisarUsuario
	buscaAlgunaCapturaVigenteDelUsuario: async (entidadActual, prodID, userID) => {
		// Variables
		let haceUnaHora = especificas.haceUnaHora();
		let entidades = [
			"peliculas",
			"colecciones",
			"capitulos",
			"RCLV_personajes",
			"RCLV_hechos",
			"RCLV_valores",
		];
		// Crear el objeto literal con las condiciones a cumplirse
		let condiciones = {
			capturado_por_id: userID, // Que esté capturado por este usuario
			capturado_en: {[Op.gt]: haceUnaHora}, // Que esté capturado hace menos de una hora
			captura_activa: 1, // Que la captura sea 'activa'
		};
		// Averiguar si tiene algún producto capturado
		let lectura;
		let entidad;
		for (entidad of entidades) {
			// Distinto al producto actual
			if (entidad == entidadActual) condiciones.id = {[Op.ne]: prodID};
			lectura = await db[entidad]
				.findOne({
					where: condiciones,
					include: "status_registro",
				})
				.then((n) => (n ? n.toJSON() : ""));
			if (condiciones.id) delete condiciones.id;
			if (lectura) break;
		}
		// Fin
		return lectura ? {...lectura, entidad} : lectura;
	},
	// Controladora/Revisar/Productos
	fichaDelUsuario: async function (userID) {
		// Obtener los datos del usuario
		let includes = "rol_iglesia";
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, includes);
		// Variables
		let anos = 1000 * 60 * 60 * 24 * 365;
		let ahora = especificas.ahora().getTime();
		// Edad
		if (usuario.fecha_nacimiento) {
			var edad = parseInt((ahora - new Date(usuario.fecha_nacimiento).getTime()) / anos) + " años";
		}
		// Antigüedad
		let antiguedad =
			(parseInt(((ahora - new Date(usuario.creado_en).getTime()) / anos) * 10) / 10)
				.toFixed(1)
				.replace(".", ",") + " años";
		// Datos a enviar
		let enviar = {};
		enviar.apodo = ["Apodo", usuario.apodo];
		if (usuario.rol_iglesia) enviar.rolIglesia = ["Vocación", usuario.rol_iglesia.nombre];
		if (usuario.fecha_nacimiento) enviar.edad = ["Edad", edad];
		enviar.antiguedad = ["Tiempo en ELC", antiguedad];
		// Fin
		return enviar;
	},
	calidadAltas: async function (userID) {
		// Obtener los datos del usuario
		let includes = ["status_registro", "peliculas", "colecciones"];
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, includes);
		// 1. Obtener los status
		let altaAprobId = await BD_genericas.obtenerPorCampos("status_registro", {alta_aprob: 1}).then(
			(n) => n.id
		);
		let aprobadoId = await BD_genericas.obtenerPorCampos("status_registro", {aprobado: 1}).then(
			(n) => n.id
		);
		let editadoId = await BD_genericas.obtenerPorCampos("status_registro", {editado: 1}).then(
			(n) => n.id
		);
		let inactivadoId = await BD_genericas.obtenerPorCampos("status_registro", {inactivado: 1}).then(
			(n) => n.id
		);
		// 2. Contar los casos aprobados
		let cantAprob = usuario.peliculas.length
			? usuario.peliculas.filter(
					(n) =>
						n.status_registro_id == altaAprobId ||
						n.status_registro_id == aprobadoId ||
						n.status_registro_id == editadoId
			  ).length
			: 0;
		cantAprob += usuario.colecciones.length
			? usuario.colecciones.filter(
					(n) =>
						n.status_registro_id == altaAprobId ||
						n.status_registro_id == aprobadoId ||
						n.status_registro_id == editadoId
			  ).length
			: 0;
		// 3. Contar los casos rechazados
		let cantRech = usuario.peliculas.length
			? usuario.peliculas.filter((n) => n.status_registro_id == inactivadoId).length
			: 0;
		cantRech += usuario.colecciones.length
			? usuario.colecciones.filter((n) => n.status_registro_id == inactivadoId).length
			: 0;
		// 4. Precisión de altas
		let cantAltas = cantAprob + cantRech;
		let calidadInputs = cantAltas ? parseInt((cantAprob / cantAltas) * 100) + "%" : "-";
		let diasPenalizacion = await BD_genericas.sumarValores("altas_rech", {id: userID}, "duracion");
		// Datos a enviar
		let enviar = {
			calidadAltas: ["Calidad Altas", calidadInputs],
			cantAltas: ["Cant. Alta Productos", cantAltas],
			diasPenalizacion: ["Días Penalizado", diasPenalizacion],
		};
		// Fin
		return enviar;
	},
	calidadEdic: async function (userID) {
		// Obtener la cantidad de aprobaciones y de rechazos
		let cantAprob = await BD_genericas.contarCasos("edic_aprob", {input_por_id: userID});
		let rechazados = await BD_genericas.obtenerTodosPorCampos("edic_rech", {input_por_id: userID});
		let cantRech = rechazados.length ? rechazados.length : 0;
		// Obtener la calidad de las ediciones
		let cantEdics = cantAprob + cantRech;
		let calidadInputs = cantEdics ? parseInt((cantAprob / cantEdics) * 100) + "%" : "-";
		// Obtener la cantidad de penalizaciones con días
		let cantPenalizConDias = rechazados.length ? rechazados.filter((n) => n.duracion).length : "-";
		// Obtener la cantidad de días penalizados
		let diasPenalizacion = rechazados.length ? rechazados.reduce((suma, n) => suma + n.duracion, 0) : "-";
		// Datos a enviar
		let enviar = {
			calidadEdiciones: ["Calidad Edición", calidadInputs],
			cantEdiciones: ["Cant. Campos Proces.", cantEdics],
			cantPenalizConDias: ["Cant. Penaliz. c/Días", cantPenalizConDias],
			diasPenalizacion: ["Días Penalizado", diasPenalizacion],
		};
		// Fin
		return enviar;
	},
	// Controladora/Usuario/Login
	actualizarElContadorDeLogins: (usuario) => {
		let hoyAhora = especificas.ahora().toISOString().slice(0, 10);
		let hoyUsuario = usuario.fecha_ultimo_login;
		//new Date(usuario.fecha_ultimo_login).toISOString().slice(0, 10);
		if (hoyAhora != hoyUsuario) {
			BD_genericas.aumentarElValorDeUnCampo("usuarios", usuario.id, "dias_login");
			BD_genericas.actualizarPorId("usuarios", usuario.id, {fecha_ultimo_login: hoyAhora});
		}
		return;
	},
	cambiarleElStatusALosCapitulos: () => {
		return;
	},
};
