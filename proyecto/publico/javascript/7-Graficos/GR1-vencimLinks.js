"use strict";
window.addEventListener("load", async () => {
	// Obtiene información del backend
	const {sinPrimRev, conPrimRev, cantLinksTotal} = await fetch("/graficos/api/vencimiento-de-links").then((n) => n.json());

	// Eje vertical
	const maxValorEjeY = Math.ceil(cantLinksTotal / 26 / 10 + 0.6) * 10; // redondea a la decena superior

	// Eje horizontal
	let sinPrimRevX = Object.keys(sinPrimRev).map((n) => Number(n));
	let conPrimRevX = Object.keys(conPrimRev).map((n) => Number(n));
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
		// Consolida el resultado
		const resultado = [["Semana", "Links con 1a Revisión", "Links sin 1a Revisión", {role: "annotation"}]];
		let ticks = [];
		for (let valorX = minX; valorX <= maxX; valorX++) {
			resultado.push([valorX, conPrimRev[valorX], sinPrimRev[valorX],""]);
			ticks.push({v: valorX, f: String(valorX < 53 ? valorX : valorX - 52)});
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
			colors: ["rgb(31,73,125)","rgb(79,98,40)"],
			legend: {position: "none"},
			hAxis: {
				format: "decimal",
				scaleType: "number",
				title: "Semana",
				ticks,
			},
			vAxis: {
				fontSize: 20,
				title: "Cantidad de links que vencen",
				viewWindow: {min: 0, max: maxValorEjeY},
			},
			isStacked: true, // columnas apiladas
		};

		// Hace visible el gráfico
		const grafico = new google.visualization.ColumnChart(document.querySelector("#grafico"));
		grafico.draw(data, options);
	}
});
