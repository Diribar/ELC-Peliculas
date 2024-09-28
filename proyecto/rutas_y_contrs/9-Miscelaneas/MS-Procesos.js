"use strict";

module.exports = {
	rutas: (entidad) => {
		// Variables
		const siglaFam = comp.siglaFam(entidad);
		const familia = comp.obtieneDesdeEntidad.familia(entidad);

		// Rutas
		const rutas = [
			// Familia - ant: familia + rutaAnt (salvo correccion) / act: entidad + rutaAct
			{ant: "/" + familia + "/historial", act: "/" + entidad + "/hs"},
			{ant: "/" + familia + "/inactivar", act: "/" + entidad + "/in"},
			{ant: "/" + familia + "/recuperar", act: "/" + entidad + "/rc"},
			{ant: "/" + familia + "/eliminadoPorCreador", act: "/" + entidad + "/ec"},
			{ant: "/" + familia + "/eliminar", act: "/" + entidad + "/el"},
			{ant: "/correccion/motivo", act: "/" + entidad + "/cm"},
			{ant: "/correccion/status", act: "/" + entidad + "/cs"},

			// Revisión de Entidades - ant: revision + familia + ant (salvo links) / act:
			{ant: "/revision/" + familia + "alta", act: "/revision/al" + siglaFam + "/" + entidad},
			{ant: "/revision/" + familia + "edicion", act: "/revision/ed/" + entidad},
			{ant: "/revision/" + familia + "rechazar", act: "/revision/ch/" + entidad},
			{ant: "/revision/" + familia + "inactivar", act: "/revision/in/" + entidad},
			{ant: "/revision/" + familia + "recuperar", act: "/revision/rc/" + entidad},
			{ant: "/revision/rclv/solapamiento", act: "/revision/slr/" + entidad},
			{ant: "/revision/links", act: "/revision/lkp/" + entidad},
		];

		// Fin
		return rutas;
	},
};
