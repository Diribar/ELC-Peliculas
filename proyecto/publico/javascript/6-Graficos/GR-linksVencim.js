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
	let resultado = [["Semana", "Caps.", "PelisColes.", "Estr. Rec.", {role: "annotation"}]];
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
		opciones.colors = ["rgb(37,64,97)", "rgb(31,73,125)", "rgb(79,98,40)"];
		opciones.vAxis.viewWindow = {min: 0, max: maxEjeY};
		opciones.hAxis.ticks = ticks;
		opciones.title = "Prom. Semanal: " + cantLinks.promSem.prods;

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
