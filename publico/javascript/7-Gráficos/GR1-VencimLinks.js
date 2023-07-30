"use strict";
window.addEventListener("load", async () => {
	// Variables
	const dondeUbicarLosResultados = document.querySelector("#zonaDeGraficos #cuadro");
	const linksSemanales = await fetch("/graficos/api/vencimiento-de-links-por-semana").then((n) => n.json());
	console.log(linksSemanales);
	const ejeY = Object.values(linksSemanales);
	let ejeX = Object.keys(linksSemanales);
	for (let i=0 ;i<ejeX.length;i++) if (ejeX[i] > 52) ejeX[i] -= 52;
    console.log(ejeX);

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/barchart
	function drawGraphic() {
		// Arma los títulos
		let encabezado = ["Atributo"];
		for (let columna of calificaciones) encabezado.push(columna.autor);
		// Arma las filas
		let titulos = ["Deja Hue.", "Entr.", "Cal. Téc."];
		let filas = [];
		for (let fila = 0; fila < titulos.length; fila++) {
			filas.push([]);
			for (let columna = 0; columna < calificaciones.length; columna++) {
				if (!columna) filas[fila].push(titulos[fila]);
				filas[fila].push(calificaciones[columna].valores[fila] / 100);
			}
		}
		// Consolida el resultado
		let resultado = [encabezado, ...filas];

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
			colors: ["green", "lightgreen"],
			legend: {
				position: "bottom",
				alignment: "start",
				textStyle: {italic: true},
			},
			hAxis: {
				minValue: 0,
				maxValue: 1,
				ticks: [0, 0.5, 1],
				format: "percent",
			},
		};

		// Hace visible el gráfico
		let grafico = new google.visualization.ColumnChart(document.getElementById("calificacionesGrafico"));
		grafico.draw(data, options);
	}
});
