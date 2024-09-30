"use strict";

module.exports = {
	rutas: (entidad) => {
		// Variables
		const siglaFam = comp.obtieneDesdeEntidad.siglaFam(entidad);
		const familia = comp.obtieneDesdeEntidad.familia(entidad);

		// Rutas
		const rutas = [
			// Producto Agregar
			...[
				// ant: '/producto/agregar' + rutaAnt - act: '/producto' + rutaAnt
				{ant: "/producto/agregar/palabras-clave", act: "/producto/palabras-clave"},
				{ant: "/producto/agregar/desambiguar", act: "/producto/desambiguar"},
				{ant: "/producto/agregar/ingreso-manual", act: "/producto/ingreso-manual"},

				// ant: '/producto/agregar' - act: entidad
				{ant: "/producto/agregar", act: "/" + entidad},
			],

			// Familia - ant: familia + rutaAnt (salvo correccion) - act: entidad + rutaAct
			...[
				{ant: "/" + familia + "/historial", act: "/" + entidad + "/hs", codigo: "historial"},
				{ant: "/" + familia + "/inactivar", act: "/" + entidad + "/in", codigo: "inactivar"},
				{ant: "/" + familia + "/recuperar", act: "/" + entidad + "/rc", codigo: "recuperar"},
				{ant: "/" + familia + "/eliminadoPorCreador", act: "/" + entidad + "/ec"},
				{ant: "/" + familia + "/eliminar", act: "/" + entidad + "/el"},
				{ant: "/correccion/motivo", act: "/" + entidad + "/cm"},
				{ant: "/correccion/status", act: "/" + entidad + "/cs"},
			],

			// Revisión de Entidades - ant: revision + familia + ant (salvo links) - act: rutaAct + entidad
			...[
				{ant: "/revision/" + familia + "/alta", act: "/revision/al" + siglaFam + "/" + entidad},
				{ant: "/revision/" + familia + "/edicion", act: "/revision/ed/" + entidad},
				{ant: "/revision/" + familia + "/inactivar", act: "/revision/in/" + entidad, codigo: "inactivar"},
				{ant: "/revision/" + familia + "/recuperar", act: "/revision/rc/" + entidad, codigo: "recuperar"},
				{ant: "/revision/" + familia + "/rechazar", act: "/revision/ch/" + entidad, codigo: "rechazar"},
				{ant: "/revision/rclv/solapamiento", act: "/revision/slr/" + entidad},
				{ant: "/revision/links", act: "/revision/lkp/" + entidad},
			],
		];

		// Fin
		return rutas;
	},
};
