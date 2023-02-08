"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

// Exportar ------------------------------------
module.exports = {
	// Funciones de soporte para edición
	quitaCamposDeEdicion: (original, edicion, familia) => {
		// 1. Quita de edición los campos que no se comparan
		(() => {
			// Obtiene los campos a comparar
			let camposRevisar = [];
			variables.camposRevisar[familia].forEach((campo) => {
				camposRevisar.push(campo.nombre);
				if (campo.relac_include) camposRevisar.push(campo.relac_include);
			});
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
			if (
				edicion[campo] === original[campo] || // El valor de edicion es estrictamente igual al de original
				(edicion[campo] && original[campo] && edicion[campo].id == original[campo].id) // El objeto vinculado tiene el mismo ID
			)
				delete edicion[campo];
		}

		// 3. Averigua si quedan campos
		let quedanCampos = !!Object.keys(edicion).length;
		if (!quedanCampos) edicion = "";

		// Fin
		return edicion;
	},
	// Lectura de edicion
	obtieneOriginalEdicion: async function (entidad, entID, userID) {
		// Variables
		let nombreEdicion = comp.obtieneNombreEdicionDesdeEntidad(entidad);
		let familia = comp.obtieneFamiliaEnPlural(entidad);

		// Obtiene los campos include
		let includesEstandar = comp.obtieneTodosLosCamposInclude(familia);
		let includesOrig = [nombreEdicion, ...includesEstandar, "creado_por", "status_registro"];
		let includesEdic = [...includesEstandar];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");

		// Obtiene el registro original
		let original = await BD_genericas.obtienePorIdConInclude(entidad, entID, includesOrig);
		for (let campo in original) if (original[campo] === null) delete original[campo];

		// Obtiene la edición a partir del vínculo del original
		let edicion = original[nombreEdicion].find((n) => n.editado_por_id == userID);
		// Obtiene la edición con sus includes y le quita los campos sin contenido
		if (edicion) {
			// Obtiene la edición con sus includes
			edicion = await BD_genericas.obtienePorIdConInclude(nombreEdicion, edicion.id, includesEdic);
			// Le quita los campos sin contenido
			for (let campo in edicion) if (edicion[campo] === null) delete edicion[campo];
		} else edicion = "";

		// Fin
		return [original, edicion];
	},
	puleEdicion: async function (original, edicion, entidad) {
		// Variables
		let familia = comp.obtieneFamiliaEnPlural(entidad);
		let nombreEdicion = comp.obtieneNombreEdicionDesdeEntidad(entidad);
		let edicion_id = edicion.id;
		// Quita los campos que no se comparan, y los que tienen el mismo valor que el original
		edicion = this.quitaCamposDeEdicion(original, edicion, familia);
		// Acciones si no quedan campos
		if (!edicion) {
			// Si existe edicion_id --> se elimina el registro de la tabla
			if (edicion_id) await BD_genericas.eliminaPorId(nombreEdicion, edicion_id);
		}
		// Si quedan campos le devuelve su valor 'id'
		else if (edicion_id) edicion.id = edicion_id;
		// Fin
		return edicion;
	},

	// Guardado de edición
	guardaEdicion: async function (original, edicion, entidad, userID) {
		// 1. Pule la edición
		// No hace falta el 'await' para 'puleEdicion', porque la eliminación del registro no afecta al resto de la rutina
		edicion = this.puleEdicion(original, edicion, entidad);

		// 2. Acciones si quedan campos
		if (edicion) {
			// 2.A. Se combina la edición con valoresNull
			edicion = this.valoresNull(edicion, familia);
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
	valoresNull: (edicion, familia) => {
		// Obtiene los campos a comparar
		let camposComparar = [];
		for (let campo of variables.camposRevisar[familia]) camposComparar.push(campo.nombre);
		// Genera el objeto con valores 'null'
		let valoresNull = {};
		for (let campo of camposComparar) valoresNull[campo] = null;
		// Fin
		return {...valoresNull, ...edicion};
	},

	avatarOrigEdic: (prodOrig, prodEdic) => {
		let avatarOrig =
			// Si no existe avatarOrig
			!prodOrig || !prodOrig.avatar
				? "/imagenes/0-Base/Avatar/Prod-Sin-Avatar.jpg"
				: // Si es un url
				prodOrig.avatar.startsWith("http")
				? prodOrig.avatar
				: // Si el avatar está 'aprobado'
				comp.averiguaSiExisteUnArchivo("./publico/imagenes/2-Avatar-Prods-Final/" + prodOrig.avatar)
				? "/imagenes/2-Avatar-Prods-Final/" + prodOrig.avatar
				: // Si el avatar está 'a revisar'
				comp.averiguaSiExisteUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/" + prodOrig.avatar)
				? "/imagenes/2-Avatar-Prods-Revisar/" + prodOrig.avatar
				: "";

		// avatarEdic
		let avatarEdic =
			prodEdic && prodEdic.avatar ? "/imagenes/2-Avatar-Prods-Revisar/" + prodEdic.avatar : avatarOrig;

		// Fin
		return {orig: avatarOrig, edic: avatarEdic};
	},
};
