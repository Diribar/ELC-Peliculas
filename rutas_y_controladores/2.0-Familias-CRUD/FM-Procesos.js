"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

// Exportar ------------------------------------
module.exports = {
	// Lectura de edicion
	obtieneOriginalEdicion: async (entidad, entID, userID) => {
		// Variables
		let familia = comp.obtieneFamiliaEnPlural(entidad);

		// Obtiene los campos include
		let includesEstandar = comp.obtieneTodosLosCamposInclude(familia);
		let includesOrig = ["ediciones", ...includesEstandar, "creado_por", "status_registro"];
		let includesEdic = [...includesEstandar];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");

		// Obtiene el registro original con sus includes y le quita los campos sin contenido
		let original = await BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);
		for (let campo in original) if (original[campo] === null) delete original[campo];

		// Obtiene la edición a partir del vínculo del original
		let edicion = original.ediciones.find((n) => n.editado_por_id == userID);
		// Obtiene la edición con sus includes y le quita los campos sin contenido
		if (edicion) {
			// Obtiene la edición con sus includes
			let nombreEdicion = comp.obtieneNombreEdicionDesdeEntidad(entidad);
			edicion = await BD_genericas.obtienePorIdConInclude(nombreEdicion, edicion.id, includesEdic);
			// Le quita los campos sin contenido
			for (let campo in edicion) if (edicion[campo] === null) delete edicion[campo];
		} else edicion = {}; // Debe ser un objeto, porque más adelante se lo trata como tal

		// Fin
		return [original, edicion];
	},
	// Guardado de edición
	guardaActEdicCRUD: async function ({original, edicion, entidad, userID}) {
		// Variables
		let nombreEdicion = comp.obtieneNombreEdicionDesdeEntidad(entidad);
		let edicion_id = edicion.id;
		let familia = comp.obtieneFamiliaEnPlural(entidad);

		// 1. Quita de edición los campos que no se comparan
		(() => {
			// Obtiene los campos a comparar
			let camposRevisar = [];
			for (let campo of variables.camposRevisar[familia]) {
				camposRevisar.push(campo.nombre);
				if (campo.relac_include) camposRevisar.push(campo.relac_include);
			}
			// Quita la duración de las colecciones
			// if (edicion.coleccion_id) {
			// 	let indice = camposRevisar.indexOf("duracion");
			// 	camposRevisar.splice(indice, 1);
			// }
			// Quita de edicion los campos que no se comparan
			for (let campo in edicion) if (!camposRevisar.includes(campo)) delete edicion[campo];
		})();

		// 2. Quita de edición las coincidencias con el original
		for (let campo in edicion) {
			// Corrige errores de data-entry
			if (typeof edicion[campo] == "string") edicion[campo] = edicion[campo].trim();

			// Condiciones
			// 1. El valor de edicion es igual al de original
			let condicion1 = edicion[campo] == original[campo];
			// 2. El objeto vinculado tiene el mismo ID
			let condicion2 =
				edicion[campo] &&
				edicion[campo].id &&
				original[campo] &&
				edicion[campo].id == original[campo].id;

			// Si se cumple alguna de las condiciones, se elimina ese método
			if (condicion1 || condicion2) delete edicion[campo];
			// else console.log(45, campo, edicion[campo], original[campo], edicion[campo] == original[campo]);
		}

		// 3. Averigua si quedan campos
		let quedanCampos = !!Object.keys(edicion).length;
		if (!quedanCampos) edicion = null;

		// Si no quedan campos y existe edicion_id --> se elimina el registro de la tabla
		if (!edicion && edicion_id) await BD_genericas.eliminaPorId(nombreEdicion, edicion_id);

		// Acciones si quedan campos
		if (edicion) {
			// Variables
			if (edicion_id) edicion.id = edicion_id;
			let familia = comp.obtieneFamiliaEnPlural(entidad);
			let nombreEdicion = comp.obtieneNombreEdicionDesdeEntidad(entidad);
			// 2.A. Se combina la edición con valoresNull
			let valoresNull = (() => {
				// Obtiene los campos a comparar
				let camposComparar = [];
				for (let campo of variables.camposRevisar[familia]) camposComparar.push(campo.nombre);
				// Genera el objeto con valores 'null'
				let valoresNull = {};
				for (let campo of camposComparar) valoresNull[campo] = null;
				// Fin
				return valoresNull;
			})();
			edicion = {...valoresNull, ...edicion};

			// 2.B.1. Si existe edicion.id --> se actualiza el registro
			if (edicion.id) await BD_genericas.actualizaPorId(nombreEdicion, edicion.id, edicion);
			// 2.B.2. Si no existe edicion_id --> se agrega el registro
			else
				await (async () => {
					// Se le agregan los campos necesarios: entidad_id, editado_por_id, producto_id (links)
					// 1. entidad_id, editado_por_id
					let entidad_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
					edicion[entidad_id] = original.id;
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
	avatarOrigEdic: (prodOrig, prodEdic) => {
		let avatarOrig =
			// Si es un url
			prodOrig.avatar.startsWith("http")
				? prodOrig.avatar
				: // Si no existe avatarOrig
				  localhost +
				  "/imagenes/" +
				  (!prodOrig || !prodOrig.avatar
						? "0-Base/Avatar/Prod-Sin-Avatar.jpg"
						: // Si el avatar está 'aprobado'
						comp.averiguaSiExisteUnArchivo(
								"./publico/imagenes/2-Avatar-Prods-Final/" + prodOrig.avatar
						  )
						? "2-Avatar-Prods-Final/" + prodOrig.avatar
						: // Si el avatar está 'a revisar'
						comp.averiguaSiExisteUnArchivo(
								"./publico/imagenes/2-Avatar-Prods-Revisar/" + prodOrig.avatar
						  )
						? "2-Avatar-Prods-Revisar/" + prodOrig.avatar
						: "");

		// avatarEdic
		let avatarEdic =
			prodEdic && prodEdic.avatar
				? localhost + "/imagenes/2-Avatar-Prods-Revisar/" + prodEdic.avatar
				: avatarOrig;

		// Fin
		return {orig: avatarOrig, edic: avatarEdic};
	},
	// Actualiza el campo 'links_gratuitos' en productos
	links_gratuitos: async (link) => {
		// Variables
		const producto_id = comp.obtieneProducto_id(link);
		const producto = comp.obtieneProdDesdeProducto_id(producto_id);
		const prodID = link[producto_id];
		const tipo_id = link_pelicula_id;
		const statusAprobado = {status_registro_id: aprobado_id};
		const statusPotencia = {status_registro_id: [creado_id, inactivar_id, recuperar_id]};
		let objeto;

		// Averigua si existe algún link, para ese producto
		objeto = {[producto_id]: prodID, tipo_id};
		let links_general = !!(await BD_genericas.obtienePorCampos("links", {...objeto, ...statusAprobado}))
			? true // Tiene
			: !!(await BD_genericas.obtienePorCampos("links", {...objeto, ...statusPotencia}))
			? false // Tiene en potencia
			: null; // No tiene

		// Averigua si existe algún link gratuito, para ese producto
		objeto = {...objeto, gratuito: true};
		let links_gratuitos = !!(await BD_genericas.obtienePorCampos("links", {...objeto, ...statusAprobado}))
			? true // Tiene
			: !!(await BD_genericas.obtienePorCampos("links", {...objeto, ...statusPotencia}))
			? false // Tiene en potencia
			: null; // No tiene

		// Actualiza el registro
		BD_genericas.actualizaPorId(producto, id, {links_general, links_gratuitos});

		// Fin
		return;
	},
	// Campo 'prods_aprob' en RCLVs
	prods_aprob: async function (producto) {
		// Variables
		let status_registro_id = aprobado_id;
		let entidadesRCLV = variables.entidadesRCLV;
		let entidadesProds = variables.entidadesProd;

		// Un producto tiene hasta 3 RCLVs - Rutina por entidadRCLV
		for (entidadRCLV of entidadesRCLV) {
			// Variables
			let entidad_id = comp.obtieneEntidad_idDesdeEntidad(entidadRCLV);
			let RCLV_id = producto[entidad_id];
			// Acciones si el producto tiene ese 'campo_id'
			if (RCLV_id) {
				// Arma el objeto
				let objeto = {[entidad_id]: RCLV_id, status_registro_id};
				let prods_aprob;
				// Cada RCLV puede estar en hasta 3 tipos de producto - Rutina por tipo de producto
				for (entidadProd of entidadesProds) {
					// Averigua si existe algún producto aprobado, para ese RCLV
					prods_aprob = !!(await BD_genericas.obtienePorCampos(entidadProd, objeto));
					if (prods_aprob) break;
				}
				// Actualiza el campo en el RCLV
				BD_genericas.actualizaPorId(entidadRCLV, RCLV_id, {prods_aprob});
			}
		}

		// Fin
		return;
	},
};
