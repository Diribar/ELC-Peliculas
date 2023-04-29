"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	detalle: {
		prodsDelRCLV: async function (RCLV, usuario) {
			// Variables
			let userID = usuario ? usuario.id : "";
			for (let entidad of variables.entidadesProd) if (!RCLV[entidad]) RCLV[entidad] = [];

			// Convierte las ediciones propias de productos en productos
			if (usuario) {
				// Obtiene las ediciones
				let ediciones = RCLV.prods_edicion ? RCLV.prods_edicion : [];

				let edicionesPropias =
					// Si el RCLV no está aprobado y el userID es un revisor, deja todas las ediciones
					!RCLV.status_registro.aprobado && usuario.rol_usuario.revisor_ents
						? ediciones
						: // Obtiene las ediciones propias
						ediciones
						? ediciones.filter((n) => n.editado_por_id == userID)
						: [];

				// Acciones si hay ediciones propias
				if (edicionesPropias.length) {
					// Obtiene los productos de esas ediciones
					for (let edicion of edicionesPropias) {
						// Obtiene la entidad con la que está asociada la edición del RCLV, y su campo 'producto_id'
						let entProd = comp.obtieneProdEntidadDesdeProd_id(edicion);
						let campo_id = comp.obtieneCampo_idDesdeEntidad(entProd);
						let entID = edicion[campo_id];
						// Obtiene los registros del producto original y su edición por el usuario
						let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(entProd, entID, userID);
						// Actualiza la variable del registro original
						let producto = {...prodOrig, ...prodEdic, id: prodOrig.id};
						// Fin
						RCLV[entProd].push(producto);
					}
				}
			}
			// Completa la información de cada tipo de producto y une los productos en una sola array
			let prodsDelRCLV = [];
			for (let entidad of variables.entidadesProd) {
				// Completa la información de cada producto dentro del tipo de producto
				let aux = RCLV[entidad].map((registro) => {
					// Averigua la ruta y el nombre del avatar
					let avatar = procsCRUD.obtieneAvatar(registro).edic;
					// Agrega la entidad, el avatar, y el nombre de la entidad
					return {...registro, entidad, avatar, entidadNombre: comp.obtieneEntidadNombreDesdeEntidad(entidad)};
				});
				prodsDelRCLV.push(...aux);
			}
			// Separa entre colecciones y resto
			let capitulos = prodsDelRCLV.filter((n) => n.entidad == "capitulos");
			let noCapitulos = prodsDelRCLV.filter((n) => n.entidad != "capitulos");
			// Elimina capitulos si las colecciones están presentes
			let colecciones = prodsDelRCLV.filter((n) => n.entidad == "colecciones");
			let coleccionesId = colecciones.map((n) => n.id);
			for (let i = capitulos.length - 1; i >= 0; i--)
				if (coleccionesId.includes(capitulos[i].coleccion_id)) capitulos.splice(i, 1);
			// Ordena por año (decreciente)
			prodsDelRCLV = [...capitulos, ...noCapitulos];
			prodsDelRCLV.sort((a, b) => b.ano_estreno - a.ano_estreno);
			// Quita los inactivos
			let resultado = prodsDelRCLV.filter((n) => n.status_registro_id != inactivo_id);
			// resultado.push(...prodsDelRCLV.filter((n) => n.status_registro_id == inactivo_id));

			// Fin
			return resultado;
		},
		bloqueRCLV: (registro) => {
			// Variables
			let bloque = [];

			// Información
			bloque.push({titulo: "Nombre", valor: registro.nombre});
			if (registro.dia_del_ano) bloque.push({titulo: "Día del año", valor: registro.dia_del_ano.nombre});

			// Particularidades para personajes
			if (registro.entidad == "personajes") {
				if (registro.apodo) bloque.push({titulo: "Alternativo", valor: registro.apodo});
				if (registro.ano) bloque.push({titulo: "Año de nacimiento", valor: registro.ano});
				if (registro.canon_id && !registro.canon_id.startsWith("NN") && registro.canon)
					bloque.push({titulo: "Proceso Canonizac.", valor: registro.canon.nombre});
				if (registro.rol_iglesia_id && !registro.rol_iglesia_id.startsWith("NN") && registro.rol_iglesia)
					bloque.push({titulo: "Rol en la Iglesia", valor: registro.rol_iglesia.nombre});
				if (registro.ap_mar_id && registro.ap_mar_id != 10 && registro.ap_mar)
					bloque.push({titulo: "Aparición Mariana", valor: registro.ap_mar.nombre});
			}

			// Particularidades para hechos
			if (registro.entidad == "hechos") {
				if (registro.ano) bloque.push({titulo: "Año", valor: registro.ano});
				if (registro.ama) bloque.push({titulo: "Es una aparición mariana", valor: "sí"});
			}

			// Fin
			return bloque;
		},
		procCanoniz: (RCLV) => {
			// Variables
			let procCanoniz = "";
			// Averigua si el RCLV tiene algún "proceso de canonización"
			if (RCLV.canon_id && !RCLV.canon_id.startsWith("NN")) {
				// Obtiene los procesos de canonización
				let proceso = canons.find((m) => m.id == RCLV.canon_id);
				// Asigna el nombre del proceso
				procCanoniz = proceso.nombre + " ";
				// Verificación si el nombre del proceso es "Santo" (varón)
				if (RCLV.canon_id == "STV") {
					// Nombres que llevan el prefijo "Santo"
					let nombresEspeciales = ["Domingo", "Tomás", "Tomé", "Toribio"];
					// Obtiene el primer nombre del RCLV
					let nombre = RCLV.nombre;
					nombre = nombre.includes(" ") ? nombre.slice(0, nombre.indexOf(" ")) : nombre;
					// Si el primer nombre no es "especial", cambia el prefijo por "San"
					if (!nombresEspeciales.includes(nombre)) procCanoniz = "San ";
				}
			}
			// Fin
			return procCanoniz;
		},
	},
	altaEdicGrabar: {
		procesaLosDatos: (datos) => {
			// Variables
			let DE = {};

			// Asigna el valor 'null' a todos los campos
			for (let campo of variables.camposEdicionRCLV[datos.entidad]) DE[campo] = null;

			// Datos comunes
			DE.nombre = datos.nombre;
			DE.dia_del_ano_id =
				datos.tipoFecha == "SF" ? 400 : dias_del_ano.find((n) => n.mes_id == datos.mes_id && n.dia == datos.dia).id;
			DE.fecha_movil = datos.tipoFecha == "FM";
			if (datos.tipoFecha == "FM") DE.comentario_movil = datos.comentario_movil;
			if (datos.prioridad_id) DE.prioridad_id = datos.prioridad_id;
			if (datos.avatar) DE.avatar = datos.avatar;

			// Datos para personajes
			if (datos.entidad == "personajes") {
				const {apodo, sexo_id, epoca_id, ano, categoria_id, rol_iglesia_id, canon_id, ap_mar_id} = datos;
				DE = {...DE, sexo_id, epoca_id, categoria_id};
				DE.apodo = apodo ? apodo : "";
				if (epoca_id == "pst") DE.ano = ano;
				const CFC = categoria_id == "CFC";
				DE.rol_iglesia_id = CFC ? rol_iglesia_id : "NN" + sexo_id;
				DE.canon_id = CFC ? canon_id : "NN" + sexo_id;
				DE.ap_mar_id = CFC && epoca_id == "pst" && parseInt(ano) > 1100 ? ap_mar_id : no_presencio_ninguna_id;
			}

			// Datos para hechos
			if (datos.entidad == "hechos") {
				// Variables
				const {epoca_id, ano, solo_cfc, ama} = datos;
				DE.epoca_id = epoca_id;
				if (epoca_id == "pst") DE.ano = ano;
				DE.solo_cfc = solo_cfc;
				DE.ama = solo_cfc == "1" ? ama : 0;
			}

			// Datos para epocas_del_ano
			if (datos.entidad == "epocas_del_ano") {
				DE.dias_de_duracion = datos.dias_de_duracion;
				DE.comentario_duracion = datos.comentario_duracion;
			}

			// Fin
			return DE;
		},
		guardaLosCambios: async (req, res, DE) => {
			// Variables
			const {entidad, id, origen, edic} = req.query;
			const userID = req.session.usuario.id;
			const codigo = req.baseUrl + req.path;

			// Mueve el archivo avatar de Provisorio a Revisar
			if (req.file && DE.avatar) comp.mueveUnArchivoImagen(DE.avatar, "9-Provisorio", "2-RCLVs/Revisar");

			// Tareas para un nuevo registro
			if (codigo == "/rclv/agregar/") {
				// Guarda el nuevo registro
				DE.creado_por_id = userID;
				DE.sugerido_por_id = userID;
				let id = await BD_genericas.agregaRegistro(entidad, DE).then((n) => n.id);

				// Les agrega el 'rclv_id' a session y cookie de origen
				let campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
				if (origen == "DA") {
					req.session.datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;
					req.session.datosAdics = {...req.session.datosAdics, [campo_id]: id};
					res.cookie("datosAdics", req.session.datosAdics, {maxAge: unDia});
				} else if (origen == "EDP") {
					req.session.edicProd = req.session.edicProd ? req.session.edicProd : req.cookies.edicProd;
					req.session.edicProd = {...req.session.edicProd, [campo_id]: id};
					res.cookie("edicProd", req.session.edicProd, {maxAge: unDia});
				}
			}
			// Tareas para edición
			else if (codigo == "/rclv/edicion/") {
				// Obtiene el registro original
				const original = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");

				// Acciones si es un registro propio y en status creado
				if (original.creado_por_id == userID && original.status_registro.creado) {
					// Actualiza el registro original
					BD_genericas.actualizaPorId(entidad, id, DE);

					// Elimina el archivo avatar-original, si existía
					if (req.file && DE.avatar && original.avatar)
						comp.borraUnArchivo("./publico/imagenes/2-RCLVs/Revisar/", original.avatar);
				}
				// Acciones si no esta en status 'creado'
				else {
					// Obtiene la edicion
					const campo_id = comp.obtieneCampo_idDesdeEntidad(entidad);
					const condiciones = {[campo_id]: id, editado_por_id: userID};
					const edicion = await BD_genericas.obtienePorCondicion(entidad, condiciones);

					// Elimina el archivo avatar-edicion, si existía
					if (req.file && DE.avatar && edicion && edicion.avatar)
						comp.borraUnArchivo("./publico/imagenes/2-RCLVs/Revisar/", edicion.avatar);

					// Guarda la edición
					procsCRUD.guardaActEdicCRUD({original, edicion: {...edicion, ...DE}, entidad, userID});
				}
			}
			// Fin
			return;
		},
	},
};
