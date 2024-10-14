"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const {aprob, pend} = await fetch(ruta).then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};
	const {ejeX, ejeY} = ordenaDatos(aprob, pend);

	// Genera el resultado
	const resultado = [["Status", "Cant. de Películas"]];
	for (let i = 0; i < ejeX.length; i++) resultado.push([ejeX[i], ejeY[i]]);

	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "pie");
		const suma = ejeY.reduce((acum, n) =>  acum + n);
		opciones.title = "Total: " + suma;

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

const ordenaDatos = (aprob, pend) => {
	// Variables
	const objeto = {
		"cfc-aprob": aprob.cfc,
		"cfc-pend": pend.cfc,
		"vpc-pend": pend.vpc,
		"vpc-aprob": aprob.vpc,
	};
	const metodos = Object.keys(objeto);
	const valores = Object.values(objeto).sort((a, b) => b - a);

	// Los ordena
	const nuevoObjeto = {};
	for (let valor of valores) {
		const metodo = metodos.find((n) => objeto[n] == valor);
		nuevoObjeto[metodo] = valor;
	}
	const ejeX = Object.keys(nuevoObjeto);
	const ejeY = Object.values(nuevoObjeto);

	// Fin
	return {ejeX, ejeY};
};
// https://developers.google.com/chart/interactive/docs/gallery/columnchart
// // Opciones del gráfico
// const gris = "rgb(100, 100, 100)";
// const azul = "rgb(37, 64, 97)";

// const options = {
// 	colors: [gris, gris, azul, azul],