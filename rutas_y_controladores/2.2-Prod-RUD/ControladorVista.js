"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const procesar = require("../../funciones/3-Procesos/3-RUD");
const funciones = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const validar = require("../../funciones/4-Validaciones/RUD");

// *********** Controlador ***********
module.exports = {
	prod_Form: async (req, res) => {
		// DETALLE - EDICIÓN
		// 1. Tema y Código
		let tema = "prod_rud";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.lastIndexOf("/"));
		// 2. Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// 3. Obtener el producto 'Original' y 'Editado'
		let [prodOriginal, prodEditado] = await procesar.obtenerVersionesDelProducto(entidad, prodID, userID);
		// 4. Obtener avatar
		let avatar = prodEditado.avatar
			? "/imagenes/3-ProdRevisar/" + prodEditado.avatar
			: prodOriginal.avatar
			? prodOriginal.avatar.slice(0, 4) != "http"
				? "/imagenes/2-Productos/" + prodOriginal.avatar
				: prodOriginal.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// Usar la versión 'session' (si existe) en vez de la edición guardada
		let prodSession = req.session.edicion
			? req.session.edicion.entidad == entidad && req.session.edicion.id == prodID
				? req.session.edicion
				: ""
			: req.cookies.edicion
			? req.cookies.edicion.entidad == entidad && req.cookies.edicion.id == prodID
				? req.cookies.edicion
				: ""
			: "";
		let prodCombinado = {...prodOriginal, ...prodEditado, ...prodSession, id: prodID};
		// 5. Configurar el título de la vista
		let prodNombre = funciones.obtenerEntidadNombre(entidad);
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? "l " : " la ") +
			prodNombre;
		// 6. Obtener los países
		let paises = prodOriginal.paises_id ? await funciones.paises_idToNombre(prodOriginal.paises_id) : "";
		// 7. Info para la vista de Edicion o Detalle
		let bloquesIzquierda, bloquesDerecha;
		let camposDD1, camposDD2, camposDD3, camposDP, BD_paises, BD_idiomas;
		if (codigo == "edicion") {
			// Variables de 'Detalle'
			// Variables de 'Edición'
			let camposDD = variables
				.camposDD()
				.filter((n) => n[entidad])
				.filter((n) => !n.omitirRutinaVista);
			camposDD1 = camposDD.filter((n) => n.antesDePais);
			camposDD2 = camposDD.filter((n) => !n.antesDePais && n.nombreDelCampo != "produccion");
			camposDD3 = camposDD.filter((n) => n.nombreDelCampo == "produccion");
			BD_paises = await BD_genericas.obtenerTodos("paises", "nombre");
			BD_idiomas = await BD_genericas.obtenerTodos("idiomas", "nombre");
			camposDP = await variables.camposDP(userID).then((n) => n.filter((m) => m.grupo != "calificala"));
		} else {
			// Variables de 'Detalle'
			let statusResumido = prodCombinado.status_registro.gr_pend_aprob
				? {id: 1, nombre: "Pend. Aprobac."}
				: prodCombinado.status_registro.aprobado
				? {id: 2, nombre: "Aprobado"}
				: {id: 3, nombre: "Inactivado"};
			let bloque1 = [
				{titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises ? paises : "Sin datos"},
				{
					titulo: "Idioma original",
					valor: prodCombinado.idioma_original ? prodCombinado.idioma_original.nombre : "Sin datos",
				},
				{
					titulo: "En castellano",
					valor: prodCombinado.en_castellano ? prodCombinado.en_castellano.productos : "Sin datos",
				},
				{
					titulo: "Es a color",
					valor: prodCombinado.en_color ? prodCombinado.en_color.productos : "Sin datos",
				},
			];
			let bloque2 = [
				{titulo: "Dirección", valor: prodCombinado.direccion ? prodCombinado.direccion : "Sin datos"},
				{titulo: "Guión", valor: prodCombinado.guion ? prodCombinado.guion : "Sin datos"},
				{titulo: "Música", valor: prodCombinado.musica ? prodCombinado.musica : "Sin datos"},
				{
					titulo: "Producción",
					valor: prodCombinado.produccion ? prodCombinado.produccion : "Sin datos",
				},
			];
			let bloque3 = [
				{titulo: "Actuación", valor: prodCombinado.actuacion ? prodCombinado.actuacion : "Sin datos"},
			];
			bloquesIzquierda = [bloque1, bloque2, bloque3];
			bloquesDerecha = [
				{
					titulo: "Público Sugerido",
					valor: prodCombinado.publico_sugerido
						? prodCombinado.publico_sugerido.nombre
						: "Sin datos",
				},
				{
					titulo: "Categoría",
					valor: prodCombinado.categoria ? prodCombinado.categoria.nombre : "Sin datos",
				},
				{
					titulo: "Sub-categoría",
					valor: prodCombinado.subcategoria ? prodCombinado.subcategoria.nombre : "Sin datos",
				},
			];
			if (prodCombinado.personaje_id != 1)
				bloquesDerecha.push({
					titulo: "Personaje Histórico",
					valor: prodCombinado.personaje.nombre,
					RCLV_entidad: "personajes",
					RCLV_id: prodCombinado.personaje.id,
				});
			if (prodCombinado.hecho_id != 1)
				bloquesDerecha.push({
					titulo: "Hecho Histórico",
					valor: prodCombinado.hecho.nombre,
					RCLV_entidad: "hechos",
					RCLV_id: prodCombinado.hecho.id,
				});
			if (prodCombinado.valor_id != 1)
				bloquesDerecha.push({
					titulo: "Valor",
					valor: prodCombinado.valor.nombre,
					RCLV_entidad: "valores",
					RCLV_id: prodCombinado.valor.id,
				});
			bloquesDerecha.push({titulo: "Año de estreno", valor: prodCombinado.ano_estreno});
			if (entidad == "colecciones")
				bloquesDerecha.push({titulo: "Año de fin", valor: prodCombinado.ano_fin});
			else bloquesDerecha.push({titulo: "Duracion", valor: prodCombinado.duracion + " min."});
			bloquesDerecha.push({
				titulo: "Status",
				valor: statusResumido.nombre,
				id: statusResumido.id,
			});
			// Variables de 'Edición'
		}
		// Averiguar si hay errores de validación
		let errores = await validar.edicion("", {...prodCombinado, entidad});
		// Obtener datos para la vista
		if (entidad == "capitulos")
			prodCombinado.capitulos = await BD_especificas.obtenerCapitulos(
				prodCombinado.coleccion_id,
				prodCombinado.temporada
			);
		// Ir a la vista
		// return res.send(prodCombinado)
		return res.render("0-Estructura-CRUD", {
			tema,
			codigo,
			titulo,
			entidad,
			prodID,
			producto: prodCombinado,
			avatar,
			bloquesIzquierda,
			bloquesDerecha,
			camposDD1,
			camposDD2,
			camposDD3,
			BD_paises,
			BD_idiomas,
			camposDP,
			errores,
			vista: req.baseUrl + req.path,
			link: req.originalUrl,
			paises,
			prodNombre,
		});
	},
	prod_GuardarEdic: async (req, res) => {
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		// Obtener el userID
		let userID = req.session.usuario.id;
		// Obtener el producto 'Original' y 'Editado'
		let [prodOriginal, prodEditado] = await procesar.obtenerVersionesDelProducto(entidad, prodID, userID);
		// Obtener el 'avatar' --> prioridades: data-entry, edición, original
		let avatar = req.file
			? req.file.filename
			: prodEditado && prodEditado.avatar
			? prodEditado.avatar
			: prodOriginal.avatar;
		// Unir 'Edición' y 'Original'
		let prodCombinado = {...prodOriginal, ...prodEditado, ...req.body, avatar, id: prodID};
		// Averiguar si hay errores de validación
		let errores = await validar.edicion("", {...prodCombinado, entidad});
		if (errores.hay) {
			if (req.file) delete prodCombinado.avatar;
			if (req.file) funciones.borrarArchivo(req.file.path, req.file.filename);
			req.session.edicion = prodCombinado;
		} else {
			// Si no hubieron errores de validación...
			// Actualizar los archivos avatar
			if (req.file) {
				// Mover el archivo actual a su ubicación para ser revisado
				funciones.moverImagenCarpetaDefinitiva(prodCombinado.avatar, "9-Provisorio", "3-ProdRevisar");
				// Eliminar el anterior archivo de imagen
				if (prodEditado.avatar)
					funciones.borrarArchivo("./publico/imagenes/3-ProdRevisar", prodEditado.avatar);
			}
			// Unir las 2 ediciones en una sola
			// Se necesita para preservar la hora en la que se creó la edición
			let edicion = {...prodEditado, ...req.body, avatar};
			// Quitar los coincidencias con el original
			let edicion_id = edicion.id;
			if (edicion_id) delete edicion.id;
			edicion = funciones.quitarLasCoincidenciasConOriginal(prodOriginal, edicion);
			// Actualización de la tabla
			// Si la edicion existía => se la actualiza
			if (edicion_id) await BD_genericas.actualizarPorId("prods_edicion", edicion_id, edicion);
			else {
				// De lo contrario, se lo agrega
				// 1. Completa la información
				let producto_id = funciones.obtenerEntidad_id(entidad);
				edicion = {
					...edicion,
					[producto_id]: prodID,
					editado_por_id: userID,
				};
				// 2. Agrega el registro a la tabla de 'Edición'
				await BD_genericas.agregarRegistro(edicion.entidad, edicion);
			}
			// Elimina req.session.edicion
			req.session.edicion = {};
		}
		return res.redirect("/producto/edicion/?entidad=" + entidad + "&id=" + prodID);
	},
	prod_EliminarEdic: async (req, res) => {
		// Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let ID = req.query.id;
		// Pendiente...
		// No se puede eliminar la edición de un status "gr_pend_aprob"
		// Terminar
		return res.send(["Eliminar", entidad, ID]);
	},
	calificala: (req, res) => {
		return res.send("Estoy en calificala");
	},
	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};
