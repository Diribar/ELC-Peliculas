"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const funciones = require("./Compartidas");
const variables = require("./Variables");
const validar = require("../4-Validaciones/RUD");

module.exports = {
	// ControladorVista (Tablero)
	// Producto, RCLVs, Links
	tablero_obtenerProds: async (ahora, status, userID) => {
		// Obtener productos en status no estables
		// Declarar las variables
		let entidades = ["peliculas", "colecciones"];
		let campos;
		// - Obtener los resultados de status creado_id
		let creado_id = status.find((n) => n.creado).id;
		campos = [entidades, ahora, creado_id, userID, "creado_en", "creado_por_id", ""];
		let PA = await tablero_obtenerRegs(...campos);
		// - Obtener los resultados de status alta_aprob sin edición
		let alta_aprob_id = status.find((n) => n.alta_aprob).id;
		campos = [entidades, ahora, alta_aprob_id, userID, "creado_en", "creado_por_id", "ediciones"];
		let SE = await tablero_obtenerRegs(...campos);
		SE = SE.filter((n) => !n.ediciones.length);
		// - Obtener los resultados de status inactivar_id
		let inactivar_id = status.find((n) => n.inactivar).id;
		campos = [entidades, ahora, inactivar_id, userID, "sugerido_en", "sugerido_por_id", ""];
		let IN = await tablero_obtenerRegs(...campos);
		// - Obtener los resultados de status recuperar_id
		let recuperar_id = status.find((n) => n.recuperar).id;
		campos = [entidades, ahora, recuperar_id, userID, "sugerido_en", "sugerido_por_id", ""];
		let RC = await tablero_obtenerRegs(...campos);

		// Fin
		return {PA, IN, RC, SE};
	},
	tablero_obtenerProdsDeEdics: async (ahora, status, userID) => {
		// Obtener los productos que tengan alguna edición que cumpla con:
		// - Ediciones ajenas
		// - Sin RCLV no aprobados
		// Y además los productos sean aptos p/captura y en status c/altaAprob o aprobados,

		// Declarar las variables
		const haceUnaHora = funciones.nuevoHorario(-1, ahora);
		let alta_aprob_id = status.find((n) => n.alta_aprob).id;
		let aprobado_id = status.find((n) => n.aprobado).id;
		let gr_aprobado = [alta_aprob_id, aprobado_id];
		let includes = ["pelicula", "coleccion", "capitulo", "personaje", "hecho", "valor"];
		let productos = [];
		// Obtener todas las ediciones ajenas
		let ediciones = await BD_especificas.tablero_obtenerEdicsDeProds(userID, includes);
		// Eliminar las edicionesProd con RCLV no aprobado
		if (ediciones.length)
			for (let i = ediciones.length - 1; i >= 0; i--)
				if (
					(ediciones[i].personaje && ediciones[i].personaje.status_registro_id != aprobado_id) ||
					(ediciones[i].hecho && ediciones[i].hecho.status_registro_id != aprobado_id) ||
					(ediciones[i].valor && ediciones[i].valor.status_registro_id != aprobado_id)
				)
					ediciones.splice(i, 1);
		// Obtener los productos
		if (ediciones.length) {
			// Variables
			let peliculas = [];
			let colecciones = [];
			let capitulos = [];
			// Obtener los productos
			ediciones.map((n) => {
				if (n.pelicula_id)
					peliculas.push({...n.pelicula, entidad: "peliculas", editado_en: n.editado_en});
				if (n.coleccion_id)
					colecciones.push({...n.coleccion, entidad: "colecciones", editado_en: n.editado_en});
				if (n.capitulo_id)
					capitulos.push({...n.capitulo, entidad: "capitulos", editado_en: n.editado_en});
			});
			// Eliminar los repetidos
			if (peliculas.length) peliculas = eliminarRepetidos(peliculas);
			if (colecciones.length) colecciones = eliminarRepetidos(colecciones);
			if (capitulos.length) capitulos = eliminarRepetidos(capitulos);
			// Consolidar los productos
			productos = [...peliculas, ...colecciones, ...capitulos];
			// Dejar solamente los productos de gr_aprobado
			productos = productos.filter((n) => gr_aprobado.includes(n.status_registro_id));
			// Dejar solamente los productos que no tengan problemas de captura
			if (productos.length)
				productos = productos.filter(
					(n) =>
						!n.capturado_en ||
						n.capturado_en < haceUnaHora ||
						!n.captura_activa ||
						n.capturado_por_id == userID
				);
			// Ordenar por fecha de edición, y luego por status_registro
			if (productos.length) {
				productos.sort((a, b) => new Date(a.editado_en) - new Date(b.editado_en));
				productos.sort((a, b) => new Date(a.status_registro_id) - new Date(b.status_registro_id));
			}
		}
		// Fin
		return productos;
	},
	tablero_obtenerRCLVs: async (ahora, status, userID) => {
		// Obtener los siguients RCLVs:
		// creado y creados ajeno,
		//		PA: c/producto o edicProd
		//		IN: s/producto o edicProd --> inactivarlo
		// IP: inactivo c/prod --> a status altaAprob
		// - SP: aprobado, s/producto o edicProd

		// Declarar las variables
		let entidades = ["personajes", "hechos", "valores"];
		let includes = ["peliculas", "colecciones", "capitulos", "ediciones_producto"];
		let campos, regs;
		let PA = [];
		let IN = [];
		let IP = [];
		// - Obtener los resultados de status creado_id
		let creado_id = status.find((n) => n.creado).id;
		campos = [entidades, ahora, creado_id, userID, "creado_en", "creado_por_id", includes];
		regs = await tablero_obtenerRegs(...campos);
		// Separar entre c/prod y s/prod
		if (regs.length) {
			regs.map((n) => {
				n.peliculas || n.colecciones || n.capitulos || n.ediciones_producto ? PA.push(n) : IN.push(n);
				return;
			});
		}
		// - Obtener los resultados de status inactivo_id
		let inactivo_id = status.find((n) => n.inactivo).id;
		campos = [entidades, ahora, inactivo_id, userID, "sugerido_por_id", "sugerido_en", includes];
		regs = await tablero_obtenerRegs(...campos);
		// Filtrar por c/prod
		IP = regs.filter((n) => n.peliculas || n.colecciones || n.capitulos || n.ediciones_producto);

		// Fin
		return {PA, IN, IP};
	},
	tablero_obtenerRCLVsEdics: async (ahora, status, userID) => {
		// - edicRCLV ajena, pend. aprobar
	},
	tablero_obtenerProdsDeLinks: async (ahora, status, userID) => {
		// Obtener todos los productos aprobados, con algún link ajeno en status no estable
		// Obtener los links 'a revisar'
		let links = await BD_especificas.tablero_obtenerLinks_y_Edics(status);
		// Si no hay => salir
		if (!links.length) return [];
		// Obtener los links ajenos
		let linksAjenos = links.filter(
			(n) =>
				(n.status_registro &&
					((n.status_registro.creado && n.creado_por_id != userID) ||
						((n.status_registro.inactivar || n.status_registro.recuperar) &&
							n.sugerido_por_id != userID))) ||
				(!n.status_registro && n.editado_por_id != userID)
		);
		// Obtener los productos
		let productos = linksAjenos.length ? obtenerProdsDeLinks(linksAjenos, status, ahora, userID) : [];
		// Fin
		return productos;
	},
	prod_ProcesarCampos: (productos) => {
		// Procesar los registros
		// Variables
		const anchoMax = 40;
		const rubros = Object.keys(productos);

		// Reconvertir los elementos
		for (let rubro of rubros)
			productos[rubro] = productos[rubro].map((n) => {
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
				};
			});

		// Fin
		return productos;
	},
	RCLV_ProcesarCampos: (RCLVs) => {
		// Procesar los registros
		let anchoMax = 30;
		const rubros = Object.keys(RCLVs);

		// Reconvertir los elementos
		for (let rubro of rubros)
			RCLVs[rubro] = RCLVs[rubro].map((n) => {
				let nombre = n.nombre.length > anchoMax ? n.nombre.slice(0, anchoMax - 1) + "…" : n.nombre;
				return {
					id: n.id,
					entidad: n.entidad,
					nombre,
					abrev: n.entidad.slice(0, 3).toUpperCase(),
					status_registro_id: n.status_registro_id,
					fecha: n.creado_en,
				};
			});

		// Fin
		return RCLVs;
	},

	// ControladorVista (Analizar)
	prod_BloquesAlta: async (prodOriginal, paises) => {
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
		let fecha = obtenerLaFecha(prodOriginal.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// 5. Obtener los datos del usuario
		let fichaDelUsuario = await usuario_Ficha(prodOriginal.creado_por_id, ahora);
		// 6. Obtener la calidad de las altas
		let calidadAltas = await usuario_CalidadAltas(prodOriginal.creado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadAltas}];
		return [izquierda, derecha];
	},
	prod_QuedanCampos: async (prodOriginal, prodEditado) => {
		// Variables
		let edicion = {...prodEditado};
		let noSeComparan = {
			editado_por_id: prodEditado.editado_por_id,
			editado_en: prodEditado.editado_en,
		};
		let entidad = funciones.obtenerEntidad(prodEditado);
		let statusAprobado = prodOriginal.status_registro.aprobado;
		// Pulir la información a tener en cuenta
		edicion = funciones.eliminarCamposConValorNull(edicion);
		edicion = funciones.quitarLosCamposQueNoSeComparan(edicion, "Prod");
		edicion = funciones.quitarLasCoincidenciasConOriginal(prodOriginal, edicion);
		let quedanCampos = funciones.eliminarEdicionSiEstaVacio("prods_edicion", prodEditado.id, edicion);
		// Si no quedan, eliminar el registro
		if (!quedanCampos) {
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
		} else edicion = {...edicion, ...noSeComparan};
		// Fin
		return [quedanCampos, edicion, statusAprobado];
	},
	prod_ArmarComparac: (prodOriginal, prodEditado) => {
		let camposAComparar = variables.camposRevisarProd();
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
	prod_BloqueEdic: async (prodOriginal, prodEditado) => {
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
		fecha = obtenerLaFecha(prodOriginal.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// Obtener la fecha de edicion
		fecha = obtenerLaFecha(prodEditado.editado_en);
		bloque1.push({titulo: "Fecha de Edic.", valor: fecha});
		// 5. Obtener los datos del usuario
		let fichaDelUsuario = await usuario_Ficha(prodEditado.editado_por_id, ahora);
		// 6. Obtener la calidad de las altas
		let calidadEdic = await usuario_CalidadEdic(prodEditado.editado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadEdic}];
		return derecha;
	},
	prod_ActualizarRCLVs_ProdAprob: async (producto, status) => {
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
				let prod_entidades = ["peliculas", "colecciones", "capitulos"];
				// Calcular la cantidad de casos
				let prod_aprob;
				for (let entidad of prod_entidades) {
					prod_aprob = RCLV[entidad].some((n) => n.status_registro_id == aprobado);
					if (prod_aprob) break;
				}
				// Actualizar el RCLV
				BD_genericas.actualizarPorId(RCLV_entidad, RCLV_id, {prod_aprob});
			}
		}
		return;
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

	// RCLV
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
				{campo: "proceso_id", titulo: "Proceso de Canonización"},
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
			let entidad =
				RCLV_original[campoComparar.campo] == RCLV_actual[campoComparar.campo]
					? "edic_aprob"
					: "edic_rech";
			await BD_genericas.agregarRegistro(entidad, datos);
		}
		return;
	},

	// Usuario
	usuario_Penalizar: async (userID, motivo, campo) => {
		// Variables
		let datos = {};
		// Averiguar si el motivo amerita bloquear
		if (motivo.bloquear_aut_input) {
			// Obtener el rol de 'Consultas', sin permiso para Data Entry
			rol_usuario_id = await BD_genericas.obtenerPorCampos("roles_usuarios", {aut_input: false}).then(
				(n) => n.id
			);
			// Cambia el rol de usuario al de 'consultas' y le borra el historial de altas o ediciones
			BD_genericas.actualizarPorId("usuarios", userID, {
				rol_usuario_id,
				[campo + "aprob"]: 0,
				[campo + "rech"]: 0,
			});
		}
		// Obtener los datos del usuario
		let usuario = await BD_genericas.obtenerPorId("usuarios", userID);
		// Averiguar la nueva penalización acumulada y la duración
		let duracion = Number(usuario.penalizac_acum) + Number(motivo.duracion);
		datos.penalizac_acum = duracion % 1;
		duracion = parseInt(duracion);
		// Averiguar la nueva penalización_hasta
		if (duracion) {
			let ahora = funciones.ahora().setHours(0, 0, 0);
			let penalizado_desde =
				usuario.penalizado_hasta && usuario.penalizado_hasta > ahora
					? usuario.penalizado_hasta
					: ahora;
			if (penalizado_desde == ahora) datos.penalizado_en = ahora;
			datos.penalizado_hasta = penalizado_desde + duracion * unDia;
		}
		// Actualizar el registro
		BD_genericas.actualizarPorId("usuarios", usuario.id, datos);
		// Fin
		return;
	},
};

// Funciones ----------------------------
let obtenerLaFecha = (fecha) => {
	let dia = fecha.getDate();
	let mes = meses[fecha.getMonth()];
	let ano = fecha.getFullYear().toString().slice(-2);
	fecha = dia + "/" + mes + "/" + ano;
	return fecha;
};
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
		: campo == "proceso_id"
		? RCLV.proceso_canonizacion
			? RCLV.proceso_canonizacion.nombre
			: ""
		: campo == "rol_iglesia_id"
		? RCLV.rol_iglesia
			? RCLV.rol_iglesia.nombre
			: ""
		: RCLV[campo];
};
let obtenerProdsDeLinks = (links, status, ahora, userID) => {
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
	// Consolidar
	let productos = [...peliculas, ...colecciones, ...capitulos];
	// Depurar los productos que no cumplen ciertas condiciones
	productos = limpieza(productos, status, ahora, userID);
	// Fin
	return productos;
};
let eliminarRepetidos = (productos) => {
	let aux = [];
	for (let i = productos.length - 1; i >= 0; i--) {
		if (aux.includes(productos[i].id)) productos.splice(i, 1);
		else aux.push(productos[i].id);
	}
	return productos;
};
let limpieza = (productos, status, ahora, userID) => {
	// Variables
	// Declarar las variables
	const aprobado_id = status.find((n) => n.aprobado).id;
	const haceUnaHora = funciones.nuevoHorario(-1, ahora);
	const haceDosHoras = funciones.nuevoHorario(-2, ahora);
	// Dejar solamente los productos aprobados
	productos = productos.filter((n) => n.status_registro_id == aprobado_id);
	// Dejar solamente los productos creados hace más de una hora
	productos = productos.filter((n) => n.creado_en < haceUnaHora);
	// Dejar solamente los productos que no tengan problemas de captura
	productos = productos.filter(
		(n) =>
			// Que no esté capturado
			!n.capturado_en ||
			// Que esté capturado hace más de dos horas
			n.capturado_en < haceDosHoras ||
			// Que la captura haya sido por otro usuario y hace más de una hora
			(n.capturado_por_id != userID && n.capturado_en < haceUnaHora) ||
			// Que la captura haya sido por otro usuario y esté inactiva
			(n.capturado_por_id != userID && !n.captura_activa) ||
			// Que esté capturado por este usuario hace menos de una hora
			(n.capturado_por_id == userID && n.capturado_en > haceUnaHora)
	);
	return productos;
};
let tablero_obtenerRegs = async (entidades, ahora, status, userID, fechaRef, autor_id, includes) => {
	// Variables
	let campos = [ahora, status, userID, includes, fechaRef, autor_id];
	let resultadosPorEntidad = [];
	// Obtener el resultado por entidad
	for (let i = 0; i < entidades.length; i++)
		resultadosPorEntidad.push(BD_especificas.tablero_obtenerRegs(entidades[i], ...campos));
	// Consolidar los resultados
	let resultados = await Promise.all([...resultadosPorEntidad]).then(([a, b]) => [...a, ...b]);
	// Eliminar los propuestos por el Revisor
	const haceUnaHora = funciones.nuevoHorario(-1, ahora);
	if (resultados.length)
		for (let i = resultados.length - 1; i >= 0; i--)
			if (resultados[i][fechaRef] > haceUnaHora || resultados[i][autor_id] == userID)
				resultados.splice(i, 1);
	// Ordenar los resultados
	if (resultados.length) resultados.sort((a, b) => new Date(a[fechaRef]) - new Date(b[fechaRef]));
	// Fin
	return resultados;
};
let usuario_Ficha = async (userID, ahora) => {
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
};
let usuario_CalidadAltas = async (userID) => {
	// 1. Obtener los datos del usuario
	let usuario = await BD_genericas.obtenerPorId("usuarios", userID);
	// 2. Contar los casos aprobados y rechazados
	let cantAprob = usuario.prod_aprob;
	let cantRech = usuario.prod_rech;
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
};
let usuario_CalidadEdic = async (userID) => {
	// 1. Obtener los datos del usuario
	let usuario = await BD_genericas.obtenerPorId("usuarios", userID);
	// 2. Contar los casos aprobados y rechazados
	let cantAprob = usuario.edic_aprob;
	let cantRech = usuario.edic_rech;
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
};
