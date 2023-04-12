"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-FN-Procesos");
const procesos = require("./PR-FN-Procesos");
const valida = require("./PR-FN-Validar");

// *********** Controlador ***********
module.exports = {
	prodDetalle_Form: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_rud";
		const codigo = "detalle";

		// Variables
		let {entidad, id, origen} = req.query;
		const userID = req.session.usuario ? req.session.usuario.id : "";
		const familia = comp.obtieneFamilia(entidad);
		if (!origen) origen = "DTP";
		const revisor_ents = req.session.usuario.rol_usuario.revisor_ents;

		// Obtiene el producto 'Original' y 'Editado'
		let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		// Obtiene la versión más completa posible del producto
		let prodComb = {...original, ...edicion, id};
		// Configura el título de la vista
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? " un " : " la ") +
			prodNombre;
		// Info para el bloque Izquierdo
		// Primer proceso: hace más legible la información
		const infoProcesada = procesos.bloqueIzq(prodComb);
		// Segundo proceso: reagrupa la información
		let bloqueIzq = {masInfoIzq: [], masInfoDer: [], actores: infoProcesada.actores};
		if (infoProcesada.infoGral.length) {
			let infoGral = infoProcesada.infoGral;
			for (let i = 0; i < infoGral.length / 2; i++) {
				// Agrega un dato en 'masInfoIzq'
				bloqueIzq.masInfoIzq.push(infoGral[i]);
				// Agrega un dato en 'masInfoDer'
				let j = parseInt(infoGral.length / 2 + 0.5 + i);
				if (j < infoGral.length) bloqueIzq.masInfoDer.push(infoGral[j]);
			}
		}

		// RCLV
		let RCLVs = variables.entidadesRCLV;
		RCLVs = RCLVs.map((n) => ({
			entidad: n,
			campo_id: comp.obtieneCampo_idDesdeEntidad(n),
			asociacion: comp.obtieneAsociacion(n),
		}));
		if (prodComb.personaje_id != 1)
			bloqueIzq.personaje = procsRCLV.detalle.bloqueRCLV({entidad: "personajes", ...prodComb.personaje});
		if (prodComb.hecho_id != 1) bloqueIzq.hecho = procsRCLV.detalle.bloqueRCLV({entidad: "hechos", ...prodComb.hecho});
		if (prodComb.tema_id != 1) bloqueIzq.valor = procsRCLV.detalle.bloqueRCLV({entidad: "temas", ...prodComb.tema});
		// return res.send(bloqueIzq);

		// Info para el bloque Derecho
		const bloqueDer = procsCRUD.bloqueRegistro({registro: prodComb, revisor: revisor_ents});
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
		const links = await procesos.obtieneLinksDelProducto(entidad, id);

		// Status de la entidad
		const status_id = original.status_registro_id;
		const statusEstable = [creado_aprob_id, aprobado_id].includes(status_id) || status_id == inactivo_id;

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo: [], origen},
			...{entidad, id, familia, status_id, statusEstable},
			...{prodNombre, registro: prodComb, links},
			...{imgDerPers, tituloImgDerPers: prodComb.nombre_castellano},
			...{bloqueIzq, bloqueDer, RCLVs},
			userRevisor: req.session.usuario && req.session.usuario.rol_usuario.revisor_ents,
			userIdentVal: req.session.usuario && req.session.usuario.status_registro.ident_validada,
		});
	},
	prodEdicion_Form: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_rud";
		const codigo = "edicion";
		let {entidad, id, origen} = req.query;
		const userID = req.session.usuario ? req.session.usuario.id : "";
		const familia = comp.obtieneFamilia(entidad);
		if (!origen) origen = "DTP";
		let imgDerPers, avatarLinksExternos, gruposPers, gruposHechos;
		let camposInput1, camposInput2, produccion, camposDA, paisesTop5;

		// 2. Obtiene el producto 'Original' y 'Editado'
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		// 3. Obtiene la versión más completa posible del producto
		let prodComb = {...original, ...edicion, id};
		// 4. Configura el título de la vista
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? " un " : " la ") +
			prodNombre;
		// 5. Obtiene el nombre de los países
		const paisesNombre = original.paises_id ? comp.paises_idToNombre(original.paises_id) : "";
		// 6. Info para la vista de Edicion o Detalle
		if (codigo == "edicion") {
			// Obtiene los datos de session/cookie y luego los elimina
			let edicSession;
			// Session
			if (req.session.edicProd) {
				if (req.session.edicProd.entidad == entidad && req.session.edicProd.id == id) edicSession = req.session.edicProd;
				else delete req.session.edicProd;
			}
			// Cookies
			if (req.cookies.edicProd && !edicSession) {
				if (req.cookies.edicProd.entidad == entidad && req.cookies.edicProd.id == id) edicSession = req.cookies.edicProd;
				else res.clearCookie("edicProd");
			}
			// Actualiza el producto prodComb
			prodComb = {...prodComb, ...edicSession};
			// Datos Duros - Campos Input
			let camposInput = variables.camposDD.filter((n) => n[entidad] || n.productos).filter((n) => n.campoInput);
			camposInput1 = camposInput.filter((n) => n.antesDePais);
			camposInput2 = camposInput.filter((n) => !n.antesDePais && n.nombre != "produccion");
			produccion = camposInput.find((n) => n.nombre == "produccion");
			// Datos Duros - Bases de Datos
			paisesTop5 = paises.sort((a, b) => b.cantProds - a.cantProds).slice(0, 5);
			// Datos Duros - Avatar
			imgDerPers = procsCRUD.obtieneAvatar(original, {...edicion, ...edicSession});
			avatarLinksExternos = variables.avatarLinksExternos(original.nombre_castellano);
			// Datos Personalizados
			camposDA = await variables.camposDA_conValores(userID);
			gruposPers = procsCRUD.gruposPers(camposDA, userID);
			gruposHechos = procsCRUD.gruposHechos(camposDA, userID);
		}
		// 7. Obtiene datos para la vista
		if (entidad == "capitulos")
			prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
		const ayudasTitulo = [
			"Los íconos de la barra azul de más abajo, te permiten editar los datos de esta vista y crear/editar los links.",
		];
		const status_id = original.status_registro_id;
		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen},
			...{prodNombre, registro: prodComb},
			...{entidad, id, familia},
			...{imgDerPers, tituloImgDerPers: prodComb.nombre_castellano},
			...{camposInput1, camposInput2, produccion},
			...{paises, paisesTop5, idiomas, paisesNombre, camposDA, gruposPers, gruposHechos},
			...{dataEntry: {}, avatarLinksExternos, status_id},
			userRevisor: req.session.usuario && req.session.usuario.rol_usuario.revisor_ents,
			...{omitirImagenDerecha: true, omitirFooter: true, cartelGenerico: true},
		});
	},
	prodEdicion_Guardar: async (req, res) => {
		// Variables
		const entidad = req.query.entidad;
		const id = req.query.id;
		const userID = req.session.usuario.id;
		const origen = req.query.origen;

		// Obtiene el producto 'Original' y 'Editado'
		let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		const revisor_ents = req.session.usuario.rol_usuario.revisor_ents;
		const actualizaOrig = revisor_ents && original.status_registro.creado_aprob && !original.ediciones.length;

		// Si recibimos un avatar, se completa la información
		if (req.file) {
			req.body.avatar = req.file.filename;
			req.body.avatar_url = req.file.originalname;
			req.body.tamano = req.file.size;
		}

		// Averigua si hay errores de validación
		// 1. Se debe agregar el id del original, para verificar que no esté repetido
		// 2. Se debe agregar la edición, para que aporte su campo 'avatar'
		let prodComb = {...original, ...edicion, ...req.body, id};
		prodComb.publico = revisor_ents;
		let errores = await valida.consolidado({datos: {...prodComb, entidad}});

		// Acciones sobre el archivo avatar, si recibimos uno
		if (req.file) {
			// Si no hay errores, actualiza el archivo avatar
			if (!errores.hay) {
				if (actualizaOrig) {
					// Mueve el archivo de la edición para reemplazar el original
					comp.mueveUnArchivoImagen(prodComb.avatar, "9-Provisorio", "2-Avatar-Prods-Final");
					// Elimina el anterior archivo de imagen original
					if (original.avatar) comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Final/", original.avatar);
				} else {
					// Mueve el archivo de la edición para su revisión
					comp.mueveUnArchivoImagen(prodComb.avatar, "9-Provisorio", "2-Avatar-Prods-Revisar");
					// Elimina el anterior archivo de imagen editada
					if (edicion.avatar) comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/", edicion.avatar);
				}
			}
			// Si hay errores, borra el archivo avatar editado
			else {
				comp.borraUnArchivo("./publico/imagenes/9-Provisorio/", req.file.filename);
				// return res.send([{errores}, {...prodComb, entidad}]);
			}
		}

		// Acciones si no hay errores
		if (!errores.hay) {
			// 1. Actualiza el original
			if (actualizaOrig) {
				// Completa los datos a guardar
				prodComb.alta_revisada_por_id = userID;
				prodComb.alta_revisada_en = comp.ahora();
				// Actualiza el registro original
				await BD_genericas.actualizaPorId(entidad, id, prodComb);
				// Se fija si corresponde cambiar el status
				await procsCRUD.prodsPosibleAprobado(entidad, prodComb);
				// Limpia el valor de la edicion, para que no se recargue el url
				edicion = null;
			} else {
				// Combina la información
				edicion = {...edicion, ...req.body};
				// 2. Guarda o actualiza la edición, y achica 'edición a su mínima expresión
				edicion = await procsCRUD.guardaActEdicCRUD({original, edicion, entidad, userID});
			}
		}

		// Fin
		return edicion
			? res.redirect(req.originalUrl) // Recarga la vista
			: origen && origen == "TE"
			? res.redirect("/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=" + origen) // Regresa a Revisión
			: res.redirect(req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id); // Recarga la página sin la edición
	},
};
