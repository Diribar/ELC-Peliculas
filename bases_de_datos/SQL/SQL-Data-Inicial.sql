USE ELC_Peliculas;

INSERT INTO status_registro_usuario (id, nombre)
VALUES (1, 'Mail a validar'), (2, 'Mail validado'), (3, 'Datos perennes OK'), (4, 'Registro completo')
;
INSERT INTO roles_usuario (id, nombre)
VALUES (1, 'Usuario'), (2, 'Admin'), (3, 'Gerente'), (4, 'Dueño')
;
INSERT INTO sexos (id, nombre, letra_final)
VALUES ('M','Masculino', 'o'), ('F','Femenino', 'a')
;
INSERT INTO estados_eclesiales (id, nombre, orden)
VALUES ('LA', 'Laico/a', 1), ('RC', 'Religioso/a', 2), ('DP', 'Diácono', 3), ('SC', 'Sacerdote', 4), ('OB', 'Obispo', 5)
;
INSERT INTO paises (alpha3Code, id, nombre, continente , idioma , zona_horaria, bandera, orden)
VALUES ('ALA','AX','Åland','Europa','Swedish','UTC+02:00','https://restcountries.eu/data/ala.svg',1), ('ASM','AS','American Samoa (Samoa Americana)','Oceanía','English','UTC-11:00','https://restcountries.eu/data/asm.svg',2), ('AND','AD','Andorra','Europa','Catalan','UTC+01:00','https://restcountries.eu/data/and.svg',3), ('AGO','AO','Angola','Africa','Portuguese','UTC+01:00','https://restcountries.eu/data/ago.svg',4), ('AIA','AI','Anguilla (Anguila)','América','English','UTC-04:00','https://restcountries.eu/data/aia.svg',5), ('ATA','AQ','Antarctica (Antártida)','Polar','English','UTC-03:00','https://restcountries.eu/data/ata.svg',6), ('ATG','AG','Antigua and Barbuda (Antigua y Barbuda)','América','English','UTC-04:00','https://restcountries.eu/data/atg.svg',7), ('ARG','AR','Argentina','América','Spanish','UTC-03:00','https://restcountries.eu/data/arg.svg',8), ('ABW','AW','Aruba','América','Dutch','UTC-04:00','https://restcountries.eu/data/abw.svg',9), ('AUS','AU','Australia','Oceanía','English','UTC+05:00','https://restcountries.eu/data/aus.svg',10), ('AZE','AZ','Azərbaycan (Azerbaiyán)','Asia','Azerbaijani','UTC+04:00','https://restcountries.eu/data/aze.svg',11), ('BHS','BS','Bahamas','América','English','UTC-05:00','https://restcountries.eu/data/bhs.svg',12), ('BGD','BD','Bangladesh (Bangladés)','Asia','Bengali','UTC+06:00','https://restcountries.eu/data/bgd.svg',13), ('BRB','BB','Barbados','América','English','UTC-04:00','https://restcountries.eu/data/brb.svg',14), ('BEL','BE','België (Bélgica)','Europa','Dutch','UTC+01:00','https://restcountries.eu/data/bel.svg',15), ('BLZ','BZ','Belize (Belice)','América','English','UTC-06:00','https://restcountries.eu/data/blz.svg',16), ('BEN','BJ','Bénin (Benín)','Africa','French','UTC+01:00','https://restcountries.eu/data/ben.svg',17), ('BMU','BM','Bermuda (Bermudas)','América','English','UTC-04:00','https://restcountries.eu/data/bmu.svg',18), ('BOL','BO','Bolivia','América','Spanish','UTC-04:00','https://restcountries.eu/data/bol.svg',19), ('BES','BQ','Bonaire (Bonaire, San Eustaquio y Saba)','América','Dutch','UTC-04:00','https://restcountries.eu/data/bes.svg',20), ('BIH','BA','Bosna i Hercegovina (Bosnia y Herzegovina)','Europa','Bosnian','UTC+01:00','https://restcountries.eu/data/bih.svg',21), ('BWA','BW','Botswana','Africa','English','UTC+02:00','https://restcountries.eu/data/bwa.svg',22), ('BVT','BV','Bouvetøya (Isla Bouvet)','Polar','Norwegian','UTC+01:00','https://restcountries.eu/data/bvt.svg',23), ('BRA','BR','Brasil','América','Portuguese','UTC-05:00','https://restcountries.eu/data/bra.svg',24), ('VGB','VG','British Virgin Islands (Islas Vírgenes Británicas)','América','English','UTC-04:00','https://restcountries.eu/data/vgb.svg',26), ('BTN','BT','ʼbrug-yul (Bután)','Asia','Dzongkha','UTC+06:00','https://restcountries.eu/data/btn.svg',27), ('BFA','BF','Burkina Faso','Africa','French','UTC','https://restcountries.eu/data/bfa.svg',28), ('BDI','BI','Burundi','Africa','French','UTC+02:00','https://restcountries.eu/data/bdi.svg',29), ('CPV','CV','Cabo Verde','Africa','Portuguese','UTC-01:00','https://restcountries.eu/data/cpv.svg',30), ('CMR','CM','Cameroon (Camerún)','Africa','English','UTC+01:00','https://restcountries.eu/data/cmr.svg',31), ('CAN','CA','Canada (Canadá)','América','English','UTC-08:00','https://restcountries.eu/data/can.svg',32), ('CYM','KY','Cayman Islands (Islas Caimán)','América','English','UTC-05:00','https://restcountries.eu/data/cym.svg',33), ('CZE','CZ','Česká republika (República Checa)','Europa','Czech','UTC+01:00','https://restcountries.eu/data/cze.svg',34), ('CHL','CL','Chile','América','Spanish','UTC-06:00','https://restcountries.eu/data/chl.svg',35), ('CXR','CX','Christmas Island (Isla de Navidad)','Oceanía','English','UTC+07:00','https://restcountries.eu/data/cxr.svg',36), ('CCK','CC','Cocos (Keeling) Islands (Islas Cocos)','Oceanía','English','UTC+06:30','https://restcountries.eu/data/cck.svg',37), ('COL','CO','Colombia','América','Spanish','UTC-05:00','https://restcountries.eu/data/col.svg',38), ('COK','CK','Cook Islands (Islas Cook)','Oceanía','English','UTC-10:00','https://restcountries.eu/data/cok.svg',39), ('CRI','CR','Costa Rica','América','Spanish','UTC-06:00','https://restcountries.eu/data/cri.svg',40), ('CIV','CI','Côte dIvoire (Costa de Marfil)','Africa','French','UTC','https://restcountries.eu/data/civ.svg',41), ('CUB','CU','Cuba','América','Spanish','UTC-05:00','https://restcountries.eu/data/cub.svg',42), ('CUW','CW','Curaçao (Curazao)','América','Dutch','UTC-04:00','https://restcountries.eu/data/cuw.svg',43), ('DNK','DK','Danmark (Dinamarca)','Europa','Danish','UTC-04:00','https://restcountries.eu/data/dnk.svg',44), ('DEU','DE','Deutschland (Alemania)','Europa','German','UTC+01:00','https://restcountries.eu/data/deu.svg',45), ('DJI','DJ','Djibouti (Yibuti)','Africa','French','UTC+03:00','https://restcountries.eu/data/dji.svg',46), ('DMA','DM','Dominica','América','English','UTC-04:00','https://restcountries.eu/data/dma.svg',47), ('ECU','EC','Ecuador','América','Spanish','UTC-06:00','https://restcountries.eu/data/ecu.svg',48), ('EST','EE','Eesti (Estonia)','Europa','Estonian','UTC+02:00','https://restcountries.eu/data/est.svg',49), ('IRL','IE','Éire (Irlanda)','Europa','Irish','UTC','https://restcountries.eu/data/irl.svg',50), ('SLV','SV','El Salvador','América','Spanish','UTC-06:00','https://restcountries.eu/data/slv.svg',51), ('ESP','ES','España','Europa','Spanish','UTC','https://restcountries.eu/data/esp.svg',52), ('FJI','FJ','Fiji (Fiyi)','Oceanía','English','UTC+12:00','https://restcountries.eu/data/fji.svg',53), ('FRO','FO','Føroyar (Islas Feroe)','Europa','Faroese','UTC+00:00','https://restcountries.eu/data/fro.svg',54), ('FRA','FR','France (Francia)','Europa','French','UTC-10:00','https://restcountries.eu/data/fra.svg',55), ('GAB','GA','Gabon (Gabón)','Africa','French','UTC+01:00','https://restcountries.eu/data/gab.svg',56), ('GMB','GM','Gambia','Africa','English','UTC+00:00','https://restcountries.eu/data/gmb.svg',57), ('GHA','GH','Ghana','Africa','English','UTC','https://restcountries.eu/data/gha.svg',58), ('GIB','GI','Gibraltar','Europa','English','UTC+01:00','https://restcountries.eu/data/gib.svg',59), ('GRD','GD','Grenada (Granada)','América','English','UTC-04:00','https://restcountries.eu/data/grd.svg',60), ('GLP','GP','Guadeloupe (Guadalupe)','América','French','UTC-04:00','https://restcountries.eu/data/glp.svg',61), ('GUM','GU','Guam','Oceanía','English','UTC+10:00','https://restcountries.eu/data/gum.svg',62), ('GTM','GT','Guatemala','América','Spanish','UTC-06:00','https://restcountries.eu/data/gtm.svg',63), ('GGY','GG','Guernsey','Europa','English','UTC+00:00','https://restcountries.eu/data/ggy.svg',64), ('GNQ','GQ','Guinea Ecuatorial','Africa','Spanish','UTC+01:00','https://restcountries.eu/data/gnq.svg',65), ('GNB','GW','Guiné-Bissau (Guinea-Bisáu)','Africa','Portuguese','UTC','https://restcountries.eu/data/gnb.svg',66), ('GIN','GN','Guinée (Guinea)','Africa','French','UTC','https://restcountries.eu/data/gin.svg',67), ('GUY','GY','Guyana','América','English','UTC-04:00','https://restcountries.eu/data/guy.svg',68), ('GUF','GF','Guyane française (Guayana Francesa)','América','French','UTC-03:00','https://restcountries.eu/data/guf.svg',69), ('HTI','HT','Haïti (Haití)','América','French','UTC-05:00','https://restcountries.eu/data/hti.svg',70), ('HND','HN','Honduras','América','Spanish','UTC-06:00','https://restcountries.eu/data/hnd.svg',72), ('HRV','HR','Hrvatska (Croacia)','Europa','Croatian','UTC+01:00','https://restcountries.eu/data/hrv.svg',73), ('IDN','ID','Indonesia','Asia','Indonesian','UTC+07:00','https://restcountries.eu/data/idn.svg',74), ('ISL','IS','Ísland (Islandia)','Europa','Icelandic','UTC','https://restcountries.eu/data/isl.svg',75), ('FLK','FK','Islas Malvinas','América','English','UTC-04:00','https://restcountries.eu/data/flk.svg',76), ('IMN','IM','Isle of Man (Isla de Man)','Europa','English','UTC+00:00','https://restcountries.eu/data/imn.svg',77), ('ITA','IT','Italia','Europa','Italian','UTC+01:00','https://restcountries.eu/data/ita.svg',78), ('JAM','JM','Jamaica','América','English','UTC-05:00','https://restcountries.eu/data/jam.svg',79), ('JEY','JE','Jersey','Europa','English','UTC+01:00','https://restcountries.eu/data/jey.svg',80), ('GRL','GL','Kalaallit Nunaat (Groenlandia)','América','Kalaallisut','UTC-04:00','https://restcountries.eu/data/grl.svg',81), ('KHM','KH','Kâmpŭchéa (Camboya)','Asia','Khmer','UTC+07:00','https://restcountries.eu/data/khm.svg',82), ('KEN','KE','Kenya (Kenia)','Africa','English','UTC+03:00','https://restcountries.eu/data/ken.svg',83), ('KIR','KI','Kiribati','Oceanía','English','UTC+12:00','https://restcountries.eu/data/kir.svg',84), ('CAF','CF','Ködörösêse tî Bêafrîka (República Centroafricana)','Africa','French','UTC+01:00','https://restcountries.eu/data/caf.svg',85), ('COM','KM','Komori (Comoras)','Africa','Arabic','UTC+03:00','https://restcountries.eu/data/com.svg',86), ('REU','RE','La Réunion (Reunión)','Africa','French','UTC+04:00','https://restcountries.eu/data/reu.svg',87), ('LVA','LV','Latvija (Letonia)','Europa','Latvian','UTC+02:00','https://restcountries.eu/data/lva.svg',88), ('LSO','LS','Lesotho (Lesoto)','Africa','English','UTC+02:00','https://restcountries.eu/data/lso.svg',89), ('LBR','LR','Liberia','Africa','English','UTC','https://restcountries.eu/data/lbr.svg',90), ('LIE','LI','Liechtenstein','Europa','German','UTC+01:00','https://restcountries.eu/data/lie.svg',91), ('LTU','LT','Lietuva (Lituania)','Europa','Lithuanian','UTC+02:00','https://restcountries.eu/data/ltu.svg',92), ('LUX','LU','Luxembourg (Luxemburgo)','Europa','French','UTC+01:00','https://restcountries.eu/data/lux.svg',93), ('MDG','MG','Madagasikara (Madagascar)','Africa','French','UTC+03:00','https://restcountries.eu/data/mdg.svg',94), ('HUN','HU','Magyarország (Hungría)','Europa','Hungarian','UTC+01:00','https://restcountries.eu/data/hun.svg',95), ('MHL','MH','M̧ajeļ (Islas Marshall)','Oceanía','English','UTC+12:00','https://restcountries.eu/data/mhl.svg',96), ('MWI','MW','Malawi (Malaui)','Africa','English','UTC+02:00','https://restcountries.eu/data/mwi.svg',97), ('MYS','MY','Malaysia (Malasia)','Asia','Malaysian','UTC+08:00','https://restcountries.eu/data/mys.svg',98), ('MDV','MV','Maldives (Maldivas)','Asia','Divehi','UTC+05:00','https://restcountries.eu/data/mdv.svg',99), ('MLI','ML','Mali (Malí)','Africa','French','UTC','https://restcountries.eu/data/mli.svg',100), ('MLT','MT','Malta','Europa','Maltese','UTC+01:00','https://restcountries.eu/data/mlt.svg',101), ('MTQ','MQ','Martinique (Martinica)','América','French','UTC-04:00','https://restcountries.eu/data/mtq.svg',102), ('MUS','MU','Maurice (Mauricio)','Africa','English','UTC+04:00','https://restcountries.eu/data/mus.svg',103), ('MYT','YT','Mayotte','Africa','French','UTC+03:00','https://restcountries.eu/data/myt.svg',104), ('MEX','MX','México','América','Spanish','UTC-08:00','https://restcountries.eu/data/mex.svg',105), ('FSM','FM','Micronesia','Oceanía','English','UTC+10:00','https://restcountries.eu/data/fsm.svg',106), ('MOZ','MZ','Moçambique (Mozambique)','Africa','Portuguese','UTC+02:00','https://restcountries.eu/data/moz.svg',107), ('MDA','MD','Moldova (Moldavia)','Europa','Romanian','UTC+02:00','https://restcountries.eu/data/mda.svg',108), ('MCO','MC','Monaco (Mónaco)','Europa','French','UTC+01:00','https://restcountries.eu/data/mco.svg',109), ('MSR','MS','Montserrat','América','English','UTC-04:00','https://restcountries.eu/data/msr.svg',110), ('MMR','MM','Myanma (Myanmar)','Asia','Burmese','UTC+06:30','https://restcountries.eu/data/mmr.svg',111), ('NAM','NA','Namibia','Africa','English','UTC+01:00','https://restcountries.eu/data/nam.svg',112), ('NRU','NR','Nauru','Oceanía','English','UTC+12:00','https://restcountries.eu/data/nru.svg',113), ('NLD','NL','Nederland (Países Bajos)','Europa','Dutch','UTC-04:00','https://restcountries.eu/data/nld.svg',114), ('BRN','BN','Negara Brunei Darussalam (Brunéi)','Asia','Malay','UTC+08:00','https://restcountries.eu/data/brn.svg',115), ('NZL','NZ','New Zealand (Nueva Zelanda)','Oceanía','English','UTC-11:00','https://restcountries.eu/data/nzl.svg',116), ('NIC','NI','Nicaragua','América','Spanish','UTC-06:00','https://restcountries.eu/data/nic.svg',117), ('NER','NE','Niger (Níger)','Africa','French','UTC+01:00','https://restcountries.eu/data/ner.svg',118), ('NGA','NG','Nigeria','Africa','English','UTC+01:00','https://restcountries.eu/data/nga.svg',119), ('NIU','NU','Niuē (Niue)','Oceanía','English','UTC-11:00','https://restcountries.eu/data/niu.svg',120), ('NFK','NF','Norfolk Island (Isla Norfolk)','Oceanía','English','UTC+11:30','https://restcountries.eu/data/nfk.svg',121), ('NOR','NO','Norge (Noruega)','Europa','Norwegian','UTC+01:00','https://restcountries.eu/data/nor.svg',122), ('MNP','MP','Northern Mariana Islands (Islas Marianas del Norte)','Oceanía','English','UTC+10:00','https://restcountries.eu/data/mnp.svg',123), ('NCL','NC','Nouvelle-Calédonie (Nueva Caledonia)','Oceanía','French','UTC+11:00','https://restcountries.eu/data/ncl.svg',124), ('UZB','UZ','Ozbekiston (Uzbekistán)','Asia','Uzbek','UTC+05:00','https://restcountries.eu/data/uzb.svg',125), ('AUT','AT','Österreich (Austria)','Europa','German','UTC+01:00','https://restcountries.eu/data/aut.svg',126), ('PAK','PK','Pakistan (Pakistán)','Asia','English','UTC+05:00','https://restcountries.eu/data/pak.svg',127), ('PLW','PW','Palau (Palaos)','Oceanía','English','UTC+09:00','https://restcountries.eu/data/plw.svg',128), ('PAN','PA','Panamá','América','Spanish','UTC-05:00','https://restcountries.eu/data/pan.svg',129), ('PNG','PG','Papua Niugini (Papúa Nueva Guinea)','Oceanía','English','UTC+10:00','https://restcountries.eu/data/png.svg',130), ('PRY','PY','Paraguay','América','Spanish','UTC-04:00','https://restcountries.eu/data/pry.svg',131), ('PER','PE','Perú','América','Spanish','UTC-05:00','https://restcountries.eu/data/per.svg',132), ('PHL','PH','Pilipinas (Filipinas)','Asia','English','UTC+08:00','https://restcountries.eu/data/phl.svg',133), ('PCN','PN','Pitcairn Islands (Islas Pitcairn)','Oceanía','English','UTC-08:00','https://restcountries.eu/data/pcn.svg',134), ('POL','PL','Polska (Polonia)','Europa','Polish','UTC+01:00','https://restcountries.eu/data/pol.svg',135), ('PYF','PF','Polynésie française (Polinesia Francesa)','Oceanía','French','UTC-10:00','https://restcountries.eu/data/pyf.svg',136), ('PRT','PT','Portugal','Europa','Portuguese','UTC-01:00','https://restcountries.eu/data/prt.svg',137), ('PRI','PR','Puerto Rico','América','Spanish','UTC-04:00','https://restcountries.eu/data/pri.svg',138), ('DOM','DO','República Dominicana','América','Spanish','UTC-04:00','https://restcountries.eu/data/dom.svg',139), ('KOS','XK','Republika e Kosovës (República de Kosovo)','Europe','Albanian','UTC+01:00','https://restcountries.eu/data/kos.svg',140), ('COD','CD','République démocratique du Congo (Congo)','Africa','French','UTC+01:00','https://restcountries.eu/data/cod.svg',141), ('COG','CG','République du Congo (República del Congo)','Africa','French','UTC+01:00','https://restcountries.eu/data/cog.svg',142), ('ROU','RO','România (Rumania)','Europa','Romanian','UTC+02:00','https://restcountries.eu/data/rou.svg',143), ('RWA','RW','Rwanda (Ruanda)','Africa','Kinyarwanda','UTC+02:00','https://restcountries.eu/data/rwa.svg',144), ('SHN','SH','Saint Helena (Santa Elena, Ascensión y Tristán de Acuña)','Africa','English','UTC+00:00','https://restcountries.eu/data/shn.svg',145), ('KNA','KN','Saint Kitts and Nevis (San Cristóbal y Nieves)','América','English','UTC-04:00','https://restcountries.eu/data/kna.svg',146), ('LCA','LC','Saint Lucia (Santa Lucía)','América','English','UTC-04:00','https://restcountries.eu/data/lca.svg',147), ('VCT','VC','Saint Vincent and the Grenadines (San Vicente y las Granadinas)','América','English','UTC-04:00','https://restcountries.eu/data/vct.svg',148), ('BLM','BL','Saint-Barthélemy (San Bartolomé)','América','French','UTC-04:00','https://restcountries.eu/data/blm.svg',149), ('MAF','MF','Saint-Martin (San Martín)','América','English','UTC-04:00','https://restcountries.eu/data/maf.svg',150), ('SPM','PM','Saint-Pierre-et-Miquelon (San Pedro y Miquelón)','América','French','UTC-03:00','https://restcountries.eu/data/spm.svg',151), ('WSM','WS','Samoa','Oceanía','Samoan','UTC+13:00','https://restcountries.eu/data/wsm.svg',152), ('SMR','SM','San Marino','Europa','Italian','UTC+01:00','https://restcountries.eu/data/smr.svg',153), ('VAT','VA','Sancta Sedes (Ciudad del Vaticano)','Europa','Latin','UTC+01:00','https://restcountries.eu/data/vat.svg',154), ('STP','ST','São Tomé e Príncipe (Santo Tomé y Príncipe)','Africa','Portuguese','UTC','https://restcountries.eu/data/stp.svg',155), ('CHE','CH','Schweiz (Suiza)','Europa','German','UTC+01:00','https://restcountries.eu/data/che.svg',156), ('SEN','SN','Sénégal (Senegal)','Africa','French','UTC','https://restcountries.eu/data/sen.svg',157), ('SYC','SC','Seychelles','Africa','French','UTC+04:00','https://restcountries.eu/data/syc.svg',158), ('ALB','AL','Shqipëria (Albania)','Europa','Albanian','UTC+01:00','https://restcountries.eu/data/alb.svg',159), ('SLE','SL','Sierra Leone (Sierra Leona)','Africa','English','UTC','https://restcountries.eu/data/sle.svg',160), ('SGP','SG','Singapore (Singapur)','Asia','English','UTC+08:00','https://restcountries.eu/data/sgp.svg',161), ('SXM','SX','Sint Maarten (San Martín)','América','Dutch','UTC-04:00','https://restcountries.eu/data/sxm.svg',162), ('SVN','SI','Slovenija (Eslovenia)','Europa','Slovene','UTC+01:00','https://restcountries.eu/data/svn.svg',163), ('SVK','SK','Slovensko (Eslovaquia)','Europa','Slovak','UTC+01:00','https://restcountries.eu/data/svk.svg',164), ('SLB','SB','Solomon Islands (Islas Salomón)','Oceanía','English','UTC+11:00','https://restcountries.eu/data/slb.svg',165), ('SOM','SO','Soomaaliya (Somalia)','Africa','Somali','UTC+03:00','https://restcountries.eu/data/som.svg',166), ('ZAF','ZA','South Africa (Sudáfrica)','Africa','Afrikaans','UTC+02:00','https://restcountries.eu/data/zaf.svg',167), ('SGS','GS','South Georgia (Islas Georgias y Sandwich del Sur)','América','English','UTC-02:00','https://restcountries.eu/data/sgs.svg',168), ('SSD','SS','South Sudan (Sudán del Sur)','Africa','English','UTC+03:00','https://restcountries.eu/data/ssd.svg',169), ('LKA','LK','śrī laṃkāva (Sri Lanka)','Asia','Sinhalese','UTC+05:30','https://restcountries.eu/data/lka.svg',170), ('FIN','FI','Suomi (Finlandia)','Europa','Finnish','UTC+02:00','https://restcountries.eu/data/fin.svg',171), ('SUR','SR','Suriname (Surinam)','América','Dutch','UTC-03:00','https://restcountries.eu/data/sur.svg',172), ('SJM','SJ','Svalbard og Jan Mayen (Svalbard y Jan Mayen)','Europa','Norwegian','UTC+01:00','https://restcountries.eu/data/sjm.svg',173), ('SWE','SE','Sverige (Suecia)','Europa','Swedish','UTC+01:00','https://restcountries.eu/data/swe.svg',174), ('SWZ','SZ','Swaziland (Suazilandia)','Africa','English','UTC+02:00','https://restcountries.eu/data/swz.svg',175), ('TZA','TZ','Tanzania','Africa','Swahili','UTC+03:00','https://restcountries.eu/data/tza.svg',176), ('TLS','TL','Timor-Leste (Timor Oriental)','Asia','Portuguese','UTC+09:00','https://restcountries.eu/data/tls.svg',179), ('TGO','TG','Togo','Africa','French','UTC','https://restcountries.eu/data/tgo.svg',180), ('TKL','TK','Tokelau','Oceanía','English','UTC+13:00','https://restcountries.eu/data/tkl.svg',181), ('TON','TO','Tonga','Oceanía','English','UTC+13:00','https://restcountries.eu/data/ton.svg',182), ('TTO','TT','Trinidad and Tobago (Trinidad y Tobago)','América','English','UTC-04:00','https://restcountries.eu/data/tto.svg',183), ('TUR','TR','Türkiye (Turquía)','Asia','Turkish','UTC+03:00','https://restcountries.eu/data/tur.svg',184), ('TKM','TM','Türkmenistan (Turkmenistán)','Asia','Turkmen','UTC+05:00','https://restcountries.eu/data/tkm.svg',185), ('TCA','TC','Turks and Caicos Islands (Islas Turcas y Caicos)','América','English','UTC-04:00','https://restcountries.eu/data/tca.svg',186), ('TUV','TV','Tuvalu','Oceanía','English','UTC+12:00','https://restcountries.eu/data/tuv.svg',187), ('UGA','UG','Uganda','Africa','English','UTC+03:00','https://restcountries.eu/data/uga.svg',188), ('GBR','GB','United Kingdom (Reino Unido)','Europa','English','UTC-08:00','https://restcountries.eu/data/gbr.svg',189), ('USA','US','United States (Estados Unidos)','América','English','UTC-12:00','https://restcountries.eu/data/usa.svg',190), ('UMI','UM','United States Minor Outlying Islands (Islas Ultramarinas Menores de EE.UU.)','América','English','UTC-11:00','https://restcountries.eu/data/umi.svg',191), ('URY','UY','Uruguay','América','Spanish','UTC-03:00','https://restcountries.eu/data/ury.svg',192), ('VUT','VU','Vanuatu','Oceanía','Bislama','UTC+11:00','https://restcountries.eu/data/vut.svg',193), ('VEN','VE','Venezuela','América','Spanish','UTC-04:00','https://restcountries.eu/data/ven.svg',194), ('VNM','VN','Việt Nam (Vietnam)','Asia','Vietnamese','UTC+07:00','https://restcountries.eu/data/vnm.svg',195), ('VIR','VI','Virgin Islands of the United States (Islas Vírgenes de EE.UU.)','América','English','UTC-04:00','https://restcountries.eu/data/vir.svg',196), ('WLF','WF','Wallis et Futuna (Wallis y Futuna)','Oceanía','French','UTC+12:00','https://restcountries.eu/data/wlf.svg',197), ('ZMB','ZM','Zambia','Africa','English','UTC+02:00','https://restcountries.eu/data/zmb.svg',198), ('ZWE','ZW','Zimbabwe (Zimbabue)','Africa','English','UTC+02:00','https://restcountries.eu/data/zwe.svg',199), ('GRC','GR','Ελλάδα (Grecia)','Europa','Greek (modern)','UTC+02:00','https://restcountries.eu/data/grc.svg',200), ('CYP','CY','Κύπρος (Chipre)','Europa','Greek (modern)','UTC+02:00','https://restcountries.eu/data/cyp.svg',201), ('BLR','BY','Белару́сь (Bielorrusia)','Europa','Belarusian','UTC+03:00','https://restcountries.eu/data/blr.svg',202), ('BGR','BG','България (Bulgaria)','Europa','Bulgarian','UTC+02:00','https://restcountries.eu/data/bgr.svg',203), ('KGZ','KG','Кыргызстан (Kirguistán)','Asia','Kyrgyz','UTC+06:00','https://restcountries.eu/data/kgz.svg',204), ('KAZ','KZ','Қазақстан (Kazajistán)','Asia','Kazakh','UTC+05:00','https://restcountries.eu/data/kaz.svg',205), ('MKD','MK','Македонија (Macedonia del Norte)','Europa','Macedonian','UTC+01:00','https://restcountries.eu/data/mkd.svg',206), ('MNG','MN','Монгол улс (Mongolia)','Asia','Mongolian','UTC+07:00','https://restcountries.eu/data/mng.svg',207), ('RUS','RU','Россия (Rusia)','Europa','Russian','UTC+03:00','https://restcountries.eu/data/rus.svg',208), ('SRB','RS','Србија (Serbia)','Europa','Serbian','UTC+01:00','https://restcountries.eu/data/srb.svg',209), ('TJK','TJ','Тоҷикистон (Tayikistán)','Asia','Tajik','UTC+05:00','https://restcountries.eu/data/tjk.svg',210), ('UKR','UA','Україна (Ucrania)','Europa','Ukrainian','UTC+02:00','https://restcountries.eu/data/ukr.svg',211), ('MNE','ME','Црна Гора (Montenegro)','Europa','Serbian','UTC+01:00','https://restcountries.eu/data/mne.svg',212), ('ARM','AM','Հայաստան (Armenia)','Asia','Armenian','UTC+04:00','https://restcountries.eu/data/arm.svg',213), ('GEO','GE','საქართველო (Georgia)','Asia','Georgian','UTC-05:00','https://restcountries.eu/data/geo.svg',214), ('ISR','IL','יִשְׂרָאֵל (Israel)','Asia','Hebrew (modern)','UTC+02:00','https://restcountries.eu/data/isr.svg',215), ('AFG','AF','افغانستان (Afganistán)','Asia','Pashto','UTC+04:30','https://restcountries.eu/data/afg.svg',216), ('JOR','JO','الأردن (Jordania)','Asia','Arabic','UTC+03:00','https://restcountries.eu/data/jor.svg',217), ('BHR','BH','‏البحرين (Baréin)','Asia','Arabic','UTC+03:00','https://restcountries.eu/data/bhr.svg',218), ('DZA','DZ','الجزائر (Argelia)','Africa','Arabic','UTC+01:00','https://restcountries.eu/data/dza.svg',219), ('SDN','SD','السودان (Sudán)','Africa','Arabic','UTC+03:00','https://restcountries.eu/data/sdn.svg',220), ('ESH','EH','الصحراء الغربية (República Árabe Saharaui Democrática)','Africa','Arabic','UTC+00:00','https://restcountries.eu/data/esh.svg',221), ('IRQ','IQ','العراق (Irak)','Asia','Arabic','UTC+03:00','https://restcountries.eu/data/irq.svg',222), ('SAU','SA','العربية السعودية (Arabia Saudita)','Asia','Arabic','UTC+03:00','https://restcountries.eu/data/sau.svg',223), ('KWT','KW','الكويت (Kuwait)','Asia','Arabic','UTC+03:00','https://restcountries.eu/data/kwt.svg',224), ('MAR','MA','المغرب (Marruecos)','Africa','Arabic','UTC','https://restcountries.eu/data/mar.svg',225), ('YEM','YE','اليَمَن (Yemen)','Asia','Arabic','UTC+03:00','https://restcountries.eu/data/yem.svg',226), ('IRN','IR','ایران (Irán)','Asia','Persian (Farsi)','UTC+03:30','https://restcountries.eu/data/irn.svg',227), ('TUN','TN','تونس (Túnez)','Africa','Arabic','UTC+01:00','https://restcountries.eu/data/tun.svg',228), ('ARE','AE','دولة الإمارات العربية المتحدة (Emiratos Árabes Unidos)','Asia','Arabic','UTC+04','https://restcountries.eu/data/are.svg',229), ('SYR','SY','سوريا (Siria)','Asia','Arabic','UTC+02:00','https://restcountries.eu/data/syr.svg',230), ('OMN','OM','عمان (Omán)','Asia','Arabic','UTC+04:00','https://restcountries.eu/data/omn.svg',231), ('PSE','PS','فلسطين (Palestina)','Asia','Arabic','UTC+02:00','https://restcountries.eu/data/pse.svg',232), ('QAT','QA','قطر (Catar)','Asia','Arabic','UTC+03:00','https://restcountries.eu/data/qat.svg',233), ('LBN','LB','لبنان (Líbano)','Asia','Arabic','UTC+02:00','https://restcountries.eu/data/lbn.svg',234), ('LBY','LY','‏ليبيا (Libia)','Africa','Arabic','UTC+01:00','https://restcountries.eu/data/lby.svg',235), ('EGY','EG','مصر‎ (Egipto)','Africa','Arabic','UTC+02:00','https://restcountries.eu/data/egy.svg',236), ('MRT','MR','موريتانيا (Mauritania)','Africa','Arabic','UTC','https://restcountries.eu/data/mrt.svg',237), ('NPL','NP','नेपाल (Nepal)','Asia','Nepali','UTC+05:45','https://restcountries.eu/data/npl.svg',238), ('IND','IN','भारत (India)','Asia','Hindi','UTC+05:30','https://restcountries.eu/data/ind.svg',239), ('THA','TH','ประเทศไทย (Tailandia)','Asia','Thai','UTC+07:00','https://restcountries.eu/data/tha.svg',240), ('LAO','LA','ສປປລາວ (Laos)','Asia','Lao','UTC+07:00','https://restcountries.eu/data/lao.svg',241), ('ETH','ET','ኢትዮጵያ (Etiopía)','Africa','Amharic','UTC+03:00','https://restcountries.eu/data/eth.svg',242), ('ERI','ER','ኤርትራ (Eritrea)','Africa','Tigrinya','UTC+03:00','https://restcountries.eu/data/eri.svg',243), ('KOR','KR','대한민국 (Corea del Sur)','Asia','Korean','UTC+09:00','https://restcountries.eu/data/kor.svg',244), ('PRK','KP','북한 (Corea del Norte)','Asia','Korean','UTC+09:00','https://restcountries.eu/data/prk.svg',245), ('CHN','CN','中国 (China)','Asia','Chinese','UTC+08:00','https://restcountries.eu/data/chn.svg',246), ('JPN','JP','日本 (Japón)','Asia','Japanese','UTC+09:00','https://restcountries.eu/data/jpn.svg',247), ('MAC','MO','澳門 (Macao)','Asia','Chinese','UTC+08:00','https://restcountries.eu/data/mac.svg',248), ('TWN','TW','臺灣 (Taiwán (República de China))','Asia','Chinese','UTC+08:00','https://restcountries.eu/data/twn.svg',249), ('HKG','HK','香港 (Hong Kong)','Asia','English','UTC+08:00','https://restcountries.eu/data/hkg.svg',250), ('AC ','AC','América','América','-','-','-',300), ('EU ','EU','Europa','Europa','-','-','-',301), ('AA ','AA','Africa','Africa','-','-','-',302), ('AB ','AB','Asia','Asia','-','-','-',303), ('OC ','OC','Oceanía','Oceanía','-','-','-',304), ('OT ','OT','Otro lugar','Otro lugar','-','-','-',305)
;
INSERT INTO USUARIOS (id, email, contrasena, status_registro_usuario_id, rol_usuario_id, nombre, apellido, apodo, avatar, fecha_nacimiento, sexo_id, pais_id, estado_eclesial_id, creado_en, completado_en)
VALUES (1, 'diegoiribarren2015@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 4, 4, 'Diego', 'Iribarren', 'Diego', '1617370359746.jpg', '1969-08-16', 'M', 'AR', 'LA', '2021-03-26', '2021-03-26'),(2, 'sp2015w@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 4, 2, 'Diego', 'Iribarren', 'Diego', '1617370359746.jpg', '1969-08-16', 'M', 'AR', 'LA', '2021-03-26', '2021-03-26')
;
INSERT INTO penalizaciones_motivos (id, nombre, duracion, comentario)
VALUES (1, 'Ofensivo', 365, 'Pornografía, mofarse de la religión católica, grosería, etc.'), (2, 'Spam', 365, 'Material ajeno a nuestro perfil')
;
INSERT INTO categorias (id, nombre)
VALUES ('CFC', 'Centradas en la Fe Católica'), ('VPC', 'Valores Presentes en la Cultura')
;
INSERT INTO categorias_sub (id, categoria_id, nombre, url)
VALUES (1, 'CFC', 'Jesús', 'cfc/jesus'), (2, 'CFC', 'Contemporáneos de Jesús', 'cfc/contemporaneos'), (3, 'CFC', 'Apariciones Marianas', 'cfc/marianas'), (4, 'CFC', 'Hagiografías', 'cfc/hagiografias'), (5, 'CFC', 'Historias de la Iglesia', 'cfc/historias'), (6, 'CFC', 'Novelas centradas en la fe', 'cfc/novelas'), (7, 'CFC', 'Colecciones', 'cfc/colecciones'), (8, 'CFC', 'Documentales', 'cfc/documentales'), (11, 'VPC', 'Biografías e Historias', 'vpc/bios_historias'), (12, 'VPC', 'Matrimonio y Familia', 'vpc/matrimonio'), (13, 'VPC', 'Novelas', 'vpc/novelas'), (14, 'VPC', 'Musicales', 'vpc/musicales'), (15, 'VPC', 'Colecciones', 'vpc/colecciones')
;
INSERT INTO listado_peliculas (id, nombre, url)
VALUES (1, 'Sugeridas para el momento del año', 'listado/sugeridas'), (2, 'Por orden de calificación en nuestra página', 'listado/calificacion'), (3, 'Por año de estreno', 'listado/estreno'), (4, 'Por orden de incorporación a nuestra base de datos', 'listado/incorporacion'), (5, 'Por orden de visita', 'listado/visita')
;
INSERT INTO menu_opciones (id, nombre, url, titulo, vista, comentario)
VALUES 
(1, 'Listado de Películas', 'listado', 'Listado', '1-Listado', 'Todas las películas de nuestra Base de Datos'),
(2, 'Un paseo por CFC', 'cfc', 'CFC', '2-CFC', 'Películas Centradas en la Fe Católica (CFC)'),
(3, 'Un paseo por VPC', 'vpc', 'VPC', '3-VPC', 'Películas con Valores Presentes en nuestra Cultura (VPC)')
;
INSERT INTO publicos_recomendados (id, nombre)
VALUES (1, 'Está dirigido a un público infantil, no se recomienda para mayores'), (2, 'Es apto para mayores, pero se recomienda para menores (se puede ver en familia)'), (3, 'Es ideal para ver en familia'), (4, 'Es apto para menores, pero se recomienda para mayores (se puede ver en familia)'), (5, 'No es apto para menores, sólo para mayores')
;
INSERT INTO personajes_historicos (id, nombre)
VALUES (1, 'Juan Pablo II (papa)')
;
INSERT INTO hechos_historicos (id, nombre)
VALUES (1, '2a Guerra Mundial')
;
INSERT INTO colecciones_cabecera (id, rubro, nombre_original, nombre_castellano, pais_id, sinopsis)
VALUES (1, 'manual', 'Karol', 'Karol', 'IT', 'Narra la historia del Papa Juan Pablo II. La primera película transcurre durante su vida anterior al papado: la II Guerra Mundial, el comunismo, su seminario en forma clandestino porque estaba prohibido por los nazis, su nombramiento como obispo y cardenal, su formación de la juventud de su pueblo, su intención de preservar la cultura polaca durante el sometimiento alemán y luego ruso. La segunda película muestra su vida durante el papado. El atentado contra su vida, sus viajes apostólicos, el encuentro con sus seres queridos.')
;
INSERT INTO colecciones_peliculas (id, coleccion_id, pelicula_id, tmdb_id, nombre_original, nombre_castellano, ano_estreno, orden_secuencia)
VALUES (1, 1, 1, '38516', 'Karol - Un uomo diventato Papa', 'Karol, el hombre que llegó a ser Papa', 2005, 1)
;
INSERT INTO colecciones_peliculas (id, coleccion_id, nombre_original, nombre_castellano, ano_estreno, orden_secuencia)
VALUES (2, 1, 'Karol, un Papa rimasto uomo', 'Karol II. El Papa, el hombre', 2006, 2)
;
INSERT INTO fe_valores (id, nombre)
VALUES (1, 'No'), (2, 'Poco'), (3, 'Sí'), (4, 'Mucho'), (5, 'Deja una huella en mí')
;
INSERT INTO entretiene (id, nombre)
VALUES (1, 'No'), (2, 'Poco'), (3, 'Sí'), (4, 'Mucho')
;
INSERT INTO calidad_filmica (id, nombre)
VALUES (1, 'Es precaria'), (2, 'No perjudica el disfrute'), (3, 'Acompaña el disfrute')
;
INSERT INTO interes_en_la_pelicula (id, nombre)
VALUES (1, 'Recordame que quiero verla'), (2, 'Ya la vi'), (3, 'Prefiero que no me la recomienden')
;
INSERT INTO epocas_estreno (id, nombre, ano_comienzo, ano_fin)
VALUES (1, 'Antes de 1970', 1900, 1969), (2, '1970 - 1999', 1970, 1999), (3, '2000 - 2014', 2000, 2014), (4, '2015 - Presente', 2015, 2025)
;
INSERT INTO eventos (id, nombre, fecha)
VALUES (1, 'San Juan Pablo II', '22/oct')
;
INSERT INTO PELICULAS (id, tmdb_id, fa_id, imdb_id, nombre_original, nombre_castellano, coleccion_pelicula_id, duracion, ano_estreno, pais_id, avatar, idioma_castellano, color, publico_recomendado_id, categoria_id, subcategoria_id, personaje_historico_id, hecho_historico_id, sugerida_para_evento_id, sinopsis, creada_por_id, creada_en, analizada_por_id, analizada_en, aprobada, director, guion, musica, actores, productor)
VALUES (1, '38516', '436804', 'tt0435100', 'Karol - Un uomo diventato Papa', 'Karol, el hombre que llegó a ser Papa', 1, 195, 2005, 'IT', 'https://image.tmdb.org/t/p/original/xVqMG4KcTXhkhL65yohBpjbkY65.jpg', true, true, 5, 'CFC', 4, 1, 1, 1, 'Miniserie biográfica sobre Juan Pablo II. En su juventud, en Polonia bajo la ocupación nazi, Karol Wojtyla trabajó en una cantera de caliza para poder sobrevivir. La represión nazi causó numerosas víctimas no sólo entre los judíos, sino también entre los católicos. Es entonces cuando Karol decide responder a la llamada divina.', 1, '2021-04-23', 2, '2021-04-23', 1, 'Giacomo Battiato', 'Giacomo Battiato', 'Ennio Morricone', 'Piotr Adamczyk (Karol Wojtyla), Małgorzata Bela (Hanna Tuszynska), Ken Duken (Adam Zielinski), Hristo Shopov (Julian Kordek), Ennio Fantastichini (Maciej Nowak), Violante Placido (Maria Pomorska), Matt Craven (Hans Frank), Raoul Bova (padre Tomasz Zaleski), Lech Mackiewicz (card. Stefan Wyszy?ski), Patrycja Soliman (Wislawa)', 'Taodue Film')
;
INSERT INTO us_pel_calificaciones (id, usuario_id, pelicula_id, fe_valores_id, entretiene_id, calidad_filmica_id)
VALUES (1, 1, 1, 5, 4, 3)
;
INSERT INTO us_pel_interes_en_la_pelicula (id, usuario_id, pelicula_id, interes_en_la_pelicula_id)
VALUES (1, 1, 1, 2)
;
