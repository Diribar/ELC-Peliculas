"use strict";
// Variables
const procesos = require("./CN-Procesos");

module.exports = {
	consultas: async (req, res) => {
		// Variables
		const tema = "consultas";
		const titulo = "Consulta de Películas";
		const usuario = req.session.usuario ? req.session.usuario : {};
		const userID = usuario ? usuario.id : null;
		const configs = await procesos.configs.cabecera(userID); // Se necesita esa función también para la API
		const configCons_cabeceras = {
			propios: configs.filter((n) => userID && n.usuario_id == userID),
			predeterms: configs.filter((n) => n.usuario_id == 1),
		};
		const configCons_campos = procesos.configs.campos();

		// Obtiene las configuraciones
		// if (configCons_url) ...;
		const configCons_BD = await obtieneConfigCons_BD(usuario);
		const configCons_SC = req.session.filtros ? req.session.filtros : req.cookies.filtros ? req.cookies.filtros : null;
		const configCons = {...configCons_BD, ...configCons_SC};

		// Va a la vista
		//return res.send({configCons_BD, configCons_SC, configCons});
		return res.render("CMP-0Estructura", {
			...{tema, titulo, userID, configCons},
			...{configCons_cabeceras, configCons_campos},
			omitirFooter: true,
		});
	},
};

let obtieneConfigCons_BD = async (usuario) => {
	// Obtiene el ID de la configCons del usuario
	const configCons_id =
		usuario && usuario.configCons_id
			? usuario.configCons_id // El guardado en el usuario
			: configConsDefault_id;

	// Obtiene la cabecera
	const configCabecera = await BD_genericas.obtienePorId("configsConsCabeceras", configCons_id);

	// Obtiene las preferencias
	let preferencias = {};
	const registros = await BD_genericas.obtieneTodosPorCondicion("configsConsCampos", {configCons_id});
	for (let registro of registros) preferencias[registro.campo] = registro.valor; // Convierte el array en objeto literal

	// Fin
	return {...configCabecera, ...preferencias};
};
let configCons_url = (req) => {
	// Si la configuración está en la url, toma el valor y redirige para eliminarlo de la url
	const configCons = Number(req.query.filtros);
	const existe = configConsUrl_id ? configs.find((n) => n.id == configCons.id) : null;
	if (existe) {
		// Actualiza el usuario
		if (usuario) {
			BD_genericas.actualizaPorId("usuarios", userID, {configCons_id: configCons.id});
			req.session.usuario = {...usuario, configCons_id};
		}
		req.session.filtros = res.clearCookie("filtros");

		// Redirecciona quitando los parámetros del 'url'
		const ruta = req.baseUrl + req.path;
		return res.redirect(ruta);
	}
};
