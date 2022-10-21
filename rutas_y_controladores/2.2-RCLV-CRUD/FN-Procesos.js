"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const buscar_x_PC = require("../../funciones/3-Procesos/Buscar_x_PC");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	resumen: async (RCLV, cantProdsEnBD) => {
		// Variable fecha
		let diaDelAno = await BD_genericas.obtenerPorId("dias_del_ano", RCLV.dia_del_ano_id);
		let dia = diaDelAno.dia;
		let mes = mesesAbrev[diaDelAno.mes_id - 1];
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
		if (RCLV.apodo) resumen.push({titulo: "Alternativo", valor: RCLV.apodo});
		resumen.push({titulo: "Día del año", valor: fecha});
		if (RCLV.entidad == "personajes" && RCLV.categoria_id == "CFC")
			resumen.push(
				{titulo: "Proceso Canonizac.", valor: comp.valorNombre(RCLV.proc_canoniz, "Ninguno")},
				{titulo: "Rol en la Iglesia", valor: comp.valorNombre(RCLV.rol_iglesia, "Ninguno")},
				{titulo: "Aparición Mariana", valor: comp.valorNombre(RCLV.ap_mar, "Ninguno")}
			);
		let valorNombreApellido = (valor) => {
			return valor ? valor.nombre + " " + valor.apellido : "Ninguno";
		};
		resumen.push(
			{titulo: "Registro creado por", valor: valorNombreApellido(RCLV.creado_por)},
			{titulo: "Registro creado en", valor: comp.fechaTexto(RCLV.creado_en)},
			{titulo: "Alta analizada por", valor: valorNombreApellido(RCLV.alta_analizada_por)},
			{titulo: "Última actualizac.", valor: ultimaActualizacion},
			{titulo: "Productos en BD", valor: cantProdsEnBD},
			{titulo: "Status del registro", valor: statusResumido.nombre, id: statusResumido.id}
		);
		// Fin
		return resumen;
	},
	prodsYaEnBD: (entProductos, RCLV) => {
		// Variables
		let prodsYaEnBD = [];
		// Completar la información de cada registro
		entProductos.forEach((entidad) => {
			let aux = RCLV[entidad].map((n) => {
				let avatar = n.avatar.includes("/")
					? n.avatar
					: "/imagenes/" + (!n.avatar ? "8-Agregar/IM.jpg" : "3-Productos/" + n.avatar);
				return {...n, entidad, avatar, prodNombre: comp.obtenerEntidadNombre(entidad)};
			});
			prodsYaEnBD.push(...aux);
		});
		// Ordenar por año (decreciente)
		prodsYaEnBD.sort((a, b) =>
			a.ano_estreno > b.ano_estreno ? -1 : a.ano_estreno < b.ano_estreno ? 1 : 0
		);
		// Separa entre colecciones y resto
		let colecciones = prodsYaEnBD.filter((n) => n.entidad == "colecciones");
		let noColecciones = prodsYaEnBD.filter((n) => n.entidad != "colecciones");
		// Elimina capitulos si las colecciones están presentes
		let coleccionesId = colecciones.map((n) => n.id);
		for (let i = noColecciones.length - 1; i >= 0; i--)
			if (coleccionesId.includes(noColecciones[i].coleccion_id)) noColecciones.splice(i, 1);
		// Fin
		prodsYaEnBD = [...colecciones, ...noColecciones];
		return prodsYaEnBD;
	},
	prodsNuevos: async (RCLV) => {
		// Obtener los Productos Nuevos
		let prodsNuevos = await buscar_x_PC
			.search(RCLV.nombre, false)
			.then((n) => n.resultados)
			.then((n) => n.filter((m) => !m.YaEnBD));
		// Si el RCLV tiene apodo...
		if (RCLV.apodo && RCLV.apodo != RCLV.nombre) {
			// Buscar también por apodo
			prodsNuevos.push(
				...(await buscar_x_PC
					.search(RCLV.apodo, false)
					.then((n) => n.resultados)
					.then((n) => n.filter((m) => !m.YaEnBD)))
			);
			// Eliminar duplicados
			let aux = [];
			prodsNuevos.forEach((prod) => {
				if (aux.findIndex((n) => n.entidad == prod.entidad && n.TMDB_id == prod.TMDB_id) == -1)
					aux.push(prod);
			});
			prodsNuevos = aux;
		}
		// Ordenar por año (decreciente)
		prodsNuevos.sort((a, b) =>
			a.ano_estreno > b.ano_estreno ? -1 : a.ano_estreno < b.ano_estreno ? 1 : 0
		);
		// Separa entre colecciones y resto
		let colecciones = prodsNuevos.filter((n) => n.entidad == "colecciones");
		let noColecciones = prodsNuevos.filter((n) => n.entidad != "colecciones");
		// Fin
		prodsNuevos = [...colecciones, ...noColecciones];
		return prodsNuevos;
	},
	procCanoniz: async (RCLV) => {
		// Variables
		let procCanoniz = "";
		// Averigua si el RCLV tiene algún "proceso de canonización"
		if (RCLV.proceso_id) {
			// Obtiene los procesos de canonización
			let proceso = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden").then((n) =>
				n.find((m) => m.id == RCLV.proceso_id)
			);
			// Asigna el nombre del proceso
			procCanoniz = proceso.nombre + " ";
			// Verificación si el nombre del proceso es "Santo"
			if (RCLV.proceso_id == "STV") {
				// Nombres que llevan el prefijo "Santo"
				let nombresEspeciales = ["Domingo", "Tomás", "Tomé", "Toribio"];
				// Obtiene el primer nombre del RCLV
				let nombre = RCLV.nombre;
				nombre = nombre.includes(" ") ? nombre.slice(0, nombre.indexOf(" ")) : nombre;
				// Si el primer nombre no es "especial", cambia el prefijo por "San"
				if (!nombresEspeciales.includes(nombre)) procCanoniz = "San ";
			}
		}
		// Fin
		return procCanoniz;
	},
	DE: async (datos) => {
		// Variables
		let DE = {};
		// Estandarizar los campos como 'null'
		variables.camposRCLV()[datos.entidad].forEach((campo) => {
			DE[campo] = null;
		});
		// Nombre
		DE.nombre = datos.nombre;
		// Día del año
		if (!datos.desconocida)
			DE.dia_del_ano_id = await BD_genericas.obtenerTodos("dias_del_ano", "id")
				.then((n) => n.find((m) => m.mes_id == datos.mes_id && m.dia == datos.dia))
				.then((n) => n.id);
		// Año
		if (datos.entidad != "valores") DE.ano = datos.ano;
		// Datos para personajes
		if (datos.entidad == "personajes") {
			// Datos sencillos
			DE.apodo = datos.apodo;
			DE.sexo_id = datos.sexo_id;
			DE.categoria_id = datos.categoria_id;
			if (datos.categoria_id == "CFC") {
				// subcategoria_id
				let santo_beato =
					datos.enProcCan == "1" &&
					(datos.proceso_id.startsWith("ST") || datos.proceso_id.startsWith("BT"));
				DE.subcategoria_id =
					datos.jss == "1" ? "JSS" : datos.cnt == "1" ? "CNT" : santo_beato ? "HAG" : "HIG";
				// Otros
				if (datos.enProcCan == "1") DE.proceso_id = datos.proceso_id;
				if (datos.ap_mar == "1") DE.ap_mar_id = datos.ap_mar_id;
				DE.rol_iglesia_id = datos.rol_iglesia_id;
			}
		}
		if (datos.entidad == "hechos") {
			DE.hasta = datos.hasta;
			DE.solo_cfc = datos.solo_cfc;
			if (datos.solo_cfc == "1") {
				DE.jss = datos.ano > 33 || datos.hasta < 0 ? 0 : 1;
				DE.cnt = datos.ano > 100 || datos.hasta < 0 ? 0 : 1;
				DE.exclusivo = datos.ano >= 0 || datos.hasta <= 100 ? 1 : 0;
				DE.ap_mar = datos.ap_mar;
			}
		}
		return DE;
	},
	guardarCambios: async (req, res, DE) => {
		// Variables
		let entidad = req.query.entidad;
		let origen = req.query.origen;
		let userID = req.session.usuario.id;
		const codigo = req.path.slice(1, -1);
		// Tareas
		if (codigo == "agregar") {
			// Guarda el nuevo registro
			let id = await comp.crear_registro(entidad, DE, userID);
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
			let id = req.query.id;
			let RCLV_original = await BD_genericas.obtenerPorIdConInclude(entidad, id, "status_registro");
			// Actualiza el registro o crea una edición
			RCLV_original.creado_por_id == userID && RCLV_original.status_registro.creado // ¿Registro propio en status creado?
				? await comp.actualizar_registro(entidad, id, DE) // Actualizar el registro original
				: await comp.guardar_edicion(entidad, "rclvs_edicion", RCLV_original, DE, userID); // Guarda la edición
		}
		// Borrar session y cookies de RCLV
		if (req.session[entidad]) delete req.session[entidad];
		if (req.cookies[entidad]) res.clearCookie(entidad);
		// Fin
		return;
	},
};
