"use strict";
window.addEventListener("load", async () => {
	// Variables
	const dondeUbicarLosResultados = document.querySelector("#zonaDeGraficos #cuadro");
	const linksSemanales = await fetch("/graficos/api/vencimiento-de-links-por-semana").then((n) => n.json());
	const ejeY = Object.values(linksSemanales);
	let ejeX = Object.keys(linksSemanales);
	// for (let i = 0; i < ejeX.length; i++) if (ejeX[i] > 52) ejeX[i] -= 52;
	for (let i = 0; i < ejeX.length; i++) ejeX[i] = Number(ejeX[i]);

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/barchart
	function drawGraphic() {
		// Consolida el resultado
		let resultado = [["Semana", "Cant. de Links"]];
		for (let i = 0; i < ejeX.length; i++) resultado.push([ejeX[i], ejeY[i]]);

		// Especifica la información
		let data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		let options = {
			backgroundColor: "rgb(255,242,204)",
			width: "100%",
			fontSize: 8,
			animation: {
				duration: 100,
				easing: "out",
				startup: true,
			},
			numberStyle: "percent",
			chartArea: {top: "10%"},
			colors: ["rgb(31,73,125)"],
			legend: {
				position: "bottom",
				alignment: "start",
				textStyle: {italic: true},
			},
			hAxis: {
				// minValue: 0,
				format: "decimal",
				scaleType: "number",
			},
		};

		// Hace visible el gráfico
		let grafico = new google.visualization.ColumnChart(document.getElementById("grafico"));
		grafico.draw(data, options);
	}
});
