"use strict";

module.exports = {
	// Redirecciona después de inactivar una captura
	redirecciona: async (req, res) => {
		// Variables
		const {origen: origenCodigo, origenUrl, prodEntidad, prodId, entidad, id, urlDestino, grupo} = req.query;
		let destino;

		// Casos particulares
		if (urlDestino) return res.redirect(urlDestino);
		if (!origenCodigo && !origenUrl) return res.redirect("/");

		// Rutina para encontrar el destino
		for (let origen of variables.origenes)
			if ((origenCodigo && origenCodigo == origen.codigo) || (origenUrl && origenUrl == origen.url)) {
				destino = origen.url;
				if (origen.cola)
					destino += "/?entidad=" + (prodEntidad ? prodEntidad : entidad) + "&id=" + (prodId ? prodId : id);
				break;
			}

		// Links
		if (!destino && ["LK", "LKM"].includes(origenCodigo))
			destino =
				"/links/abm/?entidad=" +
				(prodEntidad ? prodEntidad : entidad) +
				"&id=" +
				(prodId ? prodId : id) +
				(origenCodigo == "LKM" ? "&origen=TM" : "") +
				(grupo ? "&grupo=inactivo" : "");

		// Redirecciona a la vista que corresponda
		if (!destino) destino = "/";
		return res.redirect(destino);
	},
};
