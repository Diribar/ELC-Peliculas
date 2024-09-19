"use strict";
window.addEventListener("load", async () => {
	// Variables
	let cantidades = {logins: 0, usSinLogin: 0, visitas: 0};

	// Obtiene datos del BE
	const datos = await fetch("/graficos/api/usuarios-visitas-diarias").then((n) => n.json());
	const {visitasDiarias, colores} = datos;

	// Obtiene los colores
	const color = {
		logins: colores.azul,
		usSinLogin: colores.celeste,
		visitas: colores.naranja,
	};
	const coloresRelleno = Object.values(color).map((n) => n[1]);
	const coloresBorde = Object.values(color).map((n) => n[3]);

	// Aspectos de la imagen de Google
	google.charts.load("current", {packages: ["corechart", "bar"]});
	google.charts.setOnLoadCallback(drawGraphic);

	// https://developers.google.com/chart/interactive/docs/gallery/columnchart
	function drawGraphic() {
		// Variables
		const resultado = [["Época", "Logins", {role: "style"}, "Usuarios s/Login", {role: "style"}, "Visitas", {role: "style"}]];

		// Consolida el resultado
		for (let visitaDiaria of visitasDiarias) {
			// Alimenta los datos del gráfico
			const {fecha, usLogueado: logins, usSinLogin, visitaSinUs: visitas} = visitaDiaria;
			resultado.push([
				fecha,
				...[logins, "stroke-color: " + coloresBorde[0]],
				...[usSinLogin, "stroke-color: " + coloresBorde[1]],
				...[visitas, "stroke-color: " + coloresBorde[2]],
			]);

			// Agrega las cantidades
			cantidades.logins += logins;
			cantidades.usSinLogin += usSinLogin;
			cantidades.visitas += visitas;
		}

		// Especifica la información
		const data = google.visualization.arrayToDataTable(resultado);

		// Opciones del gráfico
		const options = {
			// title: "Cantidad: " + totalCfc + " CFC + " + totalVpc + " VPC = " + (totalCfc + totalVpc) + " Total",
			backgroundColor: "rgb(255,242,204)",
			fontSize: 10,
			animation: {
				duration: 100,
				easing: "out",
				startup: true,
			},
			chartArea: {width: "80%", height: "70%"},
			colors: coloresRelleno,
			//legend: "none",
			hAxis: {
				format: "decimal",
				scaleType: "number",
				title: "Época",
			},
			vAxis: {
				fontSize: 20,
				title: "Cantidad de personas",
				viewWindow: {min: 0},
			},
			isStacked: true, // columnas apiladas
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.ColumnChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
