"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

// Exportar ------------------------------------
module.exports = {
	// Soporte para lectura y guardado de edición
	puleEdicion: async (entidad, original, edicion) => {
		// Variables
		const familia = comp.obtieneFamiliaEnPlural(entidad);
		const nombreEdicion = comp.obtieneNombreEdicionDesdeEntidad(entidad);
		const edicion_id = edicion.id;
		let camposNull = {};

		// 1. Quita de edición los campos que no se comparan
		(() => {
			// Obtiene los campos a comparar
			let camposRevisar = [];
			for (let campo of variables.camposRevisar[familia]) {
				camposRevisar.push(campo.nombre);
				if (campo.relacInclude) camposRevisar.push(campo.relacInclude);
			}
			// Quita de edicion los campos que no se comparan
			for (let campo in edicion) if (!camposRevisar.includes(campo)) delete edicion[campo];
		})();

		// 2. Quita de edición las coincidencias con el original
		for (let campo in edicion) {
			// Corrige errores de data-entry
			if (typeof edicion[campo] == "string") edicion[campo] = edicion[campo].trim();

			// CONDICION 1: La edición no es 'null'
			let condicion1 = edicion[campo] === null;

			// CONDICION 2: El original y la edición no son 'null' ni 'undefined' y son 'iguales'
			// El original no puede ser 'null', porque ya habría sido eliminado
			// El original no puede ser 'undefined', porque ya lo estamos preguntando
			// La edición no puede ser 'null', porque ya habría sido eliminada
			// La edición no puede ser 'undefined', porque existe el método
			let condicion2 = original[campo] !== undefined && edicion[campo] !== undefined && edicion[campo] == original[campo];

			// CONDICION 3: El objeto vinculado tiene el mismo ID
			let condicion3 = edicion[campo] && edicion[campo].id && original[campo] && edicion[campo].id == original[campo].id;

			// Si se cumple alguna de las condiciones, se elimina ese método
			if (condicion1 || condicion2 || condicion3) delete edicion[campo];
			if (condicion2 || condicion2) camposNull[campo] = null;
		}

		// 3. Acciones en función de si quedan campos
		let quedanCampos = !!Object.keys(edicion).length;
		if (!quedanCampos) {
			// Convierte en 'null' la variable de 'edicion'
			edicion = null;
			// Si además había una edición guardada en la BD, la elimina
			if (edicion_id) await BD_genericas.eliminaPorId(nombreEdicion, edicion_id);
		} else if (edicion_id) edicion.id = edicion_id;

		// Fin
		return [edicion, camposNull];
	},
	// Lectura de edicion
	obtieneOriginalEdicion: async function (entidad, entID, userID) {
		// Obtiene los campos include
		let includesEstandar = comp.obtieneTodosLosCamposInclude(entidad);
		let includesOrig = ["ediciones", ...includesEstandar, "creado_por", "status_registro"];
		let includesEdic = [...includesEstandar];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");

		// Obtiene el registro original con sus includes y le quita los campos sin contenido
		let original = await BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);
		for (let campo in original) if (original[campo] === null) delete original[campo];

		// Obtiene la edición a partir del vínculo del original
		let edicion = original.ediciones.find((n) => n.editado_por_id == userID);
		if (edicion) {
			// Obtiene la edición con sus includes
			let nombreEdicion = comp.obtienePetitFamiliaDesdeEntidad(entidad) + "_edicion";
			edicion = await BD_genericas.obtienePorIdConInclude(nombreEdicion, edicion.id, includesEdic);
			// Quita la info que no agrega valor
			for (let campo in edicion) if (edicion[campo] === null) delete edicion[campo];
			let camposNull;
			[edicion, camposNull] = await this.puleEdicion(entidad, original, edicion);
			// Si quedan campos y hubo coincidencias con el original --> se eliminan esos valores coincidentes del registro de edicion
			if (edicion && Object.keys(camposNull).length)
				await BD_genericas.actualizaPorId(nombreEdicion, edicion.id, camposNull);
		} else edicion = {}; // Debe ser un objeto, porque más adelante se lo trata como tal

		// Fin
		return [original, edicion];
	},
	// Guardado de edición
	guardaActEdicCRUD: async function ({entidad, original, edicion, userID}) {
		// Variables
		let nombreEdicion = comp.obtienePetitFamiliaDesdeEntidad(entidad) + "_edicion";
		let camposNull;

		// Quita la info que no agrega valor
		[edicion, camposNull] = await this.puleEdicion(entidad, original, edicion);

		// Acciones si quedan campos
		if (edicion) {
			// Si existe edicion.id --> se actualiza el registro
			if (edicion.id) await BD_genericas.actualizaPorId(nombreEdicion, edicion.id, {...camposNull, ...edicion});
			// Si no existe edicion.id --> se agrega el registro
			else
				await (async () => {
					// Se le agregan los campos necesarios: campo_id, editado_por_id, producto_id (links)
					// 1. campo_id, editado_por_id
					let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
					edicion[campo_id] = original.id;
					edicion.editado_por_id = userID;
					// 2. producto_id (links)
					if (entidad == "links") {
						let producto_id = entidad == "links" ? comp.obtieneProducto_id(original) : "";
						edicion[producto_id] = original[producto_id];
					}
					// Se agrega el registro
					await BD_genericas.agregaRegistro(nombreEdicion, edicion);
				})();
		}

		// Fin
		return edicion ? "Edición guardada" : "Edición sin novedades respecto al original";
	},
	// Avatar
	obtieneAvatarOrigEdic: (original, edicion) => {
		let avatarOrig =
			// Si es un url
			original.avatar.startsWith("http")
				? original.avatar
				: // Si no existe avatarOrig
				  localhost +
				  "/imagenes/" +
				  (!original || !original.avatar
						? "0-Base/Avatar/Prod-Sin-Avatar.jpg"
						: // Si el avatar está 'aprobado'
						comp.averiguaSiExisteUnArchivo("./publico/imagenes/2-Avatar-Prods-Final/" + original.avatar)
						? "2-Avatar-Prods-Final/" + original.avatar
						: // Si el avatar está 'a revisar'
						comp.averiguaSiExisteUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/" + original.avatar)
						? "2-Avatar-Prods-Revisar/" + original.avatar
						: "");

		// avatarEdic
		let avatarEdic =
			edicion && edicion.avatar ? localhost + "/imagenes/2-Avatar-Prods-Revisar/" + edicion.avatar : avatarOrig;

		// Fin
		return {orig: avatarOrig, edic: avatarEdic};
	},

	// CAMBIOS DE STATUS
	// Cambia el status de un registro
	cambioDeStatus: async function (entidad, registro) {
		// Variables
		let familia = comp.obtieneFamiliaEnPlural(entidad);

		// Rutina por producto
		if (familia == "productos") {
			if (registro.status_registro_id == aprobado_id) {
				if (registro.personaje_id) BD_genericas.actualizaPorId("personajes", registro.personaje_id, {prods_aprob: SI});
				if (registro.hecho_id) BD_genericas.actualizaPorId("hechos", registro.hecho_id, {prods_aprob: SI});
				if (registro.valor_id) BD_genericas.actualizaPorId("valores", registro.valor_id, {prods_aprob: SI});
			} else this.prodEnRCLV(registro);
		}

		// Rutinas por links
		if (familia == "links") this.linksEnProd(registro);
	},
	// Actualiza los campos de 'producto' en el RCLV
	prodEnRCLV: async function (producto) {
		// Variables
		const entidadesRCLV = variables.entidadesRCLV;
		const entidadesProds = variables.entidadesProd;
		const statusAprobado = {status_registro_id: aprobado_id};
		const statusPotencial = {status_registro_id: [creado_id, inactivar_id, recuperar_id]};

		// Un producto tiene hasta 3 RCLVs - Rutina por entidadRCLV
		for (let entidadRCLV of entidadesRCLV) {
			// Variables
			let campo_id = comp.obtieneCampo_idDesdeEntidad(entidadRCLV);
			let RCLV_id = producto[campo_id];
			// Acciones si el producto tiene ese 'campo_id'
			if (RCLV_id > 10) {
				let objeto = {[campo_id]: RCLV_id};
				let prods_aprob;
				// Averigua si existe algún producto, con ese RCLV
				for (let entidadProd of entidadesProds) {
					prods_aprob = await BD_genericas.obtienePorCampos(entidadProd, {...objeto, ...statusAprobado});
					if (prods_aprob) break;
				}

				if (prods_aprob) prods_aprob = SI;
				// 2. Averigua si existe algún producto 'potencial', en status distinto a aprobado e inactivo
				else
					for (let entidadProd of entidadesProds) {
						// Averigua si existe algún producto, con ese RCLV
						prods_aprob = await BD_genericas.obtienePorCampos(entidadProd, {...objeto, ...statusPotencial});
						if (prods_aprob) break;
					}

				if (prods_aprob) prods_aprob = talVez;
				// 3. Averigua si existe alguna edición
				else prods_aprob = await BD_genericas.obtienePorCampos("prods_edicion", objeto);

				if (prods_aprob) prods_aprob = talVez;
				// 4. No encontró ningún caso
				else prods_aprob = NO;

				// Actualiza el campo en el RCLV
				BD_genericas.actualizaPorId(entidadRCLV, RCLV_id, {prods_aprob});
			}
		}

		// Fin
		return;
	},
	// Actualiza los campos de 'links' en el producto
	linksEnProd: async function (link) {
		// Variables
		const campo_id = comp.obtieneProducto_id(link);
		const producto_ent = comp.obtieneProdDesdeProducto_id(link);
		if (producto_ent == "colecciones") return;

		// Más variables
		const prodID = link[campo_id];
		const tipo_id = link_pelicula_id; // El tipo de link 'película'
		const statusAprobado = {status_registro_id: aprobado_id};
		const statusPotencial = {status_registro_id: [creado_id, inactivar_id, recuperar_id]};
		let objeto = {[campo_id]: prodID, tipo_id};

		// 1. Averigua si existe algún link gratuito, para ese producto
		let links_gratuitos = BD_genericas.obtienePorCampos("links", {...objeto, ...statusAprobado, gratuito: true}).then((n) => {
			return n
				? SI
				: BD_genericas.obtienePorCampos("links", {...objeto, ...statusPotencial, gratuito: true}).then((n) => {
						return n ? talVez : NO;
				  });
		});

		// 2. Averigua si existe algún link, para ese producto
		let links_general =
			links_gratuitos == SI ||
			BD_genericas.obtienePorCampos("links", {...objeto, ...statusAprobado}).then((n) => {
				return n
					? SI
					: links_gratuitos === talVez ||
							BD_genericas.obtienePorCampos("links", {...objeto, ...statusPotencial}).then((n) => {
								return n ? talVez : NO;
							});
			});

		// 3. Averigua si existe algún link en castellano, para ese producto
		let castellano = BD_genericas.obtienePorCampos("links", {...objeto, ...statusAprobado, castellano: true}).then((n) => {
			return n
				? SI
				: BD_genericas.obtienePorCampos("links", {...objeto, ...statusPotencial, castellano: true}).then((n) => {
						return n ? talVez : NO;
				  });
		});

		// Consolida
		[links_general, links_gratuitos, castellano] = await Promise.all([links_general, links_gratuitos, castellano]);

		// Actualiza el registro - con 'await', para que dé bien el cálculo para la colección
		await BD_genericas.actualizaPorId(producto_ent, prodID, {links_general, links_gratuitos, castellano});

		// Colecciones - la actualiza en función de la mayoría de los capítulos
		if (producto_ent == "capitulos") {
			this.colecComoCap(prodID, "links_general");
			this.colecComoCap(prodID, "links_gratuitos");
			this.colecComoCap(prodID, "castellano");
		}

		// Fin
		return;
	},
	// Actualiza para las colecciones
	colecComoCap: async (capID, campo) => {
		// Obtiene los datos para identificar la colección
		const capitulo = await BD_genericas.obtienePorId("capitulos", capID);
		const colID = capitulo.coleccion_id;
		let objeto = {coleccion_id: colID};

		// Cuenta la cantidad de casos true, false y null
		let OK = BD_genericas.contarCasos("capitulos", {...objeto, [campo]: SI});
		let potencial = BD_genericas.contarCasos("capitulos", {...objeto, [campo]: talVez});
		let no = BD_genericas.contarCasos("capitulos", {...objeto, [campo]: NO});
		[OK, potencial, no] = await Promise.all([OK, potencial, no]);

		// Averigua los porcentajes de OK y Potencial
		let total = OK + potencial + no;
		let resultadoOK = OK / total;
		let resultadoPot = (OK + potencial) / total;

		// En función de los resultados, actualiza la colección
		if (resultadoOK >= 0.5) BD_genericas.actualizaPorId("colecciones", colID, {[campo]: SI});
		else if (resultadoPot >= 0.5) BD_genericas.actualizaPorId("colecciones", colID, {[campo]: talVez});
		else BD_genericas.actualizaPorId("colecciones", colID, {[campo]: NO});
	},
};
