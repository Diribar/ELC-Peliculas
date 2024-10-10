"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const datos = await fetch(ruta).then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};

	// Genera el resultado
	const resultado = [["Fecha", "Rango", {role: "annotation"}]];
	for (let dato of datos) resultado.push([dato.nombre, dato.rango, ""]);

	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "columnas");

		// Hace visible el gráfico
		const data = new google.visualization.arrayToDataTable(resultado);
		grafico.draw(data, opciones);

		// Fin
		return;
	}

	// Dibuja el gráfico
	google.charts.setOnLoadCallback(dibujarGrafico);

	// Fin
	return;
});
// https://developers.google.com/chart/interactive/docs/gallery/columnchart
// const options = {
// 	backgroundColor: "rgb(255,242,204)",
// 	fontSize: 10,
// 	animation: {
// 		duration: 100,
// 		easing: "out",
// 		startup: true,
// 	},
// 	chartArea: {width: "80%", height: "70%"},
// 	// colors: ["firebrick", "rgb(31,73,125)", "rgb(79,98,40)"],
// 	animation: {
// 		duration: 100,
// 		easing: "out",
// 		startup: true,
// 	},
// 	chartArea: {width: "80%", height: "70%"},
// 	// colors: ["firebrick", "rgb(31,73,125)", "rgb(79,98,40)"],
// 	colors: ["rgb(31,73,125)"],
// 	legend: {position: "none"},
// 	vAxis: {
// 		fontSize: 20,
// 		title: "Días sin efemérides",
// 		viewWindow: {min: 0},
// 	},
// };
