"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const linksPorProv = await fetch(ruta).then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};
	let ejeX = linksPorProv.map((n) => n.nombre);
	const ejeY = linksPorProv.map((n) => n.links);

	// Consolida el resultado
	const resultado = [["Prov.", "Cant. de Links"]];
	for (let i = 0; i < ejeX.length; i++) resultado.push([ejeX[i], ejeY[i]]);

	// https://developers.google.com/chart/interactive/docs/gallery/piechart
	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "pie");


		// Hace visible el gráfico
		const data = new google.visualization.arrayToDataTable(resultado);
		grafico.draw(data, opciones);

		// Fin
		return;
	};

	// Dibujar el gráfico
	google.charts.setOnLoadCallback(dibujarGrafico);

	// Fin
	return;
});
