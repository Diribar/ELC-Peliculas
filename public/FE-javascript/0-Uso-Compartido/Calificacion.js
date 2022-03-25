"use strict";
window.addEventListener("load", async () => {
	// Variables
	let url = window.location.pathname.slice(1, -1);
	let detalle = url == "producto/detalle";
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");

	// Obtener las calificaciones
	let ruta = "/producto/detalle/api/obtener-calificaciones/";
	let calificaciones = await fetch(
		ruta + "?entidad=" + entidad + "&id=" + prodID + "&detalle=" + detalle
	).then((n) => n.json());

	// Edición de la imagen
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawBarColors);

	// https://developers.google.com/chart/interactive/docs/gallery/barchart
	function drawBarColors() {
		// Armar los títulos
		let encabezado = ["Aptitud"];
		for (let columna of calificaciones) encabezado.push(columna.encabezado);
		// Armar las filas
		let titulos = ["IFV", "En.", "Cal"];
		let filas = [];
		for (let fila = 0; fila < titulos.length; fila++) {
			filas.push([]);
			for (let columna = 0; columna < calificaciones.length; columna++) {
				if (!columna) filas[fila].push(titulos[fila]);
				filas[fila].push(calificaciones[columna].valores[fila]);
			}
		}
		// Consolidar el resultado
		let resultado = [encabezado, ...filas];

		// Especificar la información
		var data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		let opcionesDelEjeDeValores = {
			minValue: 0,
			maxValue: 1,
			ticks: [0, 0.5, 1],
			format: "percent",
			gridlines: {count: 3},
			textStyle: {fontSize: 10},
		};
		var options = {
			fontSize: 10,
			animation: {
				duration: 500,
				easing: 'out',
				startup: true,
			},
			numberStyle: 'percent',
			chartArea: {
				top: '10%'
			},
			colors: ['green', 'lightgreen'],
			legend: {
				position: 'bottom',
				alignment: 'start',
				textStyle: {italic: true,}
			},
			hAxis: opcionesDelEjeDeValores,
		};

		// Hacer el gráfico visible
		var chart = new google.visualization.BarChart(document.getElementById("graficoCalificacion"));
		chart.draw(data, options);
	}
});
