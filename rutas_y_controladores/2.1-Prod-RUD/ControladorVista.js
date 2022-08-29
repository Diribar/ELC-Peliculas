"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");
const validar = require("./FN-Validar");

// *********** Controlador ***********
module.exports = {
	prod_Form: async (req, res) => {
		// DETALLE - EDICIÓN
		// 1. Tema y Código
		let tema = "prod_rud";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.lastIndexOf("/"));
		// 2. Obtiene los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// 3. Obtiene el producto 'Original' y 'Editado'
		let [prodOriginal, prodEditado] = await procesos.obtenerVersionesDelProducto(entidad, prodID, userID);
		// 4. Obtiene el avatar y la versión más completa posible del producto
		let avatar = compartidas.nombreAvatar(prodOriginal, prodEditado);
		let prodCombinado = {...prodOriginal, ...prodEditado, avatar, id: prodID};
		// 5. Configura el título de la vista
		let prodNombre = compartidas.obtenerEntidadNombre(entidad);
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? "l " : " la ") +
			prodNombre;
		// 6. Obtiene los países
		let paises = prodOriginal.paises_id
			? await compartidas.paises_idToNombre(prodOriginal.paises_id)
			: "";
		// 7. Info para la vista de Edicion o Detalle
		let bloquesIzquierda, bloquesDerecha;
		let camposDD1, camposDD2, camposDD3, camposDP, BD_paises, BD_idiomas;
		if (codigo == "edicion") {
			// Obtiene los datos de session/cookie y luego los elimina
			let edicion =
				req.session.edicProd &&
				req.session.edicProd.entidad == entidad &&
				req.session.edicProd.id == prodID
					? req.session.edicProd
					: req.cookies.edicProd &&
					  req.cookies.edicProd.entidad == entidad &&
					  req.cookies.edicProd.id == prodID
					? req.cookies.edicProd
					: "";
			req.session.edicProd = "";
			res.clearCookie("edicProd");
			// Actualiza el producto prodCombinado
			prodCombinado = {...prodCombinado, ...edicion};
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
			let statusResumido = prodCombinado.status_registro.gr_pends_aprob
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
		// Obtener datos para la vista
		if (entidad == "capitulos")
			prodCombinado.capitulos = await BD_especificas.obtenerCapitulos(
				prodCombinado.coleccion_id,
				prodCombinado.temporada
			);
		// Ir a la vista
		//return res.send(bloquesDerecha)
		return res.render("CR0-0Estructura", {
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
		let [prodOriginal, prodEditado] = await procesos.obtenerVersionesDelProducto(entidad, prodID, userID);
		// Obtener el 'avatar' --> prioridades: data-entry, edición, original
		let avatar_archivo = req.file ? req.file.filename : "";
		// Unir 'Edición' y 'Original'
		let prodCombinado = {...prodOriginal, ...prodEditado, ...req.body, avatar_archivo, id: prodID};
		// Averiguar si hay errores de validación
		let errores = await validar.consolidado("", {...prodCombinado, entidad});
		if (errores.hay) {
			if (req.file) compartidas.borrarArchivo(req.file.path, req.file.filename);
		} else {
			// Actualizar los archivos avatar
			if (avatar_archivo) {
				// Mover el archivo actual a su ubicación para ser revisado
				compartidas.moverImagen(prodCombinado.avatar_archivo, "9-Provisorio", "3-ProdRevisar");
				// Eliminar el anterior archivo de imagen
				if (prodEditado.avatar)
					compartidas.borrarArchivo("./publico/imagenes/3-ProdRevisar", prodEditado.avatar);
			}
			// Actualiza la edición
			let edicion = {...req.body, avatar_archivo};
			await compartidas.guardar_edicion(entidad, "prods_edicion", prodOriginal, edicion, userID);
		}
		return res.redirect("/producto/edicion/?entidad=" + entidad + "&id=" + prodID);
	},
	calificala: (req, res) => {
		return res.send("Estoy en calificala");
	},
	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};
