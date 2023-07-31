"use strict";

// *********** Controlador ***********
module.exports = {
	vencimLinks: async (req, res) => {
		// Fin
		return res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo: "vencimLinks",
			titulo: "Vencimiento Semanal de Links",
		});
	},
};
