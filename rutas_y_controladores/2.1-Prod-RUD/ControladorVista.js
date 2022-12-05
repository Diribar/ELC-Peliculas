"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");
const valida = require("./FN-Validar");

// *********** Controlador ***********
module.exports = {
	prodDetEdic_Form: async (req, res) => {
		// DETALLE - EDICIÓN
		// 1. Tema y Código
		const tema = "prod_rud";
		const codigo = req.path.slice(1, -1);
		// 2. Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario ? req.session.usuario.id : "";
		let imgDerPers, avatarLinksExternos;
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
		let camposInput1, camposInput2, camposInput3, camposDP, BD_paises, BD_idiomas;
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
			let camposInput = variables.camposDD.filter((n) => n[entidad]).filter((n) => n.campoInput);
			camposInput1 = camposInput.filter((n) => n.antesDePais);
			camposInput2 = camposInput.filter((n) => !n.antesDePais && n.nombre != "produccion");
			camposInput3 = camposInput.filter((n) => n.nombre == "produccion");
			BD_paises = await BD_genericas.obtieneTodos("paises", "nombre");
			BD_idiomas = await BD_genericas.obtieneTodos("idiomas", "nombre");
			imgDerPers = comp.avatarOrigEdic(prodOrig, prodEdic);
			avatarLinksExternos = variables.avatarLinksExternos(prodOrig.nombre_castellano);
			camposDP = await variables.camposDP(userID).then((n) => n.filter((m) => m.grupo != "calificala"));
			// Código a borrar
			if (
				!camposDP.find((n) => n.nombre == "personaje_id").valores ||
				!camposDP.find((n) => n.nombre == "hecho_id").valores ||
				!camposDP.find((n) => n.nombre == "valor_id").valores
			) {
				console.log(65,camposDP)
				return res.send(camposDP.filter(n=>n.grupo=="RCLV"));
			}
		} else if (codigo == "detalle") {
			// Variables de 'Detalle'
			let statusResumido = prodComb.status_registro.gr_creado
				? {id: 1, valor: "Pend. Aprobac."}
				: prodComb.status_registro.aprobado
				? {id: 2, valor: "Aprobado"}
				: {id: 3, valor: "Inactivado"};
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
			bloquesDerecha.push({titulo: "Status", ...statusResumido});
			imgDerPers = comp.avatarOrigEdic(prodOrig, prodEdic);
			imgDerPers = imgDerPers.edic;
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
			imgDerPers,
			tituloImgDerPers: prodComb.nombre_castellano,
			bloquesIzquierda,
			bloquesDerecha,
			camposInput1,
			camposInput2,
			camposInput3,
			BD_paises,
			BD_idiomas,
			camposDP,
			vista: req.baseUrl + req.path,
			paises,
			prodNombre,
			cartel: codigo == "edicion",
			dataEntry: {},
			// campo: "",
			avatarLinksExternos,
			omitirImagenDerecha: codigo == "edicion",
			omitirFooter: codigo == "edicion",
		});
	},
	prodEdic_Guardar: async (req, res) => {
		// Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Obtiene el producto 'Original' y 'Editado'
		let [prodOrig, prodEdic] = await procesos.obtieneVersionesDelProducto(entidad, prodID, userID);
		// Adecuaciones para el avatar
		if (req.file) {
			req.body.avatar = req.file.filename;
			req.body.avatar_url = req.file.originalname;
			req.body.avatar = req.file.filename;
			req.body.tamano = req.file.size;
		}
		// Une 'Edición' y 'Original'
		let prodComb = {...prodOrig, ...prodEdic, ...req.body, id: prodID};
		// Averigua si hay errores de validación
		let errores = await valida.consolidado("", {...prodComb, entidad});
		if (req.file) {
			// Actualiza los archivos avatar
			if (!errores.hay) {
				// Mueve el archivo actual a su ubicación para ser revisado
				comp.mueveUnArchivoImagen(prodComb.avatar, "9-Provisorio", "4-ProdsRevisar");
				// Elimina el anterior archivo de imagen
				if (prodEdic.avatar)
					comp.borraUnArchivo("./publico/imagenes/4-ProdsRevisar/", prodEdic.avatar);
			}
			// Si hay errores, entonces borra el archivo
			else {
				comp.borraUnArchivo("./publico/imagenes/9-Provisorio/", req.file.filename);
				return res.send(errores);
			}
		}
		// Actualiza la edición
		if (!errores.hay) await comp.guardaEdicion(entidad, "prods_edicion", prodOrig, req.body, userID);
		// Fin
		return res.redirect("/producto/edicion/?entidad=" + entidad + "&id=" + prodID);
	},
	calificala: (req, res) => {
		return res.send("Estoy en calificala");
	},
	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};
