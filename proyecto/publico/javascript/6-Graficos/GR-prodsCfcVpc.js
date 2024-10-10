"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const {aprob, pend} = await fetch(ruta).then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};
	const ejeX = ["cfc-aprob", "cfc-pend", "vpc-pend", "vpc-aprob"];
	const ejeY = [aprob.cfc, pend.cfc, pend.vpc, aprob.vpc];

	// Genera el resultado
	const resultado = [["Status", "Cant. de Películas"]];
	for (let i = 0; i < ejeX.length; i++) resultado.push([ejeX[i], ejeY[i]]);

	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "pie");

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

// // Opciones del gráfico
// const gris = "rgb(100, 100, 100)";
// const azul = "rgb(37, 64, 97)";

// const options = {
// 	backgroundColor: "rgb(255,242,204)",
// 	colors: [gris, gris, azul, azul],
// 	fontSize: 10,
// 	chartArea: {height: "80%"},
// 	pieSliceText: "value",
// 	legend: {position: "labeled"},
// 	slices: {1: {offset: 0.1}, 2: {offset: 0.1}},
// };
// Agrega algunos datos relevantes
// const algunosDatos = document.querySelector("#cuadro #algunosDatos");
// const suma = ejeY.reduce((acum, n) =>  acum + n);
// algunosDatos.innerHTML = "Total: " + suma;
