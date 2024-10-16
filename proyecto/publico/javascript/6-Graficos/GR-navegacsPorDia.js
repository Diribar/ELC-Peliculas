"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const navegacsPorDia = await fetch(ruta).then((n) => n.json());

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
	for (let navegsPorDia of navegacsPorDia) {
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
		promedio[metodo] = Math.round((cantidades[metodo] / navegacsPorDia.length) * 10) / 10;
	promedio.total = Object.values(promedio).reduce((acum, n) => acum + n);
	resultado[0].push("Promedio");
	for (let i = 1; i < resultado.length; i++) resultado[i].push(promedio.total);

	// Titulo general
	let leyendaTitulo = promedio.total.toLocaleString("pt");
	grupos.forEach((grupo, i) => (leyendaTitulo += " | " + grupo + ": " + Object.values(promedio)[i].toLocaleString("pt")));

	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "columnas");

		// Título general
		const anchoGrafico = DOM.grafico.offsetWidth;
		const tituloGral = anchoGrafico > 600 ? leyendaTitulo : leyendaTitulo.split("|")[0];

		// Otras opciones particulares
		opciones.title = "Prom.: " + tituloGral;
		opciones.colors = coloresRelleno;
		opciones.series = {3: {type: "line"}};
		opciones.vAxis.title = "Cantidad de personas";

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
