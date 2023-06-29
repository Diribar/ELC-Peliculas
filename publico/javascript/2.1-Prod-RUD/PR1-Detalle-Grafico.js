"use strict";
window.addEventListener("load", async () => {
	// Variables
	const entidad = new URL(location.href).searchParams.get("entidad");
	const prodID = new URL(location.href).searchParams.get("id");

	// Obtiene las calificaciones
	const ruta = "/producto/api/obtiene-calificaciones/";
	let calificaciones = await fetch(ruta + "?entidad=" + entidad + "&id=" + prodID).then((n) => n.json());

	// Resultados de la calificación
	let dondeUbicarLosResultados = document.querySelector("#calificacionesResultados");
	let resultados = "General: <span>" + parseInt(calificaciones[0].valores[3]) + "%</span>";
	if (calificaciones.length == 2) resultados += " / Tuya: <span>" + parseInt(calificaciones[1].valores[3]) + "%</span>";
	dondeUbicarLosResultados.innerHTML = resultados;

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawBarColors);

	// https://developers.google.com/chart/interactive/docs/gallery/barchart
	function drawBarColors() {
		// Arma los títulos
		let encabezado = ["Aptitud"];
		for (let columna of calificaciones) encabezado.push(columna.encabezado);
		// Arma las filas
		let titulos = ["Deja H.", "Entr.", "Cal.T."];
		let filas = [];
		for (let fila = 0; fila < titulos.length; fila++) {
			filas.push([]);
			for (let columna = 0; columna < calificaciones.length; columna++) {
				if (!columna) filas[fila].push(titulos[fila]);
				filas[fila].push(calificaciones[columna].valores[fila]);
			}
		}
		// Consolida el resultado
		let resultado = [encabezado, ...filas];

		// Especifica la información
		let data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		let options = {
			fontSize: 5,
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
				ticks: [0, 1],
				format: "percent",
				gridlines: {count: 2},
				textStyle: {fontSize: 5},
			},
		};

		// Hace visible el gráfico
		let grafico = new google.visualization.BarChart(document.getElementById("calificacionesGrafico"));
		grafico.draw(data, options);
	}
});
