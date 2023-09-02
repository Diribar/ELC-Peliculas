"use strict";
window.addEventListener("load", async () => {
	// Variables
	const {cfc, vpc} = await fetch("/graficos/api/cantidad-de-peliculas-por-cfc-y-vpc").then((n) => n.json());
	console.log(cfc, vpc);

	const ejeX_cfc = [...Object.keys(cfc)].map((n) => "cfc-" + n);
	const ejeX_vpc = [...Object.keys(vpc).reverse()].map((n) => "vpc-" + n);
	const ejeX = [...ejeX_cfc, ...ejeX_vpc];
	const ejeY = [...Object.values(cfc), ...Object.values(vpc).reverse()];
	console.log(ejeX);
	console.log(ejeY);

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Consolida el resultado
		const resultado = [["Público", "Cant. de Películas"]];
		for (let i = 0; i < ejeX.length; i++) resultado.push([ejeX[i], ejeY[i]]);

		// Especifica la información
		const data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		const gris = "rgb(100, 100, 100)";
		const azul = "rgb(37, 64, 97)";

		const options = {
			backgroundColor: "rgb(255,242,204)",
			colors: [gris, gris, gris, azul, azul, azul],
			fontSize: 10,
			chartArea: {height: "80%"},
			legend: "none",
			pieSliceText: "value",
			// sliceVisibilityThreshold: 0.20,
			legend: {position: "labeled"},
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.PieChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
