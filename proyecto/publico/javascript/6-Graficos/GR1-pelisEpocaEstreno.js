"use strict";
window.addEventListener("load", async () => {
	// Variables
	const {cfc, vpc} = await fetch("/graficos/api/peliculas-epoca-estreno").then((n) => n.json());
	const ejeX = Object.keys(cfc);
	let totalCfc = 0;
	let totalVpc = 0;

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Variables
		const resultado = [["Época", "CFC", {role: "style"}, "VPC", {role: "style"}]];

		// Consolida el resultado
		for (let valorX of ejeX) {
			resultado.push([valorX, cfc[valorX], "stroke-color: #F57C00", vpc[valorX], "stroke-color: rgb(37,64,97)"]);
			totalCfc += cfc[valorX];
			totalVpc += vpc[valorX];
		}

		// Especifica la información
		const data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		const options = {
			title: "Cantidad: " + totalCfc + " CFC + " + totalVpc + " VPC = " + (totalCfc + totalVpc)+" Total",
			backgroundColor: "rgb(255,242,204)",
			fontSize: 10,
			animation: {
				duration: 100,
				easing: "out",
				startup: true,
			},
			chartArea: {width: "80%", height: "70%"},
			colors: ["rgb(255, 230, 153)", "rgb(220, 230, 242)"],
			//legend: "none",
			hAxis: {
				format: "decimal",
				scaleType: "number",
				title: "Época",
			},
			vAxis: {
				fontSize: 20,
				title: "Cantidad de películas y colecciones",
				viewWindow: {min: 0},
			},
			isStacked: true, // columnas apiladas
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.ColumnChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
