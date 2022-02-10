// ************ Requires ************
let BD_varias = require("../BD/varias");
let varias = require("../Varias/Varias");

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
				? "Las extensiones de archivo válidas son jpg, png, gif, bmp"
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
			errores.nombre_original = await validarRepetidos("nombre_original", datos);
		// Nombre Castellano y Año de Estreno
		if (
			datos.nombre_castellano &&
			!errores.nombre_castellano &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		)
			errores.nombre_castellano = await validarRepetidos("nombre_castellano", datos);
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
				errores.personaje_historico_id = !datos.personaje_historico_id
					? cartelSelectVacio
					: "";
			if (subcategoria.hecho)
				errores.hecho_historico_id = !datos.hecho_historico_id ? cartelSelectVacio : "";
			if (subcategoria.valor) errores.valor_id = !datos.valor_id ? cartelSelectVacio : "";
		}
		// ***** RESUMEN *******
		errores.hay = hayErrores(errores);
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
