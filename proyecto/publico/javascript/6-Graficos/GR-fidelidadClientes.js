"use strict";
window.addEventListener("load", async () => {
	// Obtiene datos del BE
	const navegsAcums = await fetch(ruta).then((n) => n.json());

	// Variables
	const DOM = {grafico: document.querySelector("#zonaDeGraficos #cuadro #grafico")};
	const grupos = [
		"altasDelDia",
		"transicion", //
		"unoATres",
		"unoADiez",
		"masDeDiez",
		"masDeTreinta",
	];

	// Establece los colores
	const color = {
		altasDelDia: colores.azul,
		transicion: colores.celeste,
		unoATres: colores.naranja,
		unoADiez: colores.azul,
		masDeDiez: colores.celeste,
		masDeTreinta: colores.naranja,
	};
	const coloresRelleno = Object.values(color).map((n) => n[1]);
	const coloresBorde = Object.values(color).map((n) => n[3]);

	// Genera la información
	const resultado = [["Fecha", ...grupos.map((grupo) => [grupo, {role: "style"}]).flat()]];
	for (let navegDelDia of navegsAcums) {
		// Alimenta los datos del gráfico
		const {fecha, altasDelDia, transicion, unoATres, unoADiez, masDeDiez, masDeTreinta} = navegDelDia;
		resultado.push([
			" " + fecha + " ",
			...[altasDelDia, "stroke-color: " + coloresBorde[0]],
			...[transicion, "stroke-color: " + coloresBorde[1]],
			...[unoATres, "stroke-color: " + coloresBorde[2]],
			...[unoADiez, "stroke-color: " + coloresBorde[0]],
			...[masDeDiez, "stroke-color: " + coloresBorde[1]],
			...[masDeTreinta, "stroke-color: " + coloresBorde[2]],
		]);

	}

	const dibujarGrafico = () => {
		// Opciones
		const {grafico, opciones} = FN_charts.opciones(DOM, "area");

		// Otras opciones particulares
		opciones.colors = coloresRelleno;
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
