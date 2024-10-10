"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const {navegsAcums, coloresConfigs: colores} = await fetch("/graficos/api/gr-usuarios-clientes-acums").then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};
	const grupos = ["Logins", "Us. s/Login", "Visitas"];
	let promedio = {};

	// Establece los colores
	const color = {
		logins: colores.azul,
		usSinLogin: colores.celeste,
		visitas: colores.naranja,
	};
	const coloresRelleno = Object.values(color).map((n) => n[1]);
	const coloresBorde = Object.values(color).map((n) => n[3]);

	// Genera la información
	const resultado = [["Fecha", ...grupos.map((grupo) => [grupo, {role: "style"}]).flat()]];
	const cantidades = {logins: 0, usSinLogin: 0, visitas: 0};
	for (let navegsPorDia of navegsAcums) {
		// Alimenta los datos del gráfico
		const {fecha, logins, usSinLogin, visitas} = navegsPorDia;
		resultado.push([
			" " + fecha + " ",
			...[logins, "stroke-color: " + coloresBorde[0]],
			...[usSinLogin, "stroke-color: " + coloresBorde[1]],
			...[visitas, "stroke-color: " + coloresBorde[2]],
		]);

		// Agrega las cantidades
		cantidades.logins += logins;
		cantidades.usSinLogin += usSinLogin;
		cantidades.visitas += visitas;
	}

	// Obtiene los promedios
	for (let metodo of Object.keys(cantidades))
		promedio[metodo] = Math.round((cantidades[metodo] / navegsAcums.length) * 10) / 10;
	promedio.total = Object.values(promedio).reduce((acum, n) => acum + n);
	resultado[0].push("Promedio");
	for (let i = 1; i < resultado.length; i++) resultado[i].push(promedio.total);

	// Titulo general
	let leyendaTitulo = promedio.total.toLocaleString("pt");
	grupos.forEach((grupo, i) => (leyendaTitulo += " | " + grupo + ": " + Object.values(promedio)[i].toLocaleString("pt")));

	const drawGraphic = () => {
		// Variables que cambian con la rotación del mobil
		const alturaGrafico = DOM.grafico.offsetHeight;
		const anchoGrafico = DOM.grafico.offsetWidth;

		const tituloGral = anchoGrafico > 600 ? leyendaTitulo : leyendaTitulo.split("|")[0];

		const mostrarLeyenda = anchoGrafico > 600 && alturaGrafico > 200;
		const options = {
			// Temas generales
			seriesType: "bars",
			isStacked: true, // columnas apiladas
			backgroundColor: "rgb(255,242,204)",
			chartArea: {left: "15%", right: "5%", top: "15%", bottom: mostrarLeyenda ? "20%" : "12%"}, // reemplaza el ancho y alto
			fontSize: 14,
			legend: {position: mostrarLeyenda > 200 ? "bottom" : "none", textStyle: {fontSize: 12}},

			// Título
			title: "Prom.: " + tituloGral,
			titleTextStyle: {color: "brown", fontSize: Math.min(Math.max(alturaGrafico / 20, 13), 18)},

			// Ejes
			hAxis: {
				textPosition: alturaGrafico > 200 ? "auto" : "none",
				maxAlternation: 1, // todos los valores en una misma fila
				slantedText: false, // todos los valores en dirección horizontal
				textStyle: {fontSize: 12},
			},
			vAxis: {
				viewWindow: {min: 0},
				title: "Cantidad de personas",
				titleTextStyle: {fontSize: anchoGrafico > 600 ? Math.min(Math.max(alturaGrafico / 20, 12), 18) : 1},
				titleTextPosition: anchoGrafico < 600 ? "none" : "auto",
				textStyle: {fontSize: Math.min(Math.max(alturaGrafico / 20, 10), 14)},
			},

			// Particularidades
			colors: coloresRelleno,
			series: {3: {type: "line"}},
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.ColumnChart(DOM.grafico);
		const data = new google.visualization.arrayToDataTable(resultado);
		grafico.draw(data, options);

		// Fin
		return;
	};

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// Event listeners - Recarga la vista si se gira
	screen.orientation.addEventListener("change", () => {
		DOM.grafico.classList.add("ocultar");
		location.reload();
	});
});
// https://developers.google.com/chart/interactive/docs/gallery/columnchart
