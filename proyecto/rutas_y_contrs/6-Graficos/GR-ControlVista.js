"use strict";

const exportar = {};
for (let codigo in graficos)
	exportar[codigo] = (req, res) => {
		res.render("CMP-0Estructura", {
			tema: "gráficos",
			codigo,
			titulo: graficos[codigo].titulo,
		});
	};

module.exports = exportar;
