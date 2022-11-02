"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");
const validar = require("./FN-Validar");

// *********** Controlador ***********
module.exports = {
	prodEdicForm_Detalle: async (req, res) => {
		// DETALLE - EDICIÓN
		// 1. Tema y Código
		const tema = "prod_rud";
		const codigo = req.path.slice(1, -1);
		// 2. Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario ? req.session.usuario.id : "";
		let avatar
		// 3. Obtiene el producto 'Original' y 'Editado'
		let [prodOrig, prodEdic] = await procesos.obtieneVersionesDelProducto(entidad, prodID, userID);
		// 4. Obtiene la versión más completa posible del producto
		let prodComb = {...prodOrig, ...prodEdic, id: prodID};
		// 5. Configura el título de la vista
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? "l " : " la ") +
			prodNombre;
		// 6. Obtiene los países
		let paises = prodOrig.paises_id ? await comp.paises_idToNombre(prodOrig.paises_id) : "";
		// 7. Info para la vista de Edicion o Detalle
		let bloquesIzquierda, bloquesDerecha;
		let camposDD1, camposDD2, camposDD3, camposDP, BD_paises, BD_idiomas;
		if (codigo == "edicion") {
			// Obtiene los datos de session/cookie y luego los elimina
			let verificarReq = (dato) => {
				return req[dato] && req[dato].entidad == entidad && req[dato].id == prodID;
			};
			let edicion = verificarReq("session.edicProd")
				? req.session.edicProd
				: verificarReq("cookies.edicProd")
				? req.cookies.edicProd
				: "";
			req.session.edicProd = "";
			res.clearCookie("edicProd");
			// Actualiza el producto prodComb
			prodComb = {...prodComb, ...edicion};
			// Variables de 'Edición'
			let camposDD = variables.camposDD.filter((n) => n[entidad]).filter((n) => !n.omitirRutinaVista);
			camposDD1 = camposDD.filter((n) => n.antesDePais);
			camposDD2 = camposDD.filter((n) => !n.antesDePais && n.nombre != "produccion");
			camposDD3 = camposDD.filter((n) => n.nombre == "produccion");
			BD_paises = await BD_genericas.obtieneTodos("paises", "nombre");
			BD_idiomas = await BD_genericas.obtieneTodos("idiomas", "nombre");
			camposDP = await variables.camposDP(userID).then((n) => n.filter((m) => m.grupo != "calificala"));
			avatar = comp.avatarOrigEdic(prodOrig, prodEdic);
		} else if (codigo=="detalle") {
			// Variables de 'Detalle'
			let statusResumido = prodComb.status_registro.gr_creado
				? {id: 1, nombre: "Pend. Aprobac."}
				: prodComb.status_registro.aprobado
				? {id: 2, nombre: "Aprobado"}
				: {id: 3, nombre: "Inactivado"};
			let bloque1 = [
				{titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises ? paises : "Sin datos"},
				{
					titulo: "Idioma original",
					valor: prodComb.idioma_original ? prodComb.idioma_original.nombre : "Sin datos",
				},
				{
					titulo: "En castellano",
					valor: prodComb.en_castellano ? prodComb.en_castellano.productos : "Sin datos",
				},
				{
					titulo: "Es a color",
					valor: prodComb.en_color ? prodComb.en_color.productos : "Sin datos",
				},
			];
			let bloque2 = [
				{titulo: "Dirección", valor: prodComb.direccion ? prodComb.direccion : "Sin datos"},
				{titulo: "Guión", valor: prodComb.guion ? prodComb.guion : "Sin datos"},
				{titulo: "Música", valor: prodComb.musica ? prodComb.musica : "Sin datos"},
				{
					titulo: "Producción",
					valor: prodComb.produccion ? prodComb.produccion : "Sin datos",
				},
			];
			let bloque3 = [
				{titulo: "Actuación", valor: prodComb.actuacion ? prodComb.actuacion : "Sin datos"},
			];
			bloquesIzquierda = [bloque1, bloque2, bloque3];
			bloquesDerecha = [
				{titulo: "Público Sugerido", valor: comp.valorNombre(prodComb.publico_sugerido, "Sin datos")},
				{titulo: "Categoría", valor: comp.valorNombre(prodComb.categoria, "Sin datos")},
				{titulo: "Sub-categoría", valor: comp.valorNombre(prodComb.subcategoria, "Sin datos")},
			];
			let RCLVs = (campo, titulo, RCLV_entidad, rel) => {
				let datos = {titulo, RCLV_entidad, valor: prodComb[rel].nombre, RCLV_id: prodComb[rel].id};
				if (prodComb[campo] != 1) bloquesDerecha.push(datos);
			};
			RCLVs("personaje_id", "Personaje Histórico", "personajes", "personaje");
			RCLVs("hecho_id", "Hecho Histórico", "hechos", "hecho");
			RCLVs("valor_id", "Valor", "valores", "valor");
			bloquesDerecha.push({titulo: "Año de estreno", valor: prodComb.ano_estreno});
			if (entidad == "colecciones")
				bloquesDerecha.push({titulo: "Año de fin", valor: prodComb.ano_fin});
			else bloquesDerecha.push({titulo: "Duracion", valor: prodComb.duracion + " min."});
			bloquesDerecha.push({
				titulo: "Status",
				valor: statusResumido.nombre,
				id: statusResumido.id,
			});
			avatar = comp.nombreAvatar(prodOrig, prodEdic);
		}
		// Obtiene datos para la vista
		if (entidad == "capitulos")
			prodComb.capitulos = await BD_especificas.obtieneCapitulos(
				prodComb.coleccion_id,
				prodComb.temporada
			);
		// Va a la vista
		//return res.send(bloquesDerecha)
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo,
			entidad,
			prodID,
			producto: prodComb,
			avatar,
			tituloAvatar: prodComb.nombre_castellano,
			bloquesIzquierda,
			bloquesDerecha,
			camposDD1,
			camposDD2,
			camposDD3,
			BD_paises,
			BD_idiomas,
			camposDP,
			vista: req.baseUrl + req.path,
			paises,
			prodNombre,
			cartel: codigo == "edicion",
			dataEntry: {},
			campo: "",
			omitirImagenDerecha: codigo == "edicion",
			omitirFooter: codigo == "edicion",
		});
	},
	prodEdicGuardar: async (req, res) => {
		// Obtiene los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		// Obtiene el userID
		let userID = req.session.usuario.id;
		// Obtiene el producto 'Original' y 'Editado'
		let [prodOrig, prodEdic] = await procesos.obtieneVersionesDelProducto(entidad, prodID, userID);
		// Obtiene el 'avatar' --> prioridades: data-entry, edición, original
		let avatar_archivo = req.file ? req.file.filename : "";
		// Unir 'Edición' y 'Original'
		let prodComb = {...prodOrig, ...prodEdic, ...req.body, avatar_archivo, id: prodID};
		// Averigua si hay errores de validación
		let errores = await validar.consolidado("", {...prodComb, entidad});
		if (errores.hay) {
			if (req.file) comp.borraUnArchivo(req.file.destination, req.file.filename);
		} else {
			// Actualizar los archivos avatar
			if (avatar_archivo) {
				// Mover el archivo actual a su ubicación para ser revisado
				comp.mueveUnArchivoImagen(prodComb.avatar_archivo, "9-Provisorio", "4-ProdsRevisar");
				// Eliminar el anterior archivo de imagen
				if (prodEdic.avatar)
					comp.borraUnArchivo("./publico/imagenes/4-ProdsRevisar/", prodEdic.avatar);
			}
			// Actualiza la edición
			let edicion = {...req.body, avatar_archivo};
			await comp.guardarEdicion(entidad, "prods_edicion", prodOrig, edicion, userID);
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
