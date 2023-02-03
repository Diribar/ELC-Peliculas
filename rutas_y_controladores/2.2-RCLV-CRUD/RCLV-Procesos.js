"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	resumen: async (RCLV, cantProdsEnBD) => {
		// Variable fecha
		let diaDelAno = await BD_genericas.obtienePorId("dias_del_ano", RCLV.dia_del_ano_id);
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

		// Comienza a armar el resumen
		let resumenRCLV = [{titulo: "Nombre", valor: RCLV.nombre}];
		if (RCLV.apodo) resumenRCLV.push({titulo: "Alternativo", valor: RCLV.apodo});
		resumenRCLV.push({titulo: "Día del año", valor: fecha});
		if (RCLV.entidad == "personajes" && RCLV.categoria_id == "CFC")
			resumenRCLV.push(
				{titulo: "Proceso Canonizac.", valor: comp.valorNombre(RCLV.proc_canon, "Ninguno")},
				{titulo: "Rol en la Iglesia", valor: comp.valorNombre(RCLV.rol_iglesia, "Ninguno")},
				{titulo: "Aparición Mariana", valor: comp.valorNombre(RCLV.ap_mar, "Ninguno")}
			);
		// Datos del registro
		let valorNombreApellido = (valor) => {
			return valor ? valor.nombre + " " + valor.apellido : "Ninguno";
		};
		let resumenRegistro = [];
		resumenRegistro.push(
			{titulo: "Registro creado por", valor: valorNombreApellido(RCLV.creado_por)},
			{titulo: "Registro creado en", valor: comp.fechaTexto(RCLV.creado_en)},
			{titulo: "Alta analizada por", valor: valorNombreApellido(RCLV.alta_analizada_por)},
			{titulo: "Última actualizac.", valor: ultimaActualizacion},
			{titulo: "Productos en BD", valor: cantProdsEnBD},
			{titulo: "Status del registro", valor: statusResumido.nombre, id: statusResumido.id}
		);
		// Fin
		return {resumenRCLV, resumenRegistro};
	},
	prodsEnBD: async function (RCLV, userID) {
		// Función
		let convierteEdicPropiasDeProdsEnProds = async () => {
			// Obtiene las ediciones propias
			let edicionesPropias = [];
			for (let edicion of RCLV.prods_edicion)
				if (edicion.editado_por_id == userID) edicionesPropias.push(edicion);
			if (edicionesPropias.length)
				edicionesPropias = edicionesPropias.filter((n) => n.editado_por_id == userID);
			// Configura la variable de productos
			let productos = {};
			for (let entidad of variables.entidadesProd) productos[entidad] = [];

			// Si no hay ediciones propias, termina la función
			if (!edicionesPropias.length) return productos;

			// Obtiene los productos de esas ediciones
			for (let edicion of edicionesPropias) {
				// Obtiene la entidad y el campo 'entidad_id'
				let entidad = comp.obtieneProdDesdeEntidad_id(edicion);
				let entidad_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
				// Obtiene los registros del producto original y su edición por el usuario
				let [prodOrig, prodEdic] = await procsCRUD.obtieneVersionesDelRegistro(
					entidad,
					edicion[entidad_id],
					userID,
					"prods_edicion",
					"productos"
				);
				// Pule la edición y actualiza la variable del registro original
				[prodEdic] = await procsCRUD.puleEdicion(prodOrig, prodEdic, "productos");
				let producto = {...prodOrig, ...prodEdic};
				// Fin
				productos[entidad].push(producto);
			}

			// Combina los productos originales con los productos de las ediciones
			for (let entidad of variables.entidadesProd) RCLV[entidad].push(...productos[entidad]);
			delete RCLV.prods_edicion;
			// Fin
			return RCLV;
		};
		// Convierte las ediciones en productos
		if (RCLV.prods_edicion.length && userID) RCLV = await convierteEdicPropiasDeProdsEnProds();
		// Completa la información de cada producto
		let prodsEnBD = [];
		variables.entidadesProd.forEach((entidad) => {
			let aux = RCLV[entidad].map((registro) => {
				// Averigua la ruta y el nombre del avatar
				let avatar = procsCRUD.avatarOrigEdic(registro).edic;
				// Agrega la entidad, el avatar, y el nombre de la entidad
				return {...registro, entidad, avatar, prodNombre: comp.obtieneEntidadNombre(entidad)};
			});
			prodsEnBD.push(...aux);
		});
		// Separa entre colecciones y resto
		let colecciones = prodsEnBD.filter((n) => n.entidad == "colecciones");
		let noColecciones = prodsEnBD.filter((n) => n.entidad != "colecciones");
		// Elimina capitulos si las colecciones están presentes
		let coleccionesId = colecciones.map((n) => n.id);
		for (let i = noColecciones.length - 1; i >= 0; i--)
			if (coleccionesId.includes(noColecciones[i].coleccion_id)) noColecciones.splice(i, 1);
		// Ordenar por año (decreciente)
		prodsEnBD = [...colecciones, ...noColecciones];
		prodsEnBD.sort((a, b) =>
			a.ano_estreno > b.ano_estreno ? -1 : a.ano_estreno < b.ano_estreno ? 1 : 0
		);
		// Fin
		return prodsEnBD;
	},
	procCanoniz: async (RCLV) => {
		// Variables
		let procCanoniz = "";
		// Averigua si el RCLV tiene algún "proceso de canonización"
		if (RCLV.proceso_id) {
			// Obtiene los procesos de canonización
			let proceso = await BD_genericas.obtieneTodos("procs_canon", "orden").then((n) =>
				n.find((m) => m.id == RCLV.proceso_id)
			);
			// Asigna el nombre del proceso
			procCanoniz = proceso.nombre + " ";
			// Verificación si el nombre del proceso es "Santo" (varón)
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
	guardaLosCambios: async (req, res, DE) => {
		// Variables
		let entidad = req.query.entidad;
		let origen = req.query.origen;
		let userID = req.session.usuario.id;
		const codigo = req.baseUrl + req.path;
		// Tareas
		if (codigo == "/rclv/agregar/") {
			// Guarda el nuevo registro
			let id = await comp.creaRegistro({entidad, datos: DE, userID});
			// Agrega el RCLV a DP/ED
			let entidad_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
			if (origen == "DA") {
				req.session.datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;
				req.session.datosAdics = {...req.session.datosAdics, [entidad_id]: id};
				res.cookie("datosAdics", req.session.datosAdics, {maxAge: unDia});
			} else if (origen == "ED") {
				req.session.edicProd = req.session.edicProd ? req.session.edicProd : req.cookies.edicProd;
				req.session.edicProd = {...req.session.edicProd, [entidad_id]: id};
				res.cookie("edicProd", req.session.edicProd, {maxAge: unDia});
			}
		} else if (codigo == "/rclv/edicion/") {
			// Obtiene el registro original
			let id = req.query.id;
			let RCLV_original = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");
			// Actualiza el registro o crea una edición
			RCLV_original.creado_por_id == userID && RCLV_original.status_registro.creado // ¿Registro propio en status creado?
				? await comp.actualizaRegistro({entidad, id, datos: DE}) // Actualiza el registro original
				: await procsCRUD.guardaEdicion({
						entidadOrig: entidad,
						entidadEdic: "rclvs_edicion",
						original: RCLV_original,
						edicion: DE,
						userID,
				  }); // Guarda la edición
		} else if (codigo == "/revision/rclv/alta/") {
			// Obtiene el registro original
			let id = req.query.id;
			// Actualiza el registro o crea una edición
			await comp.actualizaRegistro({entidad, id, datos: DE}); // Actualizar el registro original
		}
		// Borra el RCLV en session y cookies
		if (req.session[entidad]) delete req.session[entidad];
		if (req.cookies[entidad]) res.clearCookie(entidad);
		// Fin
		return [req,res];
	},
	rutaSalir: (codigo, datos) => {
		// Variables
		let rutaSalir;
		// Obtiene la ruta
		if (codigo == "agregar") {
			// Desde vista 'agregar' no hace falta inactivar => vuelve al origen
			let rutaOrigen =
				datos.origen == "DA"
					? "/producto/agregar/datos-adicionales"
					: datos.origen == "ED"
					? "/producto/edicion/"
					: "/";
			let entidadIdOrigen =
				datos.origen && datos.origen != "DA"
					? "?entidad=" + datos.prodEntidad + "&id=" + datos.prodID
					: "";
			rutaSalir = rutaOrigen + entidadIdOrigen;
		} else {
			// Desde vista distinta a 'agregar' hace falta inactivar
			// La vista actual puede ser '/rclv/edicion' o '/revisar/rclv/alta'
			let entidadIdActual = "?entidad=" + datos.entidad + "&id=" + datos.id;
			let entidadIdOrigen =
				datos.origen && datos.origen != "DA"
					? "&prodEntidad=" + datos.prodEntidad + "&prodID=" + datos.prodID
					: ""; // Sería para '/revision/tablero' y '/producto/agregar/DP'
			let origen = "&origen=" + (!datos.origen ? "tableroEnts" : datos.origen);
			// rutaSalir
			rutaSalir = "/inactivar-captura/" + entidadIdActual + entidadIdOrigen + origen;
		}
		// Fin
		return rutaSalir;
	},
	procesaLosDatos: async (datos) => {
		// Variables
		let DE = {};
		// Asigna el valor 'null' a todos los campos
		for (let campo of variables.camposRCLV[datos.entidad]) DE[campo] = null;
		// Nombre
		DE.nombre = datos.nombre;
		// Día del año
		if (!datos.desconocida)
			DE.dia_del_ano_id = await BD_genericas.obtieneTodos("dias_del_ano", "id")
				.then((n) => n.find((m) => m.mes_id == datos.mes_id && m.dia == datos.dia))
				.then((n) => n.id);
		// Año
		if (datos.entidad != "valores" && datos.ano) DE.ano = datos.ano;
		// Datos para personajes
		if (datos.entidad == "personajes") {
			// Datos sencillos
			if (datos.apodo) DE.apodo = datos.apodo;
			DE.sexo_id = datos.sexo_id;
			DE.categoria_id = datos.categoria_id;
			// RCLI
			if (datos.categoria_id == "CFC") {
				// Datos sencillos
				DE.rol_iglesia_id = datos.rol_iglesia_id;
				if (datos.enProcCan == "1") DE.proceso_id = datos.proceso_id;
				if (datos.ama == "1") DE.ap_mar_id = datos.ap_mar_id;
				// subcategoria_id
				let santoBeato = datos.proceso_id.startsWith("ST") || datos.proceso_id.startsWith("BT");
				if (datos.cnt == "1") DE.subcategoria_id = "CNT";
				else if (datos.enProcCan == "1" && santoBeato) DE.subcategoria_id = "HAG";
			}
		}
		if (datos.entidad == "hechos") {
			// Variables
			let {solo_cfc, jss, cnt, ncn, ama} = datos;
			// Datos sencillos
			DE.solo_cfc = solo_cfc;
			DE.jss = jss;
			// cnt
			if (DE.jss == "1") DE.cnt = "1";
			else DE.cnt = cnt;
			// ncn
			if (DE.cnt == "0") DE.ncn = "1";
			else DE.ncn = ncn;
			// ama
			if (solo_cfc == "1" && DE.ncn == "1") DE.ama = ama;
		}
		return DE;
	},
};
