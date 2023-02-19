"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	bloqueDerecha: async (RCLV, cantProds) => {
		// Variable fecha
		let diaDelAno = dias_del_ano.find((n) => n.id == RCLV.dia_del_ano_id);
		let fecha = diaDelAno ? diaDelAno.dia + "/" + diaDelAno.mes.abrev : "Sin fecha o varias";
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
			{titulo: "Productos en BD", valor: cantProds},
			{titulo: "Status del registro", valor: statusResumido.nombre, id: statusResumido.id}
		);
		// Fin
		return {resumenRCLV, resumenRegistro};
	},
	prodsDelRCLV: async function (RCLV, userID) {
		// Convierte las ediciones propias de productos en productos
		if (userID) {
			// Obtiene las ediciones propias
			let edicionesPropias = RCLV.prods_edicion ? RCLV.prods_edicion.filter((n) => n.editado_por_id == userID) : [];

			// Configura RCLV
			for (let entidad of variables.entidadesProd) if (!RCLV[entidad]) RCLV[entidad] = [];

			// Acciones si hay ediciones propias
			if (edicionesPropias.length) {
				// Obtiene los productos de esas ediciones
				for (let edicion of edicionesPropias) {
					// Obtiene la entidad con la que está asociada la edición del RCLV, y su campo 'producto_id'
					let entProd = comp.obtieneProdDesdeProducto_id(edicion);
					let producto_id = comp.obtieneEntidad_idDesdeEntidad(entProd);
					let entID = edicion[producto_id];
					// Obtiene los registros del producto original y su edición por el usuario
					let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(entProd, entID, userID);
					// Actualiza la variable del registro original
					let producto = {...prodOrig, ...prodEdic, id: prodOrig.id};
					// Fin
					RCLV[entProd].push(producto);
				}
			}
		}
		// Completa la información de cada tipo de producto y une los productos en una sola array
		let prodsDelRCLV = [];
		for (let entidad of variables.entidadesProd) {
			// Completa la información de cada producto dentro del tipo de producto
			let aux = RCLV[entidad].map((registro) => {
				// Averigua la ruta y el nombre del avatar
				let avatar = procsCRUD.avatarOrigEdic(registro).edic;
				// Agrega la entidad, el avatar, y el nombre de la entidad
				return {...registro, entidad, avatar, prodNombre: comp.obtieneEntidadNombre(entidad)};
			});
			prodsDelRCLV.push(...aux);
		}
		// Separa entre colecciones y resto
		let capitulos = prodsDelRCLV.filter((n) => n.entidad == "capitulos");
		let noCapitulos = prodsDelRCLV.filter((n) => n.entidad != "capitulos");
		// Elimina capitulos si las colecciones están presentes
		let colecciones = prodsDelRCLV.filter((n) => n.entidad == "colecciones");
		let coleccionesId = colecciones.map((n) => n.id);
		for (let i = capitulos.length - 1; i >= 0; i--)
			if (coleccionesId.includes(capitulos[i].coleccion_id)) capitulos.splice(i, 1);
		// Ordena por año (decreciente)
		prodsDelRCLV = [...capitulos, ...noCapitulos];
		prodsDelRCLV.sort((a, b) => (a.ano_estreno > b.ano_estreno ? -1 : a.ano_estreno < b.ano_estreno ? 1 : 0));
		// Fin
		return prodsDelRCLV;
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
		// Tareas para un nuevo registro
		if (codigo == "/rclv/agregar/") {
			// Guarda el nuevo registro
			DE.creado_por_id = userID;
			let id = await BD_genericas.agregaRegistro(entidad, DE).then((n) => n.id);
			// Les agrega el 'rclv_id' a session y cookie de origen
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
		}
		// Tareas para edición
		else if (codigo == "/rclv/edicion/") {
			// Obtiene el registro original
			let id = req.query.id;
			let original = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");
			// Actualiza el registro o crea una edición
			original.creado_por_id == userID && original.status_registro.creado // ¿Registro propio y en status creado?
				? await BD_genericas.actualizaPorId(entidad, id, DE) // Actualiza el registro original
				: await procsCRUD.guardaActEdicCRUD({original, edicion: DE, entidad, userID}); // Guarda la edición
		}
		// Fin
		return;
	},
	procesaLosDatos: (datos) => {
		// Variables
		let DE = {};
		// Asigna el valor 'null' a todos los campos
		for (let campo of variables.camposRCLV[datos.entidad]) DE[campo] = null;
		// Datos comunes - Nombre
		DE.nombre = datos.nombre;
		// Datos comunes - Día del año
		if (datos.mes_id && datos.dia)
			DE.dia_del_ano_id = dias_del_ano.find((n) => n.mes_id == datos.mes_id && n.dia == datos.dia).id;
		else if (datos.desconocida) DE.dia_del_ano_id = 400; // Si marcó 'sin fecha conocida', pone el año genérico
		else DE.dia_del_ano_id = 401; // Si pasó algo raro, pone otra fecha genérica
		// Datos para personajes
		if (datos.entidad == "personajes") {
			DE.apodo = datos.apodo ? datos.apodo : "";
			DE.sexo_id = datos.sexo_id;
			DE.epoca_id = datos.epoca_id;
			DE.ano = datos.epoca_id == "pst" ? datos.ano : 0;
			// RCLI
			DE.categoria_id = datos.categoria_id;
			let CFC = datos.categoria_id == "CFC";
			DE.rol_iglesia_id = CFC ? datos.rol_iglesia_id : "NN" + datos.sexo_id;
			DE.proceso_id = CFC ? datos.proceso_id : "NN" + datos.sexo_id;
			DE.ap_mar_id = CFC && datos.epoca_id == "pst" && parseInt(datos.ano) > 1100 ? datos.ap_mar_id : 2;
		}
		// Datos para hechos
		if (datos.entidad == "hechos") {
			// Variables
			let {ant, jss, cnt, pst, ano, solo_cfc, ama} = datos;
			// Época
			DE.ant = ant ? 1 : 0;
			DE.jss = jss ? 1 : 0;
			DE.cnt = cnt ? 1 : 0;
			DE.pst = pst ? 1 : 0;
			DE.ano = !ant && !jss && !cnt && pst ? ano : 0;
			// RCLIC
			DE.solo_cfc = solo_cfc;
			DE.ama = solo_cfc == "1" ? ama : 0;
		}
		// Fin
		return DE;
	},
};
