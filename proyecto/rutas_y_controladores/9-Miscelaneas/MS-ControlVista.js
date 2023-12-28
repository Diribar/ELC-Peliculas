"use strict";
// Variables
const procesosRE = require("../3-RevisionEnts/RE-Procesos");
const procesos = require("./MS-Procesos");

// *********** Controlador ***********
module.exports = {
	// Tablero de mantenimiento
	tableroMantenim: async (req, res) => {
		// Variables
		const tema = "mantenimiento";
		const codigo = "tableroControl";
		const userID = req.session.usuario.id;
		const omnipotente = req.session.usuario.rolUsuario_id == rolOmnipotente_id;

		// Productos
		let prods = procesos.obtieneProds(userID).then((n) => procesosRE.TC.procesaCampos.prods(n));
		let rclvs = procesos.obtieneRCLVs(userID).then((n) => procesosRE.TC.procesaCampos.rclvs(n));
		let prodsConLinksInactivos = procesos.obtieneLinksInactivos(userID).then((n) => procesosRE.TC.procesaCampos.prods(n));

		// RCLVs
		[prods, rclvs, prodsConLinksInactivos] = await Promise.all([prods, rclvs, prodsConLinksInactivos]);

		// Une Productos y Links
		prods = {...prods, ...prodsConLinksInactivos};

		// Obtiene información para la vista
		const dataEntry = req.session.tableros && req.session.tableros.mantenimiento ? req.session.tableros.mantenimiento : {};

		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Mantenimiento", origen: "TM"},
			...{prods, rclvs, omnipotente},
			dataEntry,
		});
	},

	// Redireccionar después de inactivar una captura
	redirecciona: {
		rutaAnterior: async (req, res) => {
			// Variables
			const {origen, prodEntidad, prodID, entidad, id, urlDestino, grupo} = req.query;
			let destino;

			// Casos particulares
			if (urlDestino) return res.redirect(urlDestino);
			if (!origen) return res.redirect("/");

			// Producto
			destino = destino
				? destino
				: origen == "DA"
				? "/producto/agregar/datos-adicionales"
				: origen == "DTP"
				? "/producto/detalle/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
				: origen == "EDP"
				? "/producto/edicion/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
				: origen == "CAL"
				? "/producto/calificar/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
				: origen == "REP"
				? "/revision/producto/edicion/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
				: "";

			// RCLV
			if (origen == "DTR") destino = "/rclv/detalle/?entidad=" + entidad + "&id=" + id;

			// Links
			destino = destino
				? destino
				: ["LK", "LKM"].includes(origen)
				? "/links/abm/?entidad=" +
				  (prodEntidad ? prodEntidad : entidad) +
				  "&id=" +
				  (prodID ? prodID : id) +
				  (origen == "LKM" ? "&origen=TM" : "") +
				  (grupo ? "&grupo=inactivo" : "")
				: origen == "RLK"
				? "/revision/links/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
				: "";

			// Usuarios
			if (origen == "TU") destino = "/revision/usuarios/tablero-de-control";

			// Entidades
			destino = destino
				? destino
				: origen == "TE"
				? "/revision/tablero-de-control"
				: origen == "TM"
				? "/mantenimiento"
				: "";

			// Redirecciona a la vista que corresponda
			if (!destino) destino = "/";
			return res.redirect(destino);
		},
		inicio: (req, res) => res.redirect("/institucional/inicio"), // redirecciona a Inicio
	},

	// Listados
	listados: {
		session: (req, res) => res.send(req.session), // session
		cookies: (req, res) => res.send(req.cookies), // cookies
		RCLVs: async (req, res) => {
			// Variables
			const {ruta} = comp.reqBasePathUrl(req);
			const rclv = ruta.slice(1);
			const condicion = {id: {[Op.ne]: 1}};
			const include = [...variables.entidades.prods, "prodsEdiciones"];
			let rclvs = {};
			let resultado2 = {};

			// Lectura
			await BD_genericas.obtieneTodosPorCondicionConInclude(rclv, condicion, include)
				.then((n) =>
					n.map((m) => {
						rclvs[m.nombre] = 0;
						for (let entidad of include) rclvs[m.nombre] += m[entidad].length;
					})
				)
				.then(() => {
					// Ordena los métodos
					const metodos = Object.keys(rclvs).sort((a, b) =>
						rclvs[b] != rclvs[a] ? rclvs[b] - rclvs[a] : a < b ? -1 : 1
					);
					// Crea un objeto nuevo, con los métodos ordenados
					metodos.map((n) => (resultado2[n] = rclvs[n]));
				});

			// Fin
			return res.send(resultado2);
		},
	},
};
