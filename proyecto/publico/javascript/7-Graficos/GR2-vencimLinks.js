"use strict";
window.addEventListener("load", async () => {
	// Obtiene información del backend
	const datos = await fetch("/graficos/api/vencimiento-de-links").then((n) => n.json());
	const {sinPrimRev, conPrimRev, primerLunesDelAno, unaSemana} = datos;
	let {antiguos} = datos;

	// Eje horizontal
	const sinPrimRevX = Object.keys(sinPrimRev).map((n) => Number(n));
	const conPrimRevX = Object.keys(conPrimRev).map((n) => Number(n));
	const minX = Math.min(...sinPrimRevX, ...conPrimRevX);
	const maxX = Math.max(...sinPrimRevX, ...conPrimRevX);

	// Se asegura de que haya un valorY para cada semana
	for (let i = minX; i <= maxX; i++) {
		if (!sinPrimRev[i]) sinPrimRev[i] = 0;
		if (!conPrimRev[i]) conPrimRev[i] = 0;
	}

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Variables
		const resultado = [["Semana", "Antiguos", "Links con 1a Revisión", "Links sin 1a Revisión", {role: "annotation"}]];
		const ano52Sems =
			new Date(primerLunesDelAno + unaSemana * 53).getUTCFullYear() > new Date(primerLunesDelAno).getUTCFullYear();
		let restar = 0;
		let ticks = [];

		// Consolida el resultado
		for (let valorX = minX; valorX <= maxX; valorX++) {
			// Averigua si cambia el año
			if (valorX == 53 && ano52Sems) restar = 52;
			if (valorX == 54 && !restar) restar = 53;

			// Agrega los valores
			resultado.push([valorX, antiguos, conPrimRev[valorX], sinPrimRev[valorX], ""]);
			ticks.push({v: valorX, f: String(valorX - restar)});
			if (antiguos) antiguos = 0;
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
			colors: ["firebrick", "rgb(31,73,125)", "rgb(79,98,40)"],
			legend: "none",
			hAxis: {
				format: "decimal",
				scaleType: "number",
				title: "Semana",
				ticks,
			},
			vAxis: {
				fontSize: 20,
				title: "Cantidad de links que vencen",
				viewWindow: {min: 0},
			},
			isStacked: true, // columnas apiladas
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.ColumnChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
