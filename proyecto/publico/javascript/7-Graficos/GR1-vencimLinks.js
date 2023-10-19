"use strict";
window.addEventListener("load", async () => {
	// Obtiene información del backend
	const {linksSemanales, cantLinksTotal} = await fetch("/graficos/api/vencimiento-de-links").then((n) => n.json());

	// Eje vertical
	const ejeY = Object.values(linksSemanales);
	const maxValorEjeY = Math.ceil(cantLinksTotal / 25 / 10 + 0.5) * 10;

	// Eje horizontal
	let ejeX = Object.keys(linksSemanales);
	for (let i = 0; i < ejeX.length; i++) ejeX[i] = Number(ejeX[i]);

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Consolida el resultado
		const resultado = [["Semana", "Cant. de Links", {role: "annotation"}]];
		let ticks = [];
		for (let i = 0; i < ejeX.length; i++) {
			const valorX = ejeX[i];
			resultado.push([valorX, ejeY[i], ejeY[i]]);
			ticks.push({v: valorX, f: String(valorX < 53 ? valorX : valorX - 52)});
		}

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
			colors: ["rgb(31,73,125)"],
			legend: {position: "none"},
			hAxis: {
				format: "decimal",
				scaleType: "number",
				title: "Semana",
				ticks,
			},
			vAxis: {
				viewWindow: {min: 0, max: Math.ceil(Math.max(...ejeY) / 10) * 10},
				fontSize: 20,
				title: "Cantidad de links que vencen",
				viewWindow: {min: 0, max: maxValorEjeY},
			},
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.ColumnChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
