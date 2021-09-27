DROP DATABASE IF EXISTS ELC_Peliculas;
CREATE DATABASE ELC_Peliculas;
USE ELC_Peliculas;

CREATE TABLE paises (
	id VARCHAR(2) NOT NULL UNIQUE,
	alpha3code VARCHAR(3) NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	continente VARCHAR(20) NOT NULL,
	idioma VARCHAR(50) NOT NULL,
	zona_horaria VARCHAR(10) NOT NULL,
	bandera VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO paises (id, alpha3Code, nombre, continente , idioma , zona_horaria, bandera)
VALUES ('AX','ALA','Åland','Europa','Swedish','+02:00','https://restcountries.eu/data/ala.svg'), ('AS','ASM','Samoa Americana','Oceanía','English','-11:00','https://restcountries.eu/data/asm.svg'), ('AD','AND','Andorra','Europa','Catalan','+01:00','https://restcountries.eu/data/and.svg'), ('AO','AGO','Angola','Africa','Portuguese','+01:00','https://restcountries.eu/data/ago.svg'), ('AI','AIA','Anguila','América','English','-04:00','https://restcountries.eu/data/aia.svg'), ('AQ','ATA','Antártida','Polar','English','-03:00','https://restcountries.eu/data/ata.svg'), ('AG','ATG','Antigua y Barbuda','América','English','-04:00','https://restcountries.eu/data/atg.svg'), ('AR','ARG','Argentina','América','Spanish','-03:00','https://restcountries.eu/data/arg.svg'), ('AW','ABW','Aruba','América','Dh','-04:00','https://restcountries.eu/data/abw.svg'), ('AU','AUS','Australia','Oceanía','English','+05:00','https://restcountries.eu/data/aus.svg'), ('AZ','AZE','Azerbaiyán','Asia','Azerbaijani','+04:00','https://restcountries.eu/data/aze.svg'), ('BS','BHS','Bahamas','América','English','-05:00','https://restcountries.eu/data/bhs.svg'), ('BD','BGD','Bangladés','Asia','Bengali','+06:00','https://restcountries.eu/data/bgd.svg'), ('BB','BRB','Barbados','América','English','-04:00','https://restcountries.eu/data/brb.svg'), ('BE','BEL','Bélgica','Europa','Dh','+01:00','https://restcountries.eu/data/bel.svg'), ('BZ','BLZ','Belice','América','English','-06:00','https://restcountries.eu/data/blz.svg'), ('BJ','BEN','Benín','Africa','French','+01:00','https://restcountries.eu/data/ben.svg'), ('BM','BMU','Bermudas','América','English','-04:00','https://restcountries.eu/data/bmu.svg'), ('BO','BOL','Bolivia','América','Spanish','-04:00','https://restcountries.eu/data/bol.svg'), ('BQ','BES','Bonaire, San Eustaquio y Saba','América','Dh','-04:00','https://restcountries.eu/data/bes.svg'), ('BA','BIH','Bosnia y Herzegovina','Europa','Bosnian','+01:00','https://restcountries.eu/data/bih.svg'), ('BW','BWA','Botswana','Africa','English','+02:00','https://restcountries.eu/data/bwa.svg'), ('BV','BVT','Isla Bouvet','Polar','Norwegian','+01:00','https://restcountries.eu/data/bvt.svg'), ('BR','BRA','Brasil','América','Portuguese','-05:00','https://restcountries.eu/data/bra.svg'), ('IO','IOT','Territorio Británico Índico','Africa','English','+06:00','https://restcountries.eu/data/iot.svg'), ('VG','VGB','Islas Vírgenes Británicas','América','English','-04:00','https://restcountries.eu/data/vgb.svg'), ('BT','BTN','Bután','Asia','Dzongkha','+06:00','https://restcountries.eu/data/btn.svg'), ('BF','BFA','Burkina Faso','Africa','French','','https://restcountries.eu/data/bfa.svg'), ('BI','BDI','Burundi','Africa','French','+02:00','https://restcountries.eu/data/bdi.svg'), ('CV','CPV','Cabo Verde','Africa','Portuguese','-01:00','https://restcountries.eu/data/cpv.svg'), ('CM','CMR','Camerún','Africa','English','+01:00','https://restcountries.eu/data/cmr.svg'), ('CA','CAN','Canadá','América','English','-08:00','https://restcountries.eu/data/can.svg'), ('KY','CYM','Islas Caimán','América','English','-05:00','https://restcountries.eu/data/cym.svg'), ('CZ','CZE','República Checa','Europa','Czech','+01:00','https://restcountries.eu/data/cze.svg'), ('CL','CHL','Chile','América','Spanish','-06:00','https://restcountries.eu/data/chl.svg'), ('CX','CXR','Isla de Navidad','Oceanía','English','+07:00','https://restcountries.eu/data/cxr.svg'), ('CC','CCK','Islas Cocos','Oceanía','English','+06:30','https://restcountries.eu/data/cck.svg'), ('CO','COL','Colombia','América','Spanish','-05:00','https://restcountries.eu/data/col.svg'), ('CK','COK','Islas Cook','Oceanía','English','-10:00','https://restcountries.eu/data/cok.svg'), ('CR','CRI','Costa Rica','América','Spanish','-06:00','https://restcountries.eu/data/cri.svg'), ('CI','CIV','Costa de Marfil','Africa','French','','https://restcountries.eu/data/civ.svg'), ('CU','CUB','Cuba','América','Spanish','-05:00','https://restcountries.eu/data/cub.svg'), ('CW','CUW','Curazao','América','Dh','-04:00','https://restcountries.eu/data/cuw.svg'), ('DK','DNK','Dinamarca','Europa','Danish','-04:00','https://restcountries.eu/data/dnk.svg'), ('DE','DEU','Alemania','Europa','German','+01:00','https://restcountries.eu/data/deu.svg'), ('DJ','DJI','Yibuti','Africa','French','+03:00','https://restcountries.eu/data/dji.svg'), ('DM','DMA','Dominica','América','English','-04:00','https://restcountries.eu/data/dma.svg'), ('EC','ECU','Ecuador','América','Spanish','-06:00','https://restcountries.eu/data/ecu.svg'), ('EE','EST','Estonia','Europa','Estonian','+02:00','https://restcountries.eu/data/est.svg'), ('IE','IRL','Irlanda','Europa','Irish','','https://restcountries.eu/data/irl.svg'), ('SV','SLV','El Salvador','América','Spanish','-06:00','https://restcountries.eu/data/slv.svg'), ('ES','ESP','España','Europa','Spanish','','https://restcountries.eu/data/esp.svg'), ('FJ','FJI','Fiyi','Oceanía','English','+12:00','https://restcountries.eu/data/fji.svg'), ('FO','FRO','Islas Feroe','Europa','Faroese','+00:00','https://restcountries.eu/data/fro.svg'), ('FR','FRA','Francia','Europa','French','-10:00','https://restcountries.eu/data/fra.svg'), ('GA','GAB','Gabón','Africa','French','+01:00','https://restcountries.eu/data/gab.svg'), ('GM','GMB','Gambia','Africa','English','+00:00','https://restcountries.eu/data/gmb.svg'), ('GH','GHA','Ghana','Africa','English','','https://restcountries.eu/data/gha.svg'), ('GI','GIB','Gibraltar','Europa','English','+01:00','https://restcountries.eu/data/gib.svg'), ('GD','GRD','Granada','América','English','-04:00','https://restcountries.eu/data/grd.svg'), ('GP','GLP','Guadalupe','América','French','-04:00','https://restcountries.eu/data/glp.svg'), ('GU','GUM','Guam','Oceanía','English','+10:00','https://restcountries.eu/data/gum.svg'), ('GT','GTM','Guatemala','América','Spanish','-06:00','https://restcountries.eu/data/gtm.svg'), ('GG','GGY','Guernsey','Europa','English','+00:00','https://restcountries.eu/data/ggy.svg'), ('GQ','GNQ','Guinea Ecuatorial','Africa','Spanish','+01:00','https://restcountries.eu/data/gnq.svg'), ('GW','GNB','Guinea-Bisáu','Africa','Portuguese','','https://restcountries.eu/data/gnb.svg'), ('GN','GIN','Guinea','Africa','French','','https://restcountries.eu/data/gin.svg'), ('GY','GUY','Guyana','América','English','-04:00','https://restcountries.eu/data/guy.svg'), ('GF','GUF','Guayana Francesa','América','French','-03:00','https://restcountries.eu/data/guf.svg'), ('HT','HTI','Haití','América','French','-05:00','https://restcountries.eu/data/hti.svg'), ('HM','HMD','Islas Heard y McDonald','Oceanía','English','+05:00','https://restcountries.eu/data/hmd.svg'), ('HN','HND','Honduras','América','Spanish','-06:00','https://restcountries.eu/data/hnd.svg'), ('HR','HRV','Croacia','Europa','Croatian','+01:00','https://restcountries.eu/data/hrv.svg'), ('ID','IDN','Indonesia','Asia','Indonesian','+07:00','https://restcountries.eu/data/idn.svg'), ('IS','ISL','Islandia','Europa','Icelandic','','https://restcountries.eu/data/isl.svg'), ('FK','FLK','Islas Malvinas','América','English','-04:00','https://restcountries.eu/data/flk.svg'), ('IM','IMN','Isla de Man','Europa','English','+00:00','https://restcountries.eu/data/imn.svg'), ('IT','ITA','Italia','Europa','Italian','+01:00','https://restcountries.eu/data/ita.svg'), ('JM','JAM','Jamaica','América','English','-05:00','https://restcountries.eu/data/jam.svg'), ('JE','JEY','Jersey','Europa','English','+01:00','https://restcountries.eu/data/jey.svg'), ('GL','GRL','Groenlandia','América','Kalaallisut','-04:00','https://restcountries.eu/data/grl.svg'), ('KH','KHM','Camboya','Asia','Khmer','+07:00','https://restcountries.eu/data/khm.svg'), ('KE','KEN','Kenia','Africa','English','+03:00','https://restcountries.eu/data/ken.svg'), ('KI','KIR','Kiribati','Oceanía','English','+12:00','https://restcountries.eu/data/kir.svg'), ('CF','CAF','República Centroafricana','Africa','French','+01:00','https://restcountries.eu/data/caf.svg'), ('KM','COM','Comoras','Africa','Arabic','+03:00','https://restcountries.eu/data/com.svg'), ('RE','REU','Reunión','Africa','French','+04:00','https://restcountries.eu/data/reu.svg'), ('LV','LVA','Letonia','Europa','Latvian','+02:00','https://restcountries.eu/data/lva.svg'), ('LS','LSO','Lesoto','Africa','English','+02:00','https://restcountries.eu/data/lso.svg'), ('LR','LBR','Liberia','Africa','English','','https://restcountries.eu/data/lbr.svg'), ('LI','LIE','Liechtenstein','Europa','German','+01:00','https://restcountries.eu/data/lie.svg'), ('LT','LTU','Lituania','Europa','Lithuanian','+02:00','https://restcountries.eu/data/ltu.svg'), ('LU','LUX','Luxemburgo','Europa','French','+01:00','https://restcountries.eu/data/lux.svg'), ('MG','MDG','Madagascar','Africa','French','+03:00','https://restcountries.eu/data/mdg.svg'), ('HU','HUN','Hungría','Europa','Hungarian','+01:00','https://restcountries.eu/data/hun.svg'), ('MH','MHL','Islas Marshall','Oceanía','English','+12:00','https://restcountries.eu/data/mhl.svg'), ('MW','MWI','Malaui','Africa','English','+02:00','https://restcountries.eu/data/mwi.svg'), ('MY','MYS','Malasia','Asia','Malaysian','+08:00','https://restcountries.eu/data/mys.svg'), ('MV','MDV','Maldivas','Asia','Divehi','+05:00','https://restcountries.eu/data/mdv.svg'), ('ML','MLI','Malí','Africa','French','','https://restcountries.eu/data/mli.svg'), ('MT','MLT','Malta','Europa','Maltese','+01:00','https://restcountries.eu/data/mlt.svg'), ('MQ','MTQ','Martinica','América','French','-04:00','https://restcountries.eu/data/mtq.svg'), ('MU','MUS','Mauricio','Africa','English','+04:00','https://restcountries.eu/data/mus.svg'), ('YT','MYT','Mayotte','Africa','French','+03:00','https://restcountries.eu/data/myt.svg'), ('MX','MEX','México','América','Spanish','-08:00','https://restcountries.eu/data/mex.svg'), ('FM','FSM','Micronesia','Oceanía','English','+10:00','https://restcountries.eu/data/fsm.svg'), ('MZ','MOZ','Mozambique','Africa','Portuguese','+02:00','https://restcountries.eu/data/moz.svg'), ('MD','MDA','Moldavia','Europa','Romanian','+02:00','https://restcountries.eu/data/mda.svg'), ('MC','MCO','Mónaco','Europa','French','+01:00','https://restcountries.eu/data/mco.svg'), ('MS','MSR','Montserrat','América','English','-04:00','https://restcountries.eu/data/msr.svg'), ('MM','MMR','Myanmar','Asia','Burmese','+06:30','https://restcountries.eu/data/mmr.svg'), ('NA','NAM','Namibia','Africa','English','+01:00','https://restcountries.eu/data/nam.svg'), ('NR','NRU','Nauru','Oceanía','English','+12:00','https://restcountries.eu/data/nru.svg'), ('NL','NLD','Países Bajos','Europa','Dh','-04:00','https://restcountries.eu/data/nld.svg'), ('BN','BRN','Brunéi','Asia','Malay','+08:00','https://restcountries.eu/data/brn.svg'), ('NZ','NZL','Nueva Zelanda','Oceanía','English','-11:00','https://restcountries.eu/data/nzl.svg'), ('NI','NIC','Nicaragua','América','Spanish','-06:00','https://restcountries.eu/data/nic.svg'), ('NE','NER','Níger','Africa','French','+01:00','https://restcountries.eu/data/ner.svg'), ('NG','NGA','Nigeria','Africa','English','+01:00','https://restcountries.eu/data/nga.svg'), ('NU','NIU','Niue','Oceanía','English','-11:00','https://restcountries.eu/data/niu.svg'), ('NF','NFK','Isla Norfolk','Oceanía','English','+11:30','https://restcountries.eu/data/nfk.svg'), ('NO','NOR','Noruega','Europa','Norwegian','+01:00','https://restcountries.eu/data/nor.svg'), ('MP','MNP','Islas Marianas del Norte','Oceanía','English','+10:00','https://restcountries.eu/data/mnp.svg'), ('NC','NCL','Nueva Caledonia','Oceanía','French','+11:00','https://restcountries.eu/data/ncl.svg'), ('UZ','UZB','Uzbekistán','Asia','Uzbek','+05:00','https://restcountries.eu/data/uzb.svg'), ('AT','AUT','Austria','Europa','German','+01:00','https://restcountries.eu/data/aut.svg'), ('PK','PAK','Pakistán','Asia','English','+05:00','https://restcountries.eu/data/pak.svg'), ('PW','PLW','Palaos','Oceanía','English','+09:00','https://restcountries.eu/data/plw.svg'), ('PA','PAN','Panamá','América','Spanish','-05:00','https://restcountries.eu/data/pan.svg'), ('PG','PNG','Papúa Nueva Guinea','Oceanía','English','+10:00','https://restcountries.eu/data/png.svg'), ('PY','PRY','Paraguay','América','Spanish','-04:00','https://restcountries.eu/data/pry.svg'), ('PE','PER','Perú','América','Spanish','-05:00','https://restcountries.eu/data/per.svg'), ('PH','PHL','Filipinas','Asia','English','+08:00','https://restcountries.eu/data/phl.svg'), ('PN','PCN','Islas Pitcairn','Oceanía','English','-08:00','https://restcountries.eu/data/pcn.svg'), ('PL','POL','Polonia','Europa','Polish','+01:00','https://restcountries.eu/data/pol.svg'), ('PF','PYF','Polinesia Francesa','Oceanía','French','-10:00','https://restcountries.eu/data/pyf.svg'), ('PT','PRT','Portugal','Europa','Portuguese','-01:00','https://restcountries.eu/data/prt.svg'), ('PR','PRI','Puerto Rico','América','Spanish','-04:00','https://restcountries.eu/data/pri.svg'), ('DO','DOM','República Dominicana','América','Spanish','-04:00','https://restcountries.eu/data/dom.svg'), ('XK','KOS','República de Kosovo','Europe','Albanian','+01:00','https://restcountries.eu/data/kos.svg'), ('CD','COD','Congo','Africa','French','+01:00','https://restcountries.eu/data/cod.svg'), ('CG','COG','República del Congo','Africa','French','+01:00','https://restcountries.eu/data/cog.svg'), ('RO','ROU','Rumania','Europa','Romanian','+02:00','https://restcountries.eu/data/rou.svg'), ('RW','RWA','Ruanda','Africa','Kinyarwanda','+02:00','https://restcountries.eu/data/rwa.svg'), ('SH','SHN','Santa Elena','Africa','English','+00:00','https://restcountries.eu/data/shn.svg'), ('KN','KNA','San Cristóbal y Nieves','América','English','-04:00','https://restcountries.eu/data/kna.svg'), ('LC','LCA','Santa Lucía','América','English','-04:00','https://restcountries.eu/data/lca.svg'), ('VC','VCT','San Vicente y las Granadinas','América','English','-04:00','https://restcountries.eu/data/vct.svg'), ('BL','BLM','San Bartolomé','América','French','-04:00','https://restcountries.eu/data/blm.svg'), ('MF','MAF','San Martín','América','English','-04:00','https://restcountries.eu/data/maf.svg'), ('PM','SPM','San Pedro y Miquelón','América','French','-03:00','https://restcountries.eu/data/spm.svg'), ('WS','WSM','Samoa','Oceanía','Samoan','+13:00','https://restcountries.eu/data/wsm.svg'), ('SM','SMR','San Marino','Europa','Italian','+01:00','https://restcountries.eu/data/smr.svg'), ('VA','VAT','Ciudad del Vaticano','Europa','Latin','+01:00','https://restcountries.eu/data/vat.svg'), ('ST','STP','Santo Tomé y Príncipe','Africa','Portuguese','','https://restcountries.eu/data/stp.svg'), ('CH','CHE','Suiza','Europa','German','+01:00','https://restcountries.eu/data/che.svg'), ('SN','SEN','Senegal','Africa','French','','https://restcountries.eu/data/sen.svg'), ('SC','SYC','Seychelles','Africa','French','+04:00','https://restcountries.eu/data/syc.svg'), ('AL','ALB','Albania','Europa','Albanian','+01:00','https://restcountries.eu/data/alb.svg'), ('SL','SLE','Sierra Leona','Africa','English','','https://restcountries.eu/data/sle.svg'), ('SG','SGP','Singapur','Asia','English','+08:00','https://restcountries.eu/data/sgp.svg'), ('SX','SXM','San Martín','América','Dh','-04:00','https://restcountries.eu/data/sxm.svg'), ('SI','SVN','Eslovenia','Europa','Slovene','+01:00','https://restcountries.eu/data/svn.svg'), ('SK','SVK','Eslovaquia','Europa','Slovak','+01:00','https://restcountries.eu/data/svk.svg'), ('SB','SLB','Islas Salomón','Oceanía','English','+11:00','https://restcountries.eu/data/slb.svg'), ('SO','SOM','Somalia','Africa','Somali','+03:00','https://restcountries.eu/data/som.svg'), ('ZA','ZAF','Sudáfrica','Africa','Afrikaans','+02:00','https://restcountries.eu/data/zaf.svg'), ('GS','SGS','Islas Georgias del Sur','América','English','-02:00','https://restcountries.eu/data/sgs.svg'), ('SS','SSD','Sudán del Sur','Africa','English','+03:00','https://restcountries.eu/data/ssd.svg'), ('LK','LKA','Sri Lanka','Asia','Sinhalese','+05:30','https://restcountries.eu/data/lka.svg'), ('FI','FIN','Finlandia','Europa','Finnish','+02:00','https://restcountries.eu/data/fin.svg'), ('SR','SUR','Surinam','América','Dh','-03:00','https://restcountries.eu/data/sur.svg'), ('SJ','SJM','Svalbard y Jan Mayen','Europa','Norwegian','+01:00','https://restcountries.eu/data/sjm.svg'), ('SE','SWE','Suecia','Europa','Swedish','+01:00','https://restcountries.eu/data/swe.svg'), ('SZ','SWZ','Suazilandia','Africa','English','+02:00','https://restcountries.eu/data/swz.svg'), ('TZ','TZA','Tanzania','Africa','Swahili','+03:00','https://restcountries.eu/data/tza.svg'), ('TD','TCD','Chad','Africa','French','+01:00','https://restcountries.eu/data/tcd.svg'), ('TF','ATF','Tierras Antárticas Francesas','Africa','French','+05:00','https://restcountries.eu/data/atf.svg'), ('TL','TLS','Timor Oriental','Asia','Portuguese','+09:00','https://restcountries.eu/data/tls.svg'), ('TG','TGO','Togo','Africa','French','','https://restcountries.eu/data/tgo.svg'), ('TK','TKL','Tokelau','Oceanía','English','+13:00','https://restcountries.eu/data/tkl.svg'), ('TO','TON','Tonga','Oceanía','English','+13:00','https://restcountries.eu/data/ton.svg'), ('TT','TTO','Trinidad y Tobago','América','English','-04:00','https://restcountries.eu/data/tto.svg'), ('TR','TUR','Turquía','Asia','Turkish','+03:00','https://restcountries.eu/data/tur.svg'), ('TM','TKM','Turkmenistán','Asia','Turkmen','+05:00','https://restcountries.eu/data/tkm.svg'), ('TC','TCA','Islas Turcas y Caicos','América','English','-04:00','https://restcountries.eu/data/tca.svg'), ('TV','TUV','Tuvalu','Oceanía','English','+12:00','https://restcountries.eu/data/tuv.svg'), ('UG','UGA','Uganda','Africa','English','+03:00','https://restcountries.eu/data/uga.svg'), ('GB','GBR','Reino Unido','Europa','English','-08:00','https://restcountries.eu/data/gbr.svg'), ('US','USA','Estados Unidos','América','English','-12:00','https://restcountries.eu/data/usa.svg'), ('UM','UMI','Islas Menores de EE.UU.','América','English','-11:00','https://restcountries.eu/data/umi.svg'), ('UY','URY','Uruguay','América','Spanish','-03:00','https://restcountries.eu/data/ury.svg'), ('VU','VUT','Vanuatu','Oceanía','Bislama','+11:00','https://restcountries.eu/data/vut.svg'), ('VE','VEN','Venezuela','América','Spanish','-04:00','https://restcountries.eu/data/ven.svg'), ('VN','VNM','Vietnam','Asia','Vietnamese','+07:00','https://restcountries.eu/data/vnm.svg'), ('VI','VIR','Islas Vírgenes de EE.UU.','América','English','-04:00','https://restcountries.eu/data/vir.svg'), ('WF','WLF','Wallis y Futuna','Oceanía','French','+12:00','https://restcountries.eu/data/wlf.svg'), ('ZM','ZMB','Zambia','Africa','English','+02:00','https://restcountries.eu/data/zmb.svg'), ('ZW','ZWE','Zimbabue','Africa','English','+02:00','https://restcountries.eu/data/zwe.svg'), ('GR','GRC','Grecia','Europa','Greek modern','+02:00','https://restcountries.eu/data/grc.svg'), ('CY','CYP','Chipre','Europa','Greek modern','+02:00','https://restcountries.eu/data/cyp.svg'), ('BY','BLR','Bielorrusia','Europa','Belarusian','+03:00','https://restcountries.eu/data/blr.svg'), ('BG','BGR','Bulgaria','Europa','Bulgarian','+02:00','https://restcountries.eu/data/bgr.svg'), ('KG','KGZ','Kirguistán','Asia','Kyrgyz','+06:00','https://restcountries.eu/data/kgz.svg'), ('KZ','KAZ','Kazajistán','Asia','Kazakh','+05:00','https://restcountries.eu/data/kaz.svg'), ('MK','MKD','Macedonia del Norte','Europa','Macedonian','+01:00','https://restcountries.eu/data/mkd.svg'), ('MN','MNG','Mongolia','Asia','Mongolian','+07:00','https://restcountries.eu/data/mng.svg'), ('RU','RUS','Rusia','Europa','Russian','+03:00','https://restcountries.eu/data/rus.svg'), ('RS','SRB','Serbia','Europa','Serbian','+01:00','https://restcountries.eu/data/srb.svg'), ('TJ','TJK','Tayikistán','Asia','Tajik','+05:00','https://restcountries.eu/data/tjk.svg'), ('UA','UKR','Ucrania','Europa','Ukrainian','+02:00','https://restcountries.eu/data/ukr.svg'), ('ME','MNE','Montenegro','Europa','Serbian','+01:00','https://restcountries.eu/data/mne.svg'), ('AM','ARM','Armenia','Asia','Armenian','+04:00','https://restcountries.eu/data/arm.svg'), ('GE','GEO','Georgia','Asia','Georgian','-05:00','https://restcountries.eu/data/geo.svg'), ('IL','ISR','Israel','Asia','Hebrew modern','+02:00','https://restcountries.eu/data/isr.svg'), ('AF','AFG','Afganistán','Asia','Pashto','+04:30','https://restcountries.eu/data/afg.svg'), ('JO','JOR','Jordania','Asia','Arabic','+03:00','https://restcountries.eu/data/jor.svg'), ('BH','BHR','Baréin','Asia','Arabic','+03:00','https://restcountries.eu/data/bhr.svg'), ('DZ','DZA','Argelia','Africa','Arabic','+01:00','https://restcountries.eu/data/dza.svg'), ('SD','SDN','Sudán','Africa','Arabic','+03:00','https://restcountries.eu/data/sdn.svg'), ('EH','ESH','República Árabe Saharaui','Africa','Arabic','+00:00','https://restcountries.eu/data/esh.svg'), ('IQ','IRQ','Irak','Asia','Arabic','+03:00','https://restcountries.eu/data/irq.svg'), ('SA','SAU','Arabia Saudita','Asia','Arabic','+03:00','https://restcountries.eu/data/sau.svg'), ('KW','KWT','Kuwait','Asia','Arabic','+03:00','https://restcountries.eu/data/kwt.svg'), ('MA','MAR','Marruecos','Africa','Arabic','','https://restcountries.eu/data/mar.svg'), ('YE','YEM','Yemen','Asia','Arabic','+03:00','https://restcountries.eu/data/yem.svg'), ('IR','IRN','Irán','Asia','Persian Farsi','+03:30','https://restcountries.eu/data/irn.svg'), ('TN','TUN','Túnez','Africa','Arabic','+01:00','https://restcountries.eu/data/tun.svg'), ('AE','ARE','Emiratos Árabes Unidos','Asia','Arabic','+04','https://restcountries.eu/data/are.svg'), ('SY','SYR','Siria','Asia','Arabic','+02:00','https://restcountries.eu/data/syr.svg'), ('OM','OMN','Omán','Asia','Arabic','+04:00','https://restcountries.eu/data/omn.svg'), ('PS','PSE','Palestina','Asia','Arabic','+02:00','https://restcountries.eu/data/pse.svg'), ('QA','QAT','Catar','Asia','Arabic','+03:00','https://restcountries.eu/data/qat.svg'), ('LB','LBN','Líbano','Asia','Arabic','+02:00','https://restcountries.eu/data/lbn.svg'), ('LY','LBY','Libia','Africa','Arabic','+01:00','https://restcountries.eu/data/lby.svg'), ('EG','EGY','Egipto','Africa','Arabic','+02:00','https://restcountries.eu/data/egy.svg'), ('MR','MRT','Mauritania','Africa','Arabic','','https://restcountries.eu/data/mrt.svg'), ('NP','NPL','Nepal','Asia','Nepali','+05:45','https://restcountries.eu/data/npl.svg'), ('IN','IND','India','Asia','Hindi','+05:30','https://restcountries.eu/data/ind.svg'), ('TH','THA','Tailandia','Asia','Thai','+07:00','https://restcountries.eu/data/tha.svg'), ('LA','LAO','Laos','Asia','Lao','+07:00','https://restcountries.eu/data/lao.svg'), ('ET','ETH','Etiopía','Africa','Amharic','+03:00','https://restcountries.eu/data/eth.svg'), ('ER','ERI','Eritrea','Africa','Tigrinya','+03:00','https://restcountries.eu/data/eri.svg'), ('KR','KOR','Corea del Sur','Asia','Korean','+09:00','https://restcountries.eu/data/kor.svg'), ('KP','PRK','Corea del Norte','Asia','Korean','+09:00','https://restcountries.eu/data/prk.svg'), ('CN','CHN','China','Asia','Chinese','+08:00','https://restcountries.eu/data/chn.svg'), ('JP','JPN','Japón','Asia','Japanese','+09:00','https://restcountries.eu/data/jpn.svg'), ('MO','MAC','Macao','Asia','Chinese','+08:00','https://restcountries.eu/data/mac.svg'), ('TW','TWN','Taiwán','Asia','Chinese','+08:00','https://restcountries.eu/data/twn.svg'), ('HK','HKG','Hong Kong','Asia','English','+08:00','https://restcountries.eu/data/hkg.svg')
;
CREATE TABLE idiomas (
	id VARCHAR(2) NOT NULL UNIQUE,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO idiomas (id, nombre)
VALUES ('aa','Afar'),('ab','Abjasio'),('ae','Avéstico'),('af','Afrikáans'),('ak','Akano'),('am','Amhárico'),('an','Aragonés'),('ar','Árabe'),('as','Asamés'),('av','Ávaro'),('ay','Aimara'),('az','Azerí'),('ba','Baskir'),('be','Bielorruso'),('bg','Búlgaro'),('bh','Bhoyapurí'),('bi','Bislama'),('bm','Bambara'),('bn','Bengalí'),('bo','Tibetano'),('br','Bretón'),('bs','Bosnio'),('ca','Catalán'),('ce','Checheno'),('ch','Chamorro'),('co','Corso'),('cr','Cree'),('cs','Checo'),('cu','Eslavo eclesiástico antiguo'),('cv','Chuvasio'),('cy','Galés'),('da','Danés'),('de','Alemán'),('dv','Maldivo'),('dz','Dzongkha'),('ee','Ewé'),('el','Griego'),('en','Inglés'),('eo','Esperanto'),('es','Castellano'),('et','Estonio'),('eu','Euskera'),('fa','Persa'),('ff','Fula'),('fi','Finés'),('fj','Fiyiano'),('fo','Feroés'),('fr','Francés'),('fy','Frisón'),('ga','Gaélico'),('gd','Gaélico escocés'),('gl','Gallego'),('gn','Guaraní'),('gu','Guyaratí'),('gv','Gaélico manés'),('ha','Hausa'),('he','Hebreo'),('hi','Hindi'),('ho','Hiri motu'),('hr','Croata'),('ht','Haitiano'),('hu','Húngaro'),('hy','Armenio'),('hz','Herero'),('ia','Interlingua'),('id','Indonesio'),('ie','Occidental'),('ig','Igbo'),('ii','Yi de Sichuán'),('ik','Iñupiaq'),('io','Ido'),('is','Islandés'),('it','Italiano'),('iu','Inuktitut'),('ja','Japonés'),('jv','Javanés'),('ka','Georgiano'),('kg','Kongo'),('ki','Kikuyu'),('kj','Kuanyama'),('kk','Kazajo'),('kl','Kalaallisut'),('km','Camboyano'),('kn','Canarés'),('ko','Coreano'),('kr','Kanuri'),('ks','Cachemiro'),('ku','Kurdo'),('kv','Komi'),('kw','Córnico'),('ky','Kirguís'),('la','Latín'),('lb','Luxemburgués'),('lg','Luganda'),('li','Limburgués'),('ln','Lingala'),('lo','Lao'),('lt','Lituano'),('lu','Luba-katanga'),('lv','Letón'),('mg','Malgache'),('mh','Marshalés'),('mi','Maorí'),('mk','Macedonio'),('ml','Malayalam'),('mn','Mongol'),('mr','Maratí'),('ms','Malayo'),('mt','Maltés'),('my','Birmano'),('na','Nauruano'),('nb','Noruego bokmål'),('nd','Ndebele del norte'),('ne','Nepalí'),('ng','Ndonga'),('nl','Neerlandés'),('nn','Nynorsk'),('no','Noruego'),('nr','Ndebele del sur'),('nv','Navajo'),('ny','Chichewa'),('oc','Occitano'),('oj','Ojibwa'),('om','Oromo'),('or','Oriya'),('os','Osético'),('pa','Panyabí'),('pi','Pali'),('pl','Polaco'),('ps','Pastú'),('pt','Portugués'),('qu','Quechua'),('rm','Romanche'),('rn','Kirundi'),('ro','Rumano'),('ru','Ruso'),('rw','Ruandés'),('sa','Sánscrito'),('sc','Sardo'),('sd','Sindhi'),('se','Sami septentrional'),('sg','Sango'),('si','Cingalés'),('sk','Eslovaco'),('sl','Esloveno'),('sm','Samoano'),('sn','Shona'),('so','Somalí'),('sq','Albanés'),('sr','Serbio'),('ss','Suazi'),('st','Sesotho'),('su','Sundanés'),('sv','Sueco'),('sw','Suajili'),('ta','Tamil'),('te','Télugu'),('tg','Tayiko'),('th','Tailandés'),('ti','Tigriña'),('tk','Turcomano'),('tl','Tagalo'),('tn','Setsuana'),('to','Tongano'),('tr','Turco'),('ts','Tsonga'),('tt','Tártaro'),('tw','Twi'),('ty','Tahitiano'),('ug','Uigur'),('uk','Ucraniano'),('ur','Urdu'),('uz','Uzbeko'),('ve','Venda'),('vi','Vietnamita'),('vo','Volapük'),('wa','Valón'),('wo','Wolof'),('xh','Xhosa'),('yi','Yídish'),('yo','Yoruba'),('za','Zhuang'),('zh','Chino'),('zu','Zulú')
;
CREATE TABLE estados_eclesiales (
	id VARCHAR(2) NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	orden INT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO estados_eclesiales (id, nombre, orden)
VALUES ('LA', 'Laico/a', 1), ('RC', 'Religioso/a', 2), ('DP', 'Diácono', 3), ('SC', 'Sacerdote', 4), ('OB', 'Obispo', 5)
;
CREATE TABLE roles_usuario (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(20) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO roles_usuario (id, nombre)
VALUES (1, 'Usuario'), (2, 'Admin'), (3, 'Gerente'), (4, 'Dueño')
;
CREATE TABLE sexos (
	id VARCHAR(1) NOT NULL,
	nombre VARCHAR(20) NOT NULL,
	letra_final VARCHAR(1) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO sexos (id, nombre, letra_final)
VALUES ('M','Masculino', 'o'), ('F','Femenino', 'a')
;
CREATE TABLE status_registro (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO status_registro (id, nombre)
VALUES (1, 'Mail a validar'), (2, 'Mail validado'), (3, 'Datos perennes OK'), (4, 'Datos editables OK')
;
CREATE TABLE USUARIOS (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	email VARCHAR(100) NOT NULL UNIQUE,
	contrasena VARCHAR(100) NOT NULL,
	status_registro_id INT UNSIGNED NOT NULL DEFAULT 1,
	rol_usuario_id INT UNSIGNED NOT NULL DEFAULT 1,
	autorizado_fa BOOLEAN NULL DEFAULT 0,
	nombre VARCHAR(50) NULL,
	apellido VARCHAR(50) NULL,
	apodo VARCHAR(50) NULL,
	avatar VARCHAR(100) NOT NULL DEFAULT '-',
	fecha_nacimiento DATE NULL,
	sexo_id VARCHAR(1) NULL,
	pais_id VARCHAR(2) NULL,
	estado_eclesial_id VARCHAR(2) NULL,
	creado_en DATE NULL,
	completado_en DATE NULL,
	editado_en DATE NULL,
	autorizado_data_entry BOOLEAN NOT NULL DEFAULT 0,
	borrado BOOLEAN NULL DEFAULT 0,
	borrado_en DATE NULL,
	borrado_motivo VARCHAR(500) NULL,
	borrado_por INT UNSIGNED NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro(id),
	FOREIGN KEY (rol_usuario_id) REFERENCES roles_usuario(id),
	FOREIGN KEY (sexo_id) REFERENCES sexos(id),
	FOREIGN KEY (pais_id) REFERENCES paises(id),
	FOREIGN KEY (estado_eclesial_id) REFERENCES estados_eclesiales(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO USUARIOS (id, email, contrasena, status_registro_id, rol_usuario_id, autorizado_fa, nombre, apellido, apodo, avatar, fecha_nacimiento, sexo_id, pais_id, estado_eclesial_id, creado_en, completado_en)
VALUES (1, 'diegoiribarren2015@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 4, 4, 1, 'Diego', 'Iribarren', 'Diego', '1617370359746.jpg', '1969-08-16', 'M', 'AR', 'LA', '2021-03-26', '2021-03-26'),(2, 'sp2015w@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 4, 2, 1, 'Diego', 'Iribarren', 'Diego', '1617370359746.jpg', '1969-08-16', 'M', 'AR', 'LA', '2021-03-26', '2021-03-26')
;
CREATE TABLE penalizaciones_motivos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	duracion INT UNSIGNED NOT NULL,
	comentario VARCHAR(500) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO penalizaciones_motivos (id, nombre, duracion, comentario)
VALUES (1, 'Ofensivo', 365, 'Pornografía, mofarse de la religión católica, grosería, etc.'), (2, 'Spam', 365, 'Material ajeno a nuestro perfil')
;
CREATE TABLE penalizaciones_usuarios (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	fecha DATE NOT NULL,
	usuario_id INT UNSIGNED NOT NULL,
	rol_usuario_id INT UNSIGNED NOT NULL,
	penalizado_por_id INT UNSIGNED NULL,
	penalizacion_id INT UNSIGNED NOT NULL,
	comentario VARCHAR(500) NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (rol_usuario_id) REFERENCES roles_usuario(id),
	FOREIGN KEY (penalizado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (penalizacion_id) REFERENCES penalizaciones_motivos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE categorias (
	id VARCHAR(3) NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO categorias (id, nombre)
VALUES ('CFC', 'Centradas en la Fe Católica'), ('VPC', 'Valores Presentes en la Cultura')
;
CREATE TABLE categorias_sub (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	categoria_id VARCHAR(3) NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	url VARCHAR(20) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO categorias_sub (id, categoria_id, nombre, url)
VALUES (1, 'CFC', 'Jesús', 'cfc/jesus'), (2, 'CFC', 'Contemporáneos de Jesús', 'cfc/contemporaneos'), (3, 'CFC', 'Apariciones Marianas', 'cfc/marianas'), (4, 'CFC', 'Hagiografías', 'cfc/hagiografias'), (5, 'CFC', 'Historias de la Iglesia', 'cfc/historias'), (6, 'CFC', 'Novelas centradas en la fe', 'cfc/novelas'), (7, 'CFC', 'Colecciones', 'cfc/colecciones'), (8, 'CFC', 'Documentales', 'cfc/documentales'), (11, 'VPC', 'Biografías e Historias', 'vpc/bios_historias'), (12, 'VPC', 'Matrimonio y Familia', 'vpc/matrimonio'), (13, 'VPC', 'Novelas', 'vpc/novelas'), (14, 'VPC', 'Musicales', 'vpc/musicales'), (15, 'VPC', 'Colecciones', 'vpc/colecciones')
;
CREATE TABLE listado_peliculas (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	url VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO listado_peliculas (id, nombre, url)
VALUES (1, 'Sugeridas para el momento del año', 'listado/sugeridas'), (2, 'Por orden de calificación en nuestra página', 'listado/calificacion'), (3, 'Por año de estreno', 'listado/estreno'), (4, 'Por orden de incorporación a nuestra base de datos', 'listado/incorporacion'), (5, 'Por orden de visita', 'listado/visita')
;
CREATE TABLE menu_opciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	url VARCHAR(50) NOT NULL,
	titulo VARCHAR(50) NOT NULL,
	vista VARCHAR(20) NOT NULL,
	comentario VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO menu_opciones (id, nombre, url, titulo, vista, comentario)
VALUES 
(1, 'Listado de Películas', 'listado', 'Listado', '1-Listado', 'Todas las películas de nuestra Base de Datos'),
(2, 'Un paseo por CFC', 'cfc', 'CFC', '2-CFC', 'Películas Centradas en la Fe Católica (CFC)'),
(3, 'Un paseo por VPC', 'vpc', 'VPC', '3-VPC', 'Películas con Valores Presentes en nuestra Cultura (VPC)')
;
CREATE TABLE colecciones_cabecera (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id VARCHAR(10) NULL,
	tmdb_rubro VARCHAR(10) NULL,
	fa_id VARCHAR(10) NULL,
	fuente VARCHAR(10) NOT NULL,
	nombre_original VARCHAR(100) NOT NULL UNIQUE,
	nombre_castellano VARCHAR(100) NOT NULL,
	ano_estreno INT UNSIGNED NULL,
	ano_fin INT UNSIGNED NULL,
	pais_id VARCHAR(20) NOT NULL,
	productor VARCHAR(50) NULL,
	sinopsis VARCHAR(800) NOT NULL,
	avatar VARCHAR(100) NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO colecciones_cabecera (id, tmdb_id, tmdb_rubro, fuente, nombre_original, nombre_castellano, pais_id, sinopsis)
VALUES (1, '855456', 'collection', 'TMDB', 'Karol', 'Karol', 'IT, PL', 'Es una colección de 2 películas, que narra la vida de Karol Wojtyla (Juan Pablo II). La primera película transcurre durante su vida anterior al papado: la II Guerra Mundial, el comunismo, su seminario en forma clandestino porque estaba prohibido por los nazis, su nombramiento como obispo y cardenal, su formación de la juventud de su pueblo, su intención de preservar la cultura polaca durante el sometimiento alemán y luego ruso. La segunda película muestra su vida durante el papado. El atentado contra su vida, sus viajes apostólicos, el reencuentro con sus seres queridos.')
;
CREATE TABLE colecciones_peliculas (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	pelicula_id INT UNSIGNED NULL,
	tmdb_id VARCHAR(20) NULL,
	nombre_original VARCHAR(100) NOT NULL UNIQUE,
	nombre_castellano VARCHAR(100) NOT NULL,
	ano_estreno INT UNSIGNED NOT NULL,
	cant_capitulos INT UNSIGNED NOT NULL DEFAULT 1,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,
	coleccion_id INT UNSIGNED NOT NULL,
	orden_secuencia INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_id) REFERENCES colecciones_cabecera(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO colecciones_peliculas (id, coleccion_id, pelicula_id, tmdb_id, nombre_original, nombre_castellano, ano_estreno, orden_secuencia)
VALUES (1, 1, 1, '38516', 'Karol, un uomo diventato Papa', 'Karol, el hombre que llegó a ser Papa', 2005, 1)
;
INSERT INTO colecciones_peliculas (id, coleccion_id, tmdb_id, nombre_original, nombre_castellano, ano_estreno, orden_secuencia)
VALUES (2, 1, '75470', 'Karol, un Papa rimasto uomo', 'Karol, el Papa que siguió siendo hombre', 2006, 2)
;
CREATE TABLE epocas_estreno (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(20) NOT NULL,
	ano_comienzo INT UNSIGNED NOT NULL,
	ano_fin INT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO epocas_estreno (id, nombre, ano_comienzo, ano_fin)
VALUES (1, 'Antes de 1970', 1900, 1969), (2, '1970 - 1999', 1970, 1999), (3, '2000 - 2014', 2000, 2014), (4, '2015 - Presente', 2015, 2025)
;
CREATE TABLE publicos_recomendados (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO publicos_recomendados (id, nombre)
VALUES (1, 'Está dirigido a un público infantil, no se recomienda para mayores'), (2, 'Es apto para mayores, pero se recomienda para menores (se puede ver en familia)'), (3, 'Es ideal para ver en familia'), (4, 'Es apto para menores, pero se recomienda para mayores (se puede ver en familia)'), (5, 'No es apto para menores, sólo para mayores')
;
CREATE TABLE eventos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	fecha VARCHAR(20) NOT NULL,
	distancia INT UNSIGNED NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO eventos (id, nombre, fecha)
VALUES (1, 'San Juan Pablo II', '22/oct')
;
CREATE TABLE personajes_historicos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO personajes_historicos (id, nombre)
VALUES (1, 'Juan Pablo II (papa)')
;
CREATE TABLE hechos_historicos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO hechos_historicos (id, nombre)
VALUES (1, '2a Guerra Mundial')
;
CREATE TABLE PELICULAS (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id VARCHAR(10) NULL,
	fa_id VARCHAR(10) NULL,
	imdb_id VARCHAR(10) NULL,
	nombre_original VARCHAR(50) NOT NULL UNIQUE,
	nombre_castellano VARCHAR(50) NOT NULL,
	coleccion_pelicula_id INT UNSIGNED NOT NULL DEFAULT 0,
	duracion INT UNSIGNED NOT NULL,
	ano_estreno INT UNSIGNED NOT NULL,
	pais_id VARCHAR(20) NOT NULL,
	director VARCHAR(50) NOT NULL,
	guion VARCHAR(50) NOT NULL,
	musica VARCHAR(50) NOT NULL,
	actores VARCHAR(400) NOT NULL,
	productor VARCHAR(100) NOT NULL,
	avatar VARCHAR(100) NOT NULL,
	idioma_castellano BOOLEAN NOT NULL,
	color BOOLEAN NOT NULL,
	publico_recomendado_id INT UNSIGNED NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	subcategoria_id INT UNSIGNED NOT NULL,
	personaje_historico_id INT UNSIGNED NULL,
	hecho_historico_id INT UNSIGNED NULL,
	sugerida_para_evento_id INT UNSIGNED NULL,
	sinopsis VARCHAR(800) NOT NULL,
	creada_por_id INT UNSIGNED NOT NULL,
	creada_en DATE NOT NULL,
	analizada_por_id INT UNSIGNED NULL,
	analizada_en DATE NULL,
	aprobada BOOLEAN DEFAULT 0,
	fechaFIFO DATE NULL,
	editada_por_id INT UNSIGNED NULL,
	editada_en DATE NULL,
	revisada_por_id INT UNSIGNED NULL,
	revisada_en DATE NULL,
	borrada BOOLEAN NOT NULL DEFAULT 0,
	borrada_por_id INT UNSIGNED NULL,
	borrada_en DATE NULL,
	borrada_motivo VARCHAR(500) NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_pelicula_id) REFERENCES colecciones_peliculas(id),
	FOREIGN KEY (publico_recomendado_id) REFERENCES publicos_recomendados(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES categorias_sub(id),
	FOREIGN KEY (personaje_historico_id) REFERENCES personajes_historicos(id),
	FOREIGN KEY (hecho_historico_id) REFERENCES hechos_historicos(id),
	FOREIGN KEY (sugerida_para_evento_id) REFERENCES eventos(id),
	FOREIGN KEY (creada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (revisada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (borrada_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO PELICULAS (id, tmdb_id, fa_id, imdb_id, nombre_original, nombre_castellano, coleccion_pelicula_id, duracion, ano_estreno, pais_id, avatar, idioma_castellano, color, publico_recomendado_id, categoria_id, subcategoria_id, personaje_historico_id, hecho_historico_id, sugerida_para_evento_id, sinopsis, creada_por_id, creada_en, analizada_por_id, analizada_en, aprobada, director, guion, musica, actores, productor)
VALUES (1, '38516', '436804', 'tt0435100', 'Karol - Un uomo diventato Papa', 'Karol, el hombre que llegó a ser Papa', 1, 195, 2005, 'IT, PL', 'Karol.png', true, true, 5, 'CFC', 4, 1, 1, 1, 'Miniserie biográfica sobre Juan Pablo II. En su juventud, en Polonia bajo la ocupación nazi, Karol Wojtyla trabajó en una cantera de caliza para poder sobrevivir. La represión nazi causó numerosas víctimas no sólo entre los judíos, sino también entre los católicos. Es entonces cuando Karol decide responder a la llamada divina.', 1, '2021-04-23', 2, '2021-04-23', 1, 'Giacomo Battiato', 'Giacomo Battiato', 'Ennio Morricone', 'Piotr Adamczyk (Karol Wojtyla), Malgorzata Bela (Hanna Tuszynska), Ken Duken (Adam Zielinski), Hristo Shopov (Julian Kordek), Ennio Fantastichini (Maciej Nowak), Violante Placido (Maria Pomorska), Matt Craven (Hans Frank), Raoul Bova (padre Tomasz Zaleski), Lech Mackiewicz (card. Stefan Wyszynski), Patrycja Soliman (Wislawa)', 'Taodue Film')
;
CREATE TABLE fe_valores (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO fe_valores (id, nombre)
VALUES (1, 'No'), (2, 'Poco'), (3, 'Sí'), (4, 'Mucho'), (5, 'Deja una huella en mí')
;
CREATE TABLE entretiene (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO entretiene (id, nombre)
VALUES (1, 'No'), (2, 'Poco'), (3, 'Sí'), (4, 'Mucho')
;
CREATE TABLE calidad_filmica (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO calidad_filmica (id, nombre)
VALUES (1, 'Es precaria'), (2, 'No perjudica el disfrute'), (3, 'Acompaña el disfrute')
;
CREATE TABLE us_pel_calificaciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	fe_valores_id INT UNSIGNED NOT NULL,
	entretiene_id INT UNSIGNED NOT NULL,
	calidad_filmica_id INT UNSIGNED NOT NULL,
	resultado DECIMAL(3,2) UNSIGNED NOT NULL DEFAULT 1,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id),
	FOREIGN KEY (fe_valores_id) REFERENCES fe_valores(id),
	FOREIGN KEY (entretiene_id) REFERENCES entretiene(id),
	FOREIGN KEY (calidad_filmica_id) REFERENCES calidad_filmica(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO us_pel_calificaciones (id, usuario_id, pelicula_id, fe_valores_id, entretiene_id, calidad_filmica_id)
VALUES (1, 1, 1, 5, 4, 3)
;
CREATE TABLE interes_en_la_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL UNIQUE,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO interes_en_la_pelicula (id, nombre)
VALUES (1, 'Recordame que quiero verla'), (2, 'Ya la vi'), (3, 'Prefiero que no me la recomienden')
;
CREATE TABLE us_pel_interes_en_la_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	interes_en_la_pelicula_id INT UNSIGNED NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id),
	FOREIGN KEY (interes_en_la_pelicula_id) REFERENCES interes_en_la_pelicula(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO us_pel_interes_en_la_pelicula (id, usuario_id, pelicula_id, interes_en_la_pelicula_id)
VALUES (1, 1, 1, 2)
;
CREATE TABLE filtros_personales (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	usuario_id INT UNSIGNED NOT NULL,
	campo1 VARCHAR(100),
	valor1_id INT UNSIGNED,
	campo2 VARCHAR(100),
	valor2_id INT UNSIGNED,
	campo3 VARCHAR(100),
	valor3_id INT UNSIGNED,
	campo4 VARCHAR(100),
	valor4_id INT UNSIGNED,
	palabras_clave VARCHAR(100),
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
