"use strict";
window.addEventListener("load", async () => {
	// Variables
	const algunosDatos = document.querySelector("#cuadro #algunosDatos");
	const grafico = document.querySelector("#cuadro #grafico");
	const revision = location.pathname.includes("/revision");

	// Obtiene información del backend
	const datos = await fetch("/graficos/api/links-vencimiento").then((n) => n.json());
	const {cantLinksVencPorSem: cantLinks, primerLunesDelAno, lunesDeEstaSemana, unaSemana} = datos;
	const semanaActual = (lunesDeEstaSemana - primerLunesDelAno) / unaSemana + 1;

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
		const semanas = Number(Object.keys(cantLinks).pop());
		for (let ejeX = 0; ejeX <= semanas; ejeX++) {
			// Agrega los valores X
			const semana = ejeX + semanaActual;
			if (semana == 53 && ano52Sems) restar = 52;
			if (semana == 54 && !restar) restar = 53;
			ticks.push({v: ejeX, f: String(semana - restar)});

			// Agrega los valores Y
			const antiguos = !ejeX ? cantLinks[ejeX].antiguos : 0;
			const recientes = !ejeX ? cantLinks[ejeX].recientes : 0;
			const todos = ejeX ? cantLinks[ejeX] : 0;
			total += antiguos + recientes + todos;
			resultado.push([ejeX, antiguos, recientes, todos, ""]);
		}

		// Especifica la información
		const data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		let options = {
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
				scaleType: "number",
				format: "decimal",
				baselineColor: "none", // para que desaparezca el eje vertical
				ticks,
			},
			vAxis: {
				fontSize: 20,
				viewWindow: {min: 0},
			},
			isStacked: true, // columnas apiladas
		};
		if (revision) options.hAxis.textColor = "none";
		else {
			options.vAxis.title = "Cantidad de links vencidos";
			options.hAxis.title = "Semana";
		}

		// Hace visible el gráfico
		const imagenDelGrafico = new google.visualization.ColumnChart(grafico);
		imagenDelGrafico.draw(data, options);

		// Agrega algunos datos relevantes
		const promedio = parseInt((total / semanas) * 10) / 10;
		algunosDatos.innerHTML = "Prom. Semanal: " + promedio;
	}
});
