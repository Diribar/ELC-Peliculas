"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const validar = require("../2.1-Prod-RUD/FN-Validar");

module.exports = {
	// Tablero
	TC_obtieneProds: async (ahora, userID) => {
		// Obtiene productos en situaciones particulares
		// Variables
		let entidades = ["peliculas", "colecciones"];
		let creado_id = status_registro.find((n) => n.creado).id;
		let creado_aprob_id = status_registro.find((n) => n.creado_aprob).id;
		let inactivar_id = status_registro.find((n) => n.inactivar).id;
		let recuperar_id = status_registro.find((n) => n.recuperar).id;
		let campos;
		// PA: Pendientes de Aprobar (en status creado)
		campos = [entidades, ahora, creado_id, userID, "creado_en", "creado_por_id", ""];
		let PA = await TC_obtieneRegs(...campos);
		// SE: Sin Edición (en status creado_aprob)
		campos = [entidades, ahora, creado_aprob_id, userID, "creado_en", "creado_por_id", "ediciones"];
		let SE = await TC_obtieneRegs(...campos);
		SE = SE.filter((n) => !n.ediciones.length);
		// IN: En staus 'inactivar'
		campos = [entidades, ahora, inactivar_id, userID, "sugerido_en", "sugerido_por_id", ""];
		let IN = await TC_obtieneRegs(...campos);
		// RC: En status 'recuperar'
		campos = [entidades, ahora, recuperar_id, userID, "sugerido_en", "sugerido_por_id", ""];
		let RC = await TC_obtieneRegs(...campos);

		// Fin
		return {PA, IN, RC, SE};
	},
	TC_obtieneProdsConEdicAjena: async (ahora, userID) => {
		// Obtiene los productos que tengan alguna edición que cumpla con:
		// - Ediciones ajenas
		// - Sin RCLV no aprobados
		// Y además los productos sean aptos p/captura y en status c/creadoAprob o aprobados,

		// Variables
		const haceUnaHora = comp.nuevoHorario(-1, ahora);
		const creado_id = status_registro.find((n) => n.creado).id;
		const creado_aprob_id = status_registro.find((n) => n.creado_aprob).id;
		const aprobado_id = status_registro.find((n) => n.aprobado).id;
		const gr_aprobado = [creado_aprob_id, aprobado_id];
		let includes = ["pelicula", "coleccion", "capitulo", "personaje", "hecho", "valor"];
		let productos = [];
		// Obtiene todas las ediciones ajenas
		let ediciones = await BD_especificas.TC_obtieneEdicsAjenas("prods_edicion", userID, includes);
		// Eliminar las edicionesProd con RCLV no aprobado
		if (ediciones.length)
			for (let i = ediciones.length - 1; i >= 0; i--)
				if (
					(ediciones[i].personaje && ediciones[i].personaje.status_registro_id != aprobado_id) ||
					(ediciones[i].hecho && ediciones[i].hecho.status_registro_id != aprobado_id) ||
					(ediciones[i].valor && ediciones[i].valor.status_registro_id != aprobado_id)
				)
					ediciones.splice(i, 1);
		// Obtiene los productos
		if (ediciones.length) {
			// Variables
			let peliculas = [];
			let colecciones = [];
			let capitulos = [];
			// Obtiene los productos
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
			if (peliculas.length) peliculas = comp.eliminarRepetidos(peliculas);
			if (colecciones.length) colecciones = comp.eliminarRepetidos(colecciones);
			if (capitulos.length) capitulos = comp.eliminarRepetidos(capitulos);
			// Consolidar los productos
			productos = [...peliculas, ...colecciones, ...capitulos];
			// Dejar solamente los productos de gr_aprobado
			// productos = productos.filter((n) => gr_aprobado.includes(n.status_registro_id));
			productos = productos.filter((n) => n.status_registro_id != creado_id);
			// Dejar solamente los productos que no tengan problemas de captura
			if (productos.length)
				productos = productos.filter(
					(n) =>
						!n.capturado_en ||
						n.capturado_en < haceUnaHora ||
						!n.captura_activa ||
						n.capturado_por_id == userID
				);
			// Ordenar por fecha de edición
			if (productos.length) productos.sort((a, b) => new Date(a.editado_en) - new Date(b.editado_en));
		}
		// Fin
		return productos;
	},
	TC_obtieneProdsConLink: async (ahora, userID) => {
		// Obtiene todos los productos aprobados, con algún link ajeno en status no estable
		// Obtiene los links 'a revisar'
		let links = await BD_especificas.TC_obtieneLinks_y_Edics();
		// Si no hay => salir
		if (!links.length) return [];
		// Obtiene los links ajenos
		let linksAjenos = links.filter(
			(n) =>
				(n.status_registro &&
					((n.status_registro.creado && n.creado_por_id != userID) ||
						((n.status_registro.inactivar || n.status_registro.recuperar) &&
							n.sugerido_por_id != userID))) ||
				(!n.status_registro && n.editado_por_id != userID)
		);
		// Obtiene los productos
		let productos = linksAjenos.length ? comp.obtieneProdsDeLinks(linksAjenos, ahora, userID) : [];
		// Fin
		return productos;
	},
	TC_obtieneRCLVs: async (ahora, userID) => {
		// Obtiene RCLVs en situaciones particulares
		// Variables
		let entidades = ["personajes", "hechos", "valores"];
		let creado_id = status_registro.find((n) => n.creado).id;
		let campos, regs, includes;
		//	PA: Pendientes de Aprobar (c/producto o c/edicProd)
		includes = ["peliculas", "colecciones", "capitulos", "prods_edic"];
		campos = [entidades, ahora, creado_id, userID, "creado_en", "creado_por_id", includes];
		let PA = await TC_obtieneRegs(...campos);
		PA = PA.filter((n) => n.peliculas || n.colecciones || n.capitulos || n.prods_edic);

		// Fin
		return {PA};
	},
	TC_obtieneRCLVsConEdicAjena: async (ahora, userID) => {
		// Obtiene los RCLVs que tengan alguna edición ajena

		// Variables
		const haceUnaHora = comp.nuevoHorario(-1, ahora);
		let aprobado_id = status_registro.find((n) => n.aprobado).id;
		let includes = ["personaje", "hecho", "valor"];
		let RCLVs = [];
		// Obtiene todas las ediciones ajenas
		let ediciones = await BD_especificas.TC_obtieneEdicsAjenas("rclvs_edicion", userID, includes);
		// Obtiene los RCLVs
		if (ediciones.length) {
			// Variables
			let personajes = [];
			let hechos = [];
			let valores = [];
			// Obtiene los RCLVs originales
			ediciones.map((n) => {
				if (n.personaje_id)
					personajes.push({
						...n.personaje,
						entidad: "personajes",
						editado_en: n.editado_en,
						edicion_id: n.id,
					});
				else if (n.hecho_id)
					hechos.push({
						...n.hecho,
						entidad: "hechos",
						editado_en: n.editado_en,
						edicion_id: n.id,
					});
				else if (n.valor_id)
					valores.push({
						...n.valor,
						entidad: "valores",
						editado_en: n.editado_en,
						edicion_id: n.id,
					});
			});
			// Elimina los RCLVs repetidos
			if (personajes.length) personajes = comp.eliminarRepetidos(personajes);
			if (hechos.length) hechos = comp.eliminarRepetidos(hechos);
			if (valores.length) valores = comp.eliminarRepetidos(valores);
			// Consolida los RCLVs
			RCLVs = [...personajes, ...hechos, ...valores];
			// Deja solamente los RCLVs aprobados
			RCLVs = RCLVs.filter((n) => n.status_registro_id == aprobado_id);
			// Deja solamente los RCLVs que no tengan problemas de captura
			if (RCLVs.length)
				RCLVs = RCLVs.filter(
					(n) =>
						!n.capturado_en ||
						n.capturado_en < haceUnaHora ||
						!n.captura_activa ||
						n.capturado_por_id == userID
				);
			// Ordena por fecha de edición
			if (RCLVs.length) RCLVs.sort((a, b) => new Date(a.editado_en) - new Date(b.editado_en));
		}
		// Fin
		return RCLVs;
	},
	TC_prod_ProcesarCampos: (productos) => {
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
	TC_RCLV_ProcesarCampos: (RCLVs) => {
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
		// Funciones
		let usuario_CalidadAltas = async (userID) => {
			// 1. Obtiene los datos del usuario
			let usuario = await BD_genericas.obtienePorId("usuarios", userID);
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
		// Definir el 'ahora'
		let ahora = comp.ahora().getTime();
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
		// Obtiene la fecha de alta
		let fecha = comp.fechaTexto(prodOrig.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// 5. Obtiene los datos del usuario
		let fichaDelUsuario = await comp.usuario_Ficha(prodOrig.creado_por_id, ahora);
		// 6. Obtiene la calidad de las altas
		let calidadAltas = await usuario_CalidadAltas(prodOrig.creado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadAltas}];
		return [izquierda, derecha];
	},
	// Producto Edición
	infoProdEdicion: (entidad, prodID) => {
		// Generar la info del error
		let informacion = {
			mensajes: ["No encontramos ninguna edición ajena para revisar"],
			iconos: [
				{
					nombre: "fa-spell-check ",
					link: "/inactivar-captura/?entidad=" + entidad + "&id=" + prodID + "&origen=tableroEnts",
					titulo: "Regresar al Tablero de Control",
				},
			],
		};
		return informacion;
	},
	prodEdic_AprobRechAvatar: async function (req, prodOrig, prodEdic) {
		// Variables
		const edicAprob = req.query.aprob == "true";
		const userID = req.session.usuario.id;
		const statusAprobOrig = prodOrig.status_registro.aprobado;
		const avatarOrig = prodOrig.avatar;
		const avatarEdic = prodEdic.avatar;
		req.query.campo = "avatar";
		let quedanCampos, statusAprobFinal;

		// Funciones
		let archivosSiAprob = () => {
			// Variables
			// Si el 'avatar original' es un archivo, lo elimina
			if (comp.averiguaSiExisteUnArchivo("./publico/imagenes/3-Productos/" + avatarOrig))
				comp.borraUnArchivo("./publico/imagenes/3-Productos/", avatarOrig);
			// Mueve el 'avatar editado' a la carpeta definitiva
			comp.mueveUnArchivoImagen(avatarEdic, "4-ProdsRevisar", "3-Productos");
		};
		let archivosSiRech = () => {
			// Elimina el archivo de edicion
			comp.borraUnArchivo("./publico/imagenes/4-ProdsRevisar/", avatarEdic);
		};
		// Acciones con los archivos de 'avatar'
		edicAprob ? archivosSiAprob() : archivosSiRech();
		// Si se aprobó, actualiza el registro 'original' con el nuevo nombre del avatar
		if (edicAprob) await this.actualizaOriginal(prodOrig, prodEdic, {avatar: avatarEdic}, userID);

		// Acciones complementarias
		// 1. Aumenta el campo aprob/rech en el registro del usuario
		// 2. Agrega un registro en la tabla de 'aprob/rech'
		// 3. Si corresponde, penaliza al usuario
		await this.edic_AccionesAdic(req, prodOrig, prodEdic);

		// Limpia la edición y cambia el status del producto si corresponde
		[quedanCampos, prodEdic, statusAprobFinal] = await this.prodEdic_feedback(prodOrig, prodEdic);
		// Revisa si corresponde y eventualmente actualiza, el campo 'prods_aprob' en los registros RCLV
		this.RCLV_productosAprob(prodOrig, "avatar", edicAprob, statusAprobOrig, statusAprobFinal);
		// Fin
		return [quedanCampos, prodEdic];
	},

	prodEdic_feedback: async (prodOrig, prodEdic, campo) => {
		// 1. Actualiza el registro de edición
		// 2. Averigua si quedan campos por procesar
		// 3. Si no quedan campos, elimina el registro de edición
		// 4. Actualiza el status del registro original si corresponde

		// Variables
		let datosEdicion = {
			id: prodEdic.id,
			editado_por_id: prodEdic.editado_por_id,
			editado_en: prodEdic.editado_en,
		};
		let statusAprob = prodOrig.status_registro.aprobado;
		prodEdic = {...prodEdic, entidad: "prods_edicion"};

		// 1. Elimina el valor del campo en el registro de edición
		if (campo) await BD_genericas.actualizaPorId("prods_edicion", prodEdic.id, {[campo]: null});

		// 2. Averigua si quedan campos por procesar
		let [edicion, quedanCampos] = comp.puleEdicion(prodOrig, prodEdic);
		// Acciones si no quedan campos
		if (!quedanCampos) {
			// 3. Elimina el registro de la edición
			await BD_genericas.eliminaPorId("prod_edicion", prodEdic.id);

			// 4. Actualiza el status del registro original si corresponde
			actualizaStatusRegistroOriginalSiCorresponde = async () => {
				// Variables
				let ahora = comp.ahora();
				let entidadOrig = this.obtieneEntidadDesdeEdicion(prodEdic);
				// Averigua si tiene errores
				let errores = await validar.consolidado(null, {...prodOrig, entidad: entidadOrig});
				// Acciones si el original no tiene errores y está en status 'gr_creado'
				if (!errores.hay && prodOrig.status_registro.gr_creado) {
					// Genera la información a actualizar en el registro original
					let datos = {
						alta_terminada_en: ahora,
						lead_time_creacion: comp.obtieneLeadTime(prodOrig.creado_en, ahora),
						status_registro_id: status_registro.find((n) => n.aprobado).id,
					};
					// Cambia el status del producto e inactiva la captura
					await BD_genericas.actualizaPorId(entidadOrig, prodOrig.id, {
						...datos,
						captura_activa: 0,
					});
					// Si es una colección, le cambia el status también a los capítulos
					if (entidadOrig == "colecciones") {
						datos = {...datos, alta_analizada_por_id: 2, alta_analizada_en: ahora}; // Amplía los datos
						BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: prodOrig.id}, datos); // Actualiza el status de los capitulos
					}
					// Cambia el valor de la variable que se informará
					statusAprob = true;
				}
				return statusAprob;
			};
			statusAprob = await actualizaStatusRegistroOriginalSiCorresponde();
		} else edicion = {...datosEdicion, ...edicion, [campo]: null};
		// Fin
		return [quedanCampos, edicion, statusAprob];
	},
	prodEdic_ingrReempl: (prodOrig, prodEdic) => {
		let campos = [...variables.camposRevisar.productos];

		for (let i = campos.length - 1; i >= 0; i--) {
			let campoNombre = campos[i].nombre;
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
		// Funciones
		let usuario_CalidadEdic = async (userID) => {
			// 1. Obtiene los datos del usuario
			let usuario = await BD_genericas.obtienePorId("usuarios", userID);
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

		// Definir el 'ahora'
		let ahora = comp.ahora().getTime();
		// Bloque derecho
		let bloque1 = [];
		let fecha;
		// Bloque 1
		if (prodOrig.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: prodOrig.ano_estreno});
		if (prodOrig.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOrig.ano_fin});
		if (prodOrig.duracion) bloque1.push({titulo: "Duracion", valor: prodOrig.duracion + " min."});
		// Obtiene la fecha de alta
		fecha = comp.fechaTexto(prodOrig.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// Obtiene la fecha de edicion
		fecha = comp.fechaTexto(prodEdic.editado_en);
		bloque1.push({titulo: "Fecha de Edic.", valor: fecha});
		// 5. Obtiene los datos del usuario
		let fichaDelUsuario = await comp.usuario_Ficha(prodEdic.editado_por_id, ahora);
		// 6. Obtiene la calidad de las altas
		let calidadEdic = await usuario_CalidadEdic(prodEdic.editado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadEdic}];
		return derecha;
	},
	cartelNoQuedanCampos: {
		mensajes: ["La edición fue borrada porque no tenía novedades respecto al original"],
		iconos: [
			{
				nombre: "fa-spell-check",
				link: "/revision/tablero-de-control",
				titulo: "Ir al 'Tablero de Control' de Revisiones",
			},
		],
	},

	// RCLV Alta
	RCLV_BD_AprobRech: async (entidad, original, userID) => {
		// Actualiza la info de aprobados/rechazados
		// Funcion
		let RCLV_valorVinculo = (RCLV, campo) => {
			return campo == "dia_del_ano_id"
				? RCLV.dia_del_ano
					? RCLV.dia_del_ano.dia + "/" + mesesAbrev[RCLV.dia_del_ano.mes_id - 1]
					: "Sin fecha conocida"
				: campo == "proceso_id"
				? RCLV.proc_canoniz
					? RCLV.proc_canoniz.nombre
					: ""
				: campo == "rol_iglesia_id"
				? RCLV.rol_iglesia
					? RCLV.rol_iglesia.nombre
					: ""
				: RCLV[campo];
		};
		// Variables
		let ahora = comp.ahora();
		let camposComparar = variables.camposRevisar.RCLVs.filter((n) => !!n.titulo).filter(
			(n) => n[entidad]
		);
		// Obtiene RCLV actual
		let includes = [];
		if (entidad != "valores") includes.push("dia_del_ano");
		if (entidad == "personajes") includes.push("proc_canoniz", "rol_iglesia");
		let RCLV_actual = await BD_genericas.obtienePorIdConInclude(entidad, original.id, includes);
		// Obtiene los motivos posibles
		let motivos = await BD_genericas.obtieneTodos("edic_motivos_rech");
		let motivoGenerico = motivos.find((n) => n.generico);
		let motivoInfoErronea = motivos.find((n) => n.info_erronea);
		// Rutina para comparar los campos
		for (let campoComparar of camposComparar) {
			// Valor aprobado
			let valor_aprob = RCLV_valorVinculo(RCLV_actual, campoComparar.nombre);
			let valor_rech = RCLV_valorVinculo(original, campoComparar.nombre);
			if (!valor_aprob && !valor_rech) continue;
			// Generar la información
			let datos = {
				entidad,
				entidad_id: original.id,
				campo: campoComparar.nombre,
				titulo: campoComparar.titulo,
				valor_aprob,
				input_por_id: original.creado_por_id,
				input_en: original.creado_en,
				evaluado_por_id: userID,
				evaluado_en: ahora,
			};
			// Obtiene la entidad
			let entidadAprobRech;
			if (original[campoComparar.nombre] != RCLV_actual[campoComparar.nombre]) {
				entidadAprobRech = "edics_rech";
				datos.valor_rech = valor_rech;
				motivo =
					campoComparar.nombre == "nombre" || campoComparar.nombre == "apodo"
						? motivoGenerico
						: motivoInfoErronea;
				datos.motivo_id = motivo.id;
				datos.duracion = motivo.duracion;
			} else entidadAprobRech = "edics_aprob";
			// Guarda los registros
			await BD_genericas.agregarRegistro(entidadAprobRech, datos);
		}
		// Fin
		return;
	},
	RCLV_productosAprob: function (prodOrig, campo, edicAprob, statusAprobOrig, statusAprob) {
		// Actualizar en RCLVs el campo 'prods_aprob', si ocurre 1 y (2 ó 3)
		// 1. Se aprobó un cambio y el producto está aprobado
		// 2. El cambio es un campo RCLV con valor distinto de 1
		// 3. El registro no estaba aprobado
		const entidades_id = ["personaje_id", "hecho_id", "valor_id"];
		if (
			edicAprob && // Se aprobó un cambio
			statusAprob && // El producto está aprobado
			((entidades_id.includes(campo) && prodOrig[campo] != 1) || // El cambio es un campo RCLV con valor distinto de 1
				!statusAprobOrig) // El registro no estaba aprobado
		)
			entidades_id.forEach((entidad_id) => {
				let RCLV_id = prodOrig[entidad_id]; // Obtiene el RCLV_id
				if (RCLV_id) {
					let entidad = comp.obtieneEntidadDesdeEdicion({[entidad_id]: true}); // Obtiene el campo a analizar (pelicula_id, etc.) y su valor en el producto
					BD_genericas.actualizaPorId(entidad, RCLV_id, {prods_aprob: true}); // Actualiza la entidad_RCLV
				}
			});

		// Fin
		return;
	},

	// Links
	problemasLinks: (producto, urlAnterior) => {
		// Variables
		let informacion;
		const vistaAnterior = variables.vistaAnterior(urlAnterior);
		const vistaTablero = variables.vistaTablero;

		// El producto no está en status 'aprobado'
		if (!informacion && !producto.status_registro.aprobado)
			informacion = {
				mensajes: [
					"El producto no está en status 'Aprobado'",
					"Su status es " + producto.status_registro.nombre,
				],
			};

		// El producto no posee links
		if (!informacion && !producto.links.length)
			informacion = {mensajes: ["Este producto no tiene links en nuestra Base de Datos"]};
		// Agregar los íconos
		if (informacion) informacion.iconos = [vistaAnterior, vistaTablero];

		// Fin
		return informacion;
	},
	linksEdic_LimpiarEdiciones: async (linkOrig) => {
		// Limpia las ediciones
		// 1. Obtiene el link con sus ediciones
		linkOrig = await BD_genericas.obtienePorIdConInclude("links", linkOrig.id, ["ediciones"]);
		// Genera un objeto con valores null
		let camposVacios = {};
		variables.camposRevisar.links.forEach((campo) => (camposVacios[campo.nombre] = null));
		// Purga cada edición
		linkOrig.ediciones.forEach(async (linkEdic) => {
			let edicID = linkEdic.id;
			// La variable 'linkEdic' queda solamente con los camos con valor
			linkEdic = {...linkEdic, entidad: "links_edicion"};
			[quedanCampos, linkEdic] = await comp.puleEdicion(linkOrig, linkEdic);
			// Si quedan campos, actualiza la edición
			if (quedanCampos)
				await BD_genericas.actualizaPorId("links_edicion", edicID, {
					...camposVacios,
					...linkEdic,
				});
			// Si no quedan, elimina el registro de la edición
			else await BD_genericas.eliminaPorId("links_edicion", edicID);
		});
		// Fin
		return;
	},
	links_prodCampoLG_OK: async (prodEntidad, prodID, campo) => {
		if (campo == "gratuito" && prodEntidad.gratuito) {
			// Obtiene los ID de si, no y TalVez
			let si_no_parcial = await BD_genericas.obtieneTodos("si_no_parcial", "id");
			let si = si_no_parcial.find((n) => n.si).id;
			BD_genericas.actualizaPorId("links", prodID, {
				links_gratuitos_cargados_id: si,
				links_gratuitos_en_la_web_id: si,
			});
		}
	},
	obtieneCamposLinkEdic: (edicAprob, linkEdicion, campo) => {
		// Se preparan los datos 'consecuencia' a guardar
		let datos = {[campo]: edicAprob ? linkEdicion[campo] : null};
		if (campo == "tipo_id" && linkEdicion.completo !== null)
			datos.completo = edicAprob ? linkEdicion.completo : null;
		if (campo == "tipo_id" && linkEdicion.parte !== null)
			datos.parte = edicAprob ? linkEdicion.parte : null;
		// Fin
		return datos;
	},

	// API: Prod. Alta/Edición, Links Alta/Edición
	usuario_aumentaPenalizacAcum: (userID, motivo) => {
		// Variables
		let rol_usuario_id = roles_us.find((n) => !n.perm_inputs).id;
		// Se le baja el rol a 'Consultas', si el motivo lo amerita
		if (motivo.bloqueo_perm_inputs) BD_genericas.actualizaPorId("usuarios", userID, {rol_usuario_id});
		// Aumenta la penalización acumulada
		BD_genericas.aumentaElValorDeUnCampo("usuarios", userID, "penalizac_acum", motivo.duracion);
		// Fin
		return;
	},
	actualizaOriginal: async (original, edicion, datos, userID) => {
		// Variables
		const ahora = comp.ahora();
		const entidad = comp.obtieneEntidadDesdeEdicion(edicion);

		// Genera la información a actualizar
		datos = {
			...datos,
			editado_por_id: edicion.editado_por_id,
			editado_en: edicion.editado_en,
			edic_analizada_por_id: userID,
			edic_analizada_en: ahora,
			lead_time_edicion: comp.obtieneLeadTime(edicion.editado_en, ahora),
		};
		// Actualiza el registro ORIGINAL ***********************************************
		await BD_genericas.actualizaPorId(entidad, original.id, datos);
		original = {...original, ...datos};
		// Fin
		return original;
	},
	edic_AccionesAdic: async (req, original, edicion) => {
		// 1. Aumenta el campo aprob/rech en el registro del usuario
		// 2. Agrega un registro en la tabla de 'aprob/rech'
		// 3. Si corresponde, penaliza al usuario

		// Fórmulas
		let agregaRegistroEnTablaEdicAprobRech = async () => {
			// Si fue rechazado, amplía aún más la información
			if (!edicAprob) {
				let {motivo_id} = req.query;
				let condicion = motivo_id ? {id: motivo_id} : {info_erronea: true};
				motivo = await BD_genericas.obtienePorCampos("edic_motivos_rech", condicion);
				datos = {...datos, duracion: motivo.duracion, motivo_id: motivo.id};
			}
			let valoresAprobRech = fn_valoresAprobRech();
			// Agrega un registro a la tabla 'edics_aprob' / 'edics_rech'
			datos = {...datos, ...valoresAprobRech};
			BD_genericas.agregarRegistro(decision, datos);
			// Fin
			return [datos.duracion, motivo];
		};
		let fn_valoresAprobRech = () => {
			// Amplía la información con los valores aprob/rech de edición
			let valorOrig = obtieneElValorDeUnCampo(original, campo);
			let valorEdic = obtieneElValorDeUnCampo(edicion, campo);
			// Obtiene los valores 'aprobado' y 'rechazado'
			let valor_aprob = edicAprob ? valorEdic : valorOrig;
			let valor_rech = !edicAprob ? valorEdic : valorOrig;
			// Fin
			return {valor_aprob, valor_rech};
		};
		let obtieneElValorDeUnCampo = (registro, campo) => {
			// Variables
			let familia = comp.obtieneFamiliaEnPlural(entidad);
			let camposConVinculo = [...variables.camposRevisar[familia]]; // Hay que desconectarse del original
			camposConVinculo = camposConVinculo.filter((n) => n.relac_include);
			let campos = camposConVinculo.map((n) => n.nombre);
			let indice = campos.indexOf(campo);
			let vinculo = indice >= 0 ? camposConVinculo[indice].relac_include : "";
			let respuesta;
			// Resultado
			if (indice >= 0) {
				console.log(762, vinculo);
				respuesta = registro[vinculo].productos
					? registro[vinculo].productos
					: registro[vinculo].nombre;
			} else respuesta = registro[campo];

			// Fin
			if (respuesta === null) respuesta = "-";
			return respuesta;
		};

		// Variables
		const edicAprob = req.query.aprob == "true";
		const decision = edicAprob ? "edics_aprob" : "edics_rech";
		const {entidad, id, campo} = req.query;
		const userID = req.session.usuario.id;
		const titulo = variables.camposRevisar.productos.find((n) => n.nombre == campo).titulo;
		let datos = {
			entidad,
			entidad_id: id,
			campo,
			input_por_id: edicion.editado_por_id,
			input_en: edicion.editado_en,
			titulo,
			evaluado_por_id: userID,
		};
		let motivo, duracion;

		// 1. Aumenta el campo aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", edicion.editado_por_id, decision, 1);

		// 2. Agrega un registro en la tabla de 'aprob/rech'
		[duracion, motivo] = await agregaRegistroEnTablaEdicAprobRech();
		// 3. Si corresponde, penaliza al usuario
		if (duracion) this.usuario_aumentaPenalizacAcum(edicion.editado_por_id, motivo);
		// Fin
		return;
	},
};
let TC_obtieneRegs = async (entidades, ahora, status, userID, fechaRef, autor_id, includes) => {
	// Variables
	let campos = [ahora, status, userID, includes, fechaRef, autor_id];
	let resultados = [];
	// Obtiene el resultado por entidad
	for (let entidad of entidades)
		resultados.push(...(await BD_especificas.TC_obtieneRegs(entidad, ...campos)));
	// Eliminar los propuestos hace menos de una hora, o por el Revisor
	const haceUnaHora = comp.nuevoHorario(-1, ahora);
	if (resultados.length)
		for (let i = resultados.length - 1; i >= 0; i--)
			if (resultados[i][fechaRef] > haceUnaHora || resultados[i][autor_id] == userID)
				resultados.splice(i, 1);
	// Ordenar los resultados
	if (resultados.length) resultados.sort((a, b) => new Date(a[fechaRef]) - new Date(b[fechaRef]));
	// Fin
	return resultados;
};
