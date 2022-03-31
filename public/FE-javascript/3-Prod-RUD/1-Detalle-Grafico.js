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

	// Mostrar el gráfico solamente si existen calificaciones
	//console.log(calificaciones);
	if (calificaciones.length) {
		// Resultados de la calificación
		// General: <span>77%</span> / Tuya: <span>78%</span>
		let dondeUbicarLosResultados = document.querySelector("#calificacionesResultados");
		let resultados = "General: <span>" + parseInt(calificaciones[0].valores[3] * 100) + "%</span>";
		if (calificaciones.length == 2)
			resultados += " / Tuya: <span>" + parseInt(calificaciones[1].valores[3] * 100) + "%</span>";
		dondeUbicarLosResultados.innerHTML = resultados;

		// Aspectos de la imagen de Google
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
			let data = google.visualization.arrayToDataTable(resultado);

			// Opciones del gráfico
			let opcionesDelEjeDeValores = {
				minValue: 0,
				maxValue: 1,
				ticks: [0, 0.5, 1],
				format: "percent",
				gridlines: {count: 3},
				textStyle: {fontSize: 10},
			};
			let options = {
				fontSize: 10,
				animation: {
					duration: 500,
					easing: "out",
					startup: true,
				},
				numberStyle: "percent",
				chartArea: {
					top: "10%",
				},
				colors: ["green", "lightgreen"],
				legend: {
					position: "bottom",
					alignment: "start",
					textStyle: {italic: true},
				},
				hAxis: opcionesDelEjeDeValores,
			};

			// Hacer el gráfico visible
			let grafico = new google.visualization.BarChart(document.getElementById("calificacionesGrafico"));
			grafico.draw(data, options);
		}
	}
});
