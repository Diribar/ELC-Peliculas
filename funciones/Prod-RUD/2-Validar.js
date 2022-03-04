// ************ Requires ************
let BD_varias = require("../BD/varias");
let varias = require("../Varias/Varias");
let variables = require("../Varias/Variables");

// *********** Para exportar ***********
module.exports = {
	// ControllerAPI (validarEdicion_changes)
	// ControllerVista (Edicion - Form + Grabar)
	edicion: async (campos, datos) => {
		let errores = {};
		// ***** CAMPOS INDIVIDUALES *******
		// Datos generales
		if (campos.includes("nombre_original"))
			errores.nombre_original = !datos.nombre_original
				? cartelCampoVacio
				: longitud(datos.nombre_original, 2, 50)
				? longitud(datos.nombre_original, 2, 50)
				: castellano(datos.nombre_original)
				? cartelCastellano
				: "";
		if (campos.includes("nombre_castellano"))
			errores.nombre_castellano = !datos.nombre_castellano
				? cartelCampoVacio
				: longitud(datos.nombre_castellano, 2, 50)
				? longitud(datos.nombre_castellano, 2, 50)
				: castellano(datos.nombre_castellano)
				? cartelCastellano
				: "";
		if (campos.includes("ano_estreno"))
			errores.ano_estreno = !datos.ano_estreno
				? cartelCampoVacio
				: formatoAno(datos.ano_estreno)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_estreno < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_estreno > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("ano_fin"))
			errores.ano_fin = !datos.ano_fin
				? cartelCampoVacio
				: formatoAno(datos.ano_fin)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_fin < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_fin > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("duracion"))
			errores.duracion = !datos.duracion
				? cartelCampoVacio
				: formatoNumero(datos.duracion, 20)
				? formatoNumero(datos.duracion, 20)
				: datos.duracion > 300
				? "Debe ser un número menor"
				: "";
		if (campos.includes("paises_id"))
			errores.paises_id = !datos.paises_id
				? cartelCampoVacio
				: datos.paises_id.length > 2 * 1 + 4 * 3
				? "Se aceptan hasta 4 países. Seleccioná algún país elegido para borrarlo"
				: "";
		if (campos.includes("idioma_original_id"))
			errores.idioma_original_id = !datos.idioma_original_id ? cartelCampoVacio : "";
		if (campos.includes("en_castellano_id"))
			errores.en_castellano_id = !datos.en_castellano_id ? cartelSelectVacio : "";
		if (campos.includes("en_color_id"))
			errores.en_color_id = !datos.en_color_id ? cartelSelectVacio : "";
		if (campos.includes("produccion"))
			errores.produccion = !datos.produccion
				? cartelCampoVacio
				: longitud(datos.produccion, 2, 100)
				? longitud(datos.produccion, 2, 100)
				: castellano(datos.produccion)
				? cartelCastellano
				: "";
		// Datos subjetivos
		if (campos.includes("categoria_id"))
			errores.categoria_id = !datos.categoria_id ? cartelSelectVacio : "";
		if (campos.includes("subcategoria_id"))
			errores.subcategoria_id = !datos.subcategoria_id ? cartelSelectVacio : "";
		if (campos.includes("publico_sugerido_id"))
			errores.publico_sugerido_id = !datos.publico_sugerido_id ? cartelSelectVacio : "";
		// Personas
		if (campos.includes("direccion"))
			errores.direccion = !datos.direccion
				? cartelCampoVacio
				: longitud(datos.direccion, 2, 100)
				? longitud(datos.direccion, 2, 100)
				: castellano(datos.direccion)
				? cartelCastellano
				: "";
		if (campos.includes("guion"))
			errores.guion = !datos.guion
				? cartelCampoVacio
				: longitud(datos.guion, 2, 100)
				? longitud(datos.guion, 2, 100)
				: castellano(datos.guion)
				? cartelCastellano
				: "";
		if (campos.includes("musica"))
			errores.musica = !datos.musica
				? cartelCampoVacio + '. Si no tiene música, poné "No tiene música"'
				: longitud(datos.musica, 2, 100)
				? longitud(datos.musica, 2, 100)
				: castellano(datos.musica)
				? cartelCastellano
				: "";
		if (campos.includes("actuacion"))
			errores.actuacion = !datos.actuacion
				? cartelCampoVacio +
				  '. Si no tiene actuacion (ej. un Documental), poné "No tiene actuacion"'
				: longitud(datos.actuacion, 2, 500)
				? longitud(datos.actuacion, 2, 500)
				: castellano(datos.actuacion)
				? cartelCastellano
				: "";
		if (campos.includes("sinopsis"))
			errores.sinopsis = !datos.sinopsis
				? cartelCampoVacio
				: longitud(datos.sinopsis, 15, 800)
				? longitud(datos.sinopsis, 15, 800)
				: castellano(datos.sinopsis)
				? cartelCastellano
				: "";
		if (campos.includes("avatar"))
			errores.avatar = !datos.avatar
				? "Necesitamos que agregues una imagen"
				: extensiones(datos.avatar)
				? "Las extensiones de archivo válidas son jpg y png"
				: "";
		// ***** CAMPOS COMBINADOS *******
		// Nombre Original y Año de Estreno
		if (
			datos.nombre_original &&
			!errores.nombre_original &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		)
			errores.nombre_original = await validarProdRepetido("nombre_original", datos);
		// Nombre Castellano y Año de Estreno
		if (
			datos.nombre_castellano &&
			!errores.nombre_castellano &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		)
			errores.nombre_castellano = await validarProdRepetido("nombre_castellano", datos);
		// Año de Estreno y Año Fin
		if (datos.ano_estreno && !errores.ano_estreno && datos.ano_fin && !errores.ano_fin) {
			if (datos.ano_estreno > datos.ano_fin)
				errores.ano_estreno =
					"El año de estreno debe ser menor o igual que el año de finalización";
		}
		// RCLV
		if (datos.subcategoria_id) {
			// Obtener el registro de la subcategoría
			let subcategoria = await BD_varias.obtenerPorCampo(
				"subcategorias",
				"id",
				datos.subcategoria_id
			);
			// Relación con la vida
			if (subcategoria.personaje)
				errores.personaje_id = !datos.personaje_id ? cartelSelectVacio : "";
			if (subcategoria.hecho) errores.hecho_id = !datos.hecho_id ? cartelSelectVacio : "";
			if (subcategoria.valor) errores.valor_id = !datos.valor_id ? cartelSelectVacio : "";
		}
		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},

	// ControllerAPI (validarLinks)
	links: async (campos, datos) => {
		let errores = {};
		// Revisiones INDIVIDUALES
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
						.provs_que_no_respetan_copyright()
						.map((n) => n.url)
						.some((n) => datos.url.includes(n))
				? "No nos consta que ese proveedor respete los derechos de autor."
				: variables.provs_lista_negra().some((n) => datos.url.includes(n))
				? "Los videos de ese portal son ajenos a nuestro perfil"
				: "";
			if (!errores.url) {
				let repetido = await validarLinkRepetido(datos.url);
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
	ext = nombre.slice(nombre.lastIndexOf("."));
	return ![".jpg", ".png"].includes(ext);
};
let validarProdRepetido = async (campo, datos) => {
	// Averiguar si existe algún caso en la BD
	let averiguar = await BD_varias.obtenerPor2Campos(
		datos.entidad,
		campo,
		datos[campo],
		"ano_estreno",
		datos.ano_estreno
	).then((n) => {
		return n ? n.toJSON() : "";
	});
	// Si se encontró algún caso, compara las ID
	let repetido = averiguar ? averiguar.id != datos.id : false;
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
let validarLinkRepetido = async (dato) => {
	// Obtener casos
	let repetido = await BD_varias.obtenerPorCampo("links_prods", "url", dato).then((n) => {
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
