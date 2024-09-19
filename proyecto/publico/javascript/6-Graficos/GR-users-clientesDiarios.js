"use strict";
window.addEventListener("load", async () => {
	// Variables
	const grupos = ["Logins", "Us. s/Login", "Visitas"];
	let cantidades = {logins: 0, usSinLogin: 0, visitas: 0};
	let promedio = {};
	let leyendaTitulo = "";

	// Obtiene datos del BE
	const {clientesDiarios, colores} = await fetch("/graficos/api/usuarios-clientes-diarios").then((n) => n.json());

	// Obtiene los colores
	const color = {
		logins: colores.azul,
		usSinLogin: colores.celeste,
		visitas: colores.naranja,
	};
	const coloresRelleno = Object.values(color).map((n) => n[1]);
	const coloresBorde = Object.values(color).map((n) => n[3]);

	// Opciones del gráfico - Ticks en el eje horizontal
	const cantTicks = 6;
	const periodo = Math.trunc(clientesDiarios.length / cantTicks);

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Variables
		let resultado = [["Fecha", ...grupos.map((grupo) => [grupo, {role: "style"}]).flat()]];

		// Genera la información
		clientesDiarios.forEach((clientesDiario, i) => {
			// Alimenta los datos del gráfico
			const {fecha, usLogueado: logins, usSinLogin, visitaSinUs: visitas} = clientesDiario;
			resultado.push([
				!(i % periodo) ? fecha : "",
				...[logins, "stroke-color: " + coloresBorde[0]],
				...[usSinLogin, "stroke-color: " + coloresBorde[1]],
				...[visitas, "stroke-color: " + coloresBorde[2]],
			]);

			// Agrega las cantidades
			cantidades.logins += logins;
			cantidades.usSinLogin += usSinLogin;
			cantidades.visitas += visitas;
		});

		// Obtiene los promedios
		for (let metodo of Object.keys(cantidades))
			promedio[metodo] = Math.round((cantidades[metodo] / clientesDiarios.length) * 10) / 10;
		promedio.total = Object.values(promedio).reduce((acum, n) => Math.round((acum + n) * 10) / 10);

		// Opciones del gráfico - Titulo general
		leyendaTitulo += promedio.total.toLocaleString("pt");
		grupos.forEach((grupo, i) => (leyendaTitulo += " | " + grupo + ": " + Object.values(promedio)[i].toLocaleString("pt")));

		const data = google.visualization.arrayToDataTable(resultado);
		const options = {
			backgroundColor: "rgb(255,242,204)",
			fontSize: 10,
			title: "Prom. Total: " + leyendaTitulo,
			titleTextStyle: {color: "brown"},
			legend: {position: "bottom", alignment: "center"},
			animation: {
				duration: 100,
				easing: "out",
				startup: true,
			},
			chartArea: {width: "80%", height: "50%", top: "15%"},
			colors: coloresRelleno,
			hAxis:{maxAlternation:1,slantedText:false,
				textStyle:{
					fontSize: 20,

				}
			},
			vAxis: {
				title: "Cantidad de personas",
				fontSize: 20,
				viewWindow: {min: 0},
			},
			isStacked: true, // columnas apiladas
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.ColumnChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
