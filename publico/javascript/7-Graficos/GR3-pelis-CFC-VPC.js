"use strict";
window.addEventListener("load", async () => {
	// Variables
	const {aprob, pend} = await fetch("/graficos/api/peliculas-cfc-vpc").then((n) => n.json());

	const ejeX = ["cfc-aprob", "cfc-pend", "vpc-pend", "vpc-aprob"];
	const ejeY = [aprob.cfc, pend.cfc, pend.vpc, aprob.vpc];
	console.log(10, ejeX, ejeY);

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Consolida el resultado
		const resultado = [["Status", "Cant. de Películas"]];
		for (let i = 0; i < ejeX.length; i++) resultado.push([ejeX[i], ejeY[i]]);

		// Especifica la información
		const data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		const gris = "rgb(100, 100, 100)";
		const azul = "rgb(37, 64, 97)";

		const options = {
			backgroundColor: "rgb(255,242,204)",
			colors: [gris, gris, azul, azul],
			fontSize: 10,
			chartArea: {height: "80%"},
			legend: "none",
			pieSliceText: "value",
			legend: {position: "labeled"},
			slices: {1: {offset: 0.1}, 2: {offset: 0.1}},
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.PieChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
