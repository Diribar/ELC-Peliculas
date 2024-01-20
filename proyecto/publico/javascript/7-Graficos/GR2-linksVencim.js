"use strict";
window.addEventListener("load", async () => {
	// Variables
	const algunosDatos = document.querySelector("#zonaDeGraficos #cuadro #algunosDatos");
	const grafico = document.querySelector("#zonaDeGraficos #cuadro #grafico");

	// Obtiene información del backend
	const datos = await fetch("/graficos/api/links-vencimiento").then((n) => n.json());
	const {cantLinksVencPorSem: cantLinks, primerLunesDelAno, unaSemana} = datos;

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Variables
		const resultado = [["Semana", "Ant.", "Venc.", "Nuevos", {role: "annotation"}]];
		const lunesSemana53 = primerLunesDelAno + unaSemana * 53;
		const ano52Sems = new Date(lunesSemana53).getUTCFullYear() > new Date(primerLunesDelAno).getUTCFullYear();
		let restar = 0;
		let ticks = [];
		let total = 0;

		// Consolida el resultado
		const minX = Number(Object.keys(cantLinks).shift());
		const maxX = Number(Object.keys(cantLinks).pop());

		for (let valorX = minX; valorX <= maxX; valorX++) {
			// Agrega los valores X
			if (valorX == 53 && ano52Sems) restar = 52;
			if (valorX == 54 && !restar) restar = 53;
			ticks.push({v: valorX, f: String(valorX - restar)});

			// Agrega los valores Y
			const antiguos = valorX == minX ? cantLinks[valorX].antiguos : 0;
			const recientes = valorX == minX ? cantLinks[valorX].recientes : 0;
			const todos = valorX > minX ? cantLinks[valorX] : 0;
			total += antiguos + recientes + todos;

			//console.log(antiguos,recientes,total);
			resultado.push([valorX, antiguos, recientes, todos, ""]);
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
		const imagenDelGrafico = new google.visualization.ColumnChart(grafico);
		imagenDelGrafico.draw(data, options);

		// Agrega algunos datos relevantes
		const promedio = parseInt((total / (maxX - minX)) * 10) / 10;
		algunosDatos.innerHTML = "Prom. Semanal: " + promedio;
	}
});
