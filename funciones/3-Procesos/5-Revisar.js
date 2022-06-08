"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const funciones = require("./Compartidas");
const variables = require("./Variables");
const validar = require("../4-Validaciones/RUD");

module.exports = {
	// Uso compartido
	registros_ObtenerARevisar: async (haceUnaHora, status, userID, entidades, includes) => {
		// Obtener los registros del Producto, que cumplan ciertas condiciones
		// Declarar las variables
		let revisar = status.filter((n) => !n.gr_estables).map((n) => n.id);
		let resultados = [];
		// Obtener el resultado por entidad
		for (let i = 0; i < entidades.length; i++)
			resultados[i] = BD_especificas.condicRegistro_ARevisar(
				entidades[i],
				haceUnaHora,
				revisar,
				userID,
				includes
			);
		resultados = await Promise.all([...resultados]);
		// Consolidar y ordenar los resultados
		let acumulador = [];
		for (let resultado of resultados) if (resultado.length) acumulador.push(...resultado);
		if (acumulador.length > 1) acumulador.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
		// Fin
		return acumulador;
	},
	// Producto - ControladorVista
	prod_ObtenerARevisar: async function (haceUnaHora, status, userID) {
		// Obtener los registros que cumplan ciertas condiciones
		// Declarar las variables
		let entidades = ["peliculas", "colecciones"];
		let includes = ["status_registro", "ediciones"];
		// Obtener los resultados
		let resultados = await this.registros_ObtenerARevisar(
			haceUnaHora,
			status,
			userID,
			entidades,
			includes
		);
		// Eliminar los resultados que estén en status 'alta-aprobada' y tengan una sola edición y pertenezca al usuario
		let alta_aprob = status.find((n) => n.alta_aprob).id;
		for (let i = resultados.length - 1; i >= 0; i--) {
			if (
				resultados[i].status_registro.id == alta_aprob &&
				resultados[i].ediciones.length == 1 &&
				resultados[i].ediciones[0].editado_por_id == userID
			)
				resultados.splice(i, 1);
		}
		// Fin
		return resultados;
	},
	prod_ObtenerEdicARevisar: async (haceUnaHora, status, userID) => {
		// Obtener todas las ediciones de usuarios ajenos, con asociación a películas, colecciones y capítulos
		// Declarar las variables
		let aprobados = status.find((n) => n.aprobado).id;
		// Obtener todas las ediciones de usuarios ajenos y de hace más de una hora
		let ediciones = await BD_especificas.condicEdicProd_ARevisar(haceUnaHora, userID);
		// Obtener los productos
		let productos = ediciones.map((n) => {
			return n.pelicula_id
				? {...n.pelicula, entidad: "peliculas"}
				: n.coleccion_id
				? {...n.coleccion, entidad: "colecciones"}
				: {...n.capitulo, entidad: "capitulos"};
		});
		// Dejar solamente los productos aprobados
		productos = productos.filter((n) => n.status_registro_id == aprobados);
		// Dejar solamente los productos generados por otros usuarios
		productos = productos.filter((n) => n.creado_por_id != userID);
		// Dejar solamente los productos que estén creados hace más de una hora
		productos = productos.filter((n) => n.creado_en < haceUnaHora);
		// Dejar solamente los productos que no tengan problemas de captura
		productos = productos.filter(
			(n) =>
				!n.capturado_en ||
				n.capturado_en < haceUnaHora ||
				!n.captura_activa ||
				n.capturado_por_id == userID
		);
		// Fin
		return productos;
	},
	prod_ProcesarCampos: (productos) => {
		// Procesar los registros
		let anchoMax = 40;
		// Reconvertir los elementos
		productos = productos.map((n) => {
			let nombre =
				(n.nombre_castellano.length > anchoMax
					? n.nombre_castellano.slice(0, anchoMax - 1) + "…"
					: n.nombre_castellano) +
				" (" +
				n.ano_estreno +
				")";
			return {
				id: n.id,
				entidad: n.entidad,
				nombre,
				ano_estreno: n.ano_estreno,
				abrev: n.entidad.slice(0, 3).toUpperCase(),
				status_registro_id: n.status_registro_id,
				fecha: n.creado_en,
				ediciones: n.ediciones,
			};
		});
		// Fin
		return productos;
	},
	prod_BloquesAlta: async function (prodOriginal, paises) {
		// Definir el 'ahora'
		let ahora = funciones.ahora().getTime();
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
		if (prodOriginal.ano_estreno)
			bloque1.push({titulo: "Año de estreno", valor: prodOriginal.ano_estreno});
		if (prodOriginal.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOriginal.ano_fin});
		if (prodOriginal.duracion) bloque1.push({titulo: "Duracion", valor: prodOriginal.duracion + " min."});
		// Obtener la fecha de alta
		let fecha = this.obtenerLaFecha(prodOriginal.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// 5. Obtener los datos del usuario
		let fichaDelUsuario = await this.usuario_Ficha(prodOriginal.creado_por_id, ahora);
		// 6. Obtener la calidad de las altas
		let calidadAltas = await this.usuario_CalidadAltas(prodOriginal.creado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadAltas}];
		return [izquierda, derecha];
	},
	prod_QuedanCampos: async (prodOriginal, prodEditado) => {
		// Variables
		let edicion = {...prodEditado};
		let noSeComparan;
		let entidad = funciones.obtenerEntidad(prodEditado);
		let statusAprobado = prodOriginal.status_registro.aprobado;
		// Pulir la información a tener en cuenta
		edicion = funciones.quitarLosCamposSinContenido(edicion);
		[edicion, noSeComparan] = quitarLosCamposQueNoSeComparan(edicion);
		edicion = funciones.quitarLasCoincidenciasConOriginal(prodOriginal, edicion);
		// Averiguar si queda algún campo
		let quedanCampos = !!Object.keys(edicion).length;
		// Si no quedan, eliminar el registro
		if (!quedanCampos) {
			// Eliminar el registro de la edición
			await BD_genericas.eliminarRegistro("prods_edicion", prodEditado.id);
			// Averiguar si el original no tiene errores
			let errores = await validar.edicion(null, {...prodOriginal, entidad});
			// Si se cumple lo siguiente, cambiarle el status a 'aprobado'
			// 1. Que no tenga errores
			// 2. Que el status del original sea 'alta_aprob'
			if (!errores.hay && prodOriginal.status_registro.alta_aprob) {
				statusAprobado = true;
				// Obtener el 'id' del status 'aprobado'
				let aprobado_id = await BD_especificas.obtenerELC_id("status_registro", {aprobado: true});
				// Averiguar el Lead Time de creación en horas
				let ahora = funciones.ahora();
				let leadTime = funciones.obtenerLeadTime(prodOriginal.creado_en, ahora);
				// Cambiarle el status al producto y liberarlo
				let datos = {
					alta_terminada_en: ahora,
					lead_time_creacion: leadTime,
					status_registro_id: aprobado_id,
				};
				await BD_genericas.actualizarPorId(entidad, prodOriginal.id, {...datos, captura_activa: 0});
				// Si es una colección, cambiarle el status también a los capítulos
				if (entidad == "colecciones") {
					// Ampliar los datos
					datos = {...datos, alta_analizada_por_id: 2, alta_analizada_en: ahora};
					// Generar el objeto para filtrar
					let objeto = {coleccion_id: prodOriginal.id};
					// Actualizar el status de los capitulos
					BD_genericas.actualizarPorCampos("capitulos", objeto, datos);
				}
			}
		} else edicion = {...noSeComparan, ...edicion};
		// Fin
		return [quedanCampos, edicion, statusAprobado];
	},
	prod_ArmarComparac: (prodOriginal, prodEditado) => {
		let camposAComparar = variables.camposRevisarEdic();
		for (let i = camposAComparar.length - 1; i >= 0; i--) {
			let campo = camposAComparar[i].nombreDelCampo;
			if (!Object.keys(prodEditado).includes(campo)) camposAComparar.splice(i, 1);
			else {
				// Variables
				let verificar = !camposAComparar[i].rclv || prodOriginal[campo] != 1;
				let asoc1 = camposAComparar[i].asociacion1;
				let asoc2 = camposAComparar[i].asociacion2;
				// Valores originales
				camposAComparar[i].valorOrig = verificar ? prodOriginal[campo] : null;
				camposAComparar[i].mostrarOrig =
					camposAComparar[i].asociacion1 && prodOriginal[asoc1] && verificar
						? prodOriginal[asoc1][asoc2]
						: camposAComparar[i].valorOrig;
				// Valores editados
				camposAComparar[i].valorEdic = prodEditado[campo];
				camposAComparar[i].mostrarEdic = asoc1 ? prodEditado[asoc1][asoc2] : prodEditado[campo];
			}
		}
		// Ingresos de edición, sin valor en la versión original
		let ingresos = camposAComparar.filter((n) => !n.valorOrig);
		let reemplazos = camposAComparar.filter((n) => n.valorOrig);
		return [ingresos, reemplazos];
	},
	prod_BloqueEdic: async function (prodOriginal, prodEditado) {
		// Definir el 'ahora'
		let ahora = funciones.ahora().getTime();
		// Bloque derecho
		let bloque1 = [];
		let fecha;
		// Bloque 1
		if (prodOriginal.ano_estreno)
			bloque1.push({titulo: "Año de estreno", valor: prodOriginal.ano_estreno});
		if (prodOriginal.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOriginal.ano_fin});
		if (prodOriginal.duracion) bloque1.push({titulo: "Duracion", valor: prodOriginal.duracion + " min."});
		// Obtener la fecha de alta
		fecha = this.obtenerLaFecha(prodOriginal.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// Obtener la fecha de edicion
		fecha = this.obtenerLaFecha(prodEditado.editado_en);
		bloque1.push({titulo: "Fecha de Edic.", valor: fecha});
		// 5. Obtener los datos del usuario
		let fichaDelUsuario = await this.usuario_Ficha(prodEditado.editado_por_id, ahora);
		// 6. Obtener la calidad de las altas
		let calidadEdic = await this.usuario_CalidadEdic(prodEditado.editado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadEdic}];
		return derecha;
	},
	// Producto - ControladorAPI
	prod_EdicValores: (aprobado, prodOriginal, prodEditado, campo) => {
		// Definir los campos 'complicados'
		let camposConVinculo = [
			{campo: "en_castellano_id", vinculo: "en_castellano"},
			{campo: "en_color_id", vinculo: "en_color"},
			{campo: "idioma_original_id", vinculo: "idioma_original"},
			{campo: "categoria_id", vinculo: "categoria"},
			{campo: "subcategoria_id", vinculo: "subcategoria"},
			{campo: "publico_sugerido_id", vinculo: "publico_sugerido"},
			{campo: "personaje_id", vinculo: "personaje"},
			{campo: "hecho_id", vinculo: "hecho"},
			{campo: "valor_id", vinculo: "valor"},
		];
		// Obtener el array de campos
		let campos = camposConVinculo.map((n) => n.campo);
		// Averiguar si el campo es 'complicado' y en ese caso obtener su índice
		let indice = campos.indexOf(campo);
		let valorOrig =
			indice >= 0 ? prodValorVinculo(prodOriginal, camposConVinculo[indice]) : prodOriginal[campo];
		let valorEdic =
			indice >= 0 ? prodValorVinculo(prodEditado, camposConVinculo[indice]) : prodEditado[campo];
		if (valorOrig === null) valorOrig = "-";
		// Obtener los valores 'aceptado' y 'rechazado'
		let valor_aceptado = aprobado ? valorEdic : valorOrig;
		let valor_rechazado = !aprobado ? valorEdic : valorOrig;
		// Fin
		return {valor_aceptado, valor_rechazado};
	},
	prod_DiaDelAno: async (prod_entidad, producto, status) => {
		// Variables
		let aprobado = status.find((n) => n.aprobado).id;
		// Obtener el dia_del_ano_id, con la condición de que esté aprobado
		let dia_del_ano_id =
			producto.personaje.dia_del_ano_id && producto.personaje.status_registro_id == aprobado
				? producto.personaje.dia_del_ano_id
				: producto.hecho.dia_del_ano_id && producto.hecho.status_registro_id == aprobado
				? producto.hecho.dia_del_ano_id
				: producto.valor.dia_del_ano_id && producto.valor.status_registro_id == aprobado
				? producto.valor.dia_del_ano_id
				: "";
		// Si existe el día, actualizar el producto
		if (dia_del_ano_id) BD_genericas.actualizarPorId(prod_entidad, producto.id, {dia_del_ano_id});
		// Fin
		return;
	},
	prods_DiaDelAno: function (RCLV, status) {
		// Obtener cada producto
		let asociaciones = ["peliculas", "colecciones", "capitulos"];
		// Actualizarle el valor 'dia_del_ano_id' a los productos
		asociaciones.forEach((asociacion) => {
			let entidad = asociacion;
			RCLV[asociacion].forEach(async (producto) => {
				if (RCLV.dia_del_ano_id)
					BD_genericas.actualizarPorId(entidad, producto.id, {dia_del_ano_id: RCLV.dia_del_ano_id});
				else {
					let includes = ["personaje", "hecho", "valor"];
					let prod = await BD_genericas.obtenerPorIdConInclude(entidad, producto.id, includes);
					this.prod_DiaDelAno(entidad, prod, status);
				}
			});
		});
	},

	// RCLV
	RCLV_ObtenerARevisar: async function (haceUnaHora, status, userID) {
		// Obtener los registros que cumplan ciertas condiciones
		// Declarar las variables
		let entidades = ["personajes", "hechos", "valores"];
		let includes = ["status_registro", "peliculas", "colecciones", "capitulos"];
		// Obtener los resultados
		let resultados = await this.registros_ObtenerARevisar(
			haceUnaHora,
			status,
			userID,
			entidades,
			includes
		);
		// Dejar solamente RCLVs con productos aprobados
		let aprobado = status.find((n) => n.aprobado).id;
		let campos = ["peliculas", "colecciones", "capitulos"];
		let aux = [];
		// Rutina para cada RCLV
		resultados.map((n) => {
			// Verificación si tiene algún Producto
			for (let campo of campos) {
				if (n[campo].length)
					for (let reg of n[campo]) {
						// Averiguar el status_registro_id del producto
						if (
							// El producto está aprobado
							reg.status_registro_id == aprobado &&
							// El RCLV todavía no está incluido en la variable 'auxiliar'
							aux.findIndex((m) => m.entidad == n.entidad && m.id == n.id) < 0
						) {
							aux.push(n);
							break;
						}
					}
				if (aux.length && aux.slice(-1) == n) break;
			}
		});
		resultados = aux;
		// Fin
		return resultados;
	},
	RCLV_ProcesarCampos: (RCLVs) => {
		// Definir algunas variables
		let anchoMax = 30;
		// Reconvertir los elementos
		RCLVs = RCLVs.map((n) => {
			let nombre = n.nombre.length > anchoMax ? n.nombre.slice(0, anchoMax - 1) + "…" : n.nombre;
			return {
				id: n.id,
				entidad: n.entidad,
				nombre,
				abrev: n.entidad.slice(5, 8).toUpperCase(),
				status_registro_id: n.status_registro_id,
				fecha: n.creado_en,
			};
		});
		// Fin
		return RCLVs;
	},
	RCLV_tituloCanoniz: (datos) => {
		let tituloCanoniz;
		if (datos.entidad == "personajes") {
			tituloCanoniz = datos.proceso_canonizacion.nombre;
			if (
				datos.proceso_canonizacion.nombre == "Santo" &&
				!datos.nombre.startsWith("Domingo") &&
				!datos.nombre.startsWith("Tomás") &&
				!datos.nombre.startsWith("Tomé") &&
				!datos.nombre.startsWith("Toribio")
			)
				tituloCanoniz = "San";
		}
		return tituloCanoniz;
	},
	RCLV_BD_AprobRech: async (entidad, RCLV_original, includes, userID) => {
		// Variables
		let ahora = funciones.ahora();
		// Campos a comparar
		let camposComparar = [
			{campo: "nombre", titulo: "Nombre"},
			{campo: "dia_del_ano_id", titulo: "Día del año"},
		];
		if (entidad != "valores") camposComparar.push({campo: "ano", titulo: "Año de referencia"});
		if (entidad == "personajes")
			camposComparar.push(
				{campo: "proceso_canonizacion_id", titulo: "Proceso de Canonización"},
				{campo: "rol_iglesia_id", titulo: "Rol en la Iglesia"}
			);
		// Obtener RCLV actual
		let RCLV_actual = await BD_genericas.obtenerPorIdConInclude(entidad, RCLV_original.id, includes);
		// Obtener el motivo genérico
		let motivoGenericoID = await BD_genericas.obtenerPorCampos("edic_motivos_rech", {generico: 1}).then(
			(n) => n.id
		);
		// Rutina para comparar los campos
		for (let campoComparar of camposComparar) {
			// Generar la información
			let datos = {
				entidad,
				entidad_id: RCLV_original.id,
				campo: campoComparar.campo,
				titulo: campoComparar.titulo,
				valor_aceptado: RCLV_valorVinculo(RCLV_actual, campoComparar.campo),
				input_por_id: RCLV_original.creado_por_id,
				input_en: RCLV_original.creado_en,
				evaluado_por_id: userID,
				evaluado_en: ahora,
			};
			if (RCLV_original[campoComparar.campo] != RCLV_actual[campoComparar.campo]) {
				datos.valor_rechazado = RCLV_valorVinculo(RCLV_original, campoComparar.campo);
				datos.motivo_id = motivoGenericoID;
			}
			// Guardar los registros
			let RCLV_entidad =
				RCLV_original[campoComparar.campo] == RCLV_actual[campoComparar.campo]
					? "edic_aprob"
					: "edic_rech";
			await BD_genericas.agregarRegistro(RCLV_entidad, datos);
		}
		return;
	},
	RCLV_actualizarProdAprob: async function (producto, status) {
		// Variables
		let aprobado = status.find((n) => n.aprobado).id;
		let includes = ["peliculas", "colecciones", "capitulos"];
		let RCLV_entidades = ["personajes", "hechos", "valores"];
		// Rutina para cada entidad
		for (let RCLV_entidad of RCLV_entidades) {
			// Obtener el campo a analizar (pelicula_id, etc.) y su valor en el producto
			let campo = funciones.obtenerEntidad_id(RCLV_entidad);
			// Obtener el RCLV_id
			let RCLV_id = producto[campo];
			// Si el RCLV_id no aplica (vacío o 1) => salir de la rutina
			if (!RCLV_id || RCLV_id == 1) continue;
			// Actualizar 'prod_aprob' en RCLV si corresponde
			// Obtener el RCLV
			let RCLV = await BD_genericas.obtenerPorIdConInclude(RCLV_entidad, RCLV_id, includes);
			// Rutina sólo si el RCLV está aprobado, de lo contrario no vale la pena
			if (RCLV.status_registro_id == aprobado) {
				let prod_aprob = this.RCLV_averiguarSiTieneProdAprob(RCLV, status);
				// Actualizar el RCLV
				BD_genericas.actualizarPorId(RCLV_entidad, RCLV_id, {prod_aprob});
			}
		}
		return;
	},
	RCLV_averiguarSiTieneProdAprob: (RCLV, status) => {
		// Variables
		let aprobado = status.find((n) => n.aprobado).id;
		let entidades = ["peliculas", "colecciones", "capitulos"];
		// Calcular la cantidad de casos
		let prod_aprob;
		for (let entidad of entidades) {
			prod_aprob = RCLV[entidad].some((n) => n.status_registro_id == aprobado);
			if (prod_aprob) break;
		}
		return prod_aprob;
	},

	// Links
	links_ObtenerARevisar: async (haceUnaHora, status, userID) => {
		// Obtener todos los registros de links, excepto los que tengan status 'aprobado' o 'inactivo'
		// Declarar las variables
		let revisar = status.filter((n) => !n.gr_estables).map((n) => n.id);
		let aprobado_id = status.find((n) => n.aprobado).id;
		// Obtener los links 'a revisar'
		let links = await BD_especificas.obtenerLinksARevisar(revisar);
		// Si no hay => salir
		if (!links.length) return [];
		// Obtener los links ajenos
		let linksAjenos = links.filter(
			(n) =>
				(n.status_registro &&
					((n.status_registro.creado && n.creado_por_id != userID) ||
						((n.status_registro.inactivar || !n.status_registro.recuperar) &&
							n.sugerido_por_id != userID))) ||
				(!n.status_registro && n.editado_por_id != userID)
		);
		// Obtener los productos
		let prodAjenos = linksAjenos.length
			? obtenerProductos(linksAjenos, aprobado_id, haceUnaHora, userID)
			: "";
		// Fin
		return prodAjenos;
	},

	// Usuario
	usuario_Ficha: async (userID, ahora) => {
		// Obtener los datos del usuario
		let includes = "rol_iglesia";
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, includes);
		// Variables
		let unAno = unDia * 365;
		let enviar = {apodo: ["Apodo", usuario.apodo]};
		// Edad
		if (usuario.fecha_nacimiento) {
			let edad = parseInt((ahora - new Date(usuario.fecha_nacimiento).getTime()) / unAno) + " años";
			enviar.edad = ["Edad", edad];
		}
		// Antigüedad
		let antiguedad =
			(parseInt(((ahora - new Date(usuario.creado_en).getTime()) / unAno) * 10) / 10)
				.toFixed(1)
				.replace(".", ",") + " años";
		enviar.antiguedad = ["Tiempo en ELC", antiguedad];
		// Rol en la iglesia
		if (usuario.rol_iglesia) enviar.rolIglesia = ["Vocación", usuario.rol_iglesia.nombre];
		// Fin
		return enviar;
	},
	usuario_CalidadAltas: async (userID) => {
		// 1. Obtener los datos del usuario
		let usuario = await BD_genericas.obtenerPorId("usuarios", userID);
		// 2. Contar los casos aprobados y rechazados
		let cantAprob = usuario.cant_altas_aprob;
		let cantRech = usuario.cant_altas_rech;
		// 3. Precisión de altas
		let cantAltas = cantAprob + cantRech;
		let calidadInputs = cantAltas ? parseInt((cantAprob / cantAltas) * 100) + "%" : "-";
		// let diasPenalizacion = usuario.dias_penalizacion
		// Datos a enviar
		let enviar = {
			calidadAltas: ["Calidad Altas", calidadInputs],
			cantAltas: ["Cant. Prod. Agregados", cantAltas],
			// diasPenalizacion: ["Días Penalizado", diasPenalizacion],
		};
		// Fin
		return enviar;
	},
	usuario_CalidadEdic: async (userID) => {
		// 1. Obtener los datos del usuario
		let usuario = await BD_genericas.obtenerPorId("usuarios", userID);
		// 2. Contar los casos aprobados y rechazados
		let cantAprob = usuario.cant_edic_aprob;
		let cantRech = usuario.cant_edic_rech;
		// 3. Precisión de ediciones
		let cantEdics = cantAprob + cantRech;
		let calidadInputs = cantEdics ? parseInt((cantAprob / cantEdics) * 100) + "%" : "-";
		// let diasPenalizacion = usuario.dias_penalizacion
		// Datos a enviar
		let enviar = {
			calidadEdiciones: ["Calidad Edición", calidadInputs],
			cantEdiciones: ["Cant. Campos Proces.", cantEdics],
			// diasPenalizacion: ["Días Penalizado", diasPenalizacion],
		};
		// Fin
		return enviar;
	},
	usuario_Penalizar: async (penalizarUsuario) => {
		// Obtener los datos del usuario
		let usuario = await BD_genericas.obtenerPorId("usuarios", penalizarUsuario.usuario_ID);
		// Averiguar el mayor entre 'hoy' y 'penalizado_hasta'
		let hoy = funciones.ahora().getTime();
		let penalizado_hasta = usuario.penalizado_hasta ? usuario.penalizado_hasta.getTime() : 0;
		let fechaActual = Math.max(hoy, penalizado_hasta);
		// Sumarle la duración
		let nuevaFecha = new Date(fechaActual);
		nuevaFecha.setDate(nuevaFecha.getDate() + penalizarUsuario.duracion);
		// Preparar la información
		let datos = {
			penalizado_en: penalizarUsuario.penalizado_en,
			penalizado_hasta: nuevaFecha,
			penalizado_por_id: penalizarUsuario.penalizado_por_id,
		};
		// Actualizar el registro
		BD_genericas.actualizarPorId("usuarios", usuario.id, datos);
		// Fin
		return;
	},

	// Varios
	obtenerLaFecha: (fecha) => {
		let dia = fecha.getDate();
		let mes = meses[fecha.getMonth()];
		let ano = fecha.getFullYear().toString().slice(-2);
		fecha = dia + "/" + mes + "/" + ano;
		return fecha;
	},
};

// Funciones ----------------------------
let prodValorVinculo = (producto, objeto) => {
	let aux = producto[objeto.vinculo]
		? objeto.campo == "en_castellano_id" || objeto.campo == "en_color_id"
			? producto[objeto.vinculo].productos
			: producto[objeto.vinculo].nombre
		: null;
	return aux;
};
let RCLV_valorVinculo = (RCLV, campo) => {
	return campo == "dia_del_ano_id"
		? RCLV.dia_del_ano
			? RCLV.dia_del_ano.dia + "/" + meses[RCLV.dia_del_ano.mes_id - 1]
			: RCLV.dia_del_ano
		: campo == "proceso_canonizacion_id"
		? RCLV.proceso_canonizacion
			? RCLV.proceso_canonizacion.nombre
			: ""
		: campo == "rol_iglesia_id"
		? RCLV.rol_iglesia
			? RCLV.rol_iglesia.nombre
			: ""
		: RCLV[campo];
};
let eliminarRepetidos = (productos) => {
	let aux = [];
	for (let i = productos.length - 1; i >= 0; i--) {
		if (aux.includes(productos[i].id)) productos.splice(i, 1);
		else aux.push(productos[i].id);
	}
	return productos;
};
let obtenerProductos = (links, aprobado_id, haceUnaHora, userID) => {
	// Variables
	let peliculas = [];
	let colecciones = [];
	let capitulos = [];
	// Abrir los productos por entidad
	links.forEach((link) => {
		if (link.pelicula) peliculas.push({entidad: "peliculas", ...link.pelicula});
		if (link.coleccion) colecciones.push({entidad: "colecciones", ...link.coleccion});
		if (link.capitulo) capitulos.push({entidad: "capitulos", ...link.capitulo});
	});
	// Eliminar repetidos
	if (peliculas.length) peliculas = eliminarRepetidos(peliculas);
	if (colecciones.length) colecciones = eliminarRepetidos(colecciones);
	if (capitulos.length) capitulos = eliminarRepetidos(capitulos);
	// Volver a consolidar
	let productos = [...peliculas, ...colecciones, ...capitulos];
	// Depurar los productos que no cumplen ciertas condiciones
	productos = limpieza(productos, aprobado_id, haceUnaHora, userID);
	// Fin
	return productos;
};
let limpieza = (productos, aprobado_id, haceUnaHora, userID) => {
	// Dejar solamente los productos aprobados
	productos = productos.filter((n) => n.status_registro_id == aprobado_id);
	// Dejar solamente los productos que estén creados hace más de una hora
	productos = productos.filter((n) => n.creado_en < haceUnaHora);
	// Dejar solamente los productos que no tengan problemas de captura
	productos = productos.filter(
		(n) =>
			!n.capturado_en ||
			n.capturado_en < haceUnaHora ||
			!n.captura_activa ||
			n.capturado_por_id == userID
	);
	return productos;
};
let quitarLosCamposQueNoSeComparan = (edicion) => {
	let noSeComparan = {};
	// Obtener los campos a comparar
	let camposAComparar = variables.camposRevisarEdic().map((n) => n.nombreDelCampo);
	// Quitar de edicion los campos que no se comparan
	for (let campo in edicion)
		if (!camposAComparar.includes(campo)) {
			noSeComparan[campo] = edicion[campo];
			delete edicion[campo];
		}
	// Fin
	return [edicion, noSeComparan];
};
