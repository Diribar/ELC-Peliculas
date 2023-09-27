"use strict";
window.addEventListener("load", async () => {
	// Variables
	const [resultado,publicos] = await fetch("/graficos/api/peliculas-publico").then((n) => n.json());

	// Configura los valores de los ejes
	let ejeX = [];
	let ejeY = [];
	for (let publico of publicos)
		for (let rubro in resultado) {
			ejeX.push(publico + " - " + rubro);
			ejeY.push(resultado[rubro][publico]);
		}

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
			colors: [gris, gris, azul, azul, "green", "green"],
			fontSize: 10,
			chartArea: {height: "80%"},
			legend: "none",
			pieSliceText: "value",
			sliceVisibilityThreshold: 0.10,
			legend: {position: "labeled"},
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.PieChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
