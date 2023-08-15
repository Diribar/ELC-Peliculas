"use strict";
window.addEventListener("load", async () => {
	// Variables
	const cantLinksPorProv = await fetch("/graficos/api/cantidad-de-links-por-proveedor").then((n) => n.json());
	let ejeX = cantLinksPorProv.map((n) => n.nombre);
	const ejeY = cantLinksPorProv.map((n) => n.links);
	console.log(ejeX);
	console.log(ejeY);

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Consolida el resultado
		const resultado = [["Prov.", "Cant. de Links"]];
		for (let i = 0; i < ejeX.length; i++) resultado.push([ejeX[i], ejeY[i]]);

		// Especifica la información
		const data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		const options = {
			backgroundColor: "rgb(255,242,204)",
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
