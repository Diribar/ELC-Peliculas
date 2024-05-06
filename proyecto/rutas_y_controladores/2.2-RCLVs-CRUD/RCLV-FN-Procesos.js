"use strict";
// Variables
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");

module.exports = {
	detalle: {
		actualizaProdsRCLV_conEdicionPropia: async (RCLV, userID) => {
			// Si el usuario no está logueado, devuelve el RCLV intacto
			if (!userID) return RCLV;

			// Actualiza los registros de productos
			for (let entProd of variables.entidades.prods) {
				// Si el RCLV no tiene productos de esa familia, saltea la rutina
				const prodsEnRCLV = RCLV[entProd];
				if (!prodsEnRCLV) continue;

				// Rutina por producto
				for (let i = 0; i < prodsEnRCLV.length; i++) {
					let [original, edicion] = await procsCRUD.obtieneOriginalEdicion({
						entidad: entProd,
						entID: prodsEnRCLV[i].id,
						userID,
					});
					if (edicion) {
						const avatar = procsCRUD.obtieneAvatar(original, edicion).edic;
						RCLV[entProd][i] = {...original, ...edicion, avatar, id: original.id};
					}
				}
			}

			// Fin
			return RCLV;
		},
		prodsDelRCLV: async function (RCLV, userID) {
			// Variables
			const pppRegs = await BD_genericas.obtieneTodosPorCondicionConInclude(
				"pppRegistros",
				{usuario_id: userID},
				"detalle"
			);
			for (let entidad of variables.entidades.prods) if (!RCLV[entidad]) RCLV[entidad] = [];

			// Convierte en productos, a las ediciones propias de productos, con 'campo_id' vinculado al RCLV,
			if (userID && RCLV.prodsEdiciones) {
				// Obtiene las ediciones propias
				const edicionesPropias = RCLV.prodsEdiciones.filter((n) => n.editadoPor_id == userID);

				// Obtiene los productos de las ediciones propias
				if (edicionesPropias.length)
					for (let edicion of edicionesPropias) {
						// Obtiene la entidad con la que está asociada la edición del RCLV, y su campo 'producto_id'
						let entProd = comp.obtieneDesdeCampo_id.entidadProd(edicion);
						let campo_id = comp.obtieneDesdeEntidad.campo_id(entProd);
						let entID = edicion[campo_id];

						// Obtiene los registros del producto original y su edición por el usuario
						let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion({entidad: entProd, entID, userID});

						// Actualiza la variable del registro original
						let producto = {...prodOrig, ...prodEdic, id: prodOrig.id};

						// Fin
						RCLV[entProd].push(producto);
					}
			}

			// Completa la información de cada tipo de producto y une los productos en una sola array
			let prodsDelRCLV = [];
			for (let entidad of variables.entidades.prods) {
				// Completa la información de cada producto dentro del tipo de producto
				const prodsPorEnt = RCLV[entidad].map((registro) => {
					// Variables
					const avatar = procsCRUD.obtieneAvatar(registro).edic;
					const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
					const pppReg = pppRegs.find((n) => n.entidad == entidad && n.entidad_id == registro.id);
					const ppp = pppReg ? pppReg.detalle : pppOpcsObj.sinPref;

					// Agrega la entidad, el avatar, y el nombre de la entidad
					return {...registro, entidad, avatar, entidadNombre, ppp};
				});

				// Consolida la información
				prodsDelRCLV.push(...prodsPorEnt);
			}

			// Separa entre capitulos y resto
			let capitulos = prodsDelRCLV.filter((n) => n.entidad == "capitulos");
			let noCapitulos = prodsDelRCLV.filter((n) => n.entidad != "capitulos");

			// Elimina capitulos si las colecciones están presentes
			let colecciones = prodsDelRCLV.filter((n) => n.entidad == "colecciones");
			let coleccionesId = colecciones.map((n) => n.id);
			capitulos = capitulos.filter((n) => !coleccionesId.find((m) => m == n.coleccion_id));

			// Operaciones varias
			prodsDelRCLV = [...capitulos, ...noCapitulos]; // consolida los productos
			if (prodsDelRCLV.length) {
				for (let prod of prodsDelRCLV)
					if (prod.direccion.includes(",")) {
						prod.direccion = prod.direccion.split(", ");
						prod.direccion.splice(2);
						prod.direccion = prod.direccion.join(", ");
					}
				prodsDelRCLV.sort((a, b) => b.anoEstreno - a.anoEstreno); // Ordena por año (decreciente)
				prodsDelRCLV = prodsDelRCLV.filter((n) => n.statusRegistro_id != inactivo_id); // Quita los inactivos
			}

			// Fin
			return prodsDelRCLV;
		},
		bloqueRCLV: (registro) => {
			// Variables
			let bloque = [];

			// Información
			bloque.push({titulo: "Nombre", valor: registro.nombre});
			if (registro.apodo) {
				// Necesariamente es un 'personaje'
				const articulo = registro.genero_id == "V" ? "o" : "a";
				bloque.push({titulo: "También conocid" + articulo + " como", valor: registro.apodo});
			}
			if (registro.fechaDelAno && registro.fechaDelAno.id < 400) {
				// Puede ser cualquier familia RCLV
				const articulo = comp.letras.laLo(registro);
				bloque.push({titulo: "Se " + articulo + " recuerda el", valor: registro.fechaDelAno.nombre});
			}

			// Particularidades para personajes
			if (registro.entidad == "personajes") {
				if (registro.anoNacim) bloque.push({titulo: "Año de nacimiento", valor: registro.anoNacim});
				if (registro.canon_id && registro.canon_id != "NN" && registro.canon && registro.canon[registro.genero_id])
					bloque.push({titulo: "Status Canoniz.", valor: registro.canon[registro.genero_id]});
				if (registro.rolIglesia_id && registro.rolIglesia_id != "NN" && registro.rolIglesia)
					bloque.push({titulo: "Rol en la Iglesia", valor: registro.rolIglesia[registro.genero_id]});
				if (registro.apMar_id && registro.apMar_id != 10 && registro.apMar)
					bloque.push({titulo: "Aparición Mariana", valor: registro.apMar.nombre});
			}

			// Particularidades para hechos
			if (registro.entidad == "hechos") {
				if (registro.anoComienzo) bloque.push({titulo: "Año", valor: registro.anoComienzo});
				if (registro.ama) bloque.push({valor: "Es una aparición mariana"});
			}

			// Fin
			return bloque;
		},
	},
	altaEdicForm: {
		tipoFecha_id: (dataEntry, entidad) => {
			return false
				? false
				: dataEntry.fechaMovil
				? "FM"
				: dataEntry.fechaDelAno_id == 400
				? "SF"
				: dataEntry.fechaDelAno_id && dataEntry.fechaDelAno_id < 400
				? "FD"
				: entidad == "personajes" || entidad == "hechos"
				? "FD"
				: entidad == "eventos" || entidad == "epocasDelAno"
				? "FM"
				: entidad == "temas"
				? "SF"
				: "";
		},
		prioridad_id: (dataEntry, entidad) => {
			const prioridades = {menor: 1, estandar: 2, mayor: 3};
			return false
				? false
				: entidad == "personajes"
				? prioridades.estandar
				: entidad == "hechos"
				? dataEntry.soloCfc
					? prioridades.estandar
					: prioridades.menor
				: entidad == "temas"
				? prioridades.menor
				: entidad == "eventos"
				? dataEntry.soloCfc
					? prioridades.mayor
					: prioridades.menor
				: entidad == "epocasDelAno"
				? prioridades.menor
				: "";
		},
	},
	altaEdicGuardar: {
		procesaLosDatos: (datos) => {
			// Variables
			let DE = {};
			const {nombre, tipoFecha, mes_id, dia, comentarioMovil, prioridad_id, avatar, entidad, anoFM} = datos;

			// Asigna el valor 'null' a todos los campos
			for (let campo of variables.camposEdicionRCLV[datos.entidad]) DE[campo] = null;

			// Datos comunes a todos los RCLV
			if (nombre) DE.nombre = nombre;
			DE.fechaDelAno_id = tipoFecha == "SF" ? 400 : fechasDelAno.find((n) => n.mes_id == mes_id && n.dia == dia).id;
			DE.fechaMovil = tipoFecha == "FM";
			if (tipoFecha == "FM") {
				DE.comentarioMovil = comentarioMovil;
				DE.anoFM = Number(anoFM);
			}
			if (prioridad_id) DE.prioridad_id = Number(prioridad_id);
			if (avatar) DE.avatar = avatar;

			// Datos exclusivos de personajes
			if (entidad == "personajes") {
				// Variables
				const {apodo, genero_id, epocaOcurrencia_id, anoNacim, categoria_id, rolIglesia_id, canon_id, apMar_id} = datos;
				DE = {...DE, genero_id, epocaOcurrencia_id, categoria_id};
				const CFC = categoria_id == "CFC";

				DE.canon_id = CFC ? canon_id : "NN" + genero_id;
				DE.canonNombre = comp.canonNombre({nombre, canon_id});

				DE.apodo = apodo ? apodo : "";
				if (epocaOcurrencia_id == "pst") DE.anoNacim = anoNacim;
				DE.rolIglesia_id = CFC ? rolIglesia_id : "NN" + genero_id;
				DE.apMar_id = CFC && epocaOcurrencia_id == "pst" && parseInt(anoNacim) > 1100 ? apMar_id : 10; // El '10' es el id de "no presenció ninguna"
			}

			// Datos para hechos
			if (entidad == "hechos") {
				// Variables
				const {epocaOcurrencia_id, anoComienzo, soloCfc, ama} = datos;
				DE.epocaOcurrencia_id = epocaOcurrencia_id;
				if (epocaOcurrencia_id == "pst") DE.anoComienzo = anoComienzo;
				DE.soloCfc = Number(soloCfc);
				DE.ama = soloCfc == "1" ? Number(ama) : 0;
			}

			// Datos para epocasDelAno
			if (entidad == "epocasDelAno") {
				DE.diasDeDuracion = datos.diasDeDuracion;
				DE.comentarioDuracion = datos.comentarioDuracion;
				if (datos.carpetaAvatars) DE.carpetaAvatars = datos.carpetaAvatars;
			}

			// Fin
			return DE;
		},
		guardaLosCambios: async (req, res, DE) => {
			// Variables
			const {entidad, origen} = req.query;
			let {id} = req.query; // Si es un 'agregar', el 'id' es undefined
			const campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
			const userID = req.session.usuario.id;
			const codigo = req.baseUrl + req.path;
			let original, edicion, edicN;

			// Tareas para un nuevo registro
			if (codigo == "/rclv/agregar/") {
				// Guarda el nuevo registro
				DE.creadoPor_id = userID;
				DE.statusSugeridoPor_id = userID;
				original = await BD_genericas.agregaRegistro(entidad, DE);
				id = original.id;

				// Les agrega el 'rclv_id' a session y cookie de origen
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
				original = await BD_genericas.obtienePorIdConInclude(entidad, id, ["statusRegistro", "ediciones"]);
				edicion = original.ediciones.find((n) => n[campo_id] == id && n.editadoPor_id == userID);

				// Si es un registro propio y en status creado, actualiza el registro original
				if (original.creadoPor_id == userID && original.statusRegistro_id == creado_id)
					await BD_genericas.actualizaPorId(entidad, id, DE);
				// Si no esta en status 'creado', guarda la edición
				else edicN = await procsCRUD.guardaActEdicCRUD({entidad, original, edicion: {...edicion, ...DE}, userID});
			}

			// Fin
			return {original, edicion, edicN};
		},
	},
};
