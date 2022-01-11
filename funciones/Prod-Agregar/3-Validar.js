// ************ Requires ************
let procesarProd = require("./2-Procesar");
let BD_varias = require("../BD/varias");
let varias = require("../Varias/Varias");

// *********** Para exportar ***********
module.exports = {
	// ControllerAPI (validarPalabrasClave)
	palabrasClave: (dato) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		let errores = {};
		errores.palabrasClave = !dato
			? cartelCampoVacio
			: longitud(dato, 2, 50)
			? longitud(dato, 2, 50)
			: "";
		return errores;
	},

	// ControllerAPI (validarPalabrasClave)
	desambiguar: (dato) => {
		// Detectar si es una película, que pertenece a una colección y cuya colección no está en la BD
		errores = {hay: false};
		// Si es una película y está en una colección
		if (dato.entidad_TMDB == "movie" && dato.en_coleccion) {
			errores = {
				colec_TMDB_id: dato.en_colec_TMDB_id,
				hay: true,
			};
			// Si la colección no está en nuestra BD
			if (!dato.en_colec_id) errores.mensaje = "agregarColeccion";
			else {
				errores = {
					...errores,
					mensaje: "agregarCapitulos",
					en_colec_id: dato.en_colec_id,
				};
			}
		}
		// Enviar el feedback
		return errores;
	},

	// ControllerAPI (validarCopiarFA)
	copiarFA: (datos) => {
		let errores = {};
		// Dirección
		url = datos.direccion;
		errores.direccion = !url
			? cartelCampoVacio
			: !url.includes("www.filmaffinity.com/") ||
			  !(
					url.indexOf("www.filmaffinity.com/") + 21 < url.indexOf("/film") &&
					url.indexOf("/film") + 5 < url.indexOf(".html")
			  )
			? "No parece ser una dirección de Film Affinity"
			: "";
		// Avatar
		errores.avatar = !datos.avatar
			? "Necesitamos que agregues una imagen"
			: !datos.avatar.includes("pics.filmaffinity.com/")
			? "No parece ser una imagen de FilmAffinity"
			: !datos.avatar.includes("large.jpg")
			? "Necesitamos que consigas el link de la imagen grande"
			: "";
		// Contenido
		aux = datos.contenido ? procesarProd.contenidoFA(datos.contenido) : {};
		errores.contenido = !datos.contenido
			? cartelCampoVacio
			: !Object.keys(aux).length
			? "No se obtuvo ningún dato"
			: "";
		// Final
		errores.hay = hayErrores(errores);
		errores.campos = Object.keys(aux).length;
		return errores;
	},

	// ControllerAPI (validarDatosDuros_input)
	// ControllerVista (DD - Form y Grabar)
	datosDuros: async (campos, datos) => {
		let errores = {};
		// Errores 'input' *******************************************
		campos.includes("nombre_original")
			? (errores.nombre_original = !datos.nombre_original
					? cartelCampoVacio
					: longitud(datos.nombre_original, 2, 50)
					? longitud(datos.nombre_original, 2, 50)
					: castellano(datos.nombre_original)
					? cartelCastellano
					: "")
			: "";
		campos.includes("nombre_castellano")
			? (errores.nombre_castellano = !datos.nombre_castellano
					? cartelCampoVacio
					: longitud(datos.nombre_castellano, 2, 50)
					? longitud(datos.nombre_castellano, 2, 50)
					: castellano(datos.nombre_castellano)
					? cartelCastellano
					: "")
			: "";
		campos.includes("ano_estreno")
			? (errores.ano_estreno = !datos.ano_estreno
					? cartelCampoVacio
					: formatoAno(datos.ano_estreno)
					? "Debe ser un número de 4 dígitos"
					: datos.ano_estreno < 1900
					? "El año debe ser mayor a 1900"
					: datos.ano_estreno > new Date().getFullYear()
					? "El número no puede superar al año actual"
					: "")
			: "";
		campos.includes("ano_fin")
			? (errores.ano_fin = !datos.ano_fin
					? cartelCampoVacio
					: formatoAno(datos.ano_fin)
					? "Debe ser un número de 4 dígitos"
					: datos.ano_fin < 1900
					? "El año debe ser mayor a 1900"
					: datos.ano_fin > new Date().getFullYear()
					? "El número no puede superar al año actual"
					: !errores.ano_estreno && datos.ano_estreno && datos.ano_estreno > datos.ano_fin
					? "El año de finalización debe ser igual o mayor que el año de estreno"
					: "")
			: "";
		campos.includes("duracion")
			? (errores.duracion = !datos.duracion
					? cartelCampoVacio
					: formatoNumero(datos.duracion, 20)
					? formatoNumero(datos.duracion, 20)
					: datos.duracion > 300
					? "Debe ser un número menor"
					: "")
			: "";
		campos.includes("paises_id")
			? (errores.paises_id = !datos.paises_id
					? cartelCampoVacio
					: datos.paises_id.length > 2 * 1 + 4 * 3
					? "Se aceptan hasta 4 países. Seleccioná algún país elegido para borrarlo"
					: "")
			: "";
		campos.includes("idioma_original_id")
			? (errores.idioma_original_id = !datos.idioma_original_id ? cartelCampoVacio : "")
			: "";
		campos.includes("direccion")
			? (errores.direccion = !datos.direccion
					? cartelCampoVacio
					: longitud(datos.direccion, 2, 100)
					? longitud(datos.direccion, 2, 100)
					: castellano(datos.direccion)
					? cartelCastellano
					: "")
			: "";
		campos.includes("guion")
			? (errores.guion = !datos.guion
					? cartelCampoVacio
					: longitud(datos.guion, 2, 100)
					? longitud(datos.guion, 2, 100)
					: castellano(datos.guion)
					? cartelCastellano
					: "")
			: "";
		campos.includes("musica")
			? (errores.musica = !datos.musica
					? cartelCampoVacio + '. Si no tiene música, poné "No tiene música"'
					: longitud(datos.musica, 2, 100)
					? longitud(datos.musica, 2, 100)
					: castellano(datos.musica)
					? cartelCastellano
					: "")
			: "";
		campos.includes("actuacion")
			? (errores.actuacion = !datos.actuacion
					? cartelCampoVacio +
					  '. Si no tiene actuacion (ej. un Documental), poné "No tiene actuacion"'
					: longitud(datos.actuacion, 2, 500)
					? longitud(datos.actuacion, 2, 500)
					: castellano(datos.actuacion)
					? cartelCastellano
					: "")
			: "";
		campos.includes("produccion")
			? (errores.produccion = !datos.produccion
					? cartelCampoVacio
					: longitud(datos.produccion, 2, 100)
					? longitud(datos.produccion, 2, 100)
					: castellano(datos.produccion)
					? cartelCastellano
					: "")
			: "";
		campos.includes("sinopsis")
			? (errores.sinopsis = !datos.sinopsis
					? cartelCampoVacio
					: longitud(datos.sinopsis, 15, 800)
					? longitud(datos.sinopsis, 15, 800)
					: castellano(datos.sinopsis)
					? cartelCastellano
					: "")
			: "";
		campos.includes("avatar")
			? (errores.avatar = !datos.avatar
					? "Necesitamos que agregues una imagen"
					: extensiones(datos.avatar)
					? "Las extensiones de archivo válidas son jpg, png, gif, bmp"
					: "")
			: "";
		// Errores 'change' ******************************************
		if (
			datos.nombre_original &&
			!errores.nombre_original &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		) {
			errores.nombre_original = await validarRepetidos("nombre_original", datos);
		}
		if (
			datos.nombre_castellano &&
			!errores.nombre_castellano &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		) {
			errores.nombre_castellano = await validarRepetidos("nombre_castellano", datos);
		}
		// Resumen ***************************************************
		errores.hay = hayErrores(errores);
		return errores;
	},

	// ControllerAPI (validarDatosPers)
	datosPers: async (campos, datos) => {
		let errores = {};
		// Datos generales
		errores.en_castellano_id = !datos.en_castellano_id ? cartelSelectVacio : "";
		errores.en_color_id = !datos.en_color_id ? cartelSelectVacio : "";
		errores.categoria_id = !datos.categoria_id ? cartelSelectVacio : "";
		errores.subcategoria_id = !datos.subcategoria_id ? cartelSelectVacio : "";
		errores.publico_sugerido_id = !datos.publico_sugerido_id ? cartelSelectVacio : "";
		// Tu calificación
		errores.fe_valores_id = !datos.fe_valores_id ? cartelSelectVacio : "";
		errores.entretiene_id = !datos.entretiene_id ? cartelSelectVacio : "";
		errores.calidad_tecnica_id = !datos.calidad_tecnica_id ? cartelSelectVacio : "";
		// RCLV
		if (datos.subcategoria_id) {
			// Obtener el registro de la subcategoría
			let subcategoria = await BD_varias.obtenerPorCampo(
				"subcategorias",
				"id",
				datos.subcategoria_id
			);
			// Relación con la vida
			subcategoria.personaje
				? (errores.personaje_historico_id = !datos.personaje_historico_id
						? cartelSelectVacio
						: "")
				: "";
			subcategoria.hecho
				? (errores.hecho_historico_id = !datos.hecho_historico_id ? cartelSelectVacio : "")
				: "";
			subcategoria.valor ? (errores.valor_id = !datos.valor_id ? cartelSelectVacio : "") : "";
		}
		errores.hay = hayErrores(errores);
		// Links gratuitos
		campos.includes("link_trailer")
			? (errores.link_trailer = !datos.link_trailer
					? ""
					: !validarFuente(datos.link_trailer)
					? "Debe ser de una fuente confiable"
					: "")
			: "";
		campos.includes("link_pelicula")
			? (errores.link_pelicula = !datos.link_pelicula
					? ""
					: !validarFuente(datos.link_pelicula)
					? "Debe ser de una fuente confiable"
					: "")
			: "";
		return errores;
	},
};

// Variables **************************
let cartelCampoVacio = "Necesitamos que completes esta información";
let cartelCastellano =
	"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
let cartelSelectVacio = "Necesitamos que elijas una opción";

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
let castellano = (dato) => {
	formato = /^[¡¿A-ZÁÉÍÓÚÜÑ"\d][A-ZÁÉÍÓÚÜÑa-záéíóúüñ ,.:;…"°'¿?¡!+-/()\d\r\n\#]+$/;
	// \d: any decimal
	// \r: carriage return
	// \n: new line
	return !formato.test(dato);
};
let formatoAno = (dato) => {
	formato = /^\d{4}$/;
	return !formato.test(dato);
};
let formatoNumero = (dato, minimo) => {
	formato = /^\d+$/;
	return !formato.test(dato)
		? "Debe ser un número"
		: dato < minimo
		? "Debe ser un número mayor a " + minimo
		: "";
};
let extensiones = (nombre) => {
	if (!nombre) return false;
	ext = nombre.slice(nombre.length - 4);
	return ![".jpg", ".png", ".gif", ".bmp"].includes(ext);
};
let hayErrores = (errores) => {
	resultado = false;
	valores = Object.values(errores);
	for (valor of valores) {
		valor ? (resultado = true) : "";
	}
	return resultado;
};
let validarFuente = (link) => {
	aux = link.indexOf("youtube.com/watch");
	return aux >= 0 && aux <= 12;
};
let validarRepetidos = async (campo, datos) => {
	// Obtener casos
	let repetido = await BD_varias.obtenerPorCampos(
		datos.entidad,
		campo,
		datos[campo],
		"ano_estreno",
		datos.ano_estreno
	).then((n) => {
		return n ? n.toJSON() : "";
	});
	// Si hay casos --> mensaje de error con la entidad y el id
	if (repetido) {
		let producto = varias.producto(datos.entidad);
		mensaje =
			"Esta " +
			"<a href='/producto/detalle/?entidad=" +
			datos.entidad +
			"&id=" +
			repetido.id +
			"' target='_blank'><u><strong>" +
			producto.toLowerCase() +
			"</strong></u></a>" +
			" ya se encuentra en nuestra base de datos";
	} else mensaje = "";
	return mensaje;
};
