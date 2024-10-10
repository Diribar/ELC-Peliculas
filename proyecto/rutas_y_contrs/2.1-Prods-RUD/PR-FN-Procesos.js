"use strict";

module.exports = {
	// Producto
	bloqueIzq: (producto) => {
		// Variables
		const paisesNombre = producto.paises_id ? comp.paises_idToNombre(producto.paises_id) : null;
		let infoGral = [];
		let actores = [];

		// Informacion sin títulos
		if (producto.cfc !== null)
			infoGral.push({valor: producto.cfc ? "Relacionada con la Fe Católica" : "Sin relación con la Fe Católica"});
		if (producto.bhr !== null)
			infoGral.push({valor: producto.bhr ? "Basada en Hechos Reales" : "No está basada en Hechos Reales"});
		if (producto.tipoActuacion) infoGral.push({valor: producto.tipoActuacion.nombre});
		if (producto.epocaOcurrencia_id)
			infoGral.push(
				producto.epocaOcurrencia.nombre == "Varias"
					? {titulo: "Época respecto a Cristo", valor: producto.epocaOcurrencia.nombre}
					: {valor: producto.epocaOcurrencia.nombre + " a Cristo"}
			);

		// Información con títulos
		if (producto.publico) infoGral.push({titulo: "Público sugerido", valor: producto.publico.nombre});
		if (producto.duracion) infoGral.push({titulo: "Duracion", valor: producto.duracion + " min."});
		if (producto.anoEstreno) infoGral.push({titulo: "Año de estreno", valor: producto.anoEstreno});
		if (producto.cantTemps) {
			if (producto.anoFin) infoGral.push({titulo: "Año de fin", valor: producto.anoFin});
		}
		if (producto.color !== null && !producto.color) infoGral.push({valor: "Es en blanco y negro"});
		if (producto.musical) infoGral.push({valor: "Es un musical"});
		if (producto.deporte) infoGral.push({valor: "Tiene deporte"});

		infoGral.push({
			titulo: "País" + (paisesNombre && paisesNombre.includes(",") ? "es" : ""),
			valor: paisesNombre ? paisesNombre : "desconocido",
		});
		if (producto.idioma_original) infoGral.push({titulo: "Idioma original", valor: producto.idioma_original.nombre});
		if (producto.direccion) infoGral.push({titulo: "Dirección", valor: producto.direccion});
		if (producto.guion) infoGral.push({titulo: "Guión", valor: producto.guion});
		if (producto.musica) infoGral.push({titulo: "Música", valor: producto.musica});
		if (producto.produccion) infoGral.push({titulo: "Producción", valor: producto.produccion});

		// Actores
		if (producto.actores) actores = producto.actores;

		// Fin
		return {infoGral, actores};
	},
	obtieneLinksDelProducto: async ({entidad, id, statusLink_id, usuario_id, autTablEnts, origen}) => {
		// Variables
		const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		const include = ["tipo", "prov"];

		// Declara las variables de links de tipo 'Película' y 'Trailer'
		let PL = [];
		let TR = [];

		// Obtiene los links
		const condicion = statusLink_id
			? {statusRegistro_id: statusLink_id}
			: {
					[Op.or]: [
						{statusRegistro_id: aprobados_ids},
						autTablEnts
							? {statusRegistro_id: creado_id}
							: {[Op.and]: [{statusRegistro_id: creado_id}, {creadoPor_id: usuario_id}]},
					],
			  };
		const links = await baseDeDatos.obtieneTodosPorCondicion("links", {[campo_id]: id, ...condicion}, include);

		// Procesos si hay links
		if (links.length) {
			// Los ordena
			//links.sort((a, b) => (a.url < b.url ? -1 : 1)); // por url
			//links.sort((a, b) => b.calidad - a.calidad); // por calidad
			links.sort((a, b) => a.parte - b.parte); // por partes
			links.sort((a, b) => b.completo - a.completo); // por completo
			links.sort((a, b) => b.castellano - a.castellano); // por idioma

			// Les asigna un color en función del idioma
			for (let link of links) link.idioma = link.castellano ? "enCast" : link.subtitulos ? "subtCast" : "otroIdioma";

			// Asigna los url de visualización
			for (let link of links)
				link.href =
					link.prov.embededPoner && link.gratuito
						? urlHost + "/links/mirar/l/?id=" + link.id + (origen ? "&origen=" + origen : "")
						: "//" + link.url;

			// Los separa entre Películas y Trailers
			PL = links.filter((n) => n.tipo && n.tipo.pelicula);
			TR = links.filter((n) => n.tipo && n.tipo.trailer);
		}

		TR = FN.trailer(TR);
		const GR = FN.gratis(PL);
		const CC = FN.conCosto(PL);
		const existen = !!(TR.length + GR.length + CC.length);

		// Fin
		return {GR, CC, TR, existen};
	},
	actualizaCalifProd: async ({entidad, entidad_id}) => {
		// Variables
		let datos = {feValores: null, entretiene: null, calidadTecnica: null, calificacion: null};

		// Obtiene las calificaciones
		const condics = {entidad, entidad_id};
		const include = ["feValores", "entretiene", "calidadTecnica"];
		const califics = await baseDeDatos.obtieneTodosPorCondicion("calRegistros", condics, include);

		// Si existen calificaciones, obtiene los promedios
		if (califics.length)
			for (let prop in datos)
				datos[prop] =
					prop != "calificacion"
						? Math.round(califics.map((n) => n[prop].valor).reduce((acum, i) => acum + i) / califics.length)
						: Math.round(califics.map((n) => n.resultado).reduce((acum, i) => acum + i) / califics.length);

		// Actualiza la calificación en el producto
		await baseDeDatos.actualizaPorId(entidad, entidad_id, datos);

		// Fin
		return;
	},
	obtieneInteresDelUsuario: async ({usuario_id, entidad, entidad_id}) => {
		// Variables
		const condics = {usuario_id, entidad, entidad_id};
		const include = "detalle";

		// Obtiene el interés del usuario
		const registro = await baseDeDatos.obtienePorCondicion("pppRegistros", condics, include);
		const interesDelUsuario = registro ? registro.detalle : pppOpcsObj.sinPref;

		// Fin
		return interesDelUsuario;
	},
	transfDatosDeColParaCaps: async (original, edicion, campo) => {
		// Variables
		const novedad = {[campo]: edicion[campo]};
		const {camposTransfCaps} = variables;

		// Si el campo no recibe datos, termina
		const camposAceptados = Object.values(camposTransfCaps).flat();
		if (!camposAceptados.includes(campo)) return;

		// Campos que se reemplazan siempre
		const esActoresSiempre = campo == "actores" && [dibujosAnimados, documental].includes(edicion.actores);
		if (camposTransfCaps.siempre.includes(campo) || esActoresSiempre) {
			const condicion = {coleccion_id: original.id};
			await baseDeDatos.actualizaPorCondicion("capitulos", condicion, novedad);
		}

		// Campos para los que se puede preservar el valor según el caso
		const esActoresDepende = campo == "actores" && ![dibujosAnimados, documental].includes(edicion.actores);
		if (camposTransfCaps.soloVacios.includes(campo) || esActoresDepende) {
			// Condición - se asegura de que reemplacen:
			const condicion = {coleccion_id: original.id, [campo]: [null]}; // los que tengan valor null
			if (original[campo]) condicion[campo].push(original[campo]); // los que coincidan con la colección original

			// Campos particulares
			const noEsPersonajeNiEpocaOcurr = !["personaje_id", "epocaOcurrencia_id"].includes(campo);
			const esPersonajeNoVarios = campo == "personaje_id" && edicion[campo] != 2;
			const esEpocaOcurrNoVarios = campo == "epocaOcurrencia_id" && edicion[campo] != epocaVarias.id;

			// Reemplaza los valores
			if (noEsPersonajeNiEpocaOcurr || esPersonajeNoVarios || esEpocaOcurrNoVarios)
				await baseDeDatos.actualizaPorCondicion("capitulos", condicion, novedad);
		}

		// Fin
		return true;
	},
};
let FN = {
	trailer: (links) => {
		// Array vacía
		if (!links.length) return [];

		// Array con valores
		let trailers = [];
		links.forEach((link, i) =>
			trailers.push({
				url: link.href,
				leyenda: "Trailer " + (i + 1),
				titulo: "Ver trailer",
				idioma: link.idioma,
			})
		);

		// Fin
		return trailers;
	},
	gratis: function (links) {
		// Array vacía
		if (!links.length) return [];
		let gratuitos = links.filter((n) => n.gratuito);
		if (!gratuitos.length) return [];

		// Variables
		let hayPartes, difsEnIdioma;

		// Selecciona los de mejor calidad
		gratuitos = this.dejaLaMejorCalidad(gratuitos);

		// Averigua si algunos son completos y otros son partes
		const partes = gratuitos.filter((n) => n.parte && n.parte != "-");
		if (partes.length) hayPartes = true;

		// Si no hay hayPartes, averigua si hay diferencias en el idioma
		if (!hayPartes) {
			const castellano = gratuitos.filter((n) => n.castellano);
			const subTits = gratuitos.filter((n) => n.subtitulos);
			const otroIdioma = gratuitos.filter((n) => !n.castellano && !n.subtitulos);
			if ((castellano.length && (subTits.length || otroIdioma.length)) || (subTits.length && otroIdioma.length))
				difsEnIdioma = true;
		}

		// Leyenda para diferenciarlos en la vista
		for (let link of gratuitos)
			link.leyenda = hayPartes
				? link.completo
					? "Completo"
					: "Parte " + link.parte
				: difsEnIdioma
				? link.castellano
					? "En castellano"
					: link.subtitulos
					? "Con subtit."
					: "En otro idioma"
				: "Ver gratis";

		// Deja la info indispensable
		gratuitos = gratuitos.map((link) => ({
			url: link.href,
			leyenda: link.leyenda,
			titulo: "Ver gratis",
			idioma: link.idioma,
		}));

		// Fin
		return gratuitos;
	},
	dejaLaMejorCalidad: (links) => {
		// Si no hay que desempatar, interrumpe la función
		if (links.length < 2) return links;

		// Rutina para dejar los links de mejor calidad
		for (let i = links.length - 1; i >= 0; i--) {
			// Variables
			const link = links[i];
			const {castellano, subtitulos, completo, parte} = link;

			// Obtiene los similares
			const linksSimilares = links.filter(
				(n) => n.castellano == castellano && n.subtitulos == subtitulos && n.completo == completo && n.parte == parte
			);

			// Quita los similares
			if (linksSimilares.length > 1) {
				const maxCalidad = Math.max(...linksSimilares.map((n) => n.calidad));
				const id = linksSimilares.find((n) => n.calidad == maxCalidad).id;
				for (let linkSimilar of linksSimilares)
					if (linkSimilar.id != id) {
						links = links.filter((n) => n.id != linkSimilar.id);
						i--;
					}
			}
		}

		// Fin
		return links;
	},
	conCosto: (links) => {
		// Array vacía
		if (!links.length) return [];
		let conCosto = links.filter((n) => !n.gratuito);
		if (!conCosto.length) return [];

		// Leyenda para diferenciarlos en la vista
		for (let link of conCosto) link.leyenda = link.prov.nombre;

		// Deja la info indispensable
		conCosto = conCosto.map((link) => ({url: link.href, leyenda: link.leyenda, titulo: "Ver c/costo", idioma: link.idioma}));

		// Fin
		return conCosto;
	},
};
