"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const {cfc, vpc} = await fetch(ruta).then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};
	const ejeX = Object.keys(cfc);
	let totalCfc = 0;
	let totalVpc = 0;

	// Genera el resultado
	const resultado = [["Época", "CFC", {role: "style"}, "VPC", {role: "style"}]];
	for (let valorX of ejeX) {
		resultado.push([valorX, cfc[valorX], "stroke-color: #F57C00", vpc[valorX], "stroke-color: rgb(37,64,97)"]);
		totalCfc += cfc[valorX];
		totalVpc += vpc[valorX];
	}

	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "columnas");
		opciones.title = "Cantidad: " + totalCfc + " CFC + " + totalVpc + " VPC = " + (totalCfc + totalVpc) + " Total";
		opciones.colors= ["rgb(255, 230, 153)", "rgb(220, 230, 242)"]
		opciones.vAxis.title= "Cant. películas y colecciones"

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

