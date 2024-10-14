"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const historialClientes = await fetch(ruta).then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};
	const grupos = ["tresDiez", "onceTreinta", "masDeTreinta", "unoDos"];
	const ultMiembro = grupos.length - 1;
	const coloresBorde = {};
	const coloresRelleno = [];

	// Establece los colores
	const coloresValores = Object.values(colores);
	grupos.forEach((grupo, i) => {
		coloresBorde[grupo] = coloresValores[i][3];
		coloresRelleno.push(coloresValores[i][1]);
	});

	// Genera la información
	const resultado = [["Fecha", ...grupos.map((grupo) => [grupo, {role: "style"}]).flat()]];
	for (let navegDelDia of historialClientes) {
		resultado.push([
			navegDelDia.fecha,
			...grupos.map((grupo) => [navegDelDia[grupo], "stroke-color: " + coloresBorde[grupo]]).flat(),
		]);
	}

	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "areaLinea", ultMiembro);

		// Otras opciones particulares
		opciones.colors = coloresRelleno;
		// opciones.vAxes.title = "Cantidad de personas";

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
