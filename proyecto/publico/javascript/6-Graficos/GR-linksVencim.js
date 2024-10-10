"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const datos = await fetch(ruta).then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};
	const revision = location.pathname.includes("/revision");
	const {cantLinksVencPorSem: cantLinks, primerLunesDelAno, lunesDeEstaSemana, unaSemana, linksSemsEstandar} = datos;
	const semanaActual = (lunesDeEstaSemana - primerLunesDelAno) / unaSemana + 1;
	const {promSem} = cantLinks;
	const maxEjeY = Math.round(promSem.prods * 0.15) * 10;
	const lunesSemana53 = primerLunesDelAno + unaSemana * 53;
	const ano52Sems = new Date(lunesSemana53).getUTCFullYear() > new Date(primerLunesDelAno).getUTCFullYear();

	// Genera el resultado
	let resultado = [["Semana", "Caps.", "PelisColes.", "Ilimitado", {role: "annotation"}]];
	let restar = 0;
	let ticks = [];
	for (let ejeX = 0; ejeX <= linksSemsEstandar; ejeX++) {
		// Agrega los valores X
		const semana = ejeX + semanaActual;
		if (semana == 53 && ano52Sems) restar = 52;
		if (semana == 54 && !restar) restar = 53;
		ticks.push({v: ejeX, f: String(semana - restar)});

		// Agrega los valores Y
		const capitulos = cantLinks[ejeX].capitulos;
		const pelisColes = cantLinks[ejeX].pelisColes;
		const estrRec = cantLinks[ejeX].estrRec;
		resultado.push([ejeX, capitulos, pelisColes, estrRec, ""]);
	}

	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "columnas");

		// Opciones del gráfico
		if (revision) opciones.hAxis.textColor = "none";
		else {
			opciones.vAxis.title = "Cantidad de links";
			opciones.hAxis.title = "Semana";
		}

		// Hace visible el gráfico
		const data = new google.visualization.arrayToDataTable(resultado);
		grafico.draw(data, opciones);

		// Fin
		return;
	};

	// Dibuja el gráfico
	google.charts.setOnLoadCallback(dibujarGrafico);

	// Fin
	return;
});
// https://developers.google.com/chart/interactive/docs/gallery/columnchart

			// // Temas generales
			// isStacked: true, // columnas apiladas
			// backgroundColor: "rgb(255,242,204)",
			// chartArea: {width: "80%", height: "70%"},
			// fontSize: 14,
			// legend: "none",
			// animation: {
			// 	duration: 100,
			// 	easing: "out",
			// 	startup: true,
			// },

			// // Título
			// title: "Prom. Semanal: " + cantLinks.promSem.prods,
			// titleTextStyle: {color: "brown", fontSize: 18},

			// // Ejes
			// hAxis: {
			// 	scaleType: "number",
			// 	format: "decimal",
			// 	baselineColor: "none", // para que desaparezca el eje vertical
			// 	ticks,
			// },
			// vAxis: {
			// 	fontSize: 20,
			// 	viewWindow: {min: 0, max: maxEjeY},
			// 	// gridlines: {count: 8},
			// },

			// // Particularidades
			// colors: ["rgb(37,64,97)", "rgb(31,73,125)", "rgb(79,98,40)"],
