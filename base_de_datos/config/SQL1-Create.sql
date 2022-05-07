DROP DATABASE IF EXISTS ELC_Peliculas;
CREATE DATABASE ELC_Peliculas;
USE ELC_Peliculas;

/* TABLAS AUXILIARES PARA USUARIOS Y PRODUCTOS */;
CREATE TABLE aux_idiomas (
	id VARCHAR(2) NOT NULL UNIQUE,
	nombre VARCHAR(100) NOT NULL,
	mas_frecuente BOOLEAN DEFAULT 0,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO aux_idiomas (id, nombre)
VALUES ('aa','Afar'),('ab','Abjasio'),('ae','Avéstico'),('af','Afrikáans'),('ak','Akano'),('am','Amhárico'),('an','Aragonés'),('ar','Árabe'),('as','Asamés'),('av','Ávaro'),('ay','Aimara'),('az','Azerí'),('ba','Baskir'),('be','Bielorruso'),('bg','Búlgaro'),('bh','Bhoyapurí'),('bi','Bislama'),('bm','Bambara'),('bn','Bengalí'),('bo','Tibetano'),('br','Bretón'),('bs','Bosnio'),('ca','Catalán'),('ce','Checheno'),('ch','Chamorro'),('co','Corso'),('cr','Cree'),('cs','Checo'),('cu','Eslavo eclesiástico'),('cv','Chuvasio'),('cy','Galés'),('da','Danés'),('de','Alemán'),('dv','Maldivo'),('dz','Dzongkha'),('ee','Ewé'),('el','Griego'),('en','Inglés'),('eo','Esperanto'),('es','Castellano'),('et','Estonio'),('eu','Euskera'),('fa','Persa'),('ff','Fula'),('fi','Finés'),('fj','Fiyiano'),('fo','Feroés'),('fr','Francés'),('fy','Frisón'),('ga','Gaélico'),('gd','Gaélico escocés'),('gl','Gallego'),('gn','Guaraní'),('gu','Guyaratí'),('gv','Gaélico manés'),('ha','Hausa'),('he','Hebreo'),('hi','Hindi'),('ho','Hiri motu'),('hr','Croata'),('ht','Haitiano'),('hu','Húngaro'),('hy','Armenio'),('hz','Herero'),('ia','Interlingua'),('id','Indonesio'),('ie','Occidental'),('ig','Igbo'),('ii','Yi de Sichuán'),('ik','Iñupiaq'),('io','Ido'),('is','Islandés'),('it','Italiano'),('iu','Inuktitut'),('ja','Japonés'),('jv','Javanés'),('ka','Georgiano'),('kg','Kongo'),('ki','Kikuyu'),('kj','Kuanyama'),('kk','Kazajo'),('kl','Kalaallisut'),('km','Camboyano'),('kn','Canarés'),('ko','Coreano'),('kr','Kanuri'),('ks','Cachemiro'),('ku','Kurdo'),('kv','Komi'),('kw','Córnico'),('ky','Kirguís'),('la','Latín'),('lb','Luxemburgués'),('lg','Luganda'),('li','Limburgués'),('ln','Lingala'),('lo','Lao'),('lt','Lituano'),('lu','Luba-katanga'),('lv','Letón'),('mg','Malgache'),('mh','Marshalés'),('mi','Maorí'),('mk','Macedonio'),('ml','Malayalam'),('mn','Mongol'),('mr','Maratí'),('ms','Malayo'),('mt','Maltés'),('my','Birmano'),('na','Nauruano'),('nb','Noruego bokmål'),('nd','Ndebele del norte'),('ne','Nepalí'),('ng','Ndonga'),('nl','Neerlandés'),('nn','Nynorsk'),('no','Noruego'),('nr','Ndebele del sur'),('nv','Navajo'),('ny','Chichewa'),('oc','Occitano'),('oj','Ojibwa'),('om','Oromo'),('or','Oriya'),('os','Osético'),('pa','Panyabí'),('pi','Pali'),('pl','Polaco'),('ps','Pastú'),('pt','Portugués'),('qu','Quechua'),('rm','Romanche'),('rn','Kirundi'),('ro','Rumano'),('ru','Ruso'),('rw','Ruandés'),('sa','Sánscrito'),('sc','Sardo'),('sd','Sindhi'),('se','Sami septentrional'),('sg','Sango'),('si','Cingalés'),('sk','Eslovaco'),('sl','Esloveno'),('sm','Samoano'),('sn','Shona'),('so','Somalí'),('sq','Albanés'),('sr','Serbio'),('ss','Suazi'),('st','Sesotho'),('su','Sundanés'),('sv','Sueco'),('sw','Suajili'),('ta','Tamil'),('te','Télugu'),('tg','Tayiko'),('th','Tailandés'),('ti','Tigriña'),('tk','Turcomano'),('tl','Tagalo'),('tn','Setsuana'),('to','Tongano'),('tr','Turco'),('ts','Tsonga'),('tt','Tártaro'),('tw','Twi'),('ty','Tahitiano'),('ug','Uigur'),('uk','Ucraniano'),('ur','Urdu'),('uz','Uzbeko'),('ve','Venda'),('vi','Vietnamita'),('vo','Volapük'),('wa','Valón'),('wo','Wolof'),('xh','Xhosa'),('yi','Yídish'),('yo','Yoruba'),('za','Zhuang'),('zh','Chino'),('zu','Zulú')
;
INSERT INTO aux_idiomas (id, nombre, mas_frecuente)
VALUES ('ot', 'Otro idioma', 1)
;
UPDATE aux_idiomas SET mas_frecuente = 1 WHERE id = 'es' OR id = 'en'
;
CREATE TABLE aux_paises (
	id VARCHAR(2) NOT NULL UNIQUE,
	alpha3code VARCHAR(3) NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	continente VARCHAR(20) NOT NULL,
	idioma VARCHAR(50) NOT NULL,
	zona_horaria VARCHAR(10) NOT NULL,
	bandera VARCHAR(10) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO aux_paises (id, alpha3Code, nombre, continente , idioma , zona_horaria, bandera)
/*<img src="https://restcountries.com/data/<%= n.alpha3code.toLowerCase %>.svg">*/
VALUES ('AX','ALA','Aland','Europa','Swedish','+02:00','ala.svg'), ('AS','ASM','Samoa Americana','Oceanía','English','-11:00','asm.svg'), ('AD','AND','Andorra','Europa','Catalan','+01:00','and.svg'), ('AO','AGO','Angola','Africa','Portuguese','+01:00','ago.svg'), ('AI','AIA','Anguila','América','English','-04:00','aia.svg'), ('AQ','ATA','Antártida','Polar','English','-03:00','ata.svg'), ('AG','ATG','Antigua y Barbuda','América','English','-04:00','atg.svg'), ('AR','ARG','Argentina','América','Spanish','-03:00','arg.svg'), ('AW','ABW','Aruba','América','Dh','-04:00','abw.svg'), ('AU','AUS','Australia','Oceanía','English','+05:00','aus.svg'), ('AZ','AZE','Azerbaiyán','Asia','Azerbaijani','+04:00','aze.svg'), ('BS','BHS','Bahamas','América','English','-05:00','bhs.svg'), ('BD','BGD','Bangladés','Asia','Bengali','+06:00','bgd.svg'), ('BB','BRB','Barbados','América','English','-04:00','brb.svg'), ('BE','BEL','Bélgica','Europa','Dh','+01:00','bel.svg'), ('BZ','BLZ','Belice','América','English','-06:00','blz.svg'), ('BJ','BEN','Benín','Africa','French','+01:00','ben.svg'), ('BM','BMU','Bermudas','América','English','-04:00','bmu.svg'), ('BO','BOL','Bolivia','América','Spanish','-04:00','bol.svg'), ('BQ','BES','Bonaire, San Eustaquio y Saba','América','Dh','-04:00','bes.svg'), ('BA','BIH','Bosnia y Herzegovina','Europa','Bosnian','+01:00','bih.svg'), ('BW','BWA','Botswana','Africa','English','+02:00','bwa.svg'), ('BV','BVT','Isla Bouvet','Polar','Norwegian','+01:00','bvt.svg'), ('BR','BRA','Brasil','América','Portuguese','-05:00','bra.svg'), ('IO','IOT','Territorio Británico Índico','Africa','English','+06:00','iot.svg'), ('VG','VGB','Islas Vírgenes Británicas','América','English','-04:00','vgb.svg'), ('BT','BTN','Bután','Asia','Dzongkha','+06:00','btn.svg'), ('BF','BFA','Burkina Faso','Africa','French','','bfa.svg'), ('BI','BDI','Burundi','Africa','French','+02:00','bdi.svg'), ('CV','CPV','Cabo Verde','Africa','Portuguese','-01:00','cpv.svg'), ('CM','CMR','Camerún','Africa','English','+01:00','cmr.svg'), ('CA','CAN','Canadá','América','English','-08:00','can.svg'), ('KY','CYM','Islas Caimán','América','English','-05:00','cym.svg'), ('CZ','CZE','República Checa','Europa','Czech','+01:00','cze.svg'), ('CL','CHL','Chile','América','Spanish','-06:00','chl.svg'), ('CX','CXR','Isla de Navidad','Oceanía','English','+07:00','cxr.svg'), ('CC','CCK','Islas Cocos','Oceanía','English','+06:30','cck.svg'), ('CO','COL','Colombia','América','Spanish','-05:00','col.svg'), ('CK','COK','Islas Cook','Oceanía','English','-10:00','cok.svg'), ('CR','CRI','Costa Rica','América','Spanish','-06:00','cri.svg'), ('CI','CIV','Costa de Marfil','Africa','French','','civ.svg'), ('CU','CUB','Cuba','América','Spanish','-05:00','cub.svg'), ('CW','CUW','Curazao','América','Dh','-04:00','cuw.svg'), ('DK','DNK','Dinamarca','Europa','Danish','-04:00','dnk.svg'), ('DE','DEU','Alemania','Europa','German','+01:00','deu.svg'), ('DJ','DJI','Yibuti','Africa','French','+03:00','dji.svg'), ('DM','DMA','Dominica','América','English','-04:00','dma.svg'), ('EC','ECU','Ecuador','América','Spanish','-06:00','ecu.svg'), ('EE','EST','Estonia','Europa','Estonian','+02:00','est.svg'), ('IE','IRL','Irlanda','Europa','Irish','','irl.svg'), ('SV','SLV','El Salvador','América','Spanish','-06:00','slv.svg'), ('ES','ESP','España','Europa','Spanish','','esp.svg'), ('FJ','FJI','Fiyi','Oceanía','English','+12:00','fji.svg'), ('FO','FRO','Islas Feroe','Europa','Faroese','+00:00','fro.svg'), ('FR','FRA','Francia','Europa','French','-10:00','fra.svg'), ('GA','GAB','Gabón','Africa','French','+01:00','gab.svg'), ('GM','GMB','Gambia','Africa','English','+00:00','gmb.svg'), ('GH','GHA','Ghana','Africa','English','','gha.svg'), ('GI','GIB','Gibraltar','Europa','English','+01:00','gib.svg'), ('GD','GRD','Granada','América','English','-04:00','grd.svg'), ('GP','GLP','Guadalupe','América','French','-04:00','glp.svg'), ('GU','GUM','Guam','Oceanía','English','+10:00','gum.svg'), ('GT','GTM','Guatemala','América','Spanish','-06:00','gtm.svg'), ('GG','GGY','Guernsey','Europa','English','+00:00','ggy.svg'), ('GQ','GNQ','Guinea Ecuatorial','Africa','Spanish','+01:00','gnq.svg'), ('GW','GNB','Guinea-Bisáu','Africa','Portuguese','','gnb.svg'), ('GN','GIN','Guinea','Africa','French','','gin.svg'), ('GY','GUY','Guyana','América','English','-04:00','guy.svg'), ('GF','GUF','Guayana Francesa','América','French','-03:00','guf.svg'), ('HT','HTI','Haití','América','French','-05:00','hti.svg'), ('HM','HMD','Islas Heard y McDonald','Oceanía','English','+05:00','hmd.svg'), ('HN','HND','Honduras','América','Spanish','-06:00','hnd.svg'), ('HR','HRV','Croacia','Europa','Croatian','+01:00','hrv.svg'), ('ID','IDN','Indonesia','Asia','Indonesian','+07:00','idn.svg'), ('IS','ISL','Islandia','Europa','Icelandic','','isl.svg'), ('FK','FLK','Islas Malvinas','América','English','-04:00','flk.svg'), ('IM','IMN','Isla de Man','Europa','English','+00:00','imn.svg'), ('IT','ITA','Italia','Europa','Italian','+01:00','ita.svg'), ('JM','JAM','Jamaica','América','English','-05:00','jam.svg'), ('JE','JEY','Jersey','Europa','English','+01:00','jey.svg'), ('GL','GRL','Groenlandia','América','Kalaallisut','-04:00','grl.svg'), ('KH','KHM','Camboya','Asia','Khmer','+07:00','khm.svg'), ('KE','KEN','Kenia','Africa','English','+03:00','ken.svg'), ('KI','KIR','Kiribati','Oceanía','English','+12:00','kir.svg'), ('CF','CAF','República Centroafricana','Africa','French','+01:00','caf.svg'), ('KM','COM','Comoras','Africa','Arabic','+03:00','com.svg'), ('RE','REU','Reunión','Africa','French','+04:00','reu.svg'), ('LV','LVA','Letonia','Europa','Latvian','+02:00','lva.svg'), ('LS','LSO','Lesoto','Africa','English','+02:00','lso.svg'), ('LR','LBR','Liberia','Africa','English','','lbr.svg'), ('LI','LIE','Liechtenstein','Europa','German','+01:00','lie.svg'), ('LT','LTU','Lituania','Europa','Lithuanian','+02:00','ltu.svg'), ('LU','LUX','Luxemburgo','Europa','French','+01:00','lux.svg'), ('MG','MDG','Madagascar','Africa','French','+03:00','mdg.svg'), ('HU','HUN','Hungría','Europa','Hungarian','+01:00','hun.svg'), ('MH','MHL','Islas Marshall','Oceanía','English','+12:00','mhl.svg'), ('MW','MWI','Malaui','Africa','English','+02:00','mwi.svg'), ('MY','MYS','Malasia','Asia','Malaysian','+08:00','mys.svg'), ('MV','MDV','Maldivas','Asia','Divehi','+05:00','mdv.svg'), ('ML','MLI','Malí','Africa','French','','mli.svg'), ('MT','MLT','Malta','Europa','Maltese','+01:00','mlt.svg'), ('MQ','MTQ','Martinica','América','French','-04:00','mtq.svg'), ('MU','MUS','Mauricio','Africa','English','+04:00','mus.svg'), ('YT','MYT','Mayotte','Africa','French','+03:00','myt.svg'), ('MX','MEX','México','América','Spanish','-08:00','mex.svg'), ('FM','FSM','Micronesia','Oceanía','English','+10:00','fsm.svg'), ('MZ','MOZ','Mozambique','Africa','Portuguese','+02:00','moz.svg'), ('MD','MDA','Moldavia','Europa','Romanian','+02:00','mda.svg'), ('MC','MCO','Mónaco','Europa','French','+01:00','mco.svg'), ('MS','MSR','Montserrat','América','English','-04:00','msr.svg'), ('MM','MMR','Myanmar','Asia','Burmese','+06:30','mmr.svg'), ('NA','NAM','Namibia','Africa','English','+01:00','nam.svg'), ('NR','NRU','Nauru','Oceanía','English','+12:00','nru.svg'), ('NL','NLD','Países Bajos','Europa','Dh','-04:00','nld.svg'), ('BN','BRN','Brunéi','Asia','Malay','+08:00','brn.svg'), ('NZ','NZL','Nueva Zelanda','Oceanía','English','-11:00','nzl.svg'), ('NI','NIC','Nicaragua','América','Spanish','-06:00','nic.svg'), ('NE','NER','Níger','Africa','French','+01:00','ner.svg'), ('NG','NGA','Nigeria','Africa','English','+01:00','nga.svg'), ('NU','NIU','Niue','Oceanía','English','-11:00','niu.svg'), ('NF','NFK','Isla Norfolk','Oceanía','English','+11:30','nfk.svg'), ('NO','NOR','Noruega','Europa','Norwegian','+01:00','nor.svg'), ('MP','MNP','Islas Marianas del Norte','Oceanía','English','+10:00','mnp.svg'), ('NC','NCL','Nueva Caledonia','Oceanía','French','+11:00','ncl.svg'), ('UZ','UZB','Uzbekistán','Asia','Uzbek','+05:00','uzb.svg'), ('AT','AUT','Austria','Europa','German','+01:00','aut.svg'), ('PK','PAK','Pakistán','Asia','English','+05:00','pak.svg'), ('PW','PLW','Palaos','Oceanía','English','+09:00','plw.svg'), ('PA','PAN','Panamá','América','Spanish','-05:00','pan.svg'), ('PG','PNG','Papúa Nueva Guinea','Oceanía','English','+10:00','png.svg'), ('PY','PRY','Paraguay','América','Spanish','-04:00','pry.svg'), ('PE','PER','Perú','América','Spanish','-05:00','per.svg'), ('PH','PHL','Filipinas','Asia','English','+08:00','phl.svg'), ('PN','PCN','Islas Pitcairn','Oceanía','English','-08:00','pcn.svg'), ('PL','POL','Polonia','Europa','Polish','+01:00','pol.svg'), ('PF','PYF','Polinesia Francesa','Oceanía','French','-10:00','pyf.svg'), ('PT','PRT','Portugal','Europa','Portuguese','-01:00','prt.svg'), ('PR','PRI','Puerto Rico','América','Spanish','-04:00','pri.svg'), ('DO','DOM','República Dominicana','América','Spanish','-04:00','dom.svg'), ('XK','KOS','República de Kosovo','Europe','Albanian','+01:00','kos.svg'), ('CD','COD','Congo','Africa','French','+01:00','cod.svg'), ('CG','COG','República del Congo','Africa','French','+01:00','cog.svg'), ('RO','ROU','Rumania','Europa','Romanian','+02:00','rou.svg'), ('RW','RWA','Ruanda','Africa','Kinyarwanda','+02:00','rwa.svg'), ('SH','SHN','Santa Elena','Africa','English','+00:00','shn.svg'), ('KN','KNA','San Cristóbal y Nieves','América','English','-04:00','kna.svg'), ('LC','LCA','Santa Lucía','América','English','-04:00','lca.svg'), ('VC','VCT','San Vicente y las Granadinas','América','English','-04:00','vct.svg'), ('BL','BLM','San Bartolomé','América','French','-04:00','blm.svg'), ('MF','MAF','San Martín','América','English','-04:00','maf.svg'), ('PM','SPM','San Pedro y Miquelón','América','French','-03:00','spm.svg'), ('WS','WSM','Samoa','Oceanía','Samoan','+13:00','wsm.svg'), ('SM','SMR','San Marino','Europa','Italian','+01:00','smr.svg'), ('VA','VAT','Ciudad del Vaticano','Europa','Latin','+01:00','vat.svg'), ('ST','STP','Santo Tomé y Príncipe','Africa','Portuguese','','stp.svg'), ('CH','CHE','Suiza','Europa','German','+01:00','che.svg'), ('SN','SEN','Senegal','Africa','French','','sen.svg'), ('SC','SYC','Seychelles','Africa','French','+04:00','syc.svg'), ('AL','ALB','Albania','Europa','Albanian','+01:00','alb.svg'), ('SL','SLE','Sierra Leona','Africa','English','','sle.svg'), ('SG','SGP','Singapur','Asia','English','+08:00','sgp.svg'), ('SX','SXM','San Martín','América','Dh','-04:00','sxm.svg'), ('SI','SVN','Eslovenia','Europa','Slovene','+01:00','svn.svg'), ('SK','SVK','Eslovaquia','Europa','Slovak','+01:00','svk.svg'), ('SB','SLB','Islas Salomón','Oceanía','English','+11:00','slb.svg'), ('SO','SOM','Somalia','Africa','Somali','+03:00','som.svg'), ('ZA','ZAF','Sudáfrica','Africa','Afrikaans','+02:00','zaf.svg'), ('GS','SGS','Islas Georgias del Sur','América','English','-02:00','sgs.svg'), ('SS','SSD','Sudán del Sur','Africa','English','+03:00','ssd.svg'), ('LK','LKA','Sri Lanka','Asia','Sinhalese','+05:30','lka.svg'), ('FI','FIN','Finlandia','Europa','Finnish','+02:00','fin.svg'), ('SR','SUR','Surinam','América','Dh','-03:00','sur.svg'), ('SJ','SJM','Svalbard y Jan Mayen','Europa','Norwegian','+01:00','sjm.svg'), ('SE','SWE','Suecia','Europa','Swedish','+01:00','swe.svg'), ('SZ','SWZ','Suazilandia','Africa','English','+02:00','swz.svg'), ('TZ','TZA','Tanzania','Africa','Swahili','+03:00','tza.svg'), ('TD','TCD','Chad','Africa','French','+01:00','tcd.svg'), ('TF','ATF','Tierras Antárticas Francesas','Africa','French','+05:00','atf.svg'), ('TL','TLS','Timor Oriental','Asia','Portuguese','+09:00','tls.svg'), ('TG','TGO','Togo','Africa','French','','tgo.svg'), ('TK','TKL','Tokelau','Oceanía','English','+13:00','tkl.svg'), ('TO','TON','Tonga','Oceanía','English','+13:00','ton.svg'), ('TT','TTO','Trinidad y Tobago','América','English','-04:00','tto.svg'), ('TR','TUR','Turquía','Asia','Turkish','+03:00','tur.svg'), ('TM','TKM','Turkmenistán','Asia','Turkmen','+05:00','tkm.svg'), ('TC','TCA','Islas Turcas y Caicos','América','English','-04:00','tca.svg'), ('TV','TUV','Tuvalu','Oceanía','English','+12:00','tuv.svg'), ('UG','UGA','Uganda','Africa','English','+03:00','uga.svg'), ('GB','GBR','Reino Unido','Europa','English','-08:00','gbr.svg'), ('US','USA','Estados Unidos','América','English','-12:00','usa.svg'), ('UM','UMI','Islas Menores de EE.UU.','América','English','-11:00','umi.svg'), ('UY','URY','Uruguay','América','Spanish','-03:00','ury.svg'), ('VU','VUT','Vanuatu','Oceanía','Bislama','+11:00','vut.svg'), ('VE','VEN','Venezuela','América','Spanish','-04:00','ven.svg'), ('VN','VNM','Vietnam','Asia','Vietnamese','+07:00','vnm.svg'), ('VI','VIR','Islas Vírgenes de EE.UU.','América','English','-04:00','vir.svg'), ('WF','WLF','Wallis y Futuna','Oceanía','French','+12:00','wlf.svg'), ('ZM','ZMB','Zambia','Africa','English','+02:00','zmb.svg'), ('ZW','ZWE','Zimbabue','Africa','English','+02:00','zwe.svg'), ('GR','GRC','Grecia','Europa','Greek modern','+02:00','grc.svg'), ('CY','CYP','Chipre','Europa','Greek modern','+02:00','cyp.svg'), ('BY','BLR','Bielorrusia','Europa','Belarusian','+03:00','blr.svg'), ('BG','BGR','Bulgaria','Europa','Bulgarian','+02:00','bgr.svg'), ('KG','KGZ','Kirguistán','Asia','Kyrgyz','+06:00','kgz.svg'), ('KZ','KAZ','Kazajistán','Asia','Kazakh','+05:00','kaz.svg'), ('MK','MKD','Macedonia del Norte','Europa','Macedonian','+01:00','mkd.svg'), ('MN','MNG','Mongolia','Asia','Mongolian','+07:00','mng.svg'), ('RU','RUS','Rusia','Europa','Russian','+03:00','rus.svg'), ('RS','SRB','Serbia','Europa','Serbian','+01:00','srb.svg'), ('TJ','TJK','Tayikistán','Asia','Tajik','+05:00','tjk.svg'), ('UA','UKR','Ucrania','Europa','Ukrainian','+02:00','ukr.svg'), ('ME','MNE','Montenegro','Europa','Serbian','+01:00','mne.svg'), ('AM','ARM','Armenia','Asia','Armenian','+04:00','arm.svg'), ('GE','GEO','Georgia','Asia','Georgian','-05:00','geo.svg'), ('IL','ISR','Israel','Asia','Hebrew modern','+02:00','isr.svg'), ('AF','AFG','Afganistán','Asia','Pashto','+04:30','afg.svg'), ('JO','JOR','Jordania','Asia','Arabic','+03:00','jor.svg'), ('BH','BHR','Baréin','Asia','Arabic','+03:00','bhr.svg'), ('DZ','DZA','Argelia','Africa','Arabic','+01:00','dza.svg'), ('SD','SDN','Sudán','Africa','Arabic','+03:00','sdn.svg'), ('EH','ESH','República Árabe Saharaui','Africa','Arabic','+00:00','esh.svg'), ('IQ','IRQ','Irak','Asia','Arabic','+03:00','irq.svg'), ('SA','SAU','Arabia Saudita','Asia','Arabic','+03:00','sau.svg'), ('KW','KWT','Kuwait','Asia','Arabic','+03:00','kwt.svg'), ('MA','MAR','Marruecos','Africa','Arabic','','mar.svg'), ('YE','YEM','Yemen','Asia','Arabic','+03:00','yem.svg'), ('IR','IRN','Irán','Asia','Persian Farsi','+03:30','irn.svg'), ('TN','TUN','Túnez','Africa','Arabic','+01:00','tun.svg'), ('AE','ARE','Emiratos Árabes Unidos','Asia','Arabic','+04','are.svg'), ('SY','SYR','Siria','Asia','Arabic','+02:00','syr.svg'), ('OM','OMN','Omán','Asia','Arabic','+04:00','omn.svg'), ('PS','PSE','Palestina','Asia','Arabic','+02:00','pse.svg'), ('QA','QAT','Catar','Asia','Arabic','+03:00','qat.svg'), ('LB','LBN','Líbano','Asia','Arabic','+02:00','lbn.svg'), ('LY','LBY','Libia','Africa','Arabic','+01:00','lby.svg'), ('EG','EGY','Egipto','Africa','Arabic','+02:00','egy.svg'), ('MR','MRT','Mauritania','Africa','Arabic','','mrt.svg'), ('NP','NPL','Nepal','Asia','Nepali','+05:45','npl.svg'), ('IN','IND','India','Asia','Hindi','+05:30','ind.svg'), ('TH','THA','Tailandia','Asia','Thai','+07:00','tha.svg'), ('LA','LAO','Laos','Asia','Lao','+07:00','lao.svg'), ('ET','ETH','Etiopía','Africa','Amharic','+03:00','eth.svg'), ('ER','ERI','Eritrea','Africa','Tigrinya','+03:00','eri.svg'), ('KR','KOR','Corea del Sur','Asia','Korean','+09:00','kor.svg'), ('KP','PRK','Corea del Norte','Asia','Korean','+09:00','prk.svg'), ('CN','CHN','China','Asia','Chinese','+08:00','chn.svg'), ('JP','JPN','Japón','Asia','Japanese','+09:00','jpn.svg'), ('MO','MAC','Macao','Asia','Chinese','+08:00','mac.svg'), ('TW','TWN','Taiwán','Asia','Chinese','+08:00','twn.svg'), ('HK','HKG','Hong Kong','Asia','English','+08:00','hkg.svg'), ('NN','NNN','- Sin un país de referencia -','-','-','00:00','-')
;

/* TABLAS AUXILIARES PARA USUARIOS Y RCLV */;
CREATE TABLE aux_roles_iglesia (
	id VARCHAR(3) NOT NULL,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	usuario BOOLEAN NOT NULL,
	personaje BOOLEAN NOT NULL,
	sexo_id VARCHAR(1) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO aux_roles_iglesia (id, orden, nombre, usuario, personaje, sexo_id)
VALUES 
('PC', 0, 'Computadora', 0, 0, 'O'),
('LS', 1, 'Laico soltero', 1, 1, 'O'),
('LSV', 1, 'Laico soltero', 1, 1, 'V'),
('LSM', 1, 'Laica soltera', 1, 1, 'M'),
('LC', 2, 'Laico casado', 0, 1, '-'),
('LCV', 2, 'Laico casado', 1, 1, 'V'),
('LCM', 2, 'Laica casada', 1, 1, 'M'),
('RC', 3, 'Religioso consagrado', 0, 1, '-'),
('RCV', 3, 'Religioso consagrado', 1, 1, 'V'),
('RCM', 3, 'Religiosa consagrada', 1, 1, 'M'),
('SC', 4, 'Sacerdote', 0, 1, '-'),
('SCV', 4, 'Sacerdote', 1, 1, 'V'),
('PP', 5, 'Papa', 0, 1, '-'),
('PPV', 5, 'Papa', 0, 1, 'V')
;
CREATE TABLE aux_sexos (
	id VARCHAR(1) NOT NULL,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(20) NOT NULL,
	letra_final VARCHAR(1) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO aux_sexos (id, orden, nombre, letra_final)
VALUES 
('M', 1, 'Mujer', 'a'), 
('V', 2, 'Varón', 'o'),
('P', 3, 'Prefiero no decirlo', 'o')
;

/* TABLAS AUXILIARES PARA USUARIOS */;
CREATE TABLE us_roles (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(30) NOT NULL,
	aut_input BOOLEAN NOT NULL,
	aut_gestion_prod BOOLEAN NOT NULL,
	aut_gestion_us BOOLEAN NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO us_roles (id, orden, nombre, aut_input, aut_gestion_prod, aut_gestion_us)
VALUES 
(1, 1, 'Consultas', 0, 0, 0),
(2, 2, 'Autorizado p/Inputs', 1, 0, 0),
(3, 3, 'Gestor de Productos', 1, 1, 0),
(4, 4, 'Gestor de Usuarios', 1, 0, 1),
(5, 5, 'Omnipotente', 1, 1, 1)
;
CREATE TABLE us_status_registro (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	mail_validado BOOLEAN NULL,
	datos_perennes BOOLEAN NULL,
	datos_editables BOOLEAN NULL,
	documento BOOLEAN NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO us_status_registro (id, orden, nombre, mail_validado, datos_perennes, datos_editables, documento)
VALUES 
(1, 1, 'Mail a validar', 0, 0, 0, 0), 
(2, 2, 'Mail validado', 1, 0, 0, 0), 
(3, 3, 'Datos perennes OK', 1, 1, 0, 0), 
(4, 4, 'Datos editables OK', 1, 1, 1, 0),
(5, 5, 'Documento OK', 1, 1, 1, 1)
;

/* USUARIOS */;
CREATE TABLE USUARIOS (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	email VARCHAR(100) NOT NULL UNIQUE,
	contrasena VARCHAR(100) NOT NULL,
	nombre VARCHAR(30) NULL,
	apellido VARCHAR(30) NULL,
	apodo VARCHAR(30) NULL,
	numero_documento INT UNSIGNED UNIQUE NULL,
	avatar VARCHAR(100) DEFAULT '-',
	fecha_nacimiento DATE NULL,
	sexo_id VARCHAR(1) NULL,
	pais_id VARCHAR(2) NULL,
	rol_iglesia_id VARCHAR(3) NULL,
	rol_usuario_id TINYINT UNSIGNED DEFAULT 1,
	autorizado_fa BOOLEAN DEFAULT 0,

	dias_login SMALLINT UNSIGNED DEFAULT 1,
	fecha_ultimo_login DATE DEFAULT UTC_DATE,

	creado_en DATETIME DEFAULT UTC_TIMESTAMP,
	completado_en DATETIME NULL,
	editado_en DATETIME NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,
	
	documento_validado_por_id INT UNSIGNED NULL,
	
	penalizado_en DATETIME NULL,
	penalizado_hasta DATETIME NULL,
	penalizado_por_id INT UNSIGNED NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (sexo_id) REFERENCES aux_sexos(id),
	FOREIGN KEY (pais_id) REFERENCES aux_paises(id),
	FOREIGN KEY (rol_usuario_id) REFERENCES us_roles(id),
	FOREIGN KEY (rol_iglesia_id) REFERENCES aux_roles_iglesia(id),
	FOREIGN KEY (status_registro_id) REFERENCES us_status_registro(id),
	FOREIGN KEY (documento_validado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (penalizado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO USUARIOS (id, email, contrasena, apodo, rol_usuario_id, autorizado_fa, status_registro_id, creado_en, completado_en)
VALUES 
(1, 'sinMail1', 'sinContraseña', 'Startup', 2, 1, 4, '2021-01-01','2021-01-02'),
(2, 'sinMail2', 'sinContraseña', 'Automatizado', 2, 1, 4, '2021-01-01','2021-01-02'),
(3, 'sp2015w@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 'Usuario Sin Privilegios', 1, 1, 4, '2021-01-01', '2021-01-02')
;
INSERT INTO USUARIOS (id, email, contrasena, nombre, apellido, apodo, numero_documento, avatar, fecha_nacimiento, sexo_id, pais_id, rol_usuario_id, rol_iglesia_id, autorizado_fa, status_registro_id, creado_en, completado_en)
VALUES 
(10, 'diegoiribarren2015@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 'Diego', 'Startup', 'Diego', '0', '1617370359746.jpg', '1969-08-16', 'V', 'AR', 5, 'LCV', 1, 4, '2021-01-01','2021-01-02'),
(11, 'diegoiribarren2021@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 'Diego', 'Iribarren', 'Diego', '21072001', '1632959816163.jpg', '1969-08-16', 'V', 'AR', 5, 'LCV', 1, 4, '2021-01-01','2021-01-02')
;

/* TABLAS QUE DEPENDEN DE USUARIO */;
CREATE TABLE filtros_personales_cabecera (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(15) NOT NULL,
	usuario_id INT UNSIGNED NOT NULL,
	palabras_clave VARCHAR(20),
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE filtros_personales_campos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	filtro_cabecera_id INT UNSIGNED,
	campo_id VARCHAR(100),
	valor_id SMALLINT UNSIGNED,
	PRIMARY KEY (id),
	FOREIGN KEY (filtro_cabecera_id) REFERENCES filtros_personales_cabecera(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* TABLAS AUXILIARES PARA ENTIDADES */;
CREATE TABLE aux_status_registro (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(25) NOT NULL UNIQUE,
	gr_pend_aprob BOOLEAN DEFAULT 0,
	gr_revisados BOOLEAN DEFAULT 0,
	gr_inactivos BOOLEAN DEFAULT 0,
	creado BOOLEAN DEFAULT 0,
	alta_aprob BOOLEAN DEFAULT 0,
	aprobado BOOLEAN DEFAULT 0,
	inactivar BOOLEAN DEFAULT 0,
	inactivado BOOLEAN DEFAULT 0,
	recuperar BOOLEAN DEFAULT 0,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO aux_status_registro (id, orden, nombre, creado, gr_pend_aprob) VALUES (1, 1, 'Creado',1,1);
INSERT INTO aux_status_registro (id, orden, nombre, alta_aprob, gr_pend_aprob) VALUES (2, 2, 'Alta-aprobada',1,1);
INSERT INTO aux_status_registro (id, orden, nombre, aprobado, gr_revisados) VALUES (3, 3, 'Aprobado',1,1);
INSERT INTO aux_status_registro (id, orden, nombre, inactivar, gr_inactivos) VALUES (5, 5, 'Inactivar',1,1);
INSERT INTO aux_status_registro (id, orden, nombre, inactivado, gr_revisados, gr_inactivos) VALUES (6, 6, 'Inactivado',1,1,1);
INSERT INTO aux_status_registro (id, orden, nombre, recuperar, gr_inactivos) VALUES (7, 7, 'Recuperar',1,1);

/* TABLAS AUXILIARES PARA RCLV */;
CREATE TABLE rclv_meses (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(10) NOT NULL,
	abrev VARCHAR(3) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO rclv_meses (nombre, abrev)
VALUES ('Enero', 'ene'), ('Febrero', 'feb'), ('Marzo', 'mar'), ('Abril', 'abr'), ('Mayo', 'may'), ('Junio', 'jun'), ('Julio', 'jul'), ('Agosto', 'ago'), ('Septiembre', 'sep'), ('Octubre', 'oct'), ('Noviembre', 'nov'), ('Diciembre', 'dic');
CREATE TABLE rclv_dias (
	id SMALLINT UNSIGNED NOT NULL,
	dia TINYINT UNSIGNED NOT NULL,
	mes_id TINYINT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (mes_id) REFERENCES rclv_meses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO rclv_dias (id, dia, mes_id)
VALUES (1, 1, 1), (2, 2, 1), (3, 3, 1), (4, 4, 1), (5, 5, 1), (6, 6, 1), (7, 7, 1), (8, 8, 1), (9, 9, 1), (10, 10, 1), (11, 11, 1), (12, 12, 1), (13, 13, 1), (14, 14, 1), (15, 15, 1), (16, 16, 1), (17, 17, 1), (18, 18, 1), (19, 19, 1), (20, 20, 1), (21, 21, 1), (22, 22, 1), (23, 23, 1), (24, 24, 1), (25, 25, 1), (26, 26, 1), (27, 27, 1), (28, 28, 1), (29, 29, 1), (30, 30, 1), (31, 31, 1), (32, 1, 2), (33, 2, 2), (34, 3, 2), (35, 4, 2), (36, 5, 2), (37, 6, 2), (38, 7, 2), (39, 8, 2), (40, 9, 2), (41, 10, 2), (42, 11, 2), (43, 12, 2), (44, 13, 2), (45, 14, 2), (46, 15, 2), (47, 16, 2), (48, 17, 2), (49, 18, 2), (50, 19, 2), (51, 20, 2), (52, 21, 2), (53, 22, 2), (54, 23, 2), (55, 24, 2), (56, 25, 2), (57, 26, 2), (58, 27, 2), (59, 28, 2), (60, 29, 2), (61, 1, 3), (62, 2, 3), (63, 3, 3), (64, 4, 3), (65, 5, 3), (66, 6, 3), (67, 7, 3), (68, 8, 3), (69, 9, 3), (70, 10, 3), (71, 11, 3), (72, 12, 3), (73, 13, 3), (74, 14, 3), (75, 15, 3), (76, 16, 3), (77, 17, 3), (78, 18, 3), (79, 19, 3), (80, 20, 3), (81, 21, 3), (82, 22, 3), (83, 23, 3), (84, 24, 3), (85, 25, 3), (86, 26, 3), (87, 27, 3), (88, 28, 3), (89, 29, 3), (90, 30, 3), (91, 31, 3), (92, 1, 4), (93, 2, 4), (94, 3, 4), (95, 4, 4), (96, 5, 4), (97, 6, 4), (98, 7, 4), (99, 8, 4), (100, 9, 4), (101, 10, 4), (102, 11, 4), (103, 12, 4), (104, 13, 4), (105, 14, 4), (106, 15, 4), (107, 16, 4), (108, 17, 4), (109, 18, 4), (110, 19, 4), (111, 20, 4), (112, 21, 4), (113, 22, 4), (114, 23, 4), (115, 24, 4), (116, 25, 4), (117, 26, 4), (118, 27, 4), (119, 28, 4), (120, 29, 4), (121, 30, 4), (122, 1, 5), (123, 2, 5), (124, 3, 5), (125, 4, 5), (126, 5, 5), (127, 6, 5), (128, 7, 5), (129, 8, 5), (130, 9, 5), (131, 10, 5), (132, 11, 5), (133, 12, 5), (134, 13, 5), (135, 14, 5), (136, 15, 5), (137, 16, 5), (138, 17, 5), (139, 18, 5), (140, 19, 5), (141, 20, 5), (142, 21, 5), (143, 22, 5), (144, 23, 5), (145, 24, 5), (146, 25, 5), (147, 26, 5), (148, 27, 5), (149, 28, 5), (150, 29, 5), (151, 30, 5), (152, 31, 5), (153, 1, 6), (154, 2, 6), (155, 3, 6), (156, 4, 6), (157, 5, 6), (158, 6, 6), (159, 7, 6), (160, 8, 6), (161, 9, 6), (162, 10, 6), (163, 11, 6), (164, 12, 6), (165, 13, 6), (166, 14, 6), (167, 15, 6), (168, 16, 6), (169, 17, 6), (170, 18, 6), (171, 19, 6), (172, 20, 6), (173, 21, 6), (174, 22, 6), (175, 23, 6), (176, 24, 6), (177, 25, 6), (178, 26, 6), (179, 27, 6), (180, 28, 6), (181, 29, 6), (182, 30, 6), (183, 1, 7), (184, 2, 7), (185, 3, 7), (186, 4, 7), (187, 5, 7), (188, 6, 7), (189, 7, 7), (190, 8, 7), (191, 9, 7), (192, 10, 7), (193, 11, 7), (194, 12, 7), (195, 13, 7), (196, 14, 7), (197, 15, 7), (198, 16, 7), (199, 17, 7), (200, 18, 7), (201, 19, 7), (202, 20, 7), (203, 21, 7), (204, 22, 7), (205, 23, 7), (206, 24, 7), (207, 25, 7), (208, 26, 7), (209, 27, 7), (210, 28, 7), (211, 29, 7), (212, 30, 7), (213, 31, 7), (214, 1, 8), (215, 2, 8), (216, 3, 8), (217, 4, 8), (218, 5, 8), (219, 6, 8), (220, 7, 8), (221, 8, 8), (222, 9, 8), (223, 10, 8), (224, 11, 8), (225, 12, 8), (226, 13, 8), (227, 14, 8), (228, 15, 8), (229, 16, 8), (230, 17, 8), (231, 18, 8), (232, 19, 8), (233, 20, 8), (234, 21, 8), (235, 22, 8), (236, 23, 8), (237, 24, 8), (238, 25, 8), (239, 26, 8), (240, 27, 8), (241, 28, 8), (242, 29, 8), (243, 30, 8), (244, 31, 8), (245, 1, 9), (246, 2, 9), (247, 3, 9), (248, 4, 9), (249, 5, 9), (250, 6, 9), (251, 7, 9), (252, 8, 9), (253, 9, 9), (254, 10, 9), (255, 11, 9), (256, 12, 9), (257, 13, 9), (258, 14, 9), (259, 15, 9), (260, 16, 9), (261, 17, 9), (262, 18, 9), (263, 19, 9), (264, 20, 9), (265, 21, 9), (266, 22, 9), (267, 23, 9), (268, 24, 9), (269, 25, 9), (270, 26, 9), (271, 27, 9), (272, 28, 9), (273, 29, 9), (274, 30, 9), (275, 1, 10), (276, 2, 10), (277, 3, 10), (278, 4, 10), (279, 5, 10), (280, 6, 10), (281, 7, 10), (282, 8, 10), (283, 9, 10), (284, 10, 10), (285, 11, 10), (286, 12, 10), (287, 13, 10), (288, 14, 10), (289, 15, 10), (290, 16, 10), (291, 17, 10), (292, 18, 10), (293, 19, 10), (294, 20, 10), (295, 21, 10), (296, 22, 10), (297, 23, 10), (298, 24, 10), (299, 25, 10), (300, 26, 10), (301, 27, 10), (302, 28, 10), (303, 29, 10), (304, 30, 10), (305, 31, 10), (306, 1, 11), (307, 2, 11), (308, 3, 11), (309, 4, 11), (310, 5, 11), (311, 6, 11), (312, 7, 11), (313, 8, 11), (314, 9, 11), (315, 10, 11), (316, 11, 11), (317, 12, 11), (318, 13, 11), (319, 14, 11), (320, 15, 11), (321, 16, 11), (322, 17, 11), (323, 18, 11), (324, 19, 11), (325, 20, 11), (326, 21, 11), (327, 22, 11), (328, 23, 11), (329, 24, 11), (330, 25, 11), (331, 26, 11), (332, 27, 11), (333, 28, 11), (334, 29, 11), (335, 30, 11), (336, 1, 12), (337, 2, 12), (338, 3, 12), (339, 4, 12), (340, 5, 12), (341, 6, 12), (342, 7, 12), (343, 8, 12), (344, 9, 12), (345, 10, 12), (346, 11, 12), (347, 12, 12), (348, 13, 12), (349, 14, 12), (350, 15, 12), (351, 16, 12), (352, 17, 12), (353, 18, 12), (354, 19, 12), (355, 20, 12), (356, 21, 12), (357, 22, 12), (358, 23, 12), (359, 24, 12), (360, 25, 12), (361, 26, 12), (362, 27, 12), (363, 28, 12), (364, 29, 12), (365, 30, 12), (366, 31, 12);
CREATE TABLE rclv_proc_canoniz (
	id VARCHAR(3) NOT NULL,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO rclv_proc_canoniz (id, orden, nombre)
VALUES 
('ST', 1, 'Santo'),
('STV', 1, 'Santo'),
('STM', 1, 'Santa'),
('BT', 2, 'Beato'),
('BTV', 2, 'Beato'),
('BTM', 2, 'Beata'),
('VN', 3, 'Venerable'),
('VNV', 3, 'Venerable'),
('VNM', 3, 'Venerable'),
('SD', 4, 'Siervo de Dios'),
('SDV', 4, 'Siervo de Dios'),
('SDM', 4, 'Sierva de Dios')
;

/* RCLV */;
CREATE TABLE rclv_1personajes (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	nombre VARCHAR(30) NOT NULL UNIQUE,
	ano SMALLINT NULL,
	proceso_canonizacion_id VARCHAR(3) NULL,
	rol_iglesia_id VARCHAR(3) NULL,
	prod_aprobados BOOLEAN NULL,
	
	creado_por_id INT UNSIGNED NOT NULL,
	creado_en DATETIME DEFAULT UTC_TIMESTAMP,
	alta_analizada_por_id INT UNSIGNED NULL,
	alta_analizada_en DATETIME NULL,
	lead_time_creacion SMALLINT UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editado_en DATETIME NULL,
	edic_analizada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,
	captura_activa BOOLEAN NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES rclv_dias(id),
	FOREIGN KEY (proceso_canonizacion_id) REFERENCES rclv_proc_canoniz(id),
	FOREIGN KEY (rol_iglesia_id) REFERENCES aux_roles_iglesia(id),
	FOREIGN KEY (creado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (alta_analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES aux_status_registro(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO rclv_1personajes (id, nombre, creado_por_id, status_registro_id)
VALUES 
(1, 'Ninguno', 1, 3),
(2, 'Varios (colección)', 1, 3)
;
INSERT INTO rclv_1personajes (id, dia_del_ano_id, ano, nombre, proceso_canonizacion_id, rol_iglesia_id, creado_por_id, status_registro_id)
VALUES 
(11, NULL, 0, 'Jesús', 'STV', 'RCV', 1, 3),
(12, 1, -15, 'María, madre de Jesús', 'STM', 'LCM', 1, 3),
(13, 79, -20,'José, padre de Jesús', 'STV', 'LCV', 1, 3)
;
INSERT INTO rclv_1personajes (id, cant_prod_creados, dia_del_ano_id, ano, nombre, proceso_canonizacion_id, rol_iglesia_id, creado_por_id, creado_en)
VALUES 
(21, 1, 249, 1910,'Teresa de Calcuta','STM','RCM',10,'2022-03-16 23:25:20'),
(22, 2, 285, 1958,'Juan XXIII','STV','PPV',11,'2022-03-16 23:25:20'),
(23, 2, 31, 1815,'Juan Bosco','STV','RCV',10,'2022-03-16 23:25:20'),
(24, 1, 296, 1920,'Juan Pablo II','STV','PPV',10,'2022-03-16 23:25:20')
;
CREATE TABLE rclv_2hechos (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	nombre VARCHAR(30) NOT NULL UNIQUE,
	ano SMALLINT NULL,
	prod_aprobados BOOLEAN NULL,

	creado_por_id INT UNSIGNED NOT NULL,
	creado_en DATETIME DEFAULT UTC_TIMESTAMP,
	alta_analizada_por_id INT UNSIGNED NULL,
	alta_analizada_en DATETIME NULL,
	lead_time_creacion SMALLINT UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editado_en DATETIME NULL,
	edic_analizada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,
	captura_activa BOOLEAN NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES rclv_dias(id),
	FOREIGN KEY (creado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (alta_analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES aux_status_registro(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO rclv_2hechos (id, dia_del_ano_id, ano, nombre, creado_por_id, status_registro_id)
VALUES
(1, NULL, NULL, 'Ninguno', 1, 3),
(2, NULL, NULL, 'Varios (colección)', 1, 3)
;
INSERT INTO rclv_2hechos (id, dia_del_ano_id, ano, nombre, creado_por_id, status_registro_id)
VALUES
(11, 359, 0, 'Navidad', 1, 3),
(12, 100, 33, 'Sem. Santa - 1. General', 1, 3),
(13, 105, 33, 'Sem. Santa - 2. Viernes Santo', 1, 3),
(14, 107, 33, 'Sem. Santa - 3. Resurrección', 1, 3),
(15, 150, 33, 'Pentecostés', 1, 3),
(16, 210, 1914, 'Guerra Mundial - 1a', 1, 3),
(17, 245, 1942, 'Guerra Mundial - 2a', 1, 3)
;
CREATE TABLE rclv_3valores (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	nombre VARCHAR(30) NOT NULL UNIQUE,
	prod_aprobados BOOLEAN NULL,

	creado_por_id INT UNSIGNED NOT NULL,
	creado_en DATETIME DEFAULT UTC_TIMESTAMP,
	alta_analizada_por_id INT UNSIGNED NULL,
	alta_analizada_en DATETIME NULL,
	lead_time_creacion SMALLINT UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editado_en DATETIME NULL,
	edic_analizada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,
	captura_activa BOOLEAN NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES rclv_dias(id),
	FOREIGN KEY (creado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (alta_analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES aux_status_registro(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO rclv_3valores (id, nombre, creado_por_id, status_registro_id)
VALUES
(1, 'Ninguno', 1, 3),
(2, 'Varios (colección)', 1, 3)
;
INSERT INTO rclv_3valores (id, nombre, creado_por_id, status_registro_id)
VALUES
(11, 'Perseverancia', 1, 3),
(12, 'Pacificar un país dividido', 1, 3),
(13, 'Pasión por ayudar', 1, 3),
(14, 'Superación personal', 1, 3)
;
CREATE TABLE rclv_4edicion (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	pelicula_id INT UNSIGNED DEFAULT NULL,
	coleccion_id INT UNSIGNED DEFAULT NULL,
	capitulo_id INT UNSIGNED DEFAULT NULL,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	ano SMALLINT NULL,
	nombre VARCHAR(30) NULL UNIQUE,
	proceso_canonizacion_id VARCHAR(3) NULL,
	rol_iglesia_id VARCHAR(3) NULL,

	editado_por_id INT UNSIGNED NOT NULL,
	editado_en DATETIME NOT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES rclv_dias(id),
	FOREIGN KEY (proceso_canonizacion_id) REFERENCES rclv_proc_canoniz(id),
	FOREIGN KEY (rol_iglesia_id) REFERENCES aux_roles_iglesia(id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* TABLAS AUXILIARES PARA PRODUCTOS */;
CREATE TABLE prod_categ1 (
	id VARCHAR(3) NOT NULL,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO prod_categ1 (id, orden, nombre)
VALUES 
('CFC', 1, 'Centradas en la Fe Católica'), 
('VPC', 2, 'Valores Presentes en la Cultura')
;
CREATE TABLE prod_categ2_sub (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	personaje BOOLEAN DEFAULT 0,
	hecho BOOLEAN DEFAULT 0,
	valor BOOLEAN DEFAULT 0,
	url VARCHAR(20) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (categoria_id) REFERENCES prod_categ1(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO prod_categ2_sub (id, orden, categoria_id, nombre, personaje, hecho, valor, url)
VALUES 
(1, 1, 'CFC', 'Jesús', 1, 0, 0, 'cfc/jesus'), 
(2, 2, 'CFC', 'Contemporáneos de Jesús', 1, 0, 0, 'cfc/contemporaneos'), 
(3, 3, 'CFC', 'Apariciones Marianas', 0, 1, 0, 'cfc/marianas'), 
(4, 4, 'CFC', 'Hagiografías', 1, 0, 0, 'cfc/hagiografias'), 
(5, 5, 'CFC', 'Historias de la Iglesia', 0, 1, 0, 'cfc/historias'), 
(6, 6, 'CFC', 'Novelas centradas en la fe', 0, 0, 1, 'cfc/novelas'), 
(7, 7, 'CFC', 'Documentales', 0, 0, 0, 'cfc/documentales'), 
(8, 8, 'VPC', 'Biografías', 1, 0, 1, 'vpc/bios_historias'), 
(12, 9, 'VPC', 'Historias', 0, 1, 1, 'vpc/bios_historias'),
(9, 10, 'VPC', 'Matrimonio y Familia', 0, 0, 1, 'vpc/matrimonio'), 
(10, 11, 'VPC', 'Novelas', 0, 0, 1, 'vpc/novelas'), 
(11, 12, 'VPC', 'Musicales', 0, 0, 1, 'vpc/musicales')
;
CREATE TABLE prod_publicos_sugeridos (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,	
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO prod_publicos_sugeridos (id, orden, nombre)
VALUES 
(5, 1, 'Mayores solamente'),
(4, 2, 'Mayores (apto familia)'),
(3, 3, 'Familia'),
(2, 4, 'Menores (apto familia)'),
(1, 5, 'Menores solamente')
;
CREATE TABLE prod_si_no_parcial (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	productos VARCHAR(10) NOT NULL,
	links VARCHAR(10) NOT NULL,
	si BOOLEAN NOT NULL,
	`no` BOOLEAN NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO prod_si_no_parcial (id, productos, links, si, `no`)
VALUES 
(1, 'SI', 'SI', 1, 0),
(2, 'Parcial', 'Tal vez', 0, 0),
(3, 'NO', 'NO', 0, 1)
;

/* PRODUCTOS */;
CREATE TABLE prod_1peliculas (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	TMDB_id VARCHAR(10) NULL UNIQUE,
	FA_id VARCHAR(10) NULL UNIQUE,
	IMDB_id VARCHAR(10) NULL UNIQUE,
	fuente VARCHAR(5) NOT NULL,
	nombre_original VARCHAR(50) NULL,
	nombre_castellano VARCHAR(50) NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
	duracion SMALLINT UNSIGNED NULL,
	paises_id VARCHAR(18) NULL,
	idioma_original_id VARCHAR(2) NULL,
	direccion VARCHAR(100) NULL,
	guion VARCHAR(100) NULL,
	musica VARCHAR(100) NULL,
	actuacion VARCHAR(500) NULL,
	produccion VARCHAR(100) NULL,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,

	en_castellano_id TINYINT UNSIGNED NULL,
	en_color_id TINYINT UNSIGNED NULL,
	categoria_id VARCHAR(3) NULL,
	subcategoria_id TINYINT UNSIGNED NULL,
	publico_sugerido_id TINYINT UNSIGNED NULL,

	personaje_id SMALLINT UNSIGNED DEFAULT 1,
	hecho_id SMALLINT UNSIGNED DEFAULT 1,
	valor_id SMALLINT UNSIGNED DEFAULT 1,
	dia_del_ano_id SMALLINT UNSIGNED NULL,

	fe_valores TINYINT UNSIGNED NOT NULL,
	entretiene TINYINT UNSIGNED NOT NULL,
	calidad_tecnica TINYINT UNSIGNED NOT NULL,
	calificacion TINYINT UNSIGNED NOT NULL,

	creado_por_id INT UNSIGNED NOT NULL,
	creado_en DATETIME DEFAULT UTC_TIMESTAMP,
	alta_analizada_por_id INT UNSIGNED NULL,
	alta_analizada_en DATETIME NULL,
	alta_terminada_en DATETIME NULL,
	lead_time_creacion DECIMAL(4,2) UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editado_en DATETIME NULL,
	edic_analizada_en DATETIME NULL,
	lead_time_edicion DECIMAL(4,2) UNSIGNED NULL,
	
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,
	captura_activa BOOLEAN NULL,
	
	links_gratuitos_cargados_id TINYINT UNSIGNED DEFAULT 3,
	links_gratuitos_en_la_web_id TINYINT UNSIGNED DEFAULT 2,

	PRIMARY KEY (id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES prod_publicos_sugeridos(id),
	FOREIGN KEY (en_castellano_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (idioma_original_id) REFERENCES aux_idiomas(id),
	FOREIGN KEY (categoria_id) REFERENCES prod_categ1(id),
	FOREIGN KEY (subcategoria_id) REFERENCES prod_categ2_sub(id),

	FOREIGN KEY (personaje_id) REFERENCES rclv_1personajes(id),
	FOREIGN KEY (hecho_id) REFERENCES rclv_2hechos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_3valores(id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES rclv_dias(id),	

	FOREIGN KEY (creado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (alta_analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES aux_status_registro(id),
	FOREIGN KEY (links_gratuitos_cargados_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (links_gratuitos_en_la_web_id) REFERENCES prod_si_no_parcial(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO prod_1peliculas (id,TMDB_id,IMDB_id,fuente,ano_estreno,duracion,paises_id,idioma_original_id,nombre_original,nombre_castellano,direccion,guion,musica,actuacion,produccion,sinopsis,avatar,en_castellano_id,en_color_id,categoria_id,subcategoria_id,publico_sugerido_id,personaje_id,hecho_id,valor_id,dia_del_ano_id,fe_valores,entretiene,calidad_tecnica,calificacion,creado_por_id,creado_en,alta_analizada_por_id,alta_analizada_en,lead_time_creacion,status_registro_id,editado_en,edic_analizada_en,lead_time_edicion,capturado_por_id,capturado_en,captura_activa,links_gratuitos_cargados_id,links_gratuitos_en_la_web_id)
VALUES
(1,'218275','tt1445208','TMDB',2015,125,'US','en','The Letters','Cartas de la Madre Teresa','William Riead','William Riead','Ciaran Hope','Rutger Hauer (Benjamin Praagh), Juliet Stevenson (Mother Teresa), Max von Sydow (Celeste van Exem), Priya Darshani (Shubashini Das), Kranti Redkar (Deepa Ambereesh), Mahabanoo Mody-Kotwal (Mother General), Tillotama Shome (Kavitha Singh), Vijay Maurya (Maharaj Singh), Vivek Gomber (Ashwani Sharma)','Cinema West Films, Big Screen Productions, Freestyle Releasing','\"The Letters\" narra de manera muy personal la historia de esta religiosa, quien encontró el valor para entrar en los paupérrimos barrios de Calcuta, India, con sólo cinco rupias en el bolsillo y enseñarle al mundo entero una de las lecciones de bondad más importantes de la historia. (Fuente: TMDB)','1645444885482.jpg',3,1,'CFC',4,4,21,1,1,NULL,100,75,100,92,11,'2022-03-16 23:25:20',10,'2022-04-13 21:31:31',NULL,3,'2022-03-16 23:25:20','2022-04-13 21:31:40',NULL,10,'2022-04-13 21:31:29',0,3,2),
(2,'109429','tt0327086','TMDB',2003,180,'IT','en','Il Papa buono','El Santo Padre Juan XXIII','Ricky Tognazzi','Fabrizio Bettelli, Simona Izzo, Marco Roncalli','Ennio Morricone','Bob Hoskins (Angelo Roncalli / Pope John XXIII), Carlo Cecchi (Cardinal Mattia Carcano), Roberto Citran (Monsignor Loris Capovilla), Fabrizio Vidale (Angelo Roncalli (young)), Sergio Bini Bustric (Guido Gusso), Francesco Venditti (Nicola Catania (young)), Rolando Ravello (Cannava), John Light (Mattia Carcano (young)), Francesco Carnelutti (Nicola Catania), Lena Lessing (Marta Von Papen), Joan Giammarco, Gianluca Ramazzotti, Monica Piseddu, Pietro Delle Piane','MediaTrade','Juan XXIII fue Papa sólo 4 años (1959-1963), pero promovió profundos cambios y lanzó al mundo un contundente mensaje de paz. Era la época de la Guerra Fría, y las relaciones internacionales eran muy tensas. Convocó el Concilio Vaticano II, que supuso una auténtica revolución en el seno de la Iglesia Católica, que tuvo que reconocer que se había ido alejando cada vez más del mensaje de Cristo y que era necesario reflexionar sobre las necesidades del hombre moderno. (Fuente: TMDB)','1645458510332.jpg',1,1,'CFC',4,4,22,1,1,NULL,100,75,100,92,10,'2022-03-16 23:25:21',11,'2022-03-28 20:04:55',NULL,3,'2022-03-16 23:25:21','2022-04-13 21:28:46',NULL,11,'2022-04-13 21:28:38',0,3,2),
(3,'108672','tt0317009','TMDB',2002,208,'IT','it','Papa Giovanni - Ioannes XXIII','Juan XXIII: El Papa de la paz','Giorgio Capitani','Francesco Scardamaglia, Massimo Cerofolini','Marco Frisina','Ed Asner (Angelo Roncalli), Massimo Ghini (Angelo Roncalli giovane), Claude Rich (Cardinal Ottaviani), Michael Mendl (Tardini), Franco Interlenghi (Radini Tedeschi), Sydne Rome (Rada Krusciova), Jacques Sernas (Cardinale Feltin), Leonardo Ruta (Remo Roncalli), Paolo Gasparini (Monsignor Loris Capovilla), Sergio Fiorentini (Don Rebuzzini), Roberto Accornero, Heinz Trixner (Von Papen), Ivan Bacchi, Bianca Guaccero, Emilio De Marchi, Guido Roncalli, Giorgia Bongianni, Enzo Marino Bellanich','Coproducción Italia-Alemania','En 1958, tras la muerte de Pío XII, el anciano Cardenal Angelo Roncalli, Patriarca de Venecia, viaja a Roma para participar en el cónclave que debe elegir al nuevo Papa, cónclave dominado por toda clase de maniobras políticas. En efecto, una vez en el Vaticano, Roncalli asiste atónito al enconado enfrentamiento entre las distintas facciones eclesiásticas. Durante el cónclave se van desvelando aspectos extraordinarios del pasado del cardenal: su apoyo espiritual y económico a un grupo de trabajadores en huelga, cuando todavía era un joven sacerdote; su ayuda a los cristianos ortodoxos de Bulgaria, cuando estuvo destinado en ese país; sus negociaciones con el embajador nazi de Estambul para salvar un tren de prisioneros judíos, cuando era diplomático del Vaticano en Turquía. (Fuente: TMDB)','1645458705918.jpg',1,1,'CFC',4,4,22,1,1,NULL,100,100,100,100,10,'2022-03-16 23:25:22',11,'2022-04-13 19:21:09',NULL,3,'2022-03-16 23:25:23','2022-04-13 21:28:57',NULL,11,'2022-04-13 21:28:51',0,3,2),
(4,'122977','tt0416694','TMDB',2004,146,'IT','it','Don Bosco','Don Bosco','Lodovico Gasparini',"Carlo Mazzotta, Graziano Diana, Lodovico Gasparini, Saverio D'Ercole, Lea Tafuri, F. Panzarella",'Marco Frisina','Flavio Insinna (Don Bosco), Lina Sastri (Margherita Bosco), Charles Dance (Marchese Clementi), Daniel Tschirley (Michele Rua), Fabrizio Bucci (Bruno), Lewis Crutch (Domenico Savio), Brock Everitt-Elwick (Don Bosco as a child), Alessandra Martines (Marchesa Barolo)','RAI','El Piamonte (Italia), siglo XIX. En Turín, el sacerdote Don Bosco, un hombre procedente de una humilde familia campesina, se entregó total y apasionadamente a la tarea de recoger de las calles a los chicos marginados y cuidar de ellos. No sólo los sacó de la pobreza, de la ignorancia y del desamparo social, sino que consiguió que, por primera vez, se sintieran amados. Luchó con una fe y un tesón extraordinarios para vencer los obstáculos e insidias que, tanto las autoridades civiles como las eclesiásticas, pusieron en su camino para impedirle culminar su objetivo: la fundación de la Congregación de los salesianos, que garantizaría el futuro de sus chicos. (Fuente: TMDB)','1645459542226.jpg',1,1,'CFC',4,4,23,1,1,NULL,100,100,100,100,10,'2022-03-16 23:25:23',11,'2022-04-13 19:21:15',NULL,3,'2022-03-16 23:25:24','2022-04-13 21:29:05',NULL,11,'2022-04-13 21:29:00',0,3,2),
(5,'254489','tt0095051','TMDB',1988,150,'IT','it','Don Bosco','Don Bosco','Leandro Castellani','Ennio De Concini','Stelvio Cipriani','Ben Gazzara (Don Giovanni Bosco), Patsy Kensit (Lina), Karl Zinny (Giuseppe), Piera Degli Esposti (La madre di Lina), Philippe Leroy (Papa Leone XIII), Leopoldo Trieste (Don Borel), Raymond Pellegrin (Papa Pio IX), Laurent Therzieff (Monsignor Gastaldi), Edmund Purdom (Urbano Rattazzi), Rik Battaglia (Marchese Michele Cavour)','RAI, ELLE DI.CI., TIBER CINEMATOGRAFICA','Piamonte (Italia), siglo XIX. Don Bosco, un sacerdote piamontés de humilde origen campesino, se entregó apasionadamente a la tarea de recoger de las calles de Turín a los muchachos abandonados y carentes de toda protección social. Tuvo que vencer mil obstáculos e insidias para crear albergues, escuelas y talleres, donde pudieran recibir una educación cristiana y cívica. La culminación de su obra fue la fundación de la Congregación Salesiana. (Fuente: TMDB)','1645459996491.jpg',1,1,'CFC',4,4,23,1,1,NULL,100,75,100,92,10,'2022-03-16 23:25:24',11,'2022-04-13 19:21:22',NULL,3,'2022-03-16 23:25:25','2022-04-13 21:29:11',NULL,11,'2022-04-13 21:29:07',0,3,2)
;
CREATE TABLE prod_2colecciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	TMDB_id VARCHAR(10) NULL UNIQUE,
	FA_id VARCHAR(10) NULL UNIQUE,
	TMDB_entidad VARCHAR(10) NULL,
	fuente VARCHAR(5) NOT NULL,
	nombre_original VARCHAR(100) NULL,
	nombre_castellano VARCHAR(100) NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
	ano_fin SMALLINT UNSIGNED NULL,
	paises_id VARCHAR(18) NULL,
	idioma_original_id VARCHAR(2) NULL,
	cant_temporadas TINYINT UNSIGNED NULL,
	cant_capitulos SMALLINT UNSIGNED NULL,
	direccion VARCHAR(100) NULL,
	guion VARCHAR(100) NULL,
	musica VARCHAR(100) NULL,
	actuacion VARCHAR(500) NULL,
	produccion VARCHAR(50) NULL,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,
	en_castellano_id TINYINT UNSIGNED NULL,
	en_color_id TINYINT UNSIGNED NULL,
	categoria_id VARCHAR(3) NULL,
	subcategoria_id TINYINT UNSIGNED NULL,
	publico_sugerido_id TINYINT UNSIGNED NULL,

	personaje_id SMALLINT UNSIGNED DEFAULT 1,
	hecho_id SMALLINT UNSIGNED DEFAULT 1,
	valor_id SMALLINT UNSIGNED DEFAULT 1,
	dia_del_ano_id SMALLINT UNSIGNED NULL,

	fe_valores TINYINT UNSIGNED NOT NULL,
	entretiene TINYINT UNSIGNED NOT NULL,
	calidad_tecnica TINYINT UNSIGNED NOT NULL,
	calificacion TINYINT UNSIGNED NOT NULL,

	creado_por_id INT UNSIGNED NOT NULL,
	creado_en DATETIME DEFAULT UTC_TIMESTAMP,
	alta_analizada_por_id INT UNSIGNED NULL,
	alta_analizada_en DATETIME NULL,
	alta_terminada_en DATETIME NULL,
	lead_time_creacion DECIMAL(4,2) UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editado_en DATETIME NULL,
	edic_analizada_en DATETIME NULL,
	lead_time_edicion DECIMAL(4,2) UNSIGNED NULL,
	
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,
	captura_activa BOOLEAN NULL,

	links_gratuitos_cargados_id TINYINT UNSIGNED DEFAULT 3,
	links_gratuitos_en_la_web_id TINYINT UNSIGNED DEFAULT 2,

	PRIMARY KEY (id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES prod_publicos_sugeridos(id),
	FOREIGN KEY (en_castellano_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (categoria_id) REFERENCES prod_categ1(id),
	FOREIGN KEY (subcategoria_id) REFERENCES prod_categ2_sub(id),

	FOREIGN KEY (personaje_id) REFERENCES rclv_1personajes(id),
	FOREIGN KEY (hecho_id) REFERENCES rclv_2hechos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_3valores(id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES rclv_dias(id),	

	FOREIGN KEY (creado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (alta_analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES aux_status_registro(id),
	FOREIGN KEY (links_gratuitos_cargados_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (links_gratuitos_en_la_web_id) REFERENCES prod_si_no_parcial(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO prod_2colecciones (id, TMDB_id, FA_id, TMDB_entidad, fuente, nombre_original, nombre_castellano, ano_estreno, ano_fin, paises_id, idioma_original_id, cant_temporadas, cant_capitulos, direccion, guion, musica, actuacion, produccion, sinopsis, avatar, fe_valores, entretiene, calidad_tecnica, calificacion, creado_por_id, creado_en)
VALUES
(1,'855456',NULL,'collection','TMDB','Karol','Karol',2005,2006,'PL, IT, CA','es',1,2,'Giacomo Battiato','Giacomo Battiato, Gianmario Pagano, Monica Zapelli','Ennio Morricone','Piotr Adamczyk, Malgorzata Bela, Raoul Bova, Lech Mackiewicz, Dariusz Kwasnik','TAO Film','Es una colección de 2 películas, que narra la vida de Karol Wojtyla (Juan Pablo II). La primera película transcurre durante su vida anterior al papado: la II Guerra Mundial, el comunismo, su seminario en forma clandestino porque estaba prohibido por los nazis, su nombramiento como obispo y cardenal, su formación de la juventud de su pueblo, su intención de preservar la cultura polaca durante el sometimiento alemán y luego ruso. La segunda película muestra su vida durante el papado. El atentado contra su vida, sus viajes apostólicos, el reencuentro con sus seres queridos. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/os06a6E5MvC4qyqmB7fkaKUJ7Jx.jpg',75,75,100,80,10,'2022-03-16 23:25:19'),
(2,'97919',NULL,'collection','TMDB','Love Comes Softly Collection','El amor llega suavemente - Colección',2003,2011,'US','en',1,11,'Michael Landon Jr., David S. Cass Sr., Dora Hopkins','Janette Oke, Michael Landon Jr.','Ken Thorne, Michael Wetherwax, William Ashford, Kevin Kiner, Stephen Graziano, Stephen McKeon, Brian','Dale Midkiff, Erin Cottrell','Larry Levinson Productions, RHI Entertainment','Secuela de la vida de las sucesivas descendientes femeninas de una familia. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/agSYE5U98pz8OLNI6C6d2NQvn6h.jpg',75,75,100,80,10,'2022-03-16 23:25:22')
;
CREATE TABLE prod_3capitulos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	coleccion_id INT UNSIGNED NOT NULL,
	temporada TINYINT UNSIGNED DEFAULT NULL,
	capitulo TINYINT UNSIGNED NOT NULL,
	TMDB_id VARCHAR(10) NULL UNIQUE,
	FA_id VARCHAR(10) NULL UNIQUE,
	IMDB_id VARCHAR(10) NULL UNIQUE,
	fuente VARCHAR(10) NOT NULL,
	nombre_original VARCHAR(50) NULL,
	nombre_castellano VARCHAR(50) NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
	duracion TINYINT UNSIGNED NULL,
	paises_id VARCHAR(18) NULL,
	idioma_original_id VARCHAR(2) NOT NULL,
	direccion VARCHAR(100) NULL,
	guion VARCHAR(100) NULL,
	musica VARCHAR(100) NULL,
	actuacion VARCHAR(500) NULL,
	produccion VARCHAR(100) NULL,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,
	en_castellano_id TINYINT UNSIGNED NULL,
	en_color_id TINYINT UNSIGNED NULL,
	categoria_id VARCHAR(3) NULL,
	subcategoria_id TINYINT UNSIGNED NULL,
	publico_sugerido_id TINYINT UNSIGNED NULL,

	personaje_id SMALLINT UNSIGNED DEFAULT 1,
	hecho_id SMALLINT UNSIGNED DEFAULT 1,
	valor_id SMALLINT UNSIGNED DEFAULT 1,
	dia_del_ano_id SMALLINT UNSIGNED NULL,

	fe_valores TINYINT UNSIGNED NULL,
	entretiene TINYINT UNSIGNED NULL,
	calidad_tecnica TINYINT UNSIGNED NULL,
	calificacion TINYINT UNSIGNED NULL,

	creado_por_id INT UNSIGNED NOT NULL,
	creado_en DATETIME DEFAULT UTC_TIMESTAMP,
	alta_analizada_por_id INT UNSIGNED NULL,
	alta_analizada_en DATETIME NULL,
	alta_terminada_en DATETIME NULL,
	lead_time_creacion DECIMAL(4,2) UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editado_en DATETIME NULL,
	edic_analizada_en DATETIME NULL,
	lead_time_edicion DECIMAL(4,2) UNSIGNED NULL,
	
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,
	captura_activa BOOLEAN NULL,
	
	links_gratuitos_cargados_id TINYINT UNSIGNED DEFAULT 3,
	links_gratuitos_en_la_web_id TINYINT UNSIGNED DEFAULT 2,

	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_id) REFERENCES prod_2colecciones(id),
	FOREIGN KEY (en_castellano_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (idioma_original_id) REFERENCES aux_idiomas(id),
	FOREIGN KEY (categoria_id) REFERENCES prod_categ1(id),
	FOREIGN KEY (subcategoria_id) REFERENCES prod_categ2_sub(id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES prod_publicos_sugeridos(id),

	FOREIGN KEY (personaje_id) REFERENCES rclv_1personajes(id),
	FOREIGN KEY (hecho_id) REFERENCES rclv_2hechos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_3valores(id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES rclv_dias(id),	

	FOREIGN KEY (creado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (alta_analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES aux_status_registro(id),
	FOREIGN KEY (links_gratuitos_cargados_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (links_gratuitos_en_la_web_id) REFERENCES prod_si_no_parcial(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO prod_3capitulos (id, coleccion_id, temporada, capitulo, TMDB_id, IMDB_id, fuente, nombre_original, nombre_castellano, ano_estreno, duracion, paises_id, idioma_original_id, direccion, guion, musica, actuacion, produccion, sinopsis, avatar, en_castellano_id, en_color_id, categoria_id, subcategoria_id, publico_sugerido_id, creado_por_id, status_registro_id, creado_en)
VALUES
(1,1,1,1,'38516','tt0435100','TMDB','Karol – Un uomo diventato Papa','Karol, el hombre que llegó a ser Papa',2005,195,'PL, IT','it','Giacomo Battiato','Giacomo Battiato','Ennio Morricone','Piotr Adamczyk (Karol Wojtyla), Malgorzata Bela (Hanna Tuszynska), Ken Duken (Adam Zielinski), Hristo Shopov (Julian Kordek), Ennio Fantastichini (Maciej Nowak), Violante Placido (Maria Pomorska), Matt Craven (Hans Frank), Raoul Bova (padre Tomasz Zaleski), Lech Mackiewicz (card. Stefan Wyszynski), Patrycja Soliman (Wislawa), Olgierd Lukaszewicz (Karol Wojtyla padre), Szymon Bobrowski (capitano Macke), Kenneth Welsh (professor Wójcik), Mateusz Damiecki (Wiktor), Adrian Ochalik (Jerzy Kluger)','TAO Film','Miniserie biográfica sobre Juan Pablo II. En su juventud, en Polonia bajo la ocupación nazi, Karol Wojtyla trabajó en una cantera de caliza para poder sobrevivir. La represión nazi causó numerosas víctimas no sólo entre los judíos, sino también entre los católicos. Es entonces cuando Karol decide responder a la llamada divina. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/xVqMG4KcTXhkhL65yohBpjbkY65.jpg',1,1,'CFC',4,5,2,1,'2022-03-16 23:25:20'),
(2,1,1,2,'75470','tt0495039','TMDB','Karol, un Papa rimasto uomo','Karol, el Papa que siguió siendo hombre',2006,184,'IT, PL, CA','it','Giacomo Battiato','Gianmario Pagano, Giacomo Battiato, Monica Zapelli','Ennio Morricone','Piotr Adamczyk (John Paul II), Dariusz Kwasnik (Dr. Renato Buzzonetti), Michele Placido (Dr. Renato Buzzonetti), Dariusz Kwasnik (Stanislaw Dziwisz), Alberto Cracco (Agostino Casaroli), Adriana Asti (Madre Teresa di Calcutta), Raoul Bova (Padre Thomas), Leslie Hope (Julia Ritter), Alkis Zanis (Ali Agca), Carlos Kaniowsky (Oscar Arnulfo Romero Goldamez), Fabrice Scott (Jerzy Popieluszko), Paolo Maria Scalondro (Wojciech Jaruzelski), Daniela Giordano (Tobiana Sobótka)',NULL,'Es la continuación de la miniserie Karol, el hombre que se convirtió en Papa. Narra la historia, desde 1978 en adelante, del primer hombre de un país del este elegido Papa y el papel que tomó en el final del Comunismo, a pesar de sufrir un intento de asesinato que trató de hacerlo callar. La historia narra cómo continuó su pontificado con valor a pesar de la enfermedad que poco a poco iba minando su vida. Él nunca ocultó su sufrimiento físico, pero luchó hasta el final contra la guerra y la violencia. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/pTZZSSjJvKohXJmBdAT5CO5lXnK.jpg',1,1,'CFC',4,5,2,1,'2022-03-16 23:25:20')
;
INSERT INTO prod_3capitulos (id, coleccion_id, temporada, capitulo, TMDB_id, IMDB_id, fuente, nombre_original, nombre_castellano, ano_estreno, duracion, paises_id, idioma_original_id, direccion, guion, musica, actuacion, produccion, sinopsis, avatar, en_castellano_id, en_color_id, categoria_id, subcategoria_id, publico_sugerido_id, creado_por_id)
VALUES
(3,2,1,1,'16250','tt0345591','TMDB','Love Comes Softly','El amor llega suavemente',2003,84,'US','en','Michael Landon Jr.','Michael Landon Jr., Janette Oke, Cindy Kelley','Ken Thorne, Michael Wetherwax, William Ashford','Katherine Heigl (Marty Claridge), Dale Midkiff (Clark Davis), Skye McCole Bartusiak (Missie Davis), Corbin Bernsen (Ben Graham), Theresa Russell (Sarah Graham), Oliver Macready (Aaron Claridge), Tiffany Amber Knight (Laura Graham), Nick Scoggin (Reverend Johnson), Rutanya Alda (Wanda Marshall), Jaimz Woolvett (Wagon Train Scout), Janet Rotblatt (Woman in Wagon), Adam Loeffler (Clint Graham), David Fine (Jed Larsen (uncredited)), Dani Goldman (Young Marty (uncredited))','Larry Levinson Productions, Hallmark Entertainment, Alpine Medien Productions','Estando de ruta hacia su nuevo hogar en las grandes llanuras del oeste, una joven se queda repentinamente viuda en medio del largo viaje en carreta. Con una dura temporada invernal acechando y sin recursos para regresar, la joven acepta el trato que le ofrece un granjero: casarse con él para ocuparse de su hija, a cambio de cobijo y de un pasaje de vuelta en primavera. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/eDxmL7CCHWCcFpbdS6yVnspOjV1.jpg',NULL,1,'VPC',10,4,2),
(4,2,1,2,'20641','tt0402348','TMDB','Love\'s Enduring Promise','El amor lo puede todo',2004,95,'US','en','Michael Landon Jr.','Michael Landon Jr., Janette Oke, Cindy Kelley','','January Jones (Missie Davis), Logan Bartholomew (Willie / Nate), Dale Midkiff (Clark Davis), Katherine Heigl (Marty Claridge), Kesun Loder (Aaron Davis), Logan Arens (Arnie Davis), Mackenzie Astin (Grant Thomas), Cliff DeYoung (Zeke), Matthew Peters (Brian Murphy), Michael Bartel (Willie at 15), Dominic Scott Kay (Mattie), Blaine Pate (Sam), Cara DeLizia (Annie Walker), Robert F. Lyons (Doc Watkins), Douglas Fisher (Edward Trumball), E.J. Callahan (Asa), Katia Coe (Clara), Gary Sievers (Ranxher)',NULL,'Una familia de granjeros del Oeste, cuya subsistencia depende de sus cosechas, ve cómo un accidente del cabeza de familia, que se verá obligado a guardar cama, pone en grave peligro su situación económica. Su hija, una maestra de escuela, se ve obligada a realizar las duras labores de la granja, hasta que un forastero se ofrece a ayudarles y a curar al herido... (Fuente: TMDB)','https://image.tmdb.org/t/p/original/lwbeyOtRpn1izaRnVVhDSJGwHRu.jpg',NULL,1,'VPC',10,4,2),
(5,2,1,3,'22488','tt0785025','TMDB','Love\'s Abiding Joy','El largo camino del amor',2006,88,'US','en','Michael Landon Jr.','Michael Landon Jr., Janette Oke, Douglas Lloyd McIntosh, Bridget Terry','','Erin Cottrell (Missie), Logan Bartholomew (Willie), William Morgan Sheppard (Scottie), James Tupper (Henry), Irene Bedard (Miriam Red Hawk McClain), Dale Midkiff (Clark Davis), Frank McRae (Cookie), Drew Tyler Bell (Jeff LaHaye), Brett Coker (Mattie LaHaye), Mae Whitman (Colette Doros), John Laughlin (Smuel Doros), Kevin Gage (John Abel), Brianna Brown (Melinda Klein), Stephen Bridgewater (Frank Taylorson), Blake Gibbons (Joe Paxson), Madison Leisle (Annie), Thomas Stanley (Mark)',NULL,'Tras un peligroso viaje al Oeste, Missie (Erin Cottrell) y su marido (Logan Bartholomew) se establecen en unas tierras con la intención de formar una familia. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/rNQCuECnv6ubGJzHqqdFB2O1bV7.jpg',NULL,1,'VPC',10,4,2),
(6,2,1,4,'20583','tt0486420','TMDB','Love\'s Long Journey','El amor dura eternamente',2005,87,'US','en','Michael Landon Jr.','','','Erin Cottrell (Missie LaHaye), Dale Midkiff (Clark Davis), Logan Bartholomew (Willie LaHaye), Frank McRae (Cookie), Drew Tyler Bell (Jeff LaHaye), William Morgan Sheppard (Scottie), Richard Lee Jackson (Sonny Huff)',NULL,'Adaptación televisiva de la novela de Janette Oke sobre una joven pareja, Missie (Erin Cottrell) y Willie (Logan Bartholomew), que abandonan sus hogares para comenzar una nueva vida en el Oeste. Durante el camino, su amor y su Fe en Dios serán puestos a prueba por la adversidades del trayecto. Willie y Missie La Haye emprenden una nueva vida como colonos en el Oeste americano. Adquieren un rancho y un buen número de cabezas de ganado y, una vez instalados, Missie confiesa a su marido que espera un hijo. Su padre, desde la distancia, le recuerda que sus corazones están unidos por el amor, y que pronto se reencontrarán. Mientras tanto, Missie trabaja como maestra ganándose el afecto de la comunidad india. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/eIrxGoq68iH16NWFF1XKCKXRmaE.jpg',NULL,1,'VPC',10,4,2),
(7,2,1,5,'30975','tt0929864','TMDB','Love\'s Unending Legacy','El legado de un amor infinito',2007,84,'US','en','Mark Griffiths','Janette Oke, Pamela Wallace','Kevin Kiner','Erin Cottrell (Missie LaHaye), Holliston Coleman (Belinda Marshall-LaHaye), Victor Browne (Sherrif Zack Tyler), Hank Stratton (Pastor Joe), Braeden Lemasters (Jacob Marshall-LaHaye), Dave Florek (Hank Pettis), Stephanie Nash (Mrs. Pettis), Bret Loehr (Calvin), Dale Midkiff (Clark Davis)',NULL,'Tres años después de la muerte de su marido, Missie decide regresar junto a su hijo a casa de sus padres. Allí recupera su trabajo como maestra y adopta a Belinda, una huérfana algo rebelde que oculta un secreto: tiene un hermano menor que está siendo maltratado por sus nuevos padres adoptivos. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/xi57bQTg33RpduDphkvtdWkEI7b.jpg',NULL,1,'VPC',10,4,2),
(8,2,1,6,'49857','tt0960143','TMDB','Love\'s Unfolding Dream','La doble cara del amor',2007,87,'US','en','Harvey Frost','','','Erin Cottrell (Missy Tyler), Scout Taylor-Compton (Belinda Tyler), Dale Midkiff (Clark Davis), Robert Pine (Dr. Micah Jackson), Victor Browne (Sheriff Zach Taylor), Samantha Smith (Mart Davis), Patrick Levis (Drew Simpson), Nancy Linehan Charles (Virginia Stafford-Smith)','Larry Levinson Productions, RHI Entertainment, Alpine Medien Productions','Belinda quiere ser doctora, pero vive en una época en la que su condición de mujer pone muchas trabas a su camino. Se debate entre su vocación y el amor por un abogado de costumbres tradicionales. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/7OCcCfioaoUS1q5nemO8uSciKRj.jpg',NULL,1,'VPC',10,4,2),
(9,2,1,7,'21636','tt1269560','TMDB','Love Takes Wing','Y el amor volvió a nosotros',2009,88,'US','en','Lou Diamond Phillips','Rachel Stuhler','','Sarah Jones (Belinda Simpson), Haylie Duff (Annie Nelson), Jordan Bridges (Lee Owens), Patrick Duffy (Mayor Evans), Cloris Leachman (Hattie Clarence), John Bishop (John Pine), Lou Diamond Phillips (Ray Russell), Erin Cottrell (Missy), Annalise Basso (Lillian), Time Winters (Gus), Bonnie Root (Mrs. Pine), Craig K. Bodkin (Sheriff), Dave Rodgers (Stage Coach Driver)',NULL,'Tras la muerte de su marido, la doctora Belinda Simpson llega a la ciudad de Sikeston. Pronto descubre que su población está enfermando y muriendo de cólera, brote que proviene de un orfanato cercano. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/b6bM8dmSbEHDv9hHIJCZjbgIkbV.jpg',NULL,1,'VPC',10,4,2),
(10,2,1,8,'25182','tt1307064','TMDB','Love Finds A Home','Y el amor llegó al hogar',2009,88,'US','en','David S. Cass Sr.','Janette Oke, Donald Davenport','Stephen Graziano','Sarah Jones (Belinda Simpson), Haylie Duff (Annie), Jordan Bridges (Lee Owens), Patty Duke (Mary), Courtney Halverson (Lillian), Michael Trevino (Joshua), Jeffrey Muller (Peter), Dahlia Salem (Mabel McQueen), Thomas Kopache (Reverend Davis), Chad W. Smathers (Danny Travis), Daniel Beer (Lloyd McQueen), Jeff Clarke (Mr. Travis), Jennifer M. Gentile (Mrs. Travis), Matthew Florida (Young Cowboy), Michelle Josette (Young Mother), Time Winters (Gus), Grace Levinson (Grace), Shannon Levinson (Shannon)','RHI Entertainment, Larry Levinson Productions, LG Films, Faith & Family Entertainment','La doctora Annie Watson va a casa de su mejor amiga, la también facultativa Belinda Owens. Allí, la chica tendrá que convivir con Mary, una mujer a la que le gustan los remedios naturales, y con un matrimonio en crisis, por la imposibilidad de Belinda por quedarse embarazada. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/zgFi7OtOeMmvH3stWJSpazJGaSJ.jpg',NULL,1,'VPC',10,4,2),
(11,2,1,9,'81450','tt1684907','TMDB','Love Begins','Cuando nace el amor',2011,0,'US, IE','en','David S. Cass Sr., Dora Hopkins','Janette Oke, Michael Moran','Stephen McKeon','Wes Brown (Clark Davis), Julie Mond (Ellen Louise Barlow), Abigail Mavity (Cassandra Mae \'Cassie\' Barlow), Jere Burns (Sheriff Holden), Nancy McKeon (Millie), David Tom (Daniel Whittaker), Steffani Brass (Rose), Daniel Buran (Samuel)','RHI Entertainment, Faith & Family Entertainment, MNG Films, Larry Levinson Productions','Tras una pelea en una cafetería, Clark Davis es condenado a ir a la cárcel. Gracias a un acuerdo entre el sheriff y la propietaria del local, se le conmuta la pena. Entonces tendrá que trabajar como peón para las hermanas Ellen y Cassie Barlow. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/b0JiPlWEZ8cnhhgVOWo0rnbGuvh.jpg',NULL,1,'VPC',10,4,2),
(12,2,1,10,'87311','tt1672621','TMDB','Love\'s Everlasting Courage','Love\'s Everlasting Courage',2011,89,'US','en','Bradford May, Dora Hopkins','Kevin Bocarde','Brian Byrne','Wes Brown (Clark), Julie Mond (Ellen), Bruce Boxleitner (Lloyd), Cheryl Ladd (Irene), Morgan Lily (Missy), Willow Geer (Sarah), Tyler Jacob Moore (Ben), Kirk B.R. Woller (Bruce), James Eckhouse (Mr. Harris), Courtney Marmo (Laura)','RHI Entertainment, Faith & Family Entertainment, MNG Films, Larry Levinson Productions','Una familia joven lucha por una frontera en el oeste que permita a la mujer trabajar en un taller de costura. Cuando la situación económica mejora, la esposa enferma y muere. Con la ayuda de sus padres, el joven viudo tendrá que aprender a lidiar con la trágica pérdida. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/aIZoXDvpmwF70KsY8lByku5SwgF.jpg',NULL,1,'VPC',10,4,2),
(13,2,1,11,'87313','tt2078672','TMDB','Love\'s Christmas Journey','Y el amor llegó en Navidad',2011,172,'US','en','David S. Cass Sr., Dora Hopkins','Janette Oke, George Tierne','','Natalie Hall (Ellie Davis), JoBeth Williams (Beatrice), Greg Vaughan (Aaron Davis), Dylan Bruce (Michael), Ernest Borgnine (Nicholas), Teddy Vincent (Mrs. Price), Annika Noelle (Suzanna), Bobby Campo (Erik Johnson), Charles Shaughnessy (Alex Weaver), Sean Astin (Mayor Wayne), Ryan Wynott (Christopher), Jada Facer (Annabelle), Amanda Foreman (Adrienne), Dannika Liddell (Jessica), Brian Thompson (Cass), Richard Tyson (Charley)',NULL,'Tras la muerte de su marido y su hija, Eli decide pasar la temporada de Navidad con su hermano, el sheriff de una pequeña ciudad respetado por todos. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/jYqWZG3f5FRy8oUwZYOn77h9I59.jpg',NULL,1,'VPC',10,4,2)
;
CREATE TABLE prod_4edicion (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	pelicula_id INT UNSIGNED DEFAULT NULL,
	coleccion_id INT UNSIGNED DEFAULT NULL,
	capitulo_id INT UNSIGNED DEFAULT NULL,
	nombre_original VARCHAR(50) NULL,
	nombre_castellano VARCHAR(50) NULL,
	duracion SMALLINT UNSIGNED NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
	ano_fin SMALLINT UNSIGNED NULL,
	paises_id VARCHAR(18) NULL,
	idioma_original_id VARCHAR(2) NULL,
	direccion VARCHAR(100) NULL,
	guion VARCHAR(100) NULL,
	musica VARCHAR(100) NULL,
	actuacion VARCHAR(500) NULL,
	produccion VARCHAR(100) NULL,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,
	en_castellano_id TINYINT UNSIGNED NULL,
	en_color_id TINYINT UNSIGNED NULL,
	categoria_id VARCHAR(3) NULL,
	subcategoria_id TINYINT UNSIGNED NULL,
	publico_sugerido_id TINYINT UNSIGNED NULL,

	personaje_id SMALLINT UNSIGNED NULL,
	hecho_id SMALLINT UNSIGNED NULL,
	valor_id SMALLINT UNSIGNED NULL,

	editado_por_id INT UNSIGNED NOT NULL,
	editado_en DATETIME DEFAULT UTC_TIMESTAMP,

	PRIMARY KEY (id),
	FOREIGN KEY (pelicula_id) REFERENCES prod_1peliculas(id),
	FOREIGN KEY (coleccion_id) REFERENCES prod_2colecciones(id),	
	FOREIGN KEY (capitulo_id) REFERENCES prod_3capitulos(id),
	FOREIGN KEY (en_castellano_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES prod_si_no_parcial(id),
	FOREIGN KEY (idioma_original_id) REFERENCES aux_idiomas(id),
	FOREIGN KEY (categoria_id) REFERENCES prod_categ1(id),
	FOREIGN KEY (subcategoria_id) REFERENCES prod_categ2_sub(id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES prod_publicos_sugeridos(id),
	FOREIGN KEY (personaje_id) REFERENCES rclv_1personajes(id),
	FOREIGN KEY (hecho_id) REFERENCES rclv_2hechos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_3valores(id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO prod_4edicion (id, coleccion_id, avatar, en_castellano_id, en_color_id, categoria_id, subcategoria_id, publico_sugerido_id, personaje_id, editado_por_id, editado_en) VALUES
(6,1,'1645481101308.jpg',1,1,'CFC',4,5,24,10,'2022-03-16 23:25:19');
INSERT INTO prod_4edicion (id, coleccion_id, avatar, nombre_original, nombre_castellano, musica, en_castellano_id, en_color_id, categoria_id, subcategoria_id, publico_sugerido_id, valor_id, editado_por_id, editado_en) VALUES 
(7,2,'1646276771102.jpg','Love Comes Softly','El amor llega suavemente','Ken Thorne, Michael Wetherwax, William Ashford, Kevin Kiner, Stephen Graziano, Stephen McKeon',2,1,'VPC',10,4,11,10,'2022-03-16 23:25:22');
INSERT INTO prod_4edicion (id, capitulo_id, nombre_original, personaje_id, editado_por_id, editado_en) VALUES
(8,1,'Karol - Un uomo diventato Papa',24,10,'2022-04-13 19:20:21');
INSERT INTO prod_4edicion (id, capitulo_id, produccion, personaje_id, editado_por_id, editado_en) VALUES
(9,2,'TAO Film',24,10,'2022-04-13 19:20:21');

/* LINKS */;
CREATE TABLE links_proveedores (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(20) NOT NULL UNIQUE,
	avatar VARCHAR(20) NULL,
	siempre_pago BOOLEAN NULL,
	peli_siempre_completa BOOLEAN NULL,
	calidad SMALLINT NULL,
	generico BOOLEAN DEFAULT 0,
	url_distintivo VARCHAR(20) NOT NULL UNIQUE,
	buscador_automatico BOOLEAN NOT NULL,
	url_buscar_pre VARCHAR(25) DEFAULT '',
	trailer BOOLEAN NOT NULL,
	url_buscar_post_tra VARCHAR(20) NOT NULL,
	pelicula BOOLEAN NOT NULL,
	url_buscar_post_pel VARCHAR(20) NOT NULL,	
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO links_proveedores (id, orden, nombre, avatar, siempre_pago, peli_siempre_completa, calidad, url_distintivo, url_buscar_pre, url_buscar_post_tra, url_buscar_post_pel, buscador_automatico, trailer, pelicula)
VALUES 
(1, 0, 'Desconocido','PT-Desconocido.jpg', NULL, NULL, NULL, '', '', '', '', 0, 1, 1),
(11, 1, 'YouTube', 'PT-YouTube.jpg', NULL, NULL, NULL, 'youtube.com', '/results?search_query=', '&sp=EgIYAQ%253D%253D', 'sp=EgIYAg%253D%253D', 1, 1, 1),
(12, 2, 'Formed en Español', 'PT-Formed cast.jpg', NULL, 1, 1081, 'ver.formed.lat', '/search?q=', '', '', 1, 0, 1),
(13, 3, 'Formed', 'PT-Formed.jpg', NULL, 1, 1081, 'watch.formed.org', '/search?q=', '', '', 1, 0, 1),
(14, 4, 'Brochero', 'PT-Brochero.jpg', 1, 1, 1081, 'brochero.org', '', '', '', 0, 0, 1),
(15, 5, 'FamFlix', 'PT-FamFlix.jpg', 1, 1, 1081, 'famflix.mx', '', '', '', 0, 0, 1),
(16, 6, 'FamiPlay', 'PT-FamiPlay.jpg', 1, 1, 1081, 'famiplay.com', '/catalogo?s=', '', '', 1, 0, 1),
(17, 7, 'Goya Prod.', 'PT-Goya.jpg', 1, 1, 1081, 'goyaproducciones.com', '/?s=', '', '', 1, 1, 1),
(18, 8, 'IMDb', 'PT-IMDB.jpg', 0, NULL, NULL, 'imdb.com', '/find?q=', '', '', 0, 1, 0)
;
UPDATE links_proveedores SET generico = 1 WHERE id = 1
;
CREATE TABLE links_tipos (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(10) NOT NULL,
	pelicula BOOLEAN DEFAULT 0,
	trailer BOOLEAN DEFAULT 0,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO links_tipos (id, nombre, pelicula, trailer)
VALUES 
(1, 'Trailer', 0, 1),
(2, 'Película', 1, 0)
;
CREATE TABLE links_1originales (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	pelicula_id INT UNSIGNED NULL,
	coleccion_id INT UNSIGNED NULL,
	capitulo_id INT UNSIGNED NULL,
	url VARCHAR(100) NOT NULL UNIQUE,

	calidad SMALLINT NULL,
	completo BOOLEAN DEFAULT 1,
	parte VARCHAR(3) NOT NULL,

	link_tipo_id TINYINT UNSIGNED NOT NULL,
	link_prov_id TINYINT UNSIGNED NOT NULL,
	gratuito BOOLEAN NOT NULL,

	creado_por_id INT UNSIGNED NOT NULL,
	creado_en DATETIME DEFAULT UTC_TIMESTAMP,
	alta_analizada_por_id INT UNSIGNED NULL,
	alta_analizada_en DATETIME NULL,
	lead_time_creacion SMALLINT UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editado_por_id INT UNSIGNED NULL,
	editado_en DATETIME NULL,
	edic_analizada_por_id INT UNSIGNED NULL,
	edic_analizada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	
	fecha_referencia DATETIME DEFAULT UTC_TIMESTAMP,
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME DEFAULT NULL,
	captura_activa BOOLEAN NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (pelicula_id) REFERENCES prod_1peliculas(id),
	FOREIGN KEY (coleccion_id) REFERENCES prod_2colecciones(id),
	FOREIGN KEY (capitulo_id) REFERENCES prod_3capitulos(id),
	FOREIGN KEY (link_tipo_id) REFERENCES links_tipos(id),
	FOREIGN KEY (link_prov_id) REFERENCES links_proveedores(id),
	FOREIGN KEY (creado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (alta_analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (edic_analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES aux_status_registro(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO links_1originales (id, pelicula_id, coleccion_id, capitulo_id, url, calidad, completo, parte, link_tipo_id, link_prov_id, gratuito, creado_por_id, creado_en, fecha_referencia)
VALUES 
(1,NULL,NULL,1,'youtube.com/watch?v=g1vC9TXMkXk',360,1,"-",2,11,1,10,'2022-03-16 23:25:20','2022-03-17 13:25:20'),
(2,NULL,NULL,1,'youtube.com/watch?v=0DcobZTPl0U',480,0,1,2,11,1,10,'2022-03-16 23:25:20','2022-03-17 13:25:20'),
(3,NULL,NULL,1,'youtube.com/watch?v=Ug31Sdb6GU4',480,0,2,2,11,1,1,'2022-03-16 23:25:20','2022-03-17 13:25:20'),
(4,NULL,NULL,1,'youtube.com/watch?v=vnLERiCT96M',480,0,3,2,11,1,10,'2022-03-16 23:25:20','2022-03-17 13:25:20'),
(5,NULL,NULL,1,'youtube.com/watch?v=dc4bkUqC9no',480,0,4,2,11,1,10,'2022-03-16 23:25:20','2022-03-17 13:25:20'),
(6,NULL,NULL,1,'www/fefe',144,1,"-",1,1,0,1,'2022-03-16 23:25:20','2022-03-17 13:25:20'),
(7,NULL,NULL,1,'weww/fefe',144,1,"-",1,1,0,10,'2022-03-16 23:25:20','2022-03-17 13:25:20'),
(8,NULL,NULL,1,'youtube.com/watch?v=4o-V9Cfk4to',360,1,"-",2,11,1,10,'2022-03-16 23:25:20','2022-03-17 13:25:20')
;
CREATE TABLE links_2edicion (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	link_id INT UNSIGNED NOT NULL,

	calidad SMALLINT NULL,
	link_tipo_id TINYINT UNSIGNED NULL,
	completo BOOLEAN NULL,
	parte VARCHAR(3) NULL,
	gratuito BOOLEAN NULL,

	editado_por_id INT UNSIGNED NOT NULL,
	editado_en DATETIME DEFAULT UTC_TIMESTAMP,

	fecha_referencia DATETIME DEFAULT UTC_TIMESTAMP,

	PRIMARY KEY (id),
	FOREIGN KEY (link_id) REFERENCES links_1originales(id),
	FOREIGN KEY (link_tipo_id) REFERENCES links_tipos(id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* ENTORNO DE CALIFICACIONES */;
CREATE TABLE cal_21fe_valores (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	valor TINYINT UNSIGNED NOT NULL,	
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO cal_21fe_valores (id, orden, valor, nombre)
VALUES 
(5, 1, 100, 'Mucho'),
(4, 2, 75, 'Sí'),
(3, 3, 50, 'Moderado'),
(2, 4, 25, 'Poco'),
(1, 5, 0, 'No')
;
CREATE TABLE cal_22entretiene (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	valor TINYINT UNSIGNED NOT NULL,	
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO cal_22entretiene (id, orden, valor, nombre)
VALUES 
(5, 1, 100, 'Mucho'),
(4, 2, 75, 'Sí'),
(3, 3, 50, 'Moderado'),
(2, 4, 25, 'Poco'),
(1, 5, 0, 'No')
;
CREATE TABLE cal_23calidad_tecnica (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	valor TINYINT UNSIGNED NOT NULL,	
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO cal_23calidad_tecnica (id, orden, valor, nombre)
VALUES 
(3, 1, 100, 'Sin problemas'),
(2, 2, 50, 'Afecta un poco el disfrute'),
(1, 3, 0, 'Complica el disfrute')
;
CREATE TABLE cal_1registros (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NULL,
	coleccion_id INT UNSIGNED NULL,
	capitulo_id INT UNSIGNED NULL,
	fe_valores TINYINT UNSIGNED NOT NULL,
	entretiene TINYINT UNSIGNED NOT NULL,
	calidad_tecnica TINYINT UNSIGNED NOT NULL,
	calificacion TINYINT UNSIGNED NOT NULL,
	creado_en DATETIME DEFAULT UTC_TIMESTAMP,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES prod_1peliculas(id),
	FOREIGN KEY (coleccion_id) REFERENCES prod_2colecciones(id),
	FOREIGN KEY (capitulo_id) REFERENCES prod_3capitulos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO cal_1registros (id, usuario_id, pelicula_id, coleccion_id, capitulo_id, fe_valores, entretiene, calidad_tecnica, calificacion)
VALUES
(1,10,1,NULL,NULL,100,75,100,92),
(2,10,2,NULL,NULL,100,75,100,92),
(3,10,3,NULL,NULL,100,100,100,100),
(4,10,4,NULL,NULL,100,100,100,100),
(5,10,5,NULL,NULL,100,75,100,92),
(6,10,NULL,1,NULL,75,75,100,80),
(7,10,NULL,2,NULL,75,75,100,80)
;

/* ENTORNO DE INTERÉS EN PRODUCTO */;
CREATE TABLE int_opciones (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL UNIQUE,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO int_opciones (id, orden, nombre)
VALUES 
(3, 1, 'La quiero ver'),
(2, 2, 'Es de mis favoritas'),
(4, 3, 'Ya la vi'),
(1, 4, 'No me interesa')
;
CREATE TABLE int_1registros (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NULL,
	coleccion_id INT UNSIGNED NULL,
	capitulo_id INT UNSIGNED NULL,
	int_opciones_id TINYINT UNSIGNED NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES prod_1peliculas(id),
	FOREIGN KEY (coleccion_id) REFERENCES prod_2colecciones(id),
	FOREIGN KEY (capitulo_id) REFERENCES prod_3capitulos(id),
	FOREIGN KEY (int_opciones_id) REFERENCES int_opciones(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
