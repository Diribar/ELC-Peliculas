"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const validar = require("../2.1-Prod-RUD/FN-Validar");

module.exports = {
	// Tablero
	tablero_obtenerProds: async (ahora, status, userID) => {
		// Obtener productos en status no estables
		// Declarar las variables
		let entidades = ["peliculas", "colecciones"];
		let campos;
		// - Obtener los resultados de status creado_id
		let creado_id = status.find((n) => n.creado).id;
		campos = [entidades, ahora, creado_id, userID, "creado_en", "creado_por_id", ""];
		let PA = await tablero_obtenerRegs(...campos);
		// - Obtener los resultados de status creado_aprob sin edición
		let creado_aprob_id = status.find((n) => n.creado_aprob).id;
		campos = [entidades, ahora, creado_aprob_id, userID, "creado_en", "creado_por_id", "ediciones"];
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
	tablero_obtenerProdsConEdicAjena: async (ahora, status, userID) => {
		// Obtener los productos que tengan alguna edición que cumpla con:
		// - Ediciones ajenas
		// - Sin RCLV no aprobados
		// Y además los productos sean aptos p/captura y en status c/creadoAprob o aprobados,

		// Declarar las variables
		const haceUnaHora = compartidas.nuevoHorario(-1, ahora);
		let creado_aprob_id = status.find((n) => n.creado_aprob).id;
		let aprobado_id = status.find((n) => n.aprobado).id;
		let gr_aprobado = [creado_aprob_id, aprobado_id];
		let includes = ["pelicula", "coleccion", "capitulo", "personaje", "hecho", "valor"];
		let productos = [];
		// Obtener todas las ediciones ajenas
		let ediciones = await BD_especificas.tablero_obtenerEdicsAjenasDeProds(userID, includes);
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
					peliculas.push({
						...n.pelicula,
						entidad: "peliculas",
						editado_en: n.editado_en,
						edicion_id: n.id,
					});
				else if (n.coleccion_id)
					colecciones.push({
						...n.coleccion,
						entidad: "colecciones",
						editado_en: n.editado_en,
						edicion_id: n.id,
					});
				else if (n.capitulo_id)
					capitulos.push({
						...n.capitulo,
						entidad: "capitulos",
						editado_en: n.editado_en,
						edicion_id: n.id,
					});
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
	tablero_obtenerProdsConLink: async (ahora, status, userID) => {
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
	tablero_obtenerRCLVs: async (ahora, status, userID) => {
		// Obtener los siguients RCLVs:
		// creado y creados ajeno,
		//		PA: c/producto o edicProd
		//		IN: s/producto o edicProd --> inactivarlo
		// IP: inactivo c/prod --> a status creadoAprob
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
	tablero_obtenerRCLVsConEdic: async (ahora, status, userID) => {
		// - edicRCLV ajena, pend. aprobar
	},
	tablero_prod_ProcesarCampos: (productos) => {
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
				let datos = {
					id: n.id,
					entidad: n.entidad,
					nombre,
					ano_estreno: n.ano_estreno,
					abrev: n.entidad.slice(0, 3).toUpperCase(),
				};
				if (rubro == "ED") datos.edicion_id = n.edicion_id;
				return datos;
			});

		// Fin
		return productos;
	},
	tablero_RCLV_ProcesarCampos: (RCLVs) => {
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

	// Productos Alta
	prodAlta_ficha: async (prodOrig, paises) => {
		// Definir el 'ahora'
		let ahora = compartidas.ahora().getTime();
		// Bloque izquierdo
		let [bloque1, bloque2, bloque3] = [[], [], []];
		// Bloque 1
		if (paises) bloque1.push({titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises});
		if (prodOrig.idioma_original)
			bloque1.push({titulo: "Idioma original", valor: prodOrig.idioma_original.nombre});
		// Bloque 2
		if (prodOrig.direccion) bloque2.push({titulo: "Dirección", valor: prodOrig.direccion});
		if (prodOrig.guion) bloque2.push({titulo: "Guión", valor: prodOrig.guion});
		if (prodOrig.musica) bloque2.push({titulo: "Música", valor: prodOrig.musica});
		if (prodOrig.produccion) bloque2.push({titulo: "Producción", valor: prodOrig.produccion});
		// Bloque 3
		if (prodOrig.actuacion) bloque3.push({titulo: "Actuación", valor: prodOrig.actuacion});
		// Bloque izquierdo consolidado
		let izquierda = [bloque1, bloque2, bloque3];
		// Bloque derecho
		[bloque1, bloque2] = [[], []];
		// Bloque 1
		if (prodOrig.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: prodOrig.ano_estreno});
		if (prodOrig.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOrig.ano_fin});
		if (prodOrig.duracion) bloque1.push({titulo: "Duracion", valor: prodOrig.duracion + " min."});
		// Obtener la fecha de alta
		let fecha = obtenerLaFecha(prodOrig.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// 5. Obtener los datos del usuario
		let fichaDelUsuario = await usuario_Ficha(prodOrig.creado_por_id, ahora);
		// 6. Obtener la calidad de las altas
		let calidadAltas = await usuario_CalidadAltas(prodOrig.creado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadAltas}];
		return [izquierda, derecha];
	},
	// Producto Edición
	prodEdic_feedback: async (prodOrig, prodEdic, campo) => {
		// 1. Actualiza el registro de edición
		// 2. Averigua si quedan campos por procesar
		// 3. Elimina el registro de edición si ya no tiene más datos
		// 4. Actualiza el status del registro original, si corresponde

		let datos = {[campo]: null};
		if (campo == "avatar") datos.avatar_archivo = null;
		await BD_genericas.actualizarPorId("prods_edicion", edicID, datos);

		// Variables
		let datosEdicion = {
			id: prodEdic.id,
			editado_por_id: prodEdic.editado_por_id,
			editado_en: prodEdic.editado_en,
		};
		// Pulir la información a tener en cuenta
		let [edicion, quedanCampos] = compartidas.pulirEdicion(prodOrig, prodEdic);
		// Acciones si no quedan campos
		let statusAprob = prodOrig.status_registro.aprobado;
		if (!quedanCampos) statusAprob = accionesSiNoQuedanCampos(prodOrig, prodEdic);
		else edicion = {...edicion, ...datosEdicion, [campo]: null};
		// Fin
		return [quedanCampos, edicion, statusAprob];
	},
	prodEdic_ingrReempl: (prodOrig, prodEdic) => {
		let campos = variables.camposRevisarProd();
		for (let i = campos.length - 1; i >= 0; i--) {
			let campoNombre = campos[i].nombreDelCampo;
			// Deja solamente los campos comunes entre A REVISAR y EDICIÓN
			if (!Object.keys(prodEdic).includes(campoNombre)) campos.splice(i, 1);
			else {
				// Variables
				let include = campos[i].relac_include;
				let campo = campos[i].campo_include;
				let valido = !campos[i].rclv || prodOrig[campoNombre] != 1;
				// Valores originales
				if (valido)
					campos[i].mostrarOrig =
						include && prodOrig[include] ? prodOrig[include][campo] : prodOrig[campoNombre];
				// Valores editados
				campos[i].valorEdic = prodEdic[campoNombre];
				campos[i].mostrarEdic =
					include && prodEdic[include] ? prodEdic[include][campo] : prodEdic[campoNombre];
			}
		}
		// Separar los resultados entre ingresos y reemplazos
		let ingresos = campos.filter((n) => !n.mostrarOrig); // Datos de edición, sin valor en la versión original
		let reemplazos = campos.filter((n) => n.mostrarOrig);
		// Fin
		return [ingresos, reemplazos];
	},
	prodEdic_ficha: async (prodOrig, prodEdic) => {
		// Definir el 'ahora'
		let ahora = compartidas.ahora().getTime();
		// Bloque derecho
		let bloque1 = [];
		let fecha;
		// Bloque 1
		if (prodOrig.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: prodOrig.ano_estreno});
		if (prodOrig.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOrig.ano_fin});
		if (prodOrig.duracion) bloque1.push({titulo: "Duracion", valor: prodOrig.duracion + " min."});
		// Obtener la fecha de alta
		fecha = obtenerLaFecha(prodOrig.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// Obtener la fecha de edicion
		fecha = obtenerLaFecha(prodEdic.editado_en);
		bloque1.push({titulo: "Fecha de Edic.", valor: fecha});
		// 5. Obtener los datos del usuario
		let fichaDelUsuario = await usuario_Ficha(prodEdic.editado_por_id, ahora);
		// 6. Obtener la calidad de las altas
		let calidadEdic = await usuario_CalidadEdic(prodEdic.editado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadEdic}];
		return derecha;
	},
	prodEdic_aprobRech: (aprobado, prodOrig, prodEdic, campo) => {
		// Averiguar si el campo es 'complicado' y en ese caso obtener su índice
		let valorOrig = valorDelCampo(prodOrig, campo);
		let valorEdic = valorDelCampo(prodEdic, campo);
		if (valorOrig === null) valorOrig = "-";
		// Obtiene los valores 'aprobado' y 'rechazado'
		let valor_aprob = aprobado ? valorEdic : valorOrig;
		let valor_rech = !aprobado ? valorEdic : valorOrig;
		// Fin
		return {valor_aprob, valor_rech};
	},

	// RCLV Alta
	RCLV_BD_AprobRech: async (entidad, RCLV_original, includes, userID) => {
		// Variables
		let ahora = compartidas.ahora();
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
				valor_aprob: RCLV_valorVinculo(RCLV_actual, campoComparar.campo),
				input_por_id: RCLV_original.creado_por_id,
				input_en: RCLV_original.creado_en,
				evaluado_por_id: userID,
				evaluado_en: ahora,
			};
			if (RCLV_original[campoComparar.campo] != RCLV_actual[campoComparar.campo]) {
				datos.valor_rech = RCLV_valorVinculo(RCLV_original, campoComparar.campo);
				datos.motivo_id = motivoGenericoID;
			}
			// Guardar los registros
			let entidad =
				RCLV_original[campoComparar.campo] == RCLV_actual[campoComparar.campo]
					? "edics_aprob"
					: "edics_rech";
			await BD_genericas.agregarRegistro(entidad, datos);
		}
		return;
	},
	RCLVs_ActualizarProdAprobOK: async (producto) => {
		// Variables
		let RCLV_entidades = ["personajes", "hechos", "valores"];
		// Rutina para cada entidad
		for (let entidad of RCLV_entidades) {
			let campo = compartidas.obtenerEntidad_id(entidad); // Obtener el campo a analizar (pelicula_id, etc.) y su valor en el producto
			let RCLV_id = producto[campo]; // Obtener el RCLV_id
			// Si el RCLV_id aplica (no es vacío ni 1) => actualiza el RCLV
			if (RCLV_id && RCLV_id != 1) BD_genericas.actualizarPorId(entidad, RCLV_id, {prods_aprob: true});
		}
		return;
	},
	RCLV_productosAprob: function (prodOrig, campo, edicAprob, statusOrigAprob, statusAprob, status) {
		// Actualizar en RCLVs el campo 'prods_aprob', si ocurre (1) y (2 ó 3)
		// 1. El valor del campo es distinto a 'Ninguno'
		// 2. Se cambió un campo RCLV y el producto está aprobado
		// 3. El registro no estaba aprobado y ahora sí lo está
		const RCLV_ids = ["personaje_id", "hecho_id", "valor_id"];
		if (
			prodOrig[campo] != 1 &&
			((RCLV_ids.includes(campo) && edicAprob && statusAprob) || (!statusOrigAprob && statusAprob))
		)
			this.RCLVs_ActualizarProdAprobOK(prodOrig, status);
		// Fin
		return;
	},

	// Links Edicion
	linksEdic_LimpiarEdiciones: async (linkOrig) => {
		// Limpia las ediciones
		// 1. Obtiene el link con sus ediciones
		linkOrig = await BD_genericas.obtenerPorIdConInclude("links", linkOrig.id, ["ediciones"]); 
		// Genera un objeto con valores null
		let camposVacios = {};
		variables.camposRevisarLinks().forEach((campo) => (camposVacios[campo.nombreDelCampo] = null)); 
		// Purga cada edición
		linkOrig.ediciones.forEach(async (linkEdic) => {
			let edicID = linkEdic.id;
			// La variable 'linkEdic' queda solamente con los camos con valor
			[quedanCampos, linkEdic] = await compartidas.pulirEdicion(linkOrig, linkEdic);
			// Si quedan campos, actualiza la edición
			if (quedanCampos)
				await BD_genericas.actualizarPorId("links_edicion", edicID, {
					...camposVacios,
					...linkEdic,
				});
			// Si no quedan, elimina el registro de la edición
			else await BD_genericas.eliminarPorId("links_edicion", edicID);
		});
		// Fin
		return
	},
	links_prodCampoLG_OK: async (prodEntidad, prodID, campo) => {
		if (campo == "gratuito" && prodEntidad.gratuito) {
			// Obtener los ID de si, no y TalVez
			let si_no_parcial = await BD_genericas.obtenerTodos("si_no_parcial", "id");
			let si = si_no_parcial.find((n) => n.si).id;
			BD_genericas.actualizarPorId("links", prodID, {
				links_gratuitos_cargados_id: si,
				links_gratuitos_en_la_web_id: si,
			});
		}
	},

	// Prod. Alta/Edición, Links Alta/Edición
	usuario_Penalizar: async (userID, motivo) => {
		// Variables
		let datos = {};
		// Averiguar si el motivo amerita bloquear
		if (motivo.bloquear_aut_input) {
			// Obtener el rol de 'Consultas', sin permiso para Data Entry
			let rol_usuario = await BD_genericas.obtenerPorCampos("roles_usuarios", {aut_input: false});
			datos.rol_usuario_id = rol_usuario.id;
		}
		// Obtiene los datos del usuario
		let usuario = await BD_genericas.obtenerPorId("usuarios", userID);
		// Averigua la nueva penalización acumulada y la duración
		let duracion = Number(usuario.penalizac_acum) + Number(motivo.duracion);
		datos.penalizac_acum = duracion % 1;
		duracion = parseInt(duracion);
		// Averiguar la nueva penalización_hasta
		if (duracion) {
			let ahora = compartidas.ahora().setHours(0, 0, 0);
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
let valorDelCampo = (producto, campo) => {
	// Variables
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
	let campos = camposConVinculo.map((n) => n.campo);
	let indice = campos.indexOf(campo);
	// Resultado
	return indice < 0
		? producto[campo]
		: producto[camposConVinculo.vinculo]
		? camposConVinculo.campo == "en_castellano_id" || camposConVinculo.campo == "en_color_id"
			? producto[camposConVinculo.vinculo].productos
			: producto[camposConVinculo.vinculo].nombre
		: null;
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
	const haceUnaHora = compartidas.nuevoHorario(-1, ahora);
	const haceDosHoras = compartidas.nuevoHorario(-2, ahora);
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
	const haceUnaHora = compartidas.nuevoHorario(-1, ahora);
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
	let cantAprob = usuario.prods_aprob;
	let cantRech = usuario.prods_rech;
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
	let cantAprob = usuario.edics_aprob;
	let cantRech = usuario.edics_rech;
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
let accionesSiNoQuedanCampos = async (prodOrig, prodEdic) => {
	// Variables
	let statusAprob = false;
	// 1. Elimina el registro de la edición
	await BD_genericas.eliminarPorId("prod_edicion", prodEdic.id);
	// 2. Averigua si tiene errores
	let entidadOrig = compartidas.obtieneEntidadOrigDesdeEdicion(prodEdic);
	let errores = await validar.consolidado(null, {...prodOrig, entidad: entidadOrig});
	// 2. Acciones si el original no tiene errores y está en status 'creado_aprob'
	if (!errores.hay && prodOrig.status_registro.creado_aprob) {
		// Genera la información a actualizar en el registro original
		let datos = {
			alta_terminada_en: compartidas.ahora(),
			lead_time_creacion: compartidas.todos_obtenerLeadTime(prodOrig.creado_en, ahora),
			status_registro_id: await BD_especificas.obtenerELC_id("status_registro", {aprobado: 1}),
		};
		// Cambia el status del producto e inactiva la captura
		await BD_genericas.actualizarPorId(entidadOrig, prodOrig.id, {...datos, captura_activa: 0});
		// Si es una colección, le cambia el status también a los capítulos
		if (entidadOrig == "colecciones") {
			datos = {...datos, alta_analizada_por_id: 2, alta_analizada_en: ahora}; // Amplía los datos
			BD_genericas.actualizarTodosPorCampos("capitulos", {coleccion_id: prodOrig.id}, datos); // Actualiza el status de los capitulos
		}
		// Cambia el valor de la variable que se informará
		statusAprob = true;
	}
	return statusAprob;
};
