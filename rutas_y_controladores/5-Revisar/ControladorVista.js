"use strict";
// ************ Requires ************
const BD_genericas = require("../../funciones/BD/Genericas");
const BD_especificas = require("../../funciones/BD/Especificas");
const especificas = require("../../funciones/Varias/Especificas");
const variables = require("../../funciones/Varias/Variables");

module.exports = {
	visionGeneral: async (req, res) => {
		// Tema y Código
		let tema = "revision";
		let codigo = "visionGeneral";
		// Averiguar si el usuario tiene otras capturas y en ese caso redirigir
		let userID = req.session.usuario.id;
		let prodCapturado = await BD_especificas.buscaAlgunaCapturaVigenteDelUsuario("", "", userID);
		if (prodCapturado)
			return res.redirect(
				"/revision/redireccionar/?entidad=" + prodCapturado.entidad + "&id=" + prodCapturado.id
			);
		// Definir variables
		let status = await BD_genericas.obtenerTodos("status_registro", "orden");
		let revisar = status.filter((n) => !n.gr_revisados).map((n) => n.id);
		let haceUnaHora = especificas.haceUnaHora();
		// Obtener productos ------------------------------------------------------------
		let productos = await BD_especificas.obtenerProductosARevisar(haceUnaHora, revisar, userID);
		//return res.send(productos.map(n=> {return [n.nombre_castellano,n.status_registro]}));
		// Obtener las ediciones en status 'edicion' --> PENDIENTE
		// let ediciones=await BD_especificas.obtenerEdicionesARevisar();
		// Consolidar productos y ordenar
		productos = procesar(productos);
		// Obtener RCLV -----------------------------------------------------------------
		// Obtener Links ----------------------------------------------------------------
		let links = await BD_especificas.obtenerLinks(haceUnaHora, revisar, userID);
		// Obtener los productos de los links
		let aprobado = status.filter((n) => n.aprobado).map((n) => n.id);
		let prodsLinks = productosLinks(links, aprobado);
		// Ir a la vista ----------------------------------------------------------------
		//return res.send(productos);
		return res.render("0-VistaEstandar", {
			tema,
			codigo,
			titulo: "Revisar - Visión General",
			productos,
			RCLVs: [],
			prodsLinks,
			status,
		});
	},

	redireccionar: async (req, res) => {
		// Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let edicID = req.query.edicion_id;
		let userID = req.session.usuario.id;
		let destino = especificas.familiaEnSingular(entidad);
		let datosEdicion = "";
		// Obtener el producto
		let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "status_registro");
		// Obtener la sub-dirección de destino
		if (destino == "producto") {
			let subDestino = producto.status_registro.creado
				? "/alta"
				: producto.status_registro.gr_inactivos
				? "/inactivos"
				: "/edicion";
			destino += subDestino;
			if (subDestino == "/edicion") {
				if (!edicID) {
					// Obtener el id de la edición
					let producto_id = especificas.entidad_id(entidad);
					edicID = await BD_especificas.obtenerEdicionAjena("elc_" + producto_id, prodID, userID);
				}
				if (edicID) datosEdicion = "&edicion_id=" + edicID;
			}
		}
		return res.redirect("/revision/" + destino + "/?entidad=" + entidad + "&id=" + prodID + datosEdicion);
	},

	productoAlta: async (req, res) => {
		// 1. Tema y Código
		let tema = "revision";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.lastIndexOf("/"));
		// 2. Obtener los datos identificatorios del producto
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		// 3. Redirigir hacia la colección
		if (entidad == "capitulos") {
			// Liberar la captura del capítulo
			let datos = {capturado_por_id: null, capturado_en: null, captura_activa: null};
			BD_genericas.actualizarPorId("capitulos", prodID, datos);
			// Obtener el ID de la colección
			let producto = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "coleccion");
			let colecID = producto.coleccion.id;
			// Redireccionar a la colección
			return res.redirect("/revision/redireccionar/?entidad=colecciones&id=" + colecID);
		}
		// 4. Obtener los datos ORIGINALES del producto
		let includes = ["status_registro"];
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, includes);
		if (!prodOriginal.status_registro.creado)
			return res.redirect("/revision/redireccionar/?entidad=" + entidad + "&id=" + prodID);
		// 5. Obtener avatar original
		let avatar = prodOriginal.avatar
			? (prodOriginal.avatar.slice(0, 4) != "http" ? "/imagenes/3-ProdRevisar/" : "") +
			  prodOriginal.avatar
			: "/imagenes/8-Agregar/IM.jpg";
		// 6. Configurar el título de la vista
		let productoNombre = especificas.entidadNombre(entidad);
		let titulo = "Revisar el Alta de" + (entidad == "capitulos" ? "l " : " la ") + productoNombre;
		// 7. Obtener los países
		let paises = prodOriginal.paises_id
			? await especificas.paises_idToNombre(prodOriginal.paises_id)
			: "";
		// 8. Info para la vista
		let [bloqueIzq, bloqueDer] = await bloquesAltaProd(prodOriginal, paises);
		let motivosRechazo = await BD_genericas.obtenerTodos("altas_rech_motivos", "orden").then((n) =>
			n.filter((m) => m.prod)
		);
		// Ir a la vista
		//return res.send(prodOriginal)
		return res.render("0-Revisar", {
			tema,
			codigo,
			titulo,
			entidad,
			prodOriginal,
			avatar,
			bloqueIzq,
			bloqueDer,
			motivosRechazo,
			productoNombre,
		});
	},

	productoEdicion: async (req, res) => {
		// 1. Tema y Código
		let tema = "revision";
		let url = req.url.slice(1);
		let codigo = url.slice(0, url.lastIndexOf("/"));
		// 2. Variables
		let entidad = req.query.entidad;
		let prodID = req.query.id;
		let edicID = req.query.edicion_id;
		if (!edicID) return res.redirect("/revision/redireccionar/?entidad=" + entidad + "&id=" + prodID);
		let motivosRechazo = await BD_genericas.obtenerTodos("edic_rech_motivos", "orden");
		let vista, avatar, ingresos, reemplazos;
		let bloqueIzq,
			bloqueDer = [[], []];
		// 3. Obtener ambas versiones
		let prodOriginal = await BD_genericas.obtenerPorIdConInclude(entidad, prodID, "status_registro");
		let prodEditado = await BD_genericas.obtenerPorId("productos_edic", edicID);
		// 4. Acciones dependiendo de si está editado el avatar
		if (prodEditado.avatar) {
			// Vista 'Edición-Avatar'
			vista = "2-Prod2-Edic1Avatar";
			// Ruta y nombre del archivo 'avatar'
			avatar = {
				original: prodOriginal.avatar
					? (prodOriginal.avatar.slice(0, 4) != "http"
							? prodOriginal.status_registro.gr_pend_aprob
								? "/imagenes/3-ProdRevisar/"
								: "/imagenes/2-Productos/"
							: "") + prodOriginal.avatar
					: "/imagenes/8-Agregar/IM.jpg",
				edicion: "/imagenes/3-ProdRevisar/" + prodEditado.avatar,
			};
			motivosRechazo = motivosRechazo.filter((m) => m.avatar);
		} else {
			// Armar la variable con los datos a mostrar
			let edicion = {...prodEditado};
			// Quitar los campos con valor 'null' y los que son iguales al original
			for (let campo in edicion)
				if (edicion[campo] === null || prodOriginal[campo] === edicion[campo]) delete edicion[campo];
			// Obtener los
			[ingresos, reemplazos] = armarComparacion(prodOriginal, edicion);
			// Obtener el avatar
			let imagen = prodOriginal.avatar;
			avatar = imagen
				? (imagen.slice(0, 4) != "http" ? "/imagenes/2-Productos/" : "") + imagen
				: "/imagenes/8-Agregar/IM.jpg";
			// Variables
			motivosRechazo = motivosRechazo.filter((m) => m.prod);
			bloqueDer = await bloqueDerEdicProd(prodOriginal, prodEditado);
			vista = "2-Prod2-Edic2Estruct";
		}
		// 7. Configurar el título de la vista
		let productoNombre = especificas.entidadNombre(entidad);
		let titulo = "Revisar la Edición de" + (entidad == "capitulos" ? "l " : " la ") + productoNombre;
		// Ir a la vista
		//return res.send([ingresos, reemplazos]);
		return res.render(vista, {
			tema,
			codigo,
			titulo,
			prodOriginal,
			prodEditado,
			ingresos,
			reemplazos,
			avatar,
			vista,
			motivosRechazo,
			entidad,
			bloqueIzq,
			bloqueDer,
			productoNombre,
		});
	},
};

// Funciones ------------------------------------------------------------------------------
let procesar = (productos) => {
	// Procesar los registros
	let anchoMax = 30;
	// Reconvertir los elementos
	productos = productos.map((registro) => {
		let nombre =
			(registro.nombre_castellano.length > anchoMax
				? registro.nombre_castellano.slice(0, anchoMax - 1) + "…"
				: registro.nombre_castellano) +
			" (" +
			registro.ano_estreno +
			")";
		return {
			id: registro.id,
			entidad: registro.entidad,
			nombre: nombre,
			ano_estreno: registro.ano_estreno,
			abrev: registro.entidad.slice(0, 3).toUpperCase(),
			status_registro_id: registro.status_registro_id,
			fecha: registro.creado_en,
		};
	});
	// Fin
	return productos;
};
let productosLinks = (links, aprobado) => {
	// Resultado esperado:
	//	- Solo productos aprobados
	//	- Campos: {abrev, entidad, id, ano_estreno,}

	// Definir las  variables
	let prods = [];
	let auxs = [
		{nombre: "pelicula", entidad: "peliculas"},
		{nombre: "coleccion", entidad: "colecciones"},
		{nombre: "capitulo", entidad: "capitulos"},
	];
	// Rutina para cada link
	for (let link of links) {
		// Verificación para cada Producto
		for (let aux of auxs) {
			if (
				link[aux.nombre] &&
				aprobado.includes(link[aux.nombre].status_registro_id) &&
				prods.findIndex((n) => n.entidad == aux.entidad && n.id == link[aux.nombre].id) < 0
			)
				prods.push({
					entidad: aux.entidad,
					id: link[aux.nombre].id,
					nombre: link[aux.nombre].nombre_castellano,
					ano_estreno: link[aux.nombre].ano_estreno,
					abrev: aux.nombre.slice(0, 3).toUpperCase(),
				});
		}
	}
	return prods;
};
let bloquesAltaProd = async (prodOriginal, paises) => {
	// Bloque izquierdo
	let [bloque1, bloque2, bloque3] = [[], [], []];
	// Bloque 1
	if (paises) bloque1.push({titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises});
	if (prodOriginal.idioma_original)
		bloque1.push({titulo: "Idioma original", valor: prodOriginal.idioma_original.nombre});
	// Bloque 2
	if (prodOriginal.direccion) bloque2.push({titulo: "Dirección", valor: prodOriginal.direccion});
	if (prodOriginal.guion) bloque2.push({titulo: "Guión", valor: prodOriginal.guion});
	if (prodOriginal.musica) bloque2.push({titulo: "Música", valor: prodOriginal.musica});
	if (prodOriginal.produccion) bloque2.push({titulo: "Producción", valor: prodOriginal.produccion});
	// Bloque 3
	if (prodOriginal.actuacion) bloque3.push({titulo: "Actuación", valor: prodOriginal.actuacion});
	// Bloque izquierdo consolidado
	let izquierda = [bloque1, bloque2, bloque3];
	// Bloque derecho
	[bloque1, bloque2] = [[], []];
	// Bloque 1
	if (prodOriginal.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: prodOriginal.ano_estreno});
	if (prodOriginal.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOriginal.ano_fin});
	if (prodOriginal.duracion) bloque1.push({titulo: "Duracion", valor: prodOriginal.duracion + " min."});
	// Obtener la fecha de alta
	let fecha = obtenerLaFecha(prodOriginal.creado_en);
	bloque1.push({titulo: "Fecha de Alta", valor: fecha});
	// 5. Obtener los datos del usuario
	let fichaDelUsuario = await BD_especificas.fichaDelUsuario(prodOriginal.creado_por_id);
	// 6. Obtener la calidad de las altas
	let calidadAltas = await BD_especificas.calidadAltas(prodOriginal.creado_por_id);
	// Bloque derecho consolidado
	let derecha = [bloque1, {...fichaDelUsuario, ...calidadAltas}];
	return [izquierda, derecha];
};
let bloqueDerEdicProd = async (prodOriginal, prodEditado) => {
	// Bloque derecho
	let [bloque1, bloque2] = [[], []],
		fecha;
	// Bloque 1
	if (prodOriginal.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: prodOriginal.ano_estreno});
	if (prodOriginal.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOriginal.ano_fin});
	if (prodOriginal.duracion) bloque1.push({titulo: "Duracion", valor: prodOriginal.duracion + " min."});
	// Obtener la fecha de alta
	fecha = obtenerLaFecha(prodOriginal.creado_en);
	bloque1.push({titulo: "Fecha de Alta", valor: fecha});
	// Obtener la fecha de edicion
	fecha = obtenerLaFecha(prodEditado.editado_en);
	bloque1.push({titulo: "Fecha de Edic.", valor: fecha});
	// 5. Obtener los datos del usuario
	let fichaDelUsuario = await BD_especificas.fichaDelUsuario(prodEditado.editado_por_id);
	// 6. Obtener la calidad de las altas
	let calidadEdic = await BD_especificas.calidadEdic(prodEditado.editado_por_id);
	// Bloque derecho consolidado
	let derecha = [bloque1, {...fichaDelUsuario, ...calidadEdic}];
	return derecha;
};
let obtenerLaFecha = (fecha) => {
	let dia = fecha.getDate();
	let mes = variables.meses()[fecha.getMonth()];
	let ano = fecha.getFullYear().toString().slice(-2);
	fecha = dia + "/" + mes + "/" + ano;
	return fecha;
};
let armarComparacion = (prodOriginal, edicion) => {
	let camposAComparar = variables.camposRevisarEdic();
	// Quitar los campos que no se comparan y armar los valores a comparar
	for (let i = camposAComparar.length - 1; i >= 0; i--) {
		let campo = camposAComparar[i].nombreDelCampo;
		if (!Object.keys(edicion).includes(campo)) camposAComparar.splice(i, 1);
		else {
			camposAComparar[i].valorOrig =
				!camposAComparar[i].rclv || prodOriginal[campo] != 1 ? prodOriginal[campo] : null;
			camposAComparar[i].valorEdic = edicion[campo];
		}
	}
	// Ingresos de edición, sin valor en la versión original
	let ingresos = camposAComparar.filter((n) => !n.valorOrig);
	let reemplazos = camposAComparar.filter((n) => n.valorOrig);
	return [ingresos, reemplazos];
};
