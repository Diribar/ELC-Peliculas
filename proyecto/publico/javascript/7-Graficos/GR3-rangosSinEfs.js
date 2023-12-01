"use strict";
window.addEventListener("load", async () => {
	// Obtiene información del backend
	const datos = await fetch("/graficos/api/rangos-sin-efemerides").then((n) => n.json());
	datos.splice(10);

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Consolida el resultado
		const resultado = [["Fecha", "Rango", {role: "annotation"}]];
		for (let dato of datos) resultado.push([dato.nombre, dato.rango, ""]);

		// Especifica la información
		const data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		const options = {
			backgroundColor: "rgb(255,242,204)",
			fontSize: 10,
			animation: {
				duration: 100,
				easing: "out",
				startup: true,
			},
			chartArea: {width: "80%", height: "70%"},
			// colors: ["firebrick", "rgb(31,73,125)", "rgb(79,98,40)"],
			animation: {
				duration: 100,
				easing: "out",
				startup: true,
			},
			chartArea: {width: "80%", height: "70%"},
			// colors: ["firebrick", "rgb(31,73,125)", "rgb(79,98,40)"],
			colors: ["rgb(31,73,125)"],
			legend: {position: "none"},
			vAxis: {
				fontSize: 20,
				title: "Días sin efemérides",
				viewWindow: {min: 0},
			},
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.ColumnChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
