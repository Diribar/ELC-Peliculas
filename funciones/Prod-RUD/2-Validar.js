// ************ Requires ************
let BD_varias = require("../BD/Varias");
let variables = require("../Varias/Variables");
let validar_PA = require("../Prod-Agregar/3-Validar");

// *********** Para exportar ***********
module.exports = {
	// ControllerAPI (validarEdicion_changes)
	// ControllerVista (Edicion - Form + Grabar)
	edicion: async (campos, prodCombinado) => {
		// Obtener la entidad
		entidad = prodCombinado.entidad;
		// Obtener los campos
		if (!campos) {
			let camposDD = variables.camposDD().filter((n) => n[entidad]);
			let camposDP = await variables
				.camposDP()
				.then((n) => n.filter((m) => m.grupo != "calificala"));
			campos = [...camposDD, ...camposDP].map((n) => n.nombreDelCampo);
		}
		// Averiguar si hay errores de validación DD y DP
		let erroresDD = await validar_PA.datosDuros(campos, prodCombinado);
		let erroresDP = await validar_PA.datosPers(campos, prodCombinado);
		// Terminar
		let errores = {...erroresDD, ...erroresDP};
		errores.hay = erroresDD.hay || erroresDP.hay;
		return errores;
	},

	// ControllerAPI (validarLinks)
	links: async (datos) => {
		let campos = Object.keys(datos);
		let errores = {};
		// link_prov_id
		if (campos.includes("link_prov_id"))
			errores.link_prov_id = !datos.link_prov_id ? cartelCampoVacio : "";
		// url
		if (campos.includes("url")) {
			errores.url = !datos.url
				? cartelCampoVacio
				: longitud(datos.url, 5, 100)
				? longitud(datos.url, 5, 100)
				: !datos.url.includes("/")
				? "Por favor ingresá una url válida"
				: variables
						.provsQueNoRespetanCopyright()
						.map((n) => n.url)
						.some((n) => datos.url.includes(n))
				? "No nos consta que ese proveedor respete los derechos de autor."
				: variables.provsListaNegra().some((n) => datos.url.includes(n))
				? "Los videos de ese portal son ajenos a nuestro perfil"
				: "";
			if (!errores.url) {
				let repetido = await validarLinkRepetidos(datos.url);
				if (repetido) errores.url = repetido;
			}
		}
		// calidad
		if (campos.includes("calidad")) errores.calidad = !datos.calidad ? cartelCampoVacio : "";
		// link_tipo_id
		if (campos.includes("link_tipo_id")) {
			errores.link_tipo_id = !datos.link_tipo_id
				? cartelCampoVacio
				: datos.link_tipo_id < "1" && datos.link_tipo_id > "2"
				? "Por favor elegí una opción válida"
				: "";
		}
		// completo
		if (campos.includes("completo") && datos.link_tipo_id != 1)
			errores.completo = datos.completo == "" ? cartelCampoVacio : "";
		// parte
		if (campos.includes("parte") && datos.completo != 1 && datos.link_tipo_id != 1)
			errores.parte = datos.parte == "" ? cartelCampoVacio : "";
		// gratuito
		if (campos.includes("gratuito")) {
			errores.gratuito =
				datos.gratuito == ""
					? cartelCampoVacio
					: datos.gratuito < "0" && datos.gratuito > "1"
					? "Por favor elegí una opción válida"
					: "";
		}
		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
};

// Variables **************************
let cartelCampoVacio = "Necesitamos que completes esta información";

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El contenido debe ser más largo"
		: dato.length > largo
		? "El contenido debe ser más corto. Tiene " +
		  dato.length +
		  " caracteres, el límite es " +
		  largo +
		  "."
		: "";
};
let validarLinkRepetidos = async (dato) => {
	// Obtener casos
	let repetido = await BD_varias.obtenerPorCampo("links_originales", "url", dato).then((n) => {
		return n ? n.toJSON() : "";
	});
	// Si hay casos --> mensaje de error con la entidad y el id
	if (repetido) {
		mensaje =
			"Este " +
			"<a href='/producto/links/?entidad=" +
			(repetido.pelicula_id
				? "peliculas"
				: repetido.coleccion_id
				? "colecciones"
				: repetido.capitulo_id
				? "capitulos"
				: "") +
			"&id=" +
			(repetido.pelicula_id
				? repetido.pelicula_id
				: repetido.coleccion_id
				? repetido.coleccion_id
				: repetido.capitulo_id
				? repetido.capitulo_id
				: "") +
			"' target='_blank'><u><strong>link</strong></u></a>" +
			" ya se encuentra en nuestra base de datos";
	} else mensaje = "";
	return mensaje;
};
