"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");

module.exports = {
	statusForm: (req, res) => {},

	correccionDeMotivo: {
		form: async (req, res) => {
			// Variables
			const tema = "correccion";
			const codigo = "cambioMotivo";
			const titulo = "Corrección de Motivo";
			const {entidad, id, origen} = req.query;
			const petitFamilias = comp.obtieneDesdeEntidad.petitFamilias(entidad);

			// Obtiene los registros
			const {regEnt, ultHist} = await obtieneRegs({entidad, id});
			const motivo = ultHist && ultHist.motivo_id ? statusMotivos.find((n) => n.id == ultHist.motivo_id) : null;

			// Datos para la vista
			const motivos = statusMotivos.filter((n) => n[petitFamilias]);
			const imgDerPers = procsFM.obtieneAvatar(regEnt).orig;
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const cola = "&respuesta=";
			const urlActual = req.session.urlActual;

			// Envía la info a la vista
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, urlActual, imgDerPers, cola, origen},
				...{familia, entidad, id, registro: regEnt, motivo, ultHist, motivos},
				cartelGenerico: true,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const {entidad, id, respuesta} = req.query;

			// Obtiene los registros
			const {regEnt, ultHist} = await obtieneRegs({entidad, id});
			const {motivo: motivoReg} = regEnt;
			const motivoHist = ultHist.motivo_id ? statusMotivos.find((n) => n.id == ultHist.motivo_id) : null;

			// Acciones si se aprobó el motivo del regEnt
			if (respuesta == "registro") {
			}
			// Acciones si se aprobó el motivo del historial
			else if (respuesta == "historial") {
				const motivo_id = motivoHist.id;
				await baseDeDatos.actualizaPorId(entidad, id, {motivo_id});
			}

			// Fin
			return res.redirect("/revision/tablero-de-entidades");
		},
	},

	// Redirecciona después de inactivar una captura
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
				: origen == "RAP"
				? "/revision/producto/alta/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
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
				: origen == "RL"
				? "/revision/links/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodID ? prodID : id)
				: "";

			// Usuarios
			if (origen == "TU") destino = "/revision/usuarios/tablero-de-usuarios";

			// Entidades
			destino = destino
				? destino
				: origen == "TE"
				? "/revision/tablero-de-entidades"
				: origen == "TM"
				? "/revision/tablero-de-mantenimiento"
				: origen == "CN"
				? "/consultas"
				: "";

			// Redirecciona a la vista que corresponda
			if (!destino) destino = "/";
			return res.redirect(destino);
		},
		redireccionaInicio: (req, res) => res.redirect("/"), // redirecciona a Inicio
		inicio: (req, res) => {
			const vistaActual = vistasInstitucs.inicio;
			return res.render("CMP-0Estructura", {
				tema: "institucional",
				...vistaActual,
			});
		},
	},

	// Listados
	listados: {
		session: (req, res) => res.send(req.session), // session
		cookies: (req, res) => res.send(req.cookies), // cookies
		rclvs: async (req, res) => {
			// Variables
			const {ruta} = comp.reqBasePathUrl(req);
			const indice = ruta.lastIndexOf("/");
			const rclv = ruta.slice(indice + 1);
			const condicion = {id: {[Op.ne]: 1}};
			const include = [...variables.entidades.prods, "prodsEdiciones"];
			let rclvs = {};
			let resultado = {};

			// Lectura
			await baseDeDatos
				.obtieneTodosPorCondicion(rclv, condicion, include)
				.then((n) =>
					n.map((m) => {
						rclvs[m.nombre] = 0;
						for (let entidad of include) rclvs[m.nombre] += m[entidad].length;
					})
				)
				.then(() => {
					// Ordena los métodos según la cantidad de productos
					const metodos = Object.keys(rclvs).sort((a, b) =>
						rclvs[b] != rclvs[a] ? rclvs[b] - rclvs[a] : a < b ? -1 : 1
					);
					// Crea un objeto nuevo, con los métodos ordenados
					metodos.map((n) => (resultado[n] = rclvs[n]));
				});

			// Fin
			return res.send(resultado);
		},
		links: async (req, res) => {
			// Variables
			const entidades = variables.entidades.prods;
			let productos = [];
			let TR, GR, CC, cantLinks;

			// Busca las películas y filtra por las que tienen más de un link
			for (let entidad of entidades)
				productos.push(
					...(await baseDeDatos.obtieneTodos(entidad, "links").then((n) => n.filter((m) => m.links.length > 1)))
				);

			// Separa entre links TR, GR y CC
			for (let producto of productos) {
				// Trailer
				cantLinks = producto.links.filter((n) => n.tipo_id == 1).length;
				if (!TR || TR.cantLinks < cantLinks) TR = {nombre: producto.nombreCastellano, cantLinks};

				// Gratis
				cantLinks = producto.links.filter((n) => n.tipo_id == 2 && n.gratuito).length;
				if (!GR || GR.cantLinks < cantLinks) GR = {nombre: producto.nombreCastellano, cantLinks};

				// Gratis
				cantLinks = producto.links.filter((n) => n.tipo_id == 2 && !n.gratuito).length;
				if (!CC || CC.cantLinks < cantLinks) CC = {nombre: producto.nombreCastellano, cantLinks};
			}

			// Devuelve la info
			return res.send({TR, GR, CC});
		},
	},
};
let obtieneRegs = async ({entidad, id}) => {
	// Obtiene el motivo del producto
	let include = [];
	if (entidad == "capitulos") include.push("coleccion");
	if (entidad == "colecciones") include.push("capitulos");
	const regEnt = await baseDeDatos.obtienePorId(entidad, id, include);

	// Obtiene el motivo del historial
	const condicion = {
		entidad,
		entidad_id: id,
		[Op.or]: {statusOriginal_id: {[Op.gt]: aprobado_id}, statusFinal_id: {[Op.gt]: aprobado_id}},
	};

	const ultHist = await baseDeDatos.obtienePorCondicionElUltimo("statusHistorial", condicion, "statusFinalEn");

	// Fin
	return {regEnt, ultHist};
};
