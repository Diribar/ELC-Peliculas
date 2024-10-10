// Variables
const ruta = pathname.replace("/graficos/", "/graficos/api/gr-");
const colores = {
	azul: ["#8BC1F7", "#519DE9", "#06C", "#004B95", "#002F5D"], // 1. Blue
	celeste: ["#A2D9D9", "#73C5C5", "#009596", "#005F60", "#003737"], // 3. Cyan
	purpura: ["#B2B0EA", "#8481DD", "#5752D1", "#3C3D99", "#2A265F"], // 4. Purple
	dorado: ["#F9E0A2", "#F6D173", "#F4C145", "#F0AB00", "#C58C00"], // 5. Gold
	naranja: ["#F4B678", "#EF9234", "#EC7A08", "#C46100", "#8F4700"], // 6. Orange
	verde: ["#BDE2B9", "#7CC674", "#4CB140", "#38812F", "#23511E"], // 2. Green
	rojo: ["#C9190B", "#A30000", "#7D1007", "#470000", "#2C0000"], // 7. Red
	negro: ["#F0F0F0", "#D2D2D2", "#B8BBBE", "#8A8D90", "#6A6E73"], // 8. Black
};

// Funciones
google.charts.load("current", {packages: ["corechart"]});
const FN_charts = {
	// Formatos de gráfico
	opciones: function (DOM, tipo) {
		// Opciones
		const alturaGrafico = DOM.grafico.offsetHeight;
		const anchoGrafico = DOM.grafico.offsetWidth;
		const opciones = this[tipo](alturaGrafico, anchoGrafico);

		// Genera el tipo de gráfico
		const tipoGrafico = {
			columnas: "ColumnChart",
		};
		const grafico = new google.visualization[tipoGrafico[tipo]](DOM.grafico);

		// Fin
		return {grafico, opciones};
	},
	columnas: (alturaGrafico, anchoGrafico) => {
		// Variables
		const muestraEjeX = alturaGrafico > 200;
		const muestraEjeY = anchoGrafico > 600;
		const mostrarLeyenda = muestraEjeY && muestraEjeX;
		const tamanoLetra = (min, max) => Math.min(Math.max(alturaGrafico / 20, min), max);

		// Opciones
		const opciones = {
			// Temas generales
			seriesType: "bars",
			isStacked: true, // columnas apiladas
			backgroundColor: "rgb(255,242,204)",
			fontSize: 14,

			// Título
			titleTextStyle: {color: "brown", fontSize: tamanoLetra(13, 18)},

			// Área y leyenda
			chartArea: {
				left: mostrarLeyenda ? "15%" : "5%",
				right: "5%",
				top: "15%",
				bottom: mostrarLeyenda ? "20%" : "12%",
			}, // reemplaza el ancho y alto
			legend: {
				position: mostrarLeyenda > 200 ? "bottom" : "none",
				textStyle: {fontSize: 12},
			},

			// Ejes
			hAxis: {
				maxAlternation: 1, // todos los valores en una misma fila
				slantedText: false, // todos los valores en dirección horizontal
				textStyle: {fontSize: 12},
				textPosition: muestraEjeX ? "auto" : "none",
			},
			vAxis: {
				viewWindow: {min: 0},
				title: "Cantidad de personas",
				titleTextStyle: {fontSize: muestraEjeY ? tamanoLetra(12, 18) : 1},
				titleTextPosition: anchoGrafico < 600 ? "none" : "auto",
				textStyle: {fontSize: tamanoLetra(10, 14)},
			},
		};

		// Fin
		return opciones;
	},
	pie: (alturaGrafico, anchoGrafico) => {
		// Variables
		const muestraEjeX = alturaGrafico > 200;
		const muestraEjeY = anchoGrafico > 600;
		const mostrarLeyenda = muestraEjeY && muestraEjeX;
		const tamanoLetra = (min, max) => Math.min(Math.max(alturaGrafico / 20, min), max);

		// Opciones
		const opciones = {
			backgroundColor: "rgb(255,242,204)",
			fontSize: 10,
			chartArea: {height: "80%"},
			pieSliceText: "value",
			sliceVisibilityThreshold: 0.05, // agrupa los que son menores al 5%
			legend: {position: "labeled"},

			// Temas generales
			// seriesType: "bars",
			// isStacked: true, // columnas apiladas
			// backgroundColor: "rgb(255,242,204)",
			// fontSize: 14,

			// // Título
			// titleTextStyle: {color: "brown", fontSize: tamanoLetra(13, 18)},

			// // Área y leyenda
			// chartArea: {
			// 	left: mostrarLeyenda ? "15%" : "5%",
			// 	right: "5%",
			// 	top: "15%",
			// 	bottom: mostrarLeyenda ? "20%" : "12%",
			// }, // reemplaza el ancho y alto
			// legend: {
			// 	position: mostrarLeyenda > 200 ? "bottom" : "none",
			// 	textStyle: {fontSize: 12},
			// },

			// // Ejes
			// hAxis: {
			// 	maxAlternation: 1, // todos los valores en una misma fila
			// 	slantedText: false, // todos los valores en dirección horizontal
			// 	textStyle: {fontSize: 12},
			// 	textPosition: muestraEjeX ? "auto" : "none",
			// },
			// vAxis: {
			// 	viewWindow: {min: 0},
			// 	title: "Cantidad de personas",
			// 	titleTextStyle: {fontSize: muestraEjeY ? tamanoLetra(12, 18) : 1},
			// 	titleTextPosition: anchoGrafico < 600 ? "none" : "auto",
			// 	textStyle: {fontSize: tamanoLetra(10, 14)},
			// },
		};

		// Fin
		return opciones;
	},
};

// Event listeners - Recarga la vista si se gira
window.addEventListener("load", async () =>
	screen.orientation.addEventListener("change", () => {
		document.querySelector("#zonaDeGraficos #cuadro #grafico").classList.add("ocultar");
		location.reload();
	})
);
