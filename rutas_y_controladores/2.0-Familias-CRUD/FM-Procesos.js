"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

// Exportar ------------------------------------
module.exports = {
	quitaCamposSinContenido: (objeto) => {
		for (let campo in objeto) if (objeto[campo] === null || objeto[campo] === "") delete objeto[campo];
		return objeto;
	},
	obtieneVersionesDelRegistro: async function (entidad, regID, userID, edicNombre, familia) {
		// Variables
		let includesEdic = comp.includes(familia);
		let includesOrig = ["creado_por", "status_registro"];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");
		let regEdic = "";

		// Obtiene el producto ORIGINAL
		let regOrig = await BD_genericas.obtienePorIdConInclude(entidad, regID, [
			...includesEdic,
			...includesOrig,
		]);
		regOrig = this.quitaCamposSinContenido(regOrig);

		// Obtiene el registro EDITADO
		let entidad_id = comp.obtieneEntidad_idDesdeEntidad(entidad);
		let datos = [edicNombre, {[entidad_id]: regID, editado_por_id: userID}, includesEdic];
		if (userID) regEdic = await BD_genericas.obtienePorCamposConInclude(...datos);
		if (regEdic) regEdic = this.quitaCamposSinContenido(regEdic);

		// Fin
		return [regOrig, regEdic];
	},
	puleEdicion: async function (original, edicion, familia) {
		// Funciones
		let quitaCamposQueNoSeComparan = (edicion) => {
			// Variables
			let campos = [];
			// Obtiene los campos a comparar
			variables.camposRevisar[familia].forEach((campo) => {
				campos.push(campo.nombre);
				if (campo.relac_include) campos.push(campo.relac_include);
			});
			// Quita la duración de las colecciones
			if (edicion.coleccion_id) {
				let indice = campos.indexOf("duracion");
				campos.splice(indice, 1);
			}
			// Quitar de edicion los campos que no se comparan
			for (let campo in edicion) if (!campos.includes(campo)) delete edicion[campo];
			// Fin
			return edicion;
		};
		let quitaCoincidenciasConOriginal = (original, edicion) => {
			for (let campo in edicion) {
				// Eliminar campo si se cumple alguno de estos:
				if (
					(edicion[campo] && edicion[campo] == original[campo]) || // - Edición tiene un valor significativo y coincide con el original (se usa '==' porque unos son texto y otros número)
					edicion[campo] === original[campo] || // - Edición es estrictamente igual al original
					(edicion[campo] &&
						edicion[campo].id &&
						original[campo] &&
						edicion[campo].id == original[campo].id) // El objeto vinculado tiene el mismo ID
				)
					delete edicion[campo];
			}
			return edicion;
		};
		// Variables
		const edicID = edicion.id;
		edicion = {...edicion}; // Ojo acá, es una prueba a ver si sale bien
		const nombreEdic = (familia == "productos" ? "prods" : "rclvs") + "_edicion";

		// Pulir la información a tener en cuenta
		edicion = this.quitaCamposSinContenido(edicion);
		edicion = quitaCamposQueNoSeComparan(edicion);
		edicion = quitaCoincidenciasConOriginal(original, edicion);
		// Averigua si queda algún campo
		let quedanCampos = !!Object.keys(edicion).length;
		// Si no quedan campos, elimina el registro de la edición
		if (!quedanCampos) await BD_genericas.eliminaPorId(nombreEdic, edicID);

		// Fin
		return [edicion, quedanCampos];
	},
	guardaEdicion: async function ({entidadOrig, entidadEdic, original, edicion, userID}) {
		// Variables
		// Si es un link, obtiene la relación con el producto
		let entidad_idProd =
			entidadOrig == "links"
				? comp.obtieneEntidad_idDesdeEntidad(comp.obtieneProdDesdeEntidad_id(original))
				: "";
		edicion = {...edicion, entidad: entidadEdic};
		// Si existe una edición de ese original y de ese usuario --> lo elimina
		let entidad_id = comp.obtieneEntidad_idDesdeEntidad(entidadOrig);
		let objeto = {[entidad_id]: original.id, editado_por_id: userID};
		let registroEdic = await BD_genericas.obtienePorCampos(entidadEdic, objeto);
		if (registroEdic) await BD_genericas.eliminaPorId(entidadEdic, registroEdic.id);
		// Quita las coincidencias con el original
		let quedanCampos;
		let familia = comp.obtieneFamiliaEnPlural(entidadEdic);
		[edicion, quedanCampos] = await this.puleEdicion(original, edicion, familia);
		// Averigua si hay algún campo con novedad
		if (!quedanCampos) return "Edición sin novedades respecto al original";
		// Completa la información
		edicion = {...edicion, [entidad_id]: original.id, editado_por_id: userID};
		if (entidadOrig == "links") edicion = {...edicion, [entidad_idProd]: original[entidad_idProd]};
		// Agrega la nueva edición
		await BD_genericas.agregaRegistro(entidadEdic, edicion);
		// Fin
		return "Edición guardada";
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
