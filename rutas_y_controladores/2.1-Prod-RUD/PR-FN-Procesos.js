"use strict";
// Requires
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/1-Procesos/Compartidas");

module.exports = {
	// Producto
	bloqueIzq: (producto) => {
		// Variables
		const paisesNombre = producto.paises_id ? comp.paises_idToNombre(producto.paises_id) : "";
		let infoGral = [];
		let actores = [];

		// Informacion General
		if (producto.categoria) infoGral.push({titulo: "Categoría", valor: producto.categoria.nombre});
		if (producto.publico) infoGral.push({titulo: "Público sugerido", valor: producto.publico.nombre});
		if (producto.castellano !== null)
			infoGral.push({titulo: "Tenemos links en castellano", valor: producto.castellano ? "SI" : "NO"});
		if (producto.tipoActuacion) infoGral.push({titulo: "Tipo de actuación", valor: producto.tipoActuacion.nombre});
		if (producto.anoEstreno) infoGral.push({titulo: "Año de estreno", valor: producto.anoEstreno});
		if (producto.cant_temps) {
			if (producto.anoFin) infoGral.push({titulo: "Año de fin", valor: producto.anoFin});
		} else if (producto.duracion) infoGral.push({titulo: "Duracion", valor: producto.duracion + " min."});
		if (producto.color !== null) infoGral.push({titulo: "Es a color", valor: producto.color ? "SI" : "NO"});
		if (paisesNombre) infoGral.push({titulo: "País" + (paisesNombre.includes(",") ? "es" : ""), valor: paisesNombre});
		if (producto.idioma_original) infoGral.push({titulo: "Idioma original", valor: producto.idioma_original.nombre});
		if (producto.direccion) infoGral.push({titulo: "Dirección", valor: producto.direccion});
		if (producto.guion) infoGral.push({titulo: "Guión", valor: producto.guion});
		if (producto.musica) infoGral.push({titulo: "Música", valor: producto.musica});
		if (producto.produccion) infoGral.push({titulo: "Producción", valor: producto.produccion});
		if (producto.epocaOcurrencia_id) infoGral.push({titulo: "Época respecto a Cristo", valor: producto.epoca.nombre});

		// Actores
		if (producto.actores) actores = producto.actores;

		// Fin
		return {infoGral, actores};
	},
	obtieneLinksDelProducto: async ({entidad, id, statusLink_id, userID}) => {
		// Variables
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const include = ["tipo", "prov"];

		// Declara las variables de links de tipo 'Película' y 'Trailer'
		let PL = [];
		let TR = [];

		// Obtiene los links
		const condiciones = statusLink_id
			? {statusRegistro_id: statusLink_id}
			: {
					[Op.or]: [
						{statusRegistro_id: [creadoAprob_id, aprobado_id]},
						{[Op.and]: [{statusRegistro_id: creado_id}, {creadoPor_id: userID}]},
					],
			  };
		const links = await BD_genericas.obtieneTodosPorCondicionConInclude("links", {[campo_id]: id, ...condiciones}, include);

		// Procesos si hay links
		if (links.length) {
			// 1. Los ordena
			// 1.A. Por calidad
			links.sort((a, b) => b.calidad - a.calidad);
			// 1.B. Por completo
			links.sort((a, b) => b.completo - a.completo);
			// 1.C. Por idioma
			links.sort((a, b) => b.castellano - a.castellano);

			// 2. Les asigna un color en función del idioma
			links.map((link) => {
				link.color = link.castellano ? "verde" : link.subtitulos ? "amarillo" : "rojo";
			});

			// 3. Los separa entre Películas y Trailers
			PL = links.filter((n) => n.tipo && n.tipo.pelicula);
			TR = links.filter((n) => n.tipo && n.tipo.trailer);
		}

		// Fin
		return {PL, TR};
	},
	actualizaCalifProd: async ({entidad, entidad_id}) => {
		// Variables
		let datos = {feValores: null, entretiene: null, calidadTecnica: null, calificacion: null};

		// Obtiene las calificaciones
		const condics = {entidad, entidad_id};
		const include = ["feValores", "entretiene", "calidadTecnica"];
		const califics = await BD_genericas.obtieneTodosPorCondicionConInclude("cal_registros", condics, include);

		// Si existen calificaciones, obtiene los promedios
		if (califics.length)
			for (let campo in datos)
				datos[campo] =
					campo != "calificacion"
						? Math.round(califics.map((n) => n[campo].valor).reduce((acum, i) => acum + i) / califics.length)
						: Math.round(califics.map((n) => n.resultado).reduce((acum, i) => acum + i) / califics.length);

		// Actualiza la calificación en el producto
		await BD_genericas.actualizaPorId(entidad, entidad_id, datos);

		// Fin
		return;
	},
	interesDelUsuario: async ({usuario_id, entidad, entidad_id}) => {
		// Variables
		const condics = {usuario_id, entidad, entidad_id};
		const include = "detalle";

		// Obtiene el interés del usuario
		const registro = await BD_genericas.obtienePorCondicionConInclude("ppp_registros", condics, include);
		const interesDelUsuario = registro ? registro.detalle : sinPreferencia;

		// Fin
		return interesDelUsuario;
	},
};
