"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const buscar_x_PC = require("../../funciones/3-Procesos/Buscar_x_PC");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const validar = require("./FN-Validar");

module.exports = {
	altaEdicForm: async (req, res) => {
		// Puede venir de agregarProd o edicionProd
		// 1. Tema y Código
		const tema = "rclv_crud";
		let url = req.url.slice(1);
		const codigo = url.slice(0, url.indexOf("/"));
		// 2. Variables
		let entidad = req.query.entidad;
		let meses = await BD_genericas.obtenerTodos("meses", "id");
		let dataEntry = req.session[entidad]
			? req.session[entidad]
			: req.cookies[entidad]
			? req.cookies[entidad]
			: {};
		let nombre = comp.obtenerEntidadNombre(entidad);
		let titulo = (codigo == "agregar" ? "Agregar - " : "Edición - ") + nombre;
		let tituloCuerpo =
			(codigo == "agregar" ? "Agregá un " + nombre + " a" : "Editá el " + nombre + " de") +
			" nuestra Base de Datos";
		// 3. Variables específicas para personajes
		if (entidad == "personajes") {
			var procesos_canonizacion = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden");
			procesos_canonizacion = procesos_canonizacion.filter((m) => m.id.length == 3);
			var roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
			var apariciones_marianas = await BD_genericas.obtenerTodos("hechos", "nombre");
			apariciones_marianas = apariciones_marianas.filter((n) => n.ap_mar);
		}
		// 4. Pasos exclusivos para edición
		if (codigo == "edicion") {
			let id = req.query.id;
			let includes = entidad == "personajes" ? "rol_iglesia" : "";
			dataEntry = await BD_genericas.obtenerPorIdConInclude(entidad, id, includes); // Pisa el data entry de session
			if (dataEntry.dia_del_ano_id) {
				let dia_del_ano = await BD_genericas.obtenerTodos("dias_del_ano", "id").then((n) =>
					n.find((m) => m.id == dataEntry.dia_del_ano_id)
				);
				dataEntry.dia = dia_del_ano.dia;
				dataEntry.mes_id = dia_del_ano.mes_id;
			}
		}
		// 5. Ir a la vista
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			entidad: entidad,
			titulo,
			tituloCuerpo,
			dataEntry,
			meses,
			roles_iglesia,
			procesos_canonizacion,
			apariciones_marianas,
		});
	},

	altaEdicGrabar: async (req, res) => {
		// Puede venir de agregarProd o edicionProd
		// 1. Obtener los datos
		let {entidad, id, origen, prodEntidad, prodID} = req.query;
		let datos = {...req.body, ...req.query};
		let userID = req.session.usuario.id;
		// return res.send(datos)
		// 2. Averiguar si hay errores de validación y tomar acciones
		let errores = await validar.consolidado(datos);
		if (errores.hay) {
			req.session[entidad] = datos;
			res.cookie(entidad, datos, {maxAge: unDia});
			return res.redirect(req.originalUrl);
		}
		// 3. Obtener el día del año
		if (!datos.desconocida)
			datos.dia_del_ano_id = await BD_genericas.obtenerTodos("dias_del_ano", "id")
				.then((n) => n.find((m) => m.mes_id == datos.mes_id && m.dia == datos.dia))
				.then((n) => n.id);
		// 4. Datos para personajes
		if (entidad == "personajes") {
			if (datos.categoria_id == "CFC") {
				let santo_beato = datos.proceso_id.startsWith("ST") || datos.proceso_id.startsWith("BT");
				datos = {
					...datos,
					subcategoria_id:
						datos.jss == "1" ? "JSS" : datos.cnt == "1" ? "CNT" : santo_beato ? "HAG" : null,
					ap_mar_id: datos.ap_mar_id != "" ? datos.ap_mar_id : null,
				};
			}
			if (datos.proceso_id === "") datos.proceso_id = null;
			if (datos.rol_iglesia_id === "") datos.rol_iglesia_id = null;
			if (datos.ap_mar_id === "") datos.ap_mar_id = null;
		}
		// Limpiar los datos de información irrelevante
		let camposUtiles = variables.camposRCLV()[entidad];
		for (let campo in datos) if (!camposUtiles.includes(campo)) delete datos[campo];
		// Preparar la información a guardar
		let url = req.url.slice(1);
		const codigo = url.slice(0, url.indexOf("/"));
		// Guardar los cambios del RCLV
		if (codigo == "agregar") {
			id = await comp.crear_registro(entidad, datos, userID);
			// Agregar el RCLV a DP/ED
			let entidad_id = comp.obtenerEntidad_id(entidad);
			if (origen == "DP") {
				req.session.datosPers = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
				req.session.datosPers = {...req.session.datosPers, [entidad_id]: id};
				res.cookie("datosPers", req.session.datosPers, {maxAge: unDia});
			} else if (origen == "ED") {
				req.session.edicProd = req.session.edicProd ? req.session.edicProd : req.cookies.edicProd;
				req.session.edicProd = {...req.session.edicProd, [entidad_id]: id};
				res.cookie("edicProd", req.session.edicProd, {maxAge: unDia});
			}
		} else if (codigo == "edicion") {
			// Obtener el registro original
			let RCLV_original = await BD_genericas.obtenerPorIdConInclude(entidad, id, "status_registro");
			let RCLV_editado = datos;
			// Obtener el mensaje de la tarea realizada
			RCLV_original.creado_por_id == userID && RCLV_original.status_registro.creado // ¿Registro propio en status creado?
				? await comp.actualizar_registro(entidad, id, RCLV_editado) // Actualizar el registro original
				: await comp.guardar_edicion(entidad, "rclvs_edicion", RCLV_original, RCLV_editado, userID); // Guarda la edición
		}
		// 8. Borrar session y cookies de RCLV
		if (req.session[entidad]) delete req.session[entidad];
		if (req.cookies[entidad]) res.clearCookie(entidad);
		// 9. Redireccionar a la siguiente instancia
		let destino =
			origen == "DP"
				? "/producto/agregar/datos-personalizados"
				: origen == "ED"
				? "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID
				: origen == "DT"
				? "/producto/detalle/?entidad=" + prodEntidad + "&id=" + prodID
				: "/";
		return res.redirect(destino);
	},

	detalle: async (req, res) => {
		// 1. Tema y Código
		const tema = "rclv_crud";
		const codigo = "detalle";
		// 2. Variables
		let entidad = req.query.entidad;
		let RCLV_id = req.query.id;
		let nombre = comp.obtenerEntidadNombre(entidad);
		// Obtener RCLV con produtos
		let entProductos = ["peliculas", "colecciones", "capitulos"];
		let includes = [...entProductos, "status_registro", "creado_por", "alta_analizada_por"];
		if (entidad == "personajes") includes.push("ap_mar", "proc_canoniz", "rol_iglesia");
		let RCLV = await BD_genericas.obtenerPorIdConInclude(entidad, RCLV_id, includes);
		// Bloque Izquierda
		let prodsYaEnBD = [];
		entProductos.forEach((entidad) => {
			let aux = RCLV[entidad].map((n) => {
				let avatar = n.avatar.includes("/")
					? n.avatar
					: "/imagenes/" + (!n.avatar ? "8-Agregar/IM.jpg" : "3-Productos/" + n.avatar);
				return {...n, entidad, avatar, prodNombre: comp.obtenerEntidadNombre(entidad)};
			});
			prodsYaEnBD.push(...aux);
		});
		prodsYaEnBD.sort((a, b) =>
			a.ano_estreno > b.ano_estreno ? -1 : a.ano_estreno < b.ano_estreno ? 1 : 0
		);
		prodsYaEnBD = [
			...prodsYaEnBD.filter((n) => n.entidad == "colecciones"),
			...prodsYaEnBD.filter((n) => n.entidad != "colecciones"),
		];
		let prodsNuevos = await buscar_x_PC
			.search(RCLV.nombre, false)
			.then((n) => n.resultados)
			.then((n) => n.filter((m) => !m.YaEnBD));
		if ((entidad == "personajes" && RCLV.apodo != RCLV.nombre) || true) {
			prodsNuevos.push(
				...(await buscar_x_PC
					.search(RCLV.apodo, true)
					.then((n) => n.resultados)
					.then((n) => n.filter((m) => !m.YaEnBD)))
			);
			let aux = [];
			prodsNuevos.forEach((prod) => {
				if (aux.findIndex((n) => n.entidad == prod.entidad && n.TMDB_id == prod.TMDB_id) == -1)
					aux.push(prod);
			});
			prodsNuevos = aux;
		}
		//return res.send(prodsNuevos);

		// Bloque Derecha
		let resumen = await funcionResumen({...RCLV, entidad});
		// 5. Ir a la vista
		//return res.send(prodsYaEnBD);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Detalle de " + nombre,
			resumen,
			omitirImagenDerecha: true,
			prodsYaEnBD,
			prodsNuevos,
		});
	},
};

// Funcion
let valorNombreApellido = (valor) => {
	return valor ? valor.nombre + " " + valor.apellido : "Ninguno";
};
let funcionResumen = async (RCLV) => {
	// Variable fecha
	let diaDelAno = await BD_genericas.obtenerPorId("dias_del_ano", RCLV.dia_del_ano_id);
	let dia = diaDelAno.dia;
	let mes = meses[diaDelAno.mes_id - 1];
	let fecha = dia + "/" + mes;
	// Variable ultimaActualizacion
	let fechas = [RCLV.creado_en, RCLV.alta_analizada_en, RCLV.editado_en];
	fechas.push(RCLV.edic_analizada_en, RCLV.sugerido_en);
	let ultimaActualizacion = comp.fechaTexto(new Date(Math.max(...fechas)));
	// Variable status
	let creado = RCLV.status_registro.gr_creado;
	let aprobado = RCLV.status_registro.aprobado;
	let statusResumido = creado
		? {id: 1, nombre: "Pend. Aprobac."}
		: aprobado
		? {id: 2, nombre: "Aprobado"}
		: {id: 3, nombre: "Inactivado"};

	// Comenzar a armar el resumen
	let resumen = [{titulo: "Nombre", valor: RCLV.nombre}];
	if (RCLV.apodo) resumen.push({titulo: "Apodo", valor: RCLV.apodo});
	resumen.push({titulo: "Día del año", valor: fecha});
	if (RCLV.entidad == "personajes" && RCLV.categoria_id == "CFC")
		resumen.push(
			{titulo: "Proceso Canonizac.", valor: comp.valorNombre(RCLV.proc_canoniz, "Ninguno")},
			{titulo: "Rol en la Iglesia", valor: comp.valorNombre(RCLV.rol_iglesia, "Ninguno")},
			{titulo: "Aparición Mariana", valor: comp.valorNombre(RCLV.ap_mar, "Ninguno")}
		);
	resumen.push(
		{titulo: "Registro creado por", valor: valorNombreApellido(RCLV.creado_por)},
		{titulo: "Registro creado en", valor: comp.fechaTexto(RCLV.creado_en)},
		{titulo: "Alta analizada por", valor: valorNombreApellido(RCLV.alta_analizada_por)},
		{titulo: "Última actualizac.", valor: ultimaActualizacion},
		{titulo: "Status del registro", valor: statusResumido.nombre, id: statusResumido.id}
	);
	// Fin
	return resumen;
};
