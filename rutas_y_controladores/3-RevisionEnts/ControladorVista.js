"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procesos = require("./FN-Procesos");

module.exports = {
	// Uso general
	tableroControl: async (req, res) => {
		// Tema y Código
		const tema = "revisionEnts";
		const codigo = "tableroControl";
		let userID = req.session.usuario.id;
		// Definir variables
		const ahora = compartidas.ahora();
		// Productos y Ediciones
		let productos;
		productos = await procesos.tablero_obtenerProds(ahora, userID);
		productos.ED = await procesos.tablero_obtenerProdsConEdicAjena(ahora, userID);
		// Obtener Links
		productos.LR = await procesos.tablero_obtenerProdsConLink(ahora, userID);
		productos.SL = await procesos.tablero_obtenerProdsSinLink(ahora, userID);
		productos = procesos.tablero_prod_ProcesarCampos(productos);
		// RCLV
		let RCLVs = await procesos.tablero_obtenerRCLVs(ahora, userID);
		RCLVs = procesos.tablero_RCLV_ProcesarCampos(RCLVs);
		// Va a la vista
		// return res.send([productos,RCLVs]);
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Revisión - Tablero de Entidades",
			productos,
			RCLVs,
		});
	},
	// Productos
	prod_Alta: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionEnts";
		let url = req.url.slice(1);
		const codigo = url.slice(0, url.lastIndexOf("/"));
		// 2. Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let id = req.query.id;
		// 4. Obtener los datos ORIGINALES del producto
		let includes = ["status_registro"];
		if (entidad == "colecciones") includes.push("capitulos");
		let prodOrig = await BD_genericas.obtenerPorIdConInclude(entidad, id, includes);
		if (!prodOrig.status_registro.creado) return res.redirect("/revision/tablero-de-control");
		// 5. Obtener avatar original
		let avatar = prodOrig.avatar;
		avatar = avatar
			? (!avatar.startsWith("http") ? "/imagenes/4-ProdsRevisar/" : "") + avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// 6. Configurar el título de la vista
		let prodNombre = compartidas.obtenerEntidadNombre(entidad);
		let titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// 7. Obtener los países
		let paises = prodOrig.paises_id
			? await compartidas.paises_idToNombre(prodOrig.paises_id)
			: "";
		// 8. Info para la vista
		let [bloqueIzq, bloqueDer] = await procesos.prodAlta_ficha(prodOrig, paises);
		let motivosRechazo = await BD_genericas.obtenerTodos("altas_motivos_rech", "orden").then((n) =>
			n.filter((m) => m.prod)
		);
		// Va a la vista
		//return res.send(prodOrig)
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo,
			entidad,
			id,
			prodOrig,
			avatar,
			bloqueIzq,
			bloqueDer,
			motivosRechazo,
			prodNombre,
			title: prodOrig.nombre_castellano,
		});
	},
	prod_Edicion: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionEnts";
		const codigo = "producto/edicion";
		// 2. Constantes
		const entidad = req.query.entidad;
		const prodID = req.query.id;
		const edicID = req.query.edicion_id;
		const userID = req.session.usuario.id;
		const producto_id = compartidas.obtenerEntidad_id(entidad);

		// Verificaciones ------------------------------------------
		// Verificacion 1:
		// 1. Averigua si se recibió el dato de 'edicID' y si existe la edición a analizar
		// 2. Si no existe, averigua si existe otra ajena y recarga la vista
		// 3. Si no existe, muestra el cartel de error
		// Verificación paso 1: averigua si existe la edición a analizar
		if (parseInt(edicID)) {
			var includesEdic = [
				"en_castellano",
				"en_color",
				"idioma_original",
				"categoria",
				"subcategoria",
				"publico_sugerido",
				"personaje",
				"hecho",
				"valor",
			];
			var prodEdic = await BD_genericas.obtenerPorIdConInclude(
				"prods_edicion",
				edicID,
				includesEdic
			);
		}
		// Verificación paso 2: averigua si existe otra ajena y en caso afirmativo recarga la vista
		if (!prodEdic) {
			// Averigua si existe otra ajena
			prodEdic = await BD_especificas.obtenerEdicionAjena(
				"prods_edicion",
				producto_id,
				prodID,
				userID
			);
			// En caso afirmativo recarga la vista con el ID de la nueva edición
			if (prodEdic) {
				let ruta = req.baseUrl + req.path;
				let terminacion = "?entidad=" + entidad + "&id=" + prodID + "&edicion_id=" + prodEdic.id;
				return res.redirect(ruta + terminacion);
			}
		}
		// Verificación paso 3: muestra el cartel de error
		if (!prodEdic) {
			let informacion = await infoProdEdicion(entidad, prodID, producto_id, userID);
			return res.render("MI-Cartel", {informacion});
		}
		// 3. Obtiene la versión original
		let includesOrig = [...includesEdic, "status_registro"];
		if (entidad == "capitulos") includesOrig.push("coleccion");
		if (entidad == "colecciones") includesOrig.push("capitulos");
		let prodOrig = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includesOrig);
		// Verificacion 2: si la edición no se corresponde con el producto --> redirecciona
		if (!prodEdic[producto_id] || prodEdic[producto_id] != prodID)
			return res.redirect("/inactivar-captura/?origen=tableroEnts&entidad=" + entidad + "&id=" + prodID);
		// Verificacion 3: si no quedan campos de 'edicion' por procesar --> lo avisa
		// La consulta también tiene otros efectos:
		// 1. Elimina el registro de edición si ya no tiene más datos
		// 2. Averigua si quedan campos y obtiene la versión mínima de prodEdic
		let quedanCampos
		[quedanCampos, prodEdic] = await procesos.prodEdic_feedback(prodOrig, prodEdic);
		if (!quedanCampos) return res.render("MI-Cartel", cartelNoQuedanCampos());

		// Acciones si se superan las verificaciones -------------------------------
		// Declaración de más variables
		let motivos = await BD_genericas.obtenerTodos("edic_motivos_rech", "orden");
		let vista, avatar, ingresos, reemplazos, bloqueDer;
		// 4. Acciones dependiendo de si está editado el avatar
		if (prodEdic.avatar_archivo) {
			// Vista 'Edición-Avatar'
			vista = "RE1-Prod-Avatar";
			// Ruta y nombre del archivo 'avatar'
			avatar = {
				original: prodOrig.avatar
					? (!prodOrig.avatar.startsWith("http")
							? prodOrig.status_registro.gr_creado
								? "/imagenes/4-ProdsRevisar/"
								: "/imagenes/3-Productos/"
							: "") + prodOrig.avatar
					: "/imagenes/8-Agregar/IM.jpg",
				edicion: "/imagenes/4-ProdsRevisar/" + prodEdic.avatar_archivo,
				mostrarOriginal: !!prodEdic.avatar,
			};
			motivos = motivos.filter((m) => m.avatar);
		} else {
			// Obtener los ingresos y reemplazos
			[ingresos, reemplazos] = procesos.prodEdic_ingrReempl(prodOrig, prodEdic);
			// Obtener el avatar
			avatar = prodOrig.avatar;
			avatar = avatar
				? (!avatar.startsWith("http") ? "/imagenes/3-Productos/" : "") + avatar
				: "/imagenes/8-Agregar/IM.jpg";
			// Variables
			motivos = motivos.filter((m) => m.prod);
			bloqueDer = await procesos.prodEdic_ficha(prodOrig, prodEdic);
			vista = "CMP-0Estructura";
		}
		// 5. Configurar el título de la vista
		let prodNombre = compartidas.obtenerEntidadNombre(entidad);
		let titulo = "Revisar la Edición de" + (entidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Va a la vista
		//return res.send([ingresos, reemplazos]);
		return res.render(vista, {
			tema,
			codigo,
			titulo,
			prodOrig,
			prodEdic,
			prodNombre,
			ingresos,
			reemplazos,
			avatar,
			motivos,
			entidad,
			id: prodID,
			bloqueDer,
			vista,
			title: prodOrig.nombre_castellano,
		});
	},
	// RCLV
	RCLV_Alta: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionEnts";
		const codigo = "rclv/alta";
		// 2. Variables
		let entidad = req.query.entidad;
		let id = req.query.id;
		let includes = ["status_registro"];
		if (entidad == "personajes") includes.push("rol_iglesia");
		let dataEntry = await BD_genericas.obtenerPorIdConInclude(entidad, id, includes);
		if (dataEntry.dia_del_ano_id) {
			let dia_del_ano = await BD_genericas.obtenerTodos("dias_del_ano", "id").then((n) =>
				n.find((m) => m.id == dataEntry.dia_del_ano_id)
			);
			dataEntry.dia = dia_del_ano.dia;
			dataEntry.mes_id = dia_del_ano.mes_id;
		}
		let meses = await BD_genericas.obtenerTodos("meses", "id");
		let nombre = compartidas.obtenerEntidadNombre(entidad);
		let titulo = "Revisar - " + nombre;
		let tituloCuerpo = "Revisá el " + nombre;
		// 3. Variables específicas para personajes
		if (entidad == "personajes") {
			var procesos_canonizacion = await BD_genericas.obtenerTodos("procesos_canonizacion", "orden");
			procesos_canonizacion = procesos_canonizacion.filter((m) => m.id.length == 3);
			var roles_iglesia = await BD_genericas.obtenerTodos("roles_iglesia", "orden");
			roles_iglesia = roles_iglesia.filter((m) => m.id.length == 3);
			var apariciones_marianas = await BD_genericas.obtenerTodos("hechos", "nombre");
			apariciones_marianas = apariciones_marianas.filter((n) => n.ap_mar);
		}
		// 4. Render
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			entidad: entidad,
			titulo,
			tituloCuerpo,
			dataEntry,
			meses,
			roles_iglesia,
			procesos_canonizacion,
			apariciones_marianas,
		});
	},
	// Links
	links: async (req, res) => {
		// 1. Tema y Código
		const tema = "revisionEnts";
		const codigo = "links";
		// Otras variables
		let includes;
		let prodEntidad = req.query.entidad;
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Configurar el título
		let prodNombre = compartidas.obtenerEntidadNombre(prodEntidad);
		let titulo = "Revisar los Links de" + (prodEntidad == "capitulos" ? "l " : " la ") + prodNombre;
		// Obtener el producto con sus links originales para verificar que los tenga
		includes = ["links", "status_registro"];
		if (prodEntidad == "capitulos") includes.push("coleccion");
		let producto = await BD_genericas.obtenerPorIdConInclude(prodEntidad, prodID, includes);
		// RESUMEN DE PROBLEMAS A VERIFICAR
		let informacion = problemasLinks(producto, req.session.urlAnterior);
		if (informacion) return res.render("MI-Cartel", {informacion});
		// Obtener todos los links
		let entidad_id = compartidas.obtenerEntidad_id(prodEntidad);
		includes = ["status_registro", "ediciones", "prov", "tipo", "motivo"];
		let links = await BD_genericas.obtenerTodosPorCamposConInclude(
			"links",
			{[entidad_id]: prodID},
			includes
		);
		links.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
		// return res.send(links)
		// Información para la vista
		let avatar = producto.avatar;
		avatar = avatar
			? (!avatar.startsWith("http") ? "/imagenes/3-Productos/" : "") + avatar
			: "/imagenes/8-Agregar/IM.jpg";
		let provs = await BD_genericas.obtenerTodos("links_provs", "orden");
		let linksTipos = await BD_genericas.obtenerTodos("links_tipos", "id");
		let motivos = await BD_genericas.obtenerTodos("altas_motivos_rech", "orden")
			.then((n) => n.filter((m) => m.links))
			.then((n) =>
				n.map((m) => {
					return {id: m.id, comentario: m.comentario};
				})
			);
		let camposARevisar = variables.camposRevisarLinks().map((n) => n.nombreDelCampo);
		// Va a la vista
		//return res.send(links)
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo,
			entidad: prodEntidad,
			id: prodID,
			producto,
			links,
			provs,
			links_tipos: linksTipos,
			avatar,
			motivos,
			calidades: [144, 240, 360, 480, 720, 1080],
			mostrar: null,
			userID,
			camposARevisar,
			title: producto.nombre_castellano,
		});
	},
};

let infoProdEdicion = async (entidad, prodID, producto_id, userID) => {
	// Generar la info del error
	let informacion = {
		mensajes: ["No encontramos ninguna edición ajena para revisar"],
		iconos: [
			{
				nombre: "fa-spell-check ",
				link: "/inactivar-captura/?entidad=" + entidad + "&id=" + prodID + "&origen=tableroEnts",
				titulo: "Regresar al Tablero de Control",
			},
		],
	};
	return informacion;
};
let problemasLinks = (producto, urlAnterior) => {
	// Variables
	let informacion;
	const vistaAnterior = variables.vistaAnterior(urlAnterior);
	const vistaTablero = variables.vistaTablero();

	// El producto no está en status 'aprobado'
	if (!informacion && !producto.status_registro.aprobado)
		informacion = {
			mensajes: [
				"El producto no está en status 'Aprobado'",
				"Su status es " + producto.status_registro.nombre,
			],
		};

	// El producto no posee links
	if (!informacion && !producto.links.length)
		informacion = {mensajes: ["Este producto no tiene links en nuestra Base de Datos"]};
	// Agregar los íconos
	if (informacion) informacion.iconos = [vistaAnterior, vistaTablero];

	// Fin
	return informacion;
};
let cartelNoQuedanCampos = () => {
	return {
		mensajes: ["La edición fue borrada porque no tenía novedades respecto al original"],
		iconos: [
			{
				nombre: "fa-spell-check",
				link: "/revision/tablero-de-control",
				titulo: "Ir al 'Tablero de Control' de Revisiones",
			},
		],
	};
};
