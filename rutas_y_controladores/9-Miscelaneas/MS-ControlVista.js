"use strict";
const BD_genericas = require("../../funciones/2-BD/Genericas");
const variables = require("../../funciones/1-Procesos/Variables");
const procesosRE = require("../3-RevisionEnts/RE-Procesos");
const procesos = require("./MS-Procesos");


// *********** Controlador ***********
module.exports = {
	// Redireccionar después de inactivar una captura
	redireccionar: async (req, res) => {
		// Variables
		let {origen, prodEntidad, prodID, entidad, id, urlDestino} = req.query;
		// return res.send(req.query)
		// Si es 'tablero', ir a tablero
		let destino = false
			? null
			: // Producto
			origen == "DA"
			? "/producto/agregar/datos-adicionales"
			: origen == "DTP"
			? "/producto/detalle/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: origen == "EDP"
			? "/producto/edicion/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: origen == "LK"
			? "/links/abm/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: // RCLV
			origen == "DTR"
			? "/rclv/detalle/?entidad=" + entidad + "&id=" + id
			: // Revisión
			origen == "TE"
			? "/revision/tablero-de-control"
			: origen == "RLK"
			? "/revision/links/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: origen == "REP"
			? "/revision/producto/edicion/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
			: // Otros
			origen == "TU"
			? "/revision/usuarios/tablero-de-control"
			: origen == "TM"
			? "/mantenimiento"
			: urlDestino
			? urlDestino
			: "/";
		// Redireccionar a la vista que corresponda
		return res.redirect(destino);
	},

	// Tablero de mantenimiento
	tableroMantenim: async (req, res) => {
		// Variables
		const tema = "mantenimiento";
		const codigo = "tableroControl";
		const userID = req.session.usuario.id;
		const revisor = req.session.usuario.rolUsuario.revisorEnts;
		const omnipotente = req.session.usuario.rolUsuario.omnipotente;

		// Productos
		let prods = await procesos.obtieneProds(userID);
		// return res.send(prods)
		prods = procesosRE.TC.prod_ProcesaCampos(prods);

		// RCLVs
		let rclvs = await procesos.obtieneRCLVs(userID);
		rclvs = procesosRE.TC.RCLV_ProcesaCampos(rclvs);

		// Links
		let prodLinks = await procesos.obtieneProds_Links(userID);
		prodLinks = procesosRE.TC.prod_ProcesaCampos(prodLinks);

		// Une Productos y Links
		prods = {...prods, ...prodLinks};

		// Obtiene información para la vista
		const dataEntry = req.session.tableros && req.session.tableros.mantenimiento ? req.session.tableros.mantenimiento : {};

		// Va a la vista
		// return res.send(productos)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Mantenimiento", origen: "TM"},
			...{prods, rclvs, revisor, omnipotente},
			dataEntry,
		});
	},

	calificarProds: async (req,res) => {
		const tema = "calificar";
		const codigo = "calificar";

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
		const entidadesRCLV = variables.entidades.rclvs;
		const RCLVs = entidadesRCLV.map((n) => ({
			entidad: n,
			campo_id: comp.obtieneDesdeEntidad.campo_id(n),
			asociacion: comp.obtieneDesdeEntidad.asociacion(n),
		}));
		const rclvs_id = variables.entidades.rclvs_id;
		const asocs = variables.asociaciones.rclvs;
		for (let i = 0; i < asocs.length; i++)
			if (prodComb[rclvs_id[i]] != 1)
				bloqueIzq[asocs[i]] = procsRCLV.detalle.bloqueRCLV({entidad: entidadesRCLV[i], ...prodComb[asocs[i]]});
		const rclvsNombre = variables.entidades.rclvsNombre;

		// Info para el bloque Derecho
		const bloqueDer = procsCRUD.bloqueRegistro({registro: prodComb, revisor});
		const imgDerPers = procsCRUD.obtieneAvatar(original, edicion).edic;

		// Obtiene datos para la vista
		if (entidad == "capitulos")
			prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
		const links = await procesos.obtieneLinksDelProducto({entidad, id, userID});

		// Status de la entidad
		const status_id = original.statusRegistro_id;
		const statusEstable = [creadoAprob_id, aprobado_id].includes(status_id) || status_id == inactivo_id;

		// Info para la vista
		const userIdentVal = req.session.usuario && req.session.usuario.statusRegistro.ident_validada;

		// Va a la vista
		// return res.send(prodComb);
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo: [], origen, revisor, userIdentVal},
			...{entidad, id, familia: "producto", status_id, statusEstable},
			...{entidadNombre, registro: prodComb, links},
			...{imgDerPers, tituloImgDerPers: prodComb.nombreCastellano},
			...{bloqueIzq, bloqueDer, RCLVs, asocs, rclvsNombre},
		});
	},
	
	// Redireccionar a Inicio
	redireccionarInicio: (req, res) => {
		return res.redirect("/institucional/inicio");
	},

	// Session y Cookies
	session: (req, res) => {
		return res.send(req.session);
	},
	cookies: (req, res) => {
		return res.send(req.cookies);
	},

	// Productos por RCLV
	listadoRCLVs: async (req, res) => {
		// Variables
		const rclv = req.path.slice(1);
		const condicion = {id: {[Op.ne]: 1}};
		const includes = [...variables.entidades.prods, "prods_ediciones"];
		let rclvs = {};
		let resultado2 = {};

		// Lectura
		await BD_genericas.obtieneTodosPorCondicionConInclude(rclv, condicion, includes)
			.then((n) =>
				n.map((m) => {
					rclvs[m.nombre] = 0;
					for (let entidad of includes) rclvs[m.nombre] += m[entidad].length;
				})
			)
			.then(() => {
				// Ordena los métodos
				const metodos = Object.keys(rclvs).sort((a, b) => (rclvs[b] != rclvs[a] ? rclvs[b] - rclvs[a] : a < b ? -1 : 1));
				// Crea un objeto nuevo, con los métodos ordenados
				metodos.map((n) => (resultado2[n] = rclvs[n]));
			});

		// Fin
		return res.send(resultado2);
	},
};
