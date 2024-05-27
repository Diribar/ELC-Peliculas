"use strict";
window.addEventListener("load", async () => {
	// Variables
	const algunosDatos = document.querySelector("#cuadro #algunosDatos");
	const grafico = document.querySelector("#cuadro #grafico");
	const revision = location.pathname.includes("/revision");

	// Obtiene información del backend
	const datos = await fetch("/graficos/api/links-vencimiento").then((n) => n.json());
	const {cantLinksVencPorSem: cantLinks, primerLunesDelAno, lunesDeEstaSemana, unaSemana, linksSemsEstandar} = datos;
	const semanaActual = (lunesDeEstaSemana - primerLunesDelAno) / unaSemana + 1;

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Variables
		const lunesSemana53 = primerLunesDelAno + unaSemana * 53;
		const ano52Sems = new Date(lunesSemana53).getUTCFullYear() > new Date(primerLunesDelAno).getUTCFullYear();
		let resultado = [["Semana", "Caps.", "PelisColes.", "Ilimitado", "InacRecup", {role: "annotation"}]];
		let restar = 0;
		let ticks = [];

		// Consolida el resultado
		for (let ejeX = 0; ejeX <= linksSemsEstandar; ejeX++) {
			// Agrega los valores X
			const semana = ejeX + semanaActual;
			if (semana == 53 && ano52Sems) restar = 52;
			if (semana == 54 && !restar) restar = 53;
			ticks.push({v: ejeX, f: String(semana - restar)});

			// Agrega los valores Y
			const capitulos = cantLinks[ejeX].capitulos;
			const pelisColes = cantLinks[ejeX].pelisColes;
			const sinLimite = cantLinks[ejeX].sinLimite;
			const inacRecup = cantLinks[ejeX].irPelisColes + cantLinks[ejeX].irCapitulos;
			resultado.push([ejeX, capitulos, pelisColes, sinLimite, inacRecup, ""]);
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
			colors: ["rgb(37,64,97)", "rgb(31,73,125)","rgb(79,98,40)","firebrick"],
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
				// gridlines: {count: 8},
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
		algunosDatos.innerHTML = "Prom. Semanal: " + cantLinks.cantPromSem.toFixed(1);
	}
});
