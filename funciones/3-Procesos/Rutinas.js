"use strict";
// Variables
const comp = require("../../funciones/3-Procesos/Compartidas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");

// Exportar ------------------------------------
module.exports = {
	// Tareas diarias
	tareasDiarias: async function () {
		// Obtiene información del archivo 'json'
		const rutaNombre = path.join(__dirname, "fecha.json");
		let info = (() => {
			// Variables
			const existe = comp.averiguaSiExisteUnArchivo(rutaNombre);
			const json = existe ? fs.readFileSync(rutaNombre, "utf8") : "";
			// Fin
			return json ? JSON.parse(fs.readFileSync(rutaNombre, "utf8")) : {};
		})();

		// Si la información ya está actualizada. termina
		const fechaGMT = new Date();
		const fechaFormatoPreferido = diasSemana[fechaGMT.getDay()] + ". " + comp.fechaDiaMes(fechaGMT);
		if (info.fechaActual == fechaFormatoPreferido) return;
		else info.fechaActual = fechaFormatoPreferido;

		// Actualiza la imagen derecha
		info = await this.actualizaImagenDerecha({info, fechaGMT});

		// Tareas semanales
		const comienzoAno = new Date(fechaGMT.getFullYear(), 0, 1).getTime();
		const semanaActual = parseInt((fechaGMT.getTime() - comienzoAno) / unDia / 7);
		if (info.semanaActual != semanaActual) {
			await this.tareasSemanales();
			info.semanaActual = semanaActual;
		}

		// Actualiza los valores del archivo
		await fs.writeFile(rutaNombre, JSON.stringify(info), function writeJSON(err) {
			if (err) return console.log("Tareas Diarias:", err);
		});

		// Fin
		return;
	},
	actualizaImagenDerecha: async function ({info, fechaGMT}) {
		// Asigna las nuevas fecha y hora actual
		info.horaActual = fechaGMT.toLocaleTimeString().slice(0, -3);

		// Obtiene los titulos de imgDerecha
		const milisegs = fechaGMT.getTime();
		let fechaTexto = (fecha) => {
			fecha = new Date(fecha);
			let dia = ("0" + fecha.getDate()).slice(-2);
			let mes = mesesAbrev[fecha.getMonth()];
			let ano = fecha.getFullYear().toString().slice(-2);
			fecha = dia + "-" + mes + "-" + ano;
			return fecha;
		};
		const fechas = [
			fechaTexto(milisegs - unDia * 2),
			fechaTexto(milisegs - unDia),
			fechaTexto(milisegs),
			fechaTexto(milisegs + unDia),
		];

		// Obtiene los titulos de Imagen Derecha
		titulosImgDer = {};
		for (let fecha of fechas)
			titulosImgDer[fecha] =
				info.titulosImgDer && info.titulosImgDer[fecha]
					? info.titulosImgDer[fecha]
					: await this.obtieneImagenDerecha(fecha);

		// Actualiza los títulos de la imagen derecha
		info.titulosImgDer = titulosImgDer;

		// Borra las imagenes que no se corresponden con los titulos
		// Obtiene el listado de archivos
		let imagenes = fs.readdirSync("./publico/imagenes/5-ImagenDerecha/");
		for (let imagen of imagenes)
			if (!fechas.includes(imagen.slice(0, 9))) await comp.borraUnArchivo("./publico/imagenes/5-ImagenDerecha/", imagen);

		// Fin
		return info;
	},
	obtieneImagenDerecha: async function (fecha) {
		// Obtiene el dia_del_ano
		let nombre = fecha.slice(0, 6).replace("-", "/");
		if (nombre.startsWith("0")) nombre = nombre.slice(1);
		const dia_del_ano_id = dias_del_ano.find((n) => n.nombre == nombre).id;

		// Obtiene la imagen derecha
		let imgDerecha;
		(() => {
			// Variable de la nueva fecha
			let nuevaFecha_id;
			let restaUnAno = 0;
			// Rutina para encontrar la fecha más cercana a la actual, que tenga una imagen
			for (let i = 0; i < 5; i++) {
				// Si terminó el año, continúa desde el 1/ene
				if (dia_del_ano_id + i - restaUnAno > 366) restaUnAno = 366;
				// Busca una imagen con la fecha
				let imagen = banco_de_imagenes.find((n) => n.dia_del_ano_id == dia_del_ano_id + i - restaUnAno);
				// Si la encuentra, termina de buscar
				if (imagen) {
					nuevaFecha_id = imagen.dia_del_ano_id;
					break;
				}
			}

			// Acciones si encontró una imagen para la fecha
			if (nuevaFecha_id) {
				// Variables
				let registros;
				// Busca registros dentro de los de fecha 'movil'
				registros = banco_de_imagenes.filter((n) => n.dia_del_ano_id == nuevaFecha_id && n.cuando);
				// Si no los encuentra, los busca dentro de los de fecha 'fija'
				if (!registros.length) registros = banco_de_imagenes.filter((n) => n.dia_del_ano_id == nuevaFecha_id);
				// Elije al azar de entre las opciones
				let indice = parseInt(Math.random() * registros.length);
				if (indice == registros.length) indice--; // Por si justo tocó el '1' en el sorteo
				imgDerecha = registros[indice];
				imgDerecha.carpeta = "4-RCLVs-Final/";
			}
			// Acciones si no encontró una imagen para la fecha
			else
				imgDerecha = {
					nombre: "ELC - Películas",
					nombre_archivo: "Institucional-Imagen.jpg",
					carpeta: "0-Base/",
				};
		})();

		// Guarda la nueva imagen
		await (async () => {
			// Borra la 'imagenAnterior'
			await comp.borraUnArchivo("./publico/imagenes/5-ImagenDerecha", fecha + ".jpg");
			// Copia la nueva imagen como 'imgDerecha'
			await comp.copiaUnArchivoDeImagen(
				imgDerecha.carpeta + imgDerecha.nombre_archivo,
				"5-ImagenDerecha/" + fecha + ".jpg"
			);

			// Fin
			return;
		})();

		// Fin
		return imgDerecha.nombre;
	},

	// Tareas semanales
	tareasSemanales: async () => {
		// Obtiene la condición
		const condiciones = await BD_especificas.linksVencidos();
		// Prepara la información
		const objeto = {
			status_registro_id: creado_aprob_id,
			sugerido_en: comp.ahora(),
			sugerido_por_id: 2,
		};
		// Actualiza el status de los links vencidos
		BD_genericas.actualizaTodosPorCampos("links", condiciones, objeto);

		// Fin
		return;
	},
};
