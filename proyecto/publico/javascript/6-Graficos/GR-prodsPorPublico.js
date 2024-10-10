"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const [datos, publicos] = await fetch(ruta).then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};
	const ejeX = [];
	const ejeY = [];
	for (const publico of publicos)
		for (const rubro in datos) {
			ejeX.push(publico + " - " + rubro);
			ejeY.push(datos[rubro][publico]);
		}

	// Consolida el resultado
	const resultado = [["Público", "Cant. de Películas"]];
	for (let i = 0; i < ejeX.length; i++) resultado.push([ejeX[i], ejeY[i]]);
	console.log(resultado);

	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "pie");

		// Hace visible el gráfico
		const data = new google.visualization.arrayToDataTable(resultado);
		grafico.draw(data, opciones);

		// Fin
		return;
	};

	// Dibujar el gráfico
	google.charts.setOnLoadCallback(dibujarGrafico);

	// Fin
	return;
});
// https://developers.google.com/chart/interactive/docs/gallery/columnchart
// Opciones del gráfico
// const gris = "rgb(100, 100, 100)";
// const azul = "rgb(37, 64, 97)";

// const options = {
// 	colors: [gris, gris, azul, azul, "green", "green"],

// };
