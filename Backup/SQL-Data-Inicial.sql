USE ELC_Peliculas;

INSERT INTO status_usuario (id, nombre)
VALUES (1, 'Mail a validar'), (2, 'Mail validado'), (3, 'Datos perennes OK'), (4, 'Registro completo')
;
INSERT INTO roles_usuario (id, nombre)
VALUES (1, 'Usuario'), (2, 'Admin'), (3, 'Gerente')
;
INSERT INTO sexos (id, nombre)
VALUES ('M','Masculino'), ('F','Femenino')
;
INSERT INTO estados_eclesiales (id, nombre, orden)
VALUES ('LA', 'Laico/a', 1), ('RC', 'Religioso/a', 2), ('DP', 'Diácono', 3), ('SC', 'Sacerdote', 4), ('OB', 'Obispo', 5)
;
INSERT INTO paises (iso_id, nombre)
VALUES ('AF','Afganistán'), ('AX','Åland'), ('AL','Albania'), ('DE','Alemania'), ('AD','Andorra'), ('AO','Angola'), ('AI','Anguila'), ('AQ','Antártida'), ('AG','Antigua y Barbuda'), ('SA','Arabia Saudita'), ('DZ','Argelia'), ('AR','Argentina'), ('AM','Armenia'), ('AW','Aruba'), ('AU','Australia'), ('AT','Austria'), ('AZ','Azerbaiyán'), ('BS','Bahamas'), ('BD','Bangladés'), ('BB','Barbados'), ('BH','Baréin'), ('BE','Bélgica'), ('BZ','Belice'), ('BJ','Benín'), ('BM','Bermudas'), ('BY','Bielorrusia'), ('MM','Birmania'), ('BO','Bolivia'), ('BQ','Bonaire, San Eustaquio y Saba'), ('BA','Bosnia y Herzegovina'), ('BW','Botsuana'), ('BR','Brasil'), ('BN','Brunéi'), ('BG','Bulgaria'), ('BF','Burkina Faso'), ('BI','Burundi'), ('BT','Bután'), ('CV','Cabo Verde'), ('KH','Camboya'), ('CM','Camerún'), ('CA','Canadá'), ('QA','Catar'), ('TD','Chad'), ('CL','Chile'), ('CN','China'), ('CY','Chipre'), ('VA','Ciudad del Vaticano'), ('CO','Colombia'), ('KM','Comoras'), ('KP','Corea del Norte'), ('KR','Corea del Sur'), ('CI','Costa de Marfil'), ('CR','Costa Rica'), ('HR','Croacia'), ('CU','Cuba'), ('CW','Curazao'), ('DK','Dinamarca'), ('DM','Dominica'), ('EC','Ecuador'), ('EG','Egipto'), ('SV','El Salvador'), ('AE','Emiratos Árabes Unidos'), ('ER','Eritrea'), ('SK','Eslovaquia'), ('SI','Eslovenia'), ('ES','España'), ('US','Estados Unidos'), ('EE','Estonia'), ('ET','Etiopía'), ('PH','Filipinas'), ('FI','Finlandia'), ('FJ','Fiyi'), ('FR','Francia'), ('GA','Gabón'), ('GM','Gambia'), ('GE','Georgia'), ('GH','Ghana'), ('GI','Gibraltar'), ('GD','Granada'), ('GR','Grecia'), ('GL','Groenlandia'), ('GP','Guadalupe'), ('GU','Guam'), ('GT','Guatemala'), ('GF','Guayana Francesa'), ('GG','Guernsey'), ('GN','Guinea'), ('GQ','Guinea Ecuatorial'), ('GW','Guinea-Bisáu'), ('GY','Guyana'), ('HT','Haití'), ('HN','Honduras'), ('HK','Hong Kong'), ('HU','Hungría'), ('IN','India'), ('ID','Indonesia'), ('IQ','Irak'), ('IR','Irán'), ('IE','Irlanda'), ('BV','Isla Bouvet'), ('IM','Isla de Man'), ('CX','Isla de Navidad'), ('NF','Isla Norfolk'), ('IS','Islandia'), ('KY','Islas Caimán'), ('CC','Islas Cocos'), ('CK','Islas Cook'), ('FO','Islas Feroe'), ('GS','Islas Georgias del Sur y Sandwich del Sur'), ('HM','Islas Heard y McDonald'), ('FK','Islas Malvinas'), ('MP','Islas Marianas del Norte'), ('MH','Islas Marshall'), ('PN','Islas Pitcairn'), ('SB','Islas Salomón'), ('TC','Islas Turcas y Caicos'), ('UM','Islas Ultramarinas Menores de los Estados Unidos'), ('VG','Islas Vírgenes Británicas'), ('VI','Islas Vírgenes de los Estados Unidos'), ('IL','Israel'), ('IT','Italia'), ('JM','Jamaica'), ('JP','Japón'), ('JE','Jersey'), ('JO','Jordania'), ('KZ','Kazajistán'), ('KE','Kenia'), ('KG','Kirguistán'), ('KI','Kiribati'), ('KW','Kuwait'), ('LA','Laos'), ('LS','Lesoto'), ('LV','Letonia'), ('LB','Líbano'), ('LR','Liberia'), ('LY','Libia'), ('LI','Liechtenstein'), ('LT','Lituania'), ('LU','Luxemburgo'), ('MO','Macao'), ('MK','Macedonia del Norte'), ('MG','Madagascar'), ('MY','Malasia'), ('MW','Malaui'), ('MV','Maldivas'), ('ML','Malí'), ('MT','Malta'), ('MA','Marruecos'), ('MQ','Martinica'), ('MU','Mauricio'), ('MR','Mauritania'), ('YT','Mayotte'), ('MX','México'), ('FM','Micronesia'), ('MD','Moldavia'), ('MC','Mónaco'), ('MN','Mongolia'), ('ME','Montenegro'), ('MS','Montserrat'), ('MZ','Mozambique'), ('NA','Namibia'), ('NR','Nauru'), ('NP','Nepal'), ('NI','Nicaragua'), ('NE','Níger'), ('NG','Nigeria'), ('NU','Niue'), ('NO','Noruega'), ('NC','Nueva Caledonia'), ('NZ','Nueva Zelanda'), ('OM','Omán'), ('NL','Países Bajos'), ('PK','Pakistán'), ('PW','Palaos'), ('PS','Palestina'), ('PA','Panamá'), ('PG','Papúa Nueva Guinea'), ('PY','Paraguay'), ('PE','Perú'), ('PF','Polinesia Francesa'), ('PL','Polonia'), ('PT','Portugal'), ('PR','Puerto Rico'), ('GB','Reino Unido'), ('EH','República Árabe Saharaui Democrática'), ('CF','República Centroafricana'), ('CZ','República Checa'), ('CG','República del Congo'), ('CD','República Democrática del Congo'), ('DO','República Dominicana'), ('RE','Reunión'), ('RW','Ruanda'), ('RO','Rumania'), ('RU','Rusia'), ('WS','Samoa'), ('AS','Samoa Americana'), ('BL','San Bartolomé'), ('KN','San Cristóbal y Nieves'), ('SM','San Marino'), ('MF','San Martín'), ('SX','San Martín'), ('PM','San Pedro y Miquelón'), ('VC','San Vicente y las Granadinas'), ('SH','Santa Elena, Ascensión y Tristán de Acuña'), ('LC','Santa Lucía'), ('ST','Santo Tomé y Príncipe'), ('SN','Senegal'), ('RS','Serbia'), ('SC','Seychelles'), ('SL','Sierra Leona'), ('SG','Singapur'), ('SY','Siria'), ('SO','Somalia'), ('LK','Sri Lanka'), ('SZ','Suazilandia'), ('ZA','Sudáfrica'), ('SD','Sudán'), ('SS','Sudán del Sur'), ('SE','Suecia'), ('CH','Suiza'), ('SR','Surinam'), ('SJ','Svalbard y Jan Mayen'), ('TH','Tailandia'), ('TW','Taiwán (República de China)'), ('TZ','Tanzania'), ('TJ','Tayikistán'), ('IO','Territorio Británico del Océano Índico'), ('TF','Tierras Australes y Antárticas Francesas'), ('TL','Timor Oriental'), ('TG','Togo'), ('TK','Tokelau'), ('TO','Tonga'), ('TT','Trinidad y Tobago'), ('TN','Túnez'), ('TM','Turkmenistán'), ('TR','Turquía'), ('TV','Tuvalu'), ('UA','Ucrania'), ('UG','Uganda'), ('UY','Uruguay'), ('UZ','Uzbekistán'), ('VU','Vanuatu'), ('VE','Venezuela'), ('VN','Vietnam'), ('WF','Wallis y Futuna'), ('YE','Yemen'), ('DJ','Yibuti'), ('ZM','Zambia'), ('ZW','Zimbabue'), ('OT','Otro')
;
INSERT INTO usuarios (
id, email, contrasena, status_usuario_id, rol_usuario_id, nombre, apellido, apodo, avatar, fecha_nacimiento, sexo_id, pais_id, estado_eclesial_id, creado_en, completado_en)
VALUES (1, 'diegoiribarren2015@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 2, 3, 'Diego', 'Iribarren', 'Diego', '1617370359746.jpg', '1969-08-16', 'M', 'AR', 'LA', '2021-03-26', '2021-03-26'),(2, 'sp2015w@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 2, 2, 'Diego', 'Iribarren', 'Diego', '1617370359746.jpg', '1969-08-16', 'M', 'AR', 'LA', '2021-03-26', '2021-03-26')
;
INSERT INTO interes_en_la_pelicula (id, nombre)
VALUES (1, 'Favoritas'), (2, 'Recordame que quiero verla'), (3, 'Prefiero que no me la sigan mostrando')
;
INSERT INTO categorias (id, nombre)
VALUES ('CFC', 'Centradas en la Fe Católica'), ('VPC', 'Valores Presentes en la Cultura')
;
INSERT INTO subcategorias (id, categoria_id, nombre)
VALUES (1, 'CFC', 'Jesús'), (2, 'CFC', 'Contemporáneos de Jesús'), (3, 'CFC', 'Apariciones Marianas'), (4, 'CFC', 'Hagiografías'), (5, 'CFC', 'Historias de la Iglesia'), (6, 'CFC', 'Novelas centradas en la fe'), (7, 'CFC', 'Colecciones'), (11, 'VPC', 'Biografías e Historias'), (12, 'VPC', 'Matrimonio y Familia'), (13, 'VPC', 'Novelas'), (14, 'VPC', 'Musicales'), (15, 'VPC', 'Colecciones')
;
INSERT INTO publico_recomendado (id, nombre)
VALUES (1, 'Está dirigido a un público infantil, no se recomienda para mayores'), (2, 'Es apto para mayores, pero se recomienda para menores (se puede ver en familia)'), (3, 'Es ideal para ver en familia'), (4, 'Es apto para menores, pero se recomienda para mayores (se puede ver en familia)'), (5, 'No es apto para menores, sólo para mayores')
;
INSERT INTO directores (id, tmdb_id, nombre)
VALUES (1, 234495, 'Giacomo Battiato')
;
INSERT INTO guion (id, tmdb_id, nombre)
VALUES (1, 2565414, 'Giacomo Battiato')
;
INSERT INTO musica (id, tmdb_id, nombre)
VALUES (1, 1259, 'Ennio Morricone')
;
INSERT INTO actores (id, tmdb_id, nombre)
VALUES (1, 118762, 'Piotr Adamczyk'), (2, 138047, 'Ma?gorzata Bela'), (3, 44651, 'Ken Duken'), (4, 8775, 'Hristo Shopov'), (5, 27272, 'Ennio Fantastichini'), (6, 44649, 'Violante Placido'), (7, 13525, 'Matt Craven'), (8, 5412, 'Raoul Bova'), (9, 1275339, 'Lech Mackiewicz'), (10, 1558123, 'Patrycja Soliman')
;
INSERT INTO productores (id, tmdb_id, nombre)
VALUES (1, 473, 'Taodue Film')
;
INSERT INTO colecciones (id, nombre_original, nombre_castellano)
VALUES (1, 'Karol', 'Karol')
;
INSERT INTO personajes (id, nombre)
VALUES (1, 'Juan Pablo II (papa)')
;
INSERT INTO hechos_historicos (id, nombre)
VALUES (1, '2a Guerra Mundial y Comunismo')
;
INSERT INTO coleccion_pelicula (id, tmdb_coleccion_id, pelicula_id, tmdb_pelicula_id, titulo_original, titulo_castellano, ano_estreno)
VALUES 
(1, 0, 1, 38516, 'Karol - Un uomo diventato Papa', 'Karol, el hombre que llegó a ser Papa', 2005), 
(2, 0, 0, 75470, 'Karol, un Papa rimasto uomo', 'Karol II. El Papa, el hombre', 2006)
;
INSERT INTO peliculas (
id, tmdb_id, fa_id, imdb_id, titulo_original, titulo_castellano, coleccion_id, duracion, ano_estreno, pais_origen_id, avatar, idioma_castellano, color, precuela_de, publico_recomendado_id, categoria_id, subcategoria_id, sinopsis, creada_por, creada_en, analizada_por, analizada_en, aprobadaCR)
VALUES (1, "38516", "436804", 'tt0435100', 'Karol - Un uomo diventato Papa', 'Karol, el hombre que llegó a ser Papa', 1, 195, 2005, 'IT', 'https://image.tmdb.org/t/p/original/xVqMG4KcTXhkhL65yohBpjbkY65.jpg', true, true, 'Karol - Un uomo diventato Papa', 5, 'CFC', 4, 'Miniserie biográfica sobre Juan Pablo II. En su juventud, en Polonia bajo la ocupación nazi, Karol Wojtyla trabajó en una cantera de caliza para poder sobrevivir. La represión nazi causó numerosas víctimas no sólo entre los judíos, sino también entre los católicos. Es entonces cuando Karol decide responder a la llamada divina.', 1, '2021-04-23', 2, '2021-04-23', 1)
;
INSERT INTO usuario_pelicula (id, usuario_id, pelicula_id, vistas, fe_valores, entretiene, calidad_filmica)
VALUES (1, 1, 1, 1, 1.00, 1.00, 1.00)
;
INSERT INTO director_pelicula (id, director_id, pelicula_id)
VALUES (1, 1, 1)
;
INSERT INTO musica_pelicula (id, musica_id, pelicula_id)
VALUES (1, 1, 1)
;
INSERT INTO guion_pelicula (id, guion_id, pelicula_id)
VALUES (1, 1, 1)
;
INSERT INTO actor_pelicula (id, actor_id, pelicula_id, personaje)
VALUES (1, 1, 1, 'Karol Wojtyla'), (2, 2, 1, 'Hanna Tuszynska'), (3, 3, 1, 'Adam Zielinski'), (4, 4, 1, 'Julian Kordek'), (5, 5, 1, 'Maciej Nowak'), (6, 6, 1, 'Maria Pomorska'), (7, 7, 1, 'Hans Frank'), (8, 8, 1, 'padre Tomasz Zaleski'), (9, 9, 1, 'card. Stefan Wyszy?ski'), (10, 10, 1, 'Wislawa')
;
INSERT INTO productor_pelicula (id, productor_id, pelicula_id)
VALUES (1, 1, 1)
;
INSERT INTO personaje_pelicula (id, personaje_id, pelicula_id)
VALUES (1, 1, 1)
;
INSERT INTO hecho_historico_pelicula (id, hecho_historico_id, pelicula_id)
VALUES (1, 1, 1)
;