"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
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
		const {entidad, id} = req.query;
		const origen = req.query.origen;
		const userID = req.session.usuario ? req.session.usuario.id : "";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const revisor = req.session.usuario && req.session.usuario.rolUsuario.revisorEnts;

		// Obtiene el producto 'Original' y 'Editado'
		let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		// Obtiene la versión más completa posible del producto
		let prodComb = {...original, ...edicion, id};
		// Configura el título de la vista
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? " un " : " la ") +
			entidadNombre;
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
		let RCLVs = variables.entidades.rclvs;
		RCLVs = RCLVs.map((n) => ({
			entidad: n,
			campo_id: comp.obtieneDesdeEntidad.campo_id(n),
			asociacion: comp.obtieneDesdeEntidad.asociacion(n),
		}));
		if (prodComb.personaje_id != 1)
			bloqueIzq.personaje = procsRCLV.detalle.bloqueRCLV({entidad: "personajes", ...prodComb.personaje});
		if (prodComb.hecho_id != 1) bloqueIzq.hecho = procsRCLV.detalle.bloqueRCLV({entidad: "hechos", ...prodComb.hecho});
		if (prodComb.tema_id != 1) bloqueIzq.valor = procsRCLV.detalle.bloqueRCLV({entidad: "temas", ...prodComb.tema});

		// Info para el bloque Derecho
		const bloqueDer = procsCRUD.bloqueRegistro({registro: prodComb, revisor});
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
		const links = await procesos.obtieneLinksDelProducto(entidad, id);

		// Status de la entidad
		const status_id = original.statusRegistro_id;
		const statusEstable = [creadoAprob_id, aprobado_id].includes(status_id) || status_id == inactivo_id;

		// Info para la vista
		const userIdentVal = req.session.usuario && req.session.usuario.statusRegistro.ident_validada;

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo: [], origen, revisor, userIdentVal},
			...{entidad, id, familia: "producto", status_id, statusEstable},
			...{entidadNombre, registro: prodComb, links},
			...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
			...{bloqueIzq, bloqueDer, RCLVs},
		});
	},
	prodEdicion_Form: async (req, res) => {
		// Tema y Código
		const tema = "prod_rud";
		const codigo = "edicion";

		// Más variables
		const {entidad, id} = req.query;
		const origen = req.query.origen;
		const userID = req.session.usuario ? req.session.usuario.id : "";
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		let imgDerPers, avatarsExternos, gruposPers, gruposHechos;
		let camposInput1, camposInput2, produccion, camposDA, paisesTop5;

		// Configura el título de la vista
		const titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? " un " : " la ") +
			entidadNombre;

		// Obtiene la versión más completa posible del producto
		const [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		let prodComb = {...original, ...edicion, id};
		if (req.session.edicProd) prodComb = {...prodComb, ...req.session.edicProd};
		delete req.session.edicProd;

		// Obtiene el nombre de los países
		const paisesNombre = original.paises_id ? comp.paises_idToNombre(original.paises_id) : "";

		// Info para la vista de Edicion o Detalle
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

			// Datos Personalizados
			camposDA = await variables.camposDA_conValores(userID);
			gruposPers = procsCRUD.gruposPers(camposDA, userID);
			gruposHechos = procsCRUD.gruposHechos(camposDA, userID);
		}

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
		const ayudasTitulo = [
			"Los íconos de la barra azul de más abajo, te permiten editar los datos de esta vista y crear/editar los links.",
		];
		const status_id = original.statusRegistro_id;
		const revisor = req.session.usuario && req.session.usuario.rolUsuario.revisorEnts;

		// Va a la vista
		// return res.send(prodComb)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen, revisor},
			...{entidadNombre, entidad, id, familia: "producto", registro: prodComb},
			...{imgDerPers, status_id},
			...{camposInput1, camposInput2, produccion},
			...{paises, paisesTop5, idiomas, paisesNombre, camposDA, gruposPers, gruposHechos},
			...{omitirImagenDerecha: true, omitirFooter: true, cartelGenerico: true},
		});
	},
	prodEdicion_Guardar: async (req, res) => {
		// Variables
		const {entidad, id, origen} = req.query;
		const userID = req.session.usuario.id;

		// Si recibimos un avatar, se completa la información
		if (req.file) {
			req.body.avatar = req.file.filename;
			req.body.avatarUrl = req.file.originalname;
			req.body.tamano = req.file.size;
		}

		// Obtiene el producto 'Original' y 'Editado'
		let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		const avatarEdicInicial = edicion.avatar;
		if (original.capitulos) delete original.capitulos;

		// Averigua si el usuario tiene el perfil de revisor
		const revisor = req.session.usuario && req.session.usuario.rolUsuario.revisorEnts;

		// Averigua si corresponde actualizar el original
		// 1. Tiene que ser un revisor
		// 2. El registro debe estar en el status 'creadoAprob'
		// 3. El registro original no debe tener otras ediciones
		const actualizaOrig = revisor && original.statusRegistro.creadoAprob && !original.ediciones.length;

		// Averigua si hay errores de validación
		// 1. Se debe agregar el id del original, para verificar que no esté repetido
		// 2. Se debe agregar la edición, para que aporte su campo 'avatar'
		let prodComb = {...original, ...edicion, ...req.body, id};
		prodComb.epoca = revisor;
		prodComb.publico = revisor;
		let errores = await valida.consolidado({datos: {...prodComb, entidad}});

		// Acciones si no hay errores
		if (!errores.hay) {
			// 1. Actualiza el original
			if (actualizaOrig) {
				// Completa los datos a guardar
				prodComb.altaRevisadaPor_id = userID;
				prodComb.altaRevisadaEn = comp.fechaHora.ahora();
				// Actualiza el registro original
				await BD_genericas.actualizaPorId(entidad, id, prodComb);
				// Se fija si corresponde cambiar el status
				await procsCRUD.prodsPosibleAprobado(entidad, prodComb);
				// Limpia el valor de la edicion, para que no se recargue el url
				edicion = null;
			}
			// De lo contrario, actualiza la edicion
			else {
				// Combina la información
				edicion = {...edicion, ...req.body};
				// 2. Guarda o actualiza la edición, y achica 'edición a su mínima expresión
				edicion = await procsCRUD.guardaActEdicCRUD({original, edicion, entidad, userID});
			}
			// Acciones sobre el archivo avatar, si recibimos uno
			if (req.file) {
				if (actualizaOrig) {
					// Mueve el archivo de la edición para reemplazar el original
					comp.gestionArchivos.mueveImagen(prodComb.avatar, "9-Provisorio", "2-Productos/Final");
					// Elimina el anterior archivo de imagen original
					if (original.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-Productos/Final/", original.avatar);
				} else {
					// Mueve el archivo de la edición para su revisión
					comp.gestionArchivos.mueveImagen(prodComb.avatar, "9-Provisorio", "2-Productos/Revisar");
					// Elimina el anterior archivo de imagen editada
					if (edicion.avatar)
						comp.gestionArchivos.elimina("./publico/imagenes/2-Productos/Revisar/", avatarEdicInicial);
				}
			}
		} else {
			// Si recibimos un archivo avatar editado, lo elimina
			if (req.file) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio/", req.file.filename);

			// Guarda los datos editados, sin el de avatar
			req.session.edicProd = req.body;
			delete req.session.edicProd.avatar;

			// Recarga la vista
			return res.redirect(req.originalUrl);
		}

		// Fin
		return edicion
			? res.redirect(req.originalUrl) // Recarga la vista
			: origen && origen == "TE"
			? res.redirect("/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=" + origen) // Regresa a Revisión
			: res.redirect(req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id); // Recarga la página sin la edición
	},
};
