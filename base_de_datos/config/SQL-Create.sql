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
	bandera VARCHAR(10) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO paises (id, alpha3Code, nombre, continente , idioma , zona_horaria, bandera)
/*<img src="https://restcountries.com/data/<%= n.alpha3code.toLowerCase %>.svg">*/
VALUES ('AX','ALA','Åland','Europa','Swedish','+02:00','ala.svg'), ('AS','ASM','Samoa Americana','Oceanía','English','-11:00','asm.svg'), ('AD','AND','Andorra','Europa','Catalan','+01:00','and.svg'), ('AO','AGO','Angola','Africa','Portuguese','+01:00','ago.svg'), ('AI','AIA','Anguila','América','English','-04:00','aia.svg'), ('AQ','ATA','Antártida','Polar','English','-03:00','ata.svg'), ('AG','ATG','Antigua y Barbuda','América','English','-04:00','atg.svg'), ('AR','ARG','Argentina','América','Spanish','-03:00','arg.svg'), ('AW','ABW','Aruba','América','Dh','-04:00','abw.svg'), ('AU','AUS','Australia','Oceanía','English','+05:00','aus.svg'), ('AZ','AZE','Azerbaiyán','Asia','Azerbaijani','+04:00','aze.svg'), ('BS','BHS','Bahamas','América','English','-05:00','bhs.svg'), ('BD','BGD','Bangladés','Asia','Bengali','+06:00','bgd.svg'), ('BB','BRB','Barbados','América','English','-04:00','brb.svg'), ('BE','BEL','Bélgica','Europa','Dh','+01:00','bel.svg'), ('BZ','BLZ','Belice','América','English','-06:00','blz.svg'), ('BJ','BEN','Benín','Africa','French','+01:00','ben.svg'), ('BM','BMU','Bermudas','América','English','-04:00','bmu.svg'), ('BO','BOL','Bolivia','América','Spanish','-04:00','bol.svg'), ('BQ','BES','Bonaire, San Eustaquio y Saba','América','Dh','-04:00','bes.svg'), ('BA','BIH','Bosnia y Herzegovina','Europa','Bosnian','+01:00','bih.svg'), ('BW','BWA','Botswana','Africa','English','+02:00','bwa.svg'), ('BV','BVT','Isla Bouvet','Polar','Norwegian','+01:00','bvt.svg'), ('BR','BRA','Brasil','América','Portuguese','-05:00','bra.svg'), ('IO','IOT','Territorio Británico Índico','Africa','English','+06:00','iot.svg'), ('VG','VGB','Islas Vírgenes Británicas','América','English','-04:00','vgb.svg'), ('BT','BTN','Bután','Asia','Dzongkha','+06:00','btn.svg'), ('BF','BFA','Burkina Faso','Africa','French','','bfa.svg'), ('BI','BDI','Burundi','Africa','French','+02:00','bdi.svg'), ('CV','CPV','Cabo Verde','Africa','Portuguese','-01:00','cpv.svg'), ('CM','CMR','Camerún','Africa','English','+01:00','cmr.svg'), ('CA','CAN','Canadá','América','English','-08:00','can.svg'), ('KY','CYM','Islas Caimán','América','English','-05:00','cym.svg'), ('CZ','CZE','República Checa','Europa','Czech','+01:00','cze.svg'), ('CL','CHL','Chile','América','Spanish','-06:00','chl.svg'), ('CX','CXR','Isla de Navidad','Oceanía','English','+07:00','cxr.svg'), ('CC','CCK','Islas Cocos','Oceanía','English','+06:30','cck.svg'), ('CO','COL','Colombia','América','Spanish','-05:00','col.svg'), ('CK','COK','Islas Cook','Oceanía','English','-10:00','cok.svg'), ('CR','CRI','Costa Rica','América','Spanish','-06:00','cri.svg'), ('CI','CIV','Costa de Marfil','Africa','French','','civ.svg'), ('CU','CUB','Cuba','América','Spanish','-05:00','cub.svg'), ('CW','CUW','Curazao','América','Dh','-04:00','cuw.svg'), ('DK','DNK','Dinamarca','Europa','Danish','-04:00','dnk.svg'), ('DE','DEU','Alemania','Europa','German','+01:00','deu.svg'), ('DJ','DJI','Yibuti','Africa','French','+03:00','dji.svg'), ('DM','DMA','Dominica','América','English','-04:00','dma.svg'), ('EC','ECU','Ecuador','América','Spanish','-06:00','ecu.svg'), ('EE','EST','Estonia','Europa','Estonian','+02:00','est.svg'), ('IE','IRL','Irlanda','Europa','Irish','','irl.svg'), ('SV','SLV','El Salvador','América','Spanish','-06:00','slv.svg'), ('ES','ESP','España','Europa','Spanish','','esp.svg'), ('FJ','FJI','Fiyi','Oceanía','English','+12:00','fji.svg'), ('FO','FRO','Islas Feroe','Europa','Faroese','+00:00','fro.svg'), ('FR','FRA','Francia','Europa','French','-10:00','fra.svg'), ('GA','GAB','Gabón','Africa','French','+01:00','gab.svg'), ('GM','GMB','Gambia','Africa','English','+00:00','gmb.svg'), ('GH','GHA','Ghana','Africa','English','','gha.svg'), ('GI','GIB','Gibraltar','Europa','English','+01:00','gib.svg'), ('GD','GRD','Granada','América','English','-04:00','grd.svg'), ('GP','GLP','Guadalupe','América','French','-04:00','glp.svg'), ('GU','GUM','Guam','Oceanía','English','+10:00','gum.svg'), ('GT','GTM','Guatemala','América','Spanish','-06:00','gtm.svg'), ('GG','GGY','Guernsey','Europa','English','+00:00','ggy.svg'), ('GQ','GNQ','Guinea Ecuatorial','Africa','Spanish','+01:00','gnq.svg'), ('GW','GNB','Guinea-Bisáu','Africa','Portuguese','','gnb.svg'), ('GN','GIN','Guinea','Africa','French','','gin.svg'), ('GY','GUY','Guyana','América','English','-04:00','guy.svg'), ('GF','GUF','Guayana Francesa','América','French','-03:00','guf.svg'), ('HT','HTI','Haití','América','French','-05:00','hti.svg'), ('HM','HMD','Islas Heard y McDonald','Oceanía','English','+05:00','hmd.svg'), ('HN','HND','Honduras','América','Spanish','-06:00','hnd.svg'), ('HR','HRV','Croacia','Europa','Croatian','+01:00','hrv.svg'), ('ID','IDN','Indonesia','Asia','Indonesian','+07:00','idn.svg'), ('IS','ISL','Islandia','Europa','Icelandic','','isl.svg'), ('FK','FLK','Islas Malvinas','América','English','-04:00','flk.svg'), ('IM','IMN','Isla de Man','Europa','English','+00:00','imn.svg'), ('IT','ITA','Italia','Europa','Italian','+01:00','ita.svg'), ('JM','JAM','Jamaica','América','English','-05:00','jam.svg'), ('JE','JEY','Jersey','Europa','English','+01:00','jey.svg'), ('GL','GRL','Groenlandia','América','Kalaallisut','-04:00','grl.svg'), ('KH','KHM','Camboya','Asia','Khmer','+07:00','khm.svg'), ('KE','KEN','Kenia','Africa','English','+03:00','ken.svg'), ('KI','KIR','Kiribati','Oceanía','English','+12:00','kir.svg'), ('CF','CAF','República Centroafricana','Africa','French','+01:00','caf.svg'), ('KM','COM','Comoras','Africa','Arabic','+03:00','com.svg'), ('RE','REU','Reunión','Africa','French','+04:00','reu.svg'), ('LV','LVA','Letonia','Europa','Latvian','+02:00','lva.svg'), ('LS','LSO','Lesoto','Africa','English','+02:00','lso.svg'), ('LR','LBR','Liberia','Africa','English','','lbr.svg'), ('LI','LIE','Liechtenstein','Europa','German','+01:00','lie.svg'), ('LT','LTU','Lituania','Europa','Lithuanian','+02:00','ltu.svg'), ('LU','LUX','Luxemburgo','Europa','French','+01:00','lux.svg'), ('MG','MDG','Madagascar','Africa','French','+03:00','mdg.svg'), ('HU','HUN','Hungría','Europa','Hungarian','+01:00','hun.svg'), ('MH','MHL','Islas Marshall','Oceanía','English','+12:00','mhl.svg'), ('MW','MWI','Malaui','Africa','English','+02:00','mwi.svg'), ('MY','MYS','Malasia','Asia','Malaysian','+08:00','mys.svg'), ('MV','MDV','Maldivas','Asia','Divehi','+05:00','mdv.svg'), ('ML','MLI','Malí','Africa','French','','mli.svg'), ('MT','MLT','Malta','Europa','Maltese','+01:00','mlt.svg'), ('MQ','MTQ','Martinica','América','French','-04:00','mtq.svg'), ('MU','MUS','Mauricio','Africa','English','+04:00','mus.svg'), ('YT','MYT','Mayotte','Africa','French','+03:00','myt.svg'), ('MX','MEX','México','América','Spanish','-08:00','mex.svg'), ('FM','FSM','Micronesia','Oceanía','English','+10:00','fsm.svg'), ('MZ','MOZ','Mozambique','Africa','Portuguese','+02:00','moz.svg'), ('MD','MDA','Moldavia','Europa','Romanian','+02:00','mda.svg'), ('MC','MCO','Mónaco','Europa','French','+01:00','mco.svg'), ('MS','MSR','Montserrat','América','English','-04:00','msr.svg'), ('MM','MMR','Myanmar','Asia','Burmese','+06:30','mmr.svg'), ('NA','NAM','Namibia','Africa','English','+01:00','nam.svg'), ('NR','NRU','Nauru','Oceanía','English','+12:00','nru.svg'), ('NL','NLD','Países Bajos','Europa','Dh','-04:00','nld.svg'), ('BN','BRN','Brunéi','Asia','Malay','+08:00','brn.svg'), ('NZ','NZL','Nueva Zelanda','Oceanía','English','-11:00','nzl.svg'), ('NI','NIC','Nicaragua','América','Spanish','-06:00','nic.svg'), ('NE','NER','Níger','Africa','French','+01:00','ner.svg'), ('NG','NGA','Nigeria','Africa','English','+01:00','nga.svg'), ('NU','NIU','Niue','Oceanía','English','-11:00','niu.svg'), ('NF','NFK','Isla Norfolk','Oceanía','English','+11:30','nfk.svg'), ('NO','NOR','Noruega','Europa','Norwegian','+01:00','nor.svg'), ('MP','MNP','Islas Marianas del Norte','Oceanía','English','+10:00','mnp.svg'), ('NC','NCL','Nueva Caledonia','Oceanía','French','+11:00','ncl.svg'), ('UZ','UZB','Uzbekistán','Asia','Uzbek','+05:00','uzb.svg'), ('AT','AUT','Austria','Europa','German','+01:00','aut.svg'), ('PK','PAK','Pakistán','Asia','English','+05:00','pak.svg'), ('PW','PLW','Palaos','Oceanía','English','+09:00','plw.svg'), ('PA','PAN','Panamá','América','Spanish','-05:00','pan.svg'), ('PG','PNG','Papúa Nueva Guinea','Oceanía','English','+10:00','png.svg'), ('PY','PRY','Paraguay','América','Spanish','-04:00','pry.svg'), ('PE','PER','Perú','América','Spanish','-05:00','per.svg'), ('PH','PHL','Filipinas','Asia','English','+08:00','phl.svg'), ('PN','PCN','Islas Pitcairn','Oceanía','English','-08:00','pcn.svg'), ('PL','POL','Polonia','Europa','Polish','+01:00','pol.svg'), ('PF','PYF','Polinesia Francesa','Oceanía','French','-10:00','pyf.svg'), ('PT','PRT','Portugal','Europa','Portuguese','-01:00','prt.svg'), ('PR','PRI','Puerto Rico','América','Spanish','-04:00','pri.svg'), ('DO','DOM','República Dominicana','América','Spanish','-04:00','dom.svg'), ('XK','KOS','República de Kosovo','Europe','Albanian','+01:00','kos.svg'), ('CD','COD','Congo','Africa','French','+01:00','cod.svg'), ('CG','COG','República del Congo','Africa','French','+01:00','cog.svg'), ('RO','ROU','Rumania','Europa','Romanian','+02:00','rou.svg'), ('RW','RWA','Ruanda','Africa','Kinyarwanda','+02:00','rwa.svg'), ('SH','SHN','Santa Elena','Africa','English','+00:00','shn.svg'), ('KN','KNA','San Cristóbal y Nieves','América','English','-04:00','kna.svg'), ('LC','LCA','Santa Lucía','América','English','-04:00','lca.svg'), ('VC','VCT','San Vicente y las Granadinas','América','English','-04:00','vct.svg'), ('BL','BLM','San Bartolomé','América','French','-04:00','blm.svg'), ('MF','MAF','San Martín','América','English','-04:00','maf.svg'), ('PM','SPM','San Pedro y Miquelón','América','French','-03:00','spm.svg'), ('WS','WSM','Samoa','Oceanía','Samoan','+13:00','wsm.svg'), ('SM','SMR','San Marino','Europa','Italian','+01:00','smr.svg'), ('VA','VAT','Ciudad del Vaticano','Europa','Latin','+01:00','vat.svg'), ('ST','STP','Santo Tomé y Príncipe','Africa','Portuguese','','stp.svg'), ('CH','CHE','Suiza','Europa','German','+01:00','che.svg'), ('SN','SEN','Senegal','Africa','French','','sen.svg'), ('SC','SYC','Seychelles','Africa','French','+04:00','syc.svg'), ('AL','ALB','Albania','Europa','Albanian','+01:00','alb.svg'), ('SL','SLE','Sierra Leona','Africa','English','','sle.svg'), ('SG','SGP','Singapur','Asia','English','+08:00','sgp.svg'), ('SX','SXM','San Martín','América','Dh','-04:00','sxm.svg'), ('SI','SVN','Eslovenia','Europa','Slovene','+01:00','svn.svg'), ('SK','SVK','Eslovaquia','Europa','Slovak','+01:00','svk.svg'), ('SB','SLB','Islas Salomón','Oceanía','English','+11:00','slb.svg'), ('SO','SOM','Somalia','Africa','Somali','+03:00','som.svg'), ('ZA','ZAF','Sudáfrica','Africa','Afrikaans','+02:00','zaf.svg'), ('GS','SGS','Islas Georgias del Sur','América','English','-02:00','sgs.svg'), ('SS','SSD','Sudán del Sur','Africa','English','+03:00','ssd.svg'), ('LK','LKA','Sri Lanka','Asia','Sinhalese','+05:30','lka.svg'), ('FI','FIN','Finlandia','Europa','Finnish','+02:00','fin.svg'), ('SR','SUR','Surinam','América','Dh','-03:00','sur.svg'), ('SJ','SJM','Svalbard y Jan Mayen','Europa','Norwegian','+01:00','sjm.svg'), ('SE','SWE','Suecia','Europa','Swedish','+01:00','swe.svg'), ('SZ','SWZ','Suazilandia','Africa','English','+02:00','swz.svg'), ('TZ','TZA','Tanzania','Africa','Swahili','+03:00','tza.svg'), ('TD','TCD','Chad','Africa','French','+01:00','tcd.svg'), ('TF','ATF','Tierras Antárticas Francesas','Africa','French','+05:00','atf.svg'), ('TL','TLS','Timor Oriental','Asia','Portuguese','+09:00','tls.svg'), ('TG','TGO','Togo','Africa','French','','tgo.svg'), ('TK','TKL','Tokelau','Oceanía','English','+13:00','tkl.svg'), ('TO','TON','Tonga','Oceanía','English','+13:00','ton.svg'), ('TT','TTO','Trinidad y Tobago','América','English','-04:00','tto.svg'), ('TR','TUR','Turquía','Asia','Turkish','+03:00','tur.svg'), ('TM','TKM','Turkmenistán','Asia','Turkmen','+05:00','tkm.svg'), ('TC','TCA','Islas Turcas y Caicos','América','English','-04:00','tca.svg'), ('TV','TUV','Tuvalu','Oceanía','English','+12:00','tuv.svg'), ('UG','UGA','Uganda','Africa','English','+03:00','uga.svg'), ('GB','GBR','Reino Unido','Europa','English','-08:00','gbr.svg'), ('US','USA','Estados Unidos','América','English','-12:00','usa.svg'), ('UM','UMI','Islas Menores de EE.UU.','América','English','-11:00','umi.svg'), ('UY','URY','Uruguay','América','Spanish','-03:00','ury.svg'), ('VU','VUT','Vanuatu','Oceanía','Bislama','+11:00','vut.svg'), ('VE','VEN','Venezuela','América','Spanish','-04:00','ven.svg'), ('VN','VNM','Vietnam','Asia','Vietnamese','+07:00','vnm.svg'), ('VI','VIR','Islas Vírgenes de EE.UU.','América','English','-04:00','vir.svg'), ('WF','WLF','Wallis y Futuna','Oceanía','French','+12:00','wlf.svg'), ('ZM','ZMB','Zambia','Africa','English','+02:00','zmb.svg'), ('ZW','ZWE','Zimbabue','Africa','English','+02:00','zwe.svg'), ('GR','GRC','Grecia','Europa','Greek modern','+02:00','grc.svg'), ('CY','CYP','Chipre','Europa','Greek modern','+02:00','cyp.svg'), ('BY','BLR','Bielorrusia','Europa','Belarusian','+03:00','blr.svg'), ('BG','BGR','Bulgaria','Europa','Bulgarian','+02:00','bgr.svg'), ('KG','KGZ','Kirguistán','Asia','Kyrgyz','+06:00','kgz.svg'), ('KZ','KAZ','Kazajistán','Asia','Kazakh','+05:00','kaz.svg'), ('MK','MKD','Macedonia del Norte','Europa','Macedonian','+01:00','mkd.svg'), ('MN','MNG','Mongolia','Asia','Mongolian','+07:00','mng.svg'), ('RU','RUS','Rusia','Europa','Russian','+03:00','rus.svg'), ('RS','SRB','Serbia','Europa','Serbian','+01:00','srb.svg'), ('TJ','TJK','Tayikistán','Asia','Tajik','+05:00','tjk.svg'), ('UA','UKR','Ucrania','Europa','Ukrainian','+02:00','ukr.svg'), ('ME','MNE','Montenegro','Europa','Serbian','+01:00','mne.svg'), ('AM','ARM','Armenia','Asia','Armenian','+04:00','arm.svg'), ('GE','GEO','Georgia','Asia','Georgian','-05:00','geo.svg'), ('IL','ISR','Israel','Asia','Hebrew modern','+02:00','isr.svg'), ('AF','AFG','Afganistán','Asia','Pashto','+04:30','afg.svg'), ('JO','JOR','Jordania','Asia','Arabic','+03:00','jor.svg'), ('BH','BHR','Baréin','Asia','Arabic','+03:00','bhr.svg'), ('DZ','DZA','Argelia','Africa','Arabic','+01:00','dza.svg'), ('SD','SDN','Sudán','Africa','Arabic','+03:00','sdn.svg'), ('EH','ESH','República Árabe Saharaui','Africa','Arabic','+00:00','esh.svg'), ('IQ','IRQ','Irak','Asia','Arabic','+03:00','irq.svg'), ('SA','SAU','Arabia Saudita','Asia','Arabic','+03:00','sau.svg'), ('KW','KWT','Kuwait','Asia','Arabic','+03:00','kwt.svg'), ('MA','MAR','Marruecos','Africa','Arabic','','mar.svg'), ('YE','YEM','Yemen','Asia','Arabic','+03:00','yem.svg'), ('IR','IRN','Irán','Asia','Persian Farsi','+03:30','irn.svg'), ('TN','TUN','Túnez','Africa','Arabic','+01:00','tun.svg'), ('AE','ARE','Emiratos Árabes Unidos','Asia','Arabic','+04','are.svg'), ('SY','SYR','Siria','Asia','Arabic','+02:00','syr.svg'), ('OM','OMN','Omán','Asia','Arabic','+04:00','omn.svg'), ('PS','PSE','Palestina','Asia','Arabic','+02:00','pse.svg'), ('QA','QAT','Catar','Asia','Arabic','+03:00','qat.svg'), ('LB','LBN','Líbano','Asia','Arabic','+02:00','lbn.svg'), ('LY','LBY','Libia','Africa','Arabic','+01:00','lby.svg'), ('EG','EGY','Egipto','Africa','Arabic','+02:00','egy.svg'), ('MR','MRT','Mauritania','Africa','Arabic','','mrt.svg'), ('NP','NPL','Nepal','Asia','Nepali','+05:45','npl.svg'), ('IN','IND','India','Asia','Hindi','+05:30','ind.svg'), ('TH','THA','Tailandia','Asia','Thai','+07:00','tha.svg'), ('LA','LAO','Laos','Asia','Lao','+07:00','lao.svg'), ('ET','ETH','Etiopía','Africa','Amharic','+03:00','eth.svg'), ('ER','ERI','Eritrea','Africa','Tigrinya','+03:00','eri.svg'), ('KR','KOR','Corea del Sur','Asia','Korean','+09:00','kor.svg'), ('KP','PRK','Corea del Norte','Asia','Korean','+09:00','prk.svg'), ('CN','CHN','China','Asia','Chinese','+08:00','chn.svg'), ('JP','JPN','Japón','Asia','Japanese','+09:00','jpn.svg'), ('MO','MAC','Macao','Asia','Chinese','+08:00','mac.svg'), ('TW','TWN','Taiwán','Asia','Chinese','+08:00','twn.svg'), ('HK','HKG','Hong Kong','Asia','English','+08:00','hkg.svg')
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
	orden INT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO estados_eclesiales (id, orden, nombre)
VALUES 
('LA', 1, 'Laico/a'),
('RC', 2, 'Religioso/a'), 
('DP', 3, 'Diácono Perm.'),
('SC', 4, 'Sacerdote'), 
('OB', 5, 'Obispo')
;
CREATE TABLE roles_usuario (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	nombre VARCHAR(30) NOT NULL,
	aut_altas_productos BOOLEAN NOT NULL,
	aut_aprobar_altas_prod BOOLEAN NOT NULL,
	aut_cambiar_perfil_usuarios BOOLEAN NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO roles_usuario (id, orden, nombre, aut_altas_productos, aut_aprobar_altas_prod, aut_cambiar_perfil_usuarios)
VALUES 
(1, 1, 'Usuario', 1, 0, 0),
(2, 2, 'Revisor de Altas de Productos', 1, 1, 0),
(3, 3, 'Gestor de Usuarios', 1, 0, 1),
(4, 4, 'Todos los permisos', 1, 1, 1)
;
CREATE TABLE sexos (
	id VARCHAR(1) NOT NULL,
	nombre VARCHAR(20) NOT NULL,
	letra_final VARCHAR(1) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO sexos (id, nombre, letra_final)
VALUES ('F','Femenino', 'a'), ('M','Masculino', 'o')
;
CREATE TABLE status_registro (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO status_registro (id, orden, nombre)
VALUES 
(1, 1, 'Mail a validar'), 
(2, 2, 'Mail validado'), 
(3, 3, 'Datos perennes OK'), 
(4, 4, 'Datos editables OK')
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
	aut_data_entry BOOLEAN NOT NULL DEFAULT 0,
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
VALUES 
(1, 'diegoiribarren2015@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 4, 4, 1, 'Diego', 'Iribarren', 'Diego', '1617370359746.jpg', '1969-08-16', 'M', 'AR', 'LA', '2021-03-26', '2021-03-26'),
(2, 'sp2015w@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 4, 2, 1, 'Diego', 'Iribarren', 'Diego', '1617370359746.jpg', '1969-08-16', 'M', 'AR', 'LA', '2021-03-26', '2021-03-26')
;
CREATE TABLE penalizaciones_motivos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	duracion INT UNSIGNED NOT NULL,
	comentario VARCHAR(500) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO penalizaciones_motivos (id, orden, duracion, nombre, comentario)
VALUES 
(1, 1, 30, 'Spam primera vez', 'Material no agresivo, pero ajeno a nuestro perfil, primera vez'),
(2, 2, 200, 'Spam reincidente', 'Material no agresivo, pero ajeno a nuestro perfil, reincidente'),
(3, 3, 200, 'Anti-católico primera vez', 'Mofarse de la religión católica, primera vez'),
(4, 4, 400, 'Anti-católico reincidente', 'Mofarse de la religión católica, reincidente'),
(5, 5, 400, 'Pornografía primera vez', 'Pornografía, primera vez'),
(6, 6, 1000, 'Pornografía reincidente', 'Pornografía, reincidente')
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
	orden INT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO categorias (id, orden, nombre)
VALUES 
('CFC', 1, 'Centradas en la Fe Católica'), 
('VPC', 2, 'Valores Presentes en la Cultura')
;
CREATE TABLE categorias_sub (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	url VARCHAR(20) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO categorias_sub (id, orden, categoria_id, nombre, url)
VALUES 
(1, 1, 'CFC', 'Jesús', 'cfc/jesus'), 
(2, 2, 'CFC', 'Contemporáneos de Jesús', 'cfc/contemporaneos'), 
(3, 3, 'CFC', 'Apariciones Marianas', 'cfc/marianas'), 
(4, 4, 'CFC', 'Hagiografías', 'cfc/hagiografias'), 
(5, 5, 'CFC', 'Historias de la Iglesia', 'cfc/historias'), 
(6, 6, 'CFC', 'Novelas centradas en la fe', 'cfc/novelas'), 
(7, 7, 'CFC', 'Colecciones', 'cfc/colecciones'), 
(8, 8, 'CFC', 'Documentales', 'cfc/documentales'), 
(9, 9, 'VPC', 'Biografías e Historias', 'vpc/bios_historias'), 
(10, 10, 'VPC', 'Matrimonio y Familia', 'vpc/matrimonio'), 
(11, 11, 'VPC', 'Novelas', 'vpc/novelas'), 
(12, 12, 'VPC', 'Musicales', 'vpc/musicales'), 
(13, 13, 'VPC', 'Colecciones', 'vpc/colecciones')
;
CREATE TABLE listado_peliculas (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	url VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO listado_peliculas (id, orden, nombre, url)
VALUES 
(1, 1, 'Sugeridas para el momento del año', 'listado/sugeridas'), 
(2, 2, 'Por orden de calificación en nuestra página', 'listado/calificacion'), 
(3, 3, 'Por año de estreno', 'listado/estreno'), 
(4, 4, 'Por orden de incorporación a nuestra base de datos', 'listado/incorporacion'), 
(5, 5, 'Por orden de visita', 'listado/visita')
;
CREATE TABLE menu_opciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	url VARCHAR(50) NOT NULL,
	titulo VARCHAR(50) NOT NULL,
	vista VARCHAR(20) NOT NULL,
	comentario VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO menu_opciones (id, orden, nombre, url, titulo, vista, comentario)
VALUES 
(1, 1, 'Listado de Películas', 'listado', 'Listado', '1-Listado', 'Todas las películas de nuestra Base de Datos'),
(2, 2, 'Un paseo por CFC', 'cfc', 'CFC', '2-CFC', 'Películas Centradas en la Fe Católica (CFC)'),
(3, 3, 'Un paseo por VPC', 'vpc', 'VPC', '3-VPC', 'Películas con Valores Presentes en nuestra Cultura (VPC)')
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
	coleccion_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NULL,
	tmdb_id VARCHAR(20) NULL,
	nombre_original VARCHAR(100) NOT NULL UNIQUE,
	nombre_castellano VARCHAR(100) NOT NULL,
	ano_estreno INT UNSIGNED NOT NULL,
	cant_capitulos INT UNSIGNED NOT NULL DEFAULT 1,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,
	orden_secuencia INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_id) REFERENCES colecciones_cabecera(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO colecciones_peliculas (coleccion_id, pelicula_id, tmdb_id, nombre_original, nombre_castellano, ano_estreno, orden_secuencia)
VALUES (1, 1, '38516', 'Karol, un uomo diventato Papa', 'Karol, el hombre que llegó a ser Papa', 2005, 1)
;
INSERT INTO colecciones_peliculas (coleccion_id, tmdb_id, nombre_original, nombre_castellano, ano_estreno, orden_secuencia)
VALUES (1, '75470', 'Karol, un Papa rimasto uomo', 'Karol, el Papa que siguió siendo hombre', 2006, 2)
;
CREATE TABLE epocas_estreno (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,	
	nombre VARCHAR(20) NOT NULL,
	ano_comienzo INT UNSIGNED NOT NULL,
	ano_fin INT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO epocas_estreno (id, orden, nombre, ano_comienzo, ano_fin)
VALUES 
(4, 1, '2015 - Presente', 2015, 2025),
(3, 2, '2000 - 2014', 2000, 2014), 
(2, 3, '1970 - 1999', 1970, 1999), 
(1, 4, 'Antes de 1970', 1900, 1969)
;
CREATE TABLE publicos_sugeridos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,	
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO publicos_sugeridos (id, orden, nombre)
VALUES 
(5, 1, 'Mayores solamente'),
(4, 2, 'Mayores (apto familia)'),
(3, 3, 'Familia'),
(2, 4, 'Menores (apto familia)'),
(1, 5, 'Menores solamente')
;
CREATE TABLE eventos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	dia INT UNSIGNED NULL,
	mes INT UNSIGNED NULL,
	evento VARCHAR(50) NOT NULL,
	nombre VARCHAR(70) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO eventos (id, orden, dia, mes, evento, nombre)
VALUES (1, 301, 22, 10, 'San Juan Pablo II', '22/oct - San Juan Pablo II')
;
CREATE TABLE personajes_historicos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO personajes_historicos (id, nombre)
VALUES (1, 'Papa Juan Pablo II')
;
CREATE TABLE hechos_historicos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO hechos_historicos (id, nombre)
VALUES (1, 'Guerra Mundial - II')
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
	actores VARCHAR(500) NOT NULL,
	productor VARCHAR(100) NOT NULL,
	sinopsis VARCHAR(800) NOT NULL,
	avatar VARCHAR(100) NOT NULL,
	en_castellano BOOLEAN NOT NULL,
	color BOOLEAN NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	subcategoria_id INT UNSIGNED NOT NULL,
	publico_sugerido_id INT UNSIGNED NOT NULL,
	personaje_historico_id INT UNSIGNED NULL,
	hecho_historico_id INT UNSIGNED NULL,
	sugerida_para_evento_id INT UNSIGNED NULL,
	trailer VARCHAR(200) NULL,
	pelicula VARCHAR(200) NULL,
	calificacion INT UNSIGNED NULL,
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
	FOREIGN KEY (publico_sugerido_id) REFERENCES publicos_sugeridos(id),
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
INSERT INTO PELICULAS (id, tmdb_id, fa_id, imdb_id, nombre_original, nombre_castellano, coleccion_pelicula_id, duracion, ano_estreno, pais_id, avatar, en_castellano, color, publico_sugerido_id, categoria_id, subcategoria_id, personaje_historico_id, hecho_historico_id, sugerida_para_evento_id, sinopsis, creada_por_id, creada_en, analizada_por_id, analizada_en, aprobada, director, guion, musica, actores, productor)
VALUES (1, '38516', '436804', 'tt0435100', 'Karol - Un uomo diventato Papa', 'Karol, el hombre que llegó a ser Papa', 1, 195, 2005, 'IT, PL', 'Karol.png', true, true, 1, 'CFC', 4, 1, 1, 1, 'Miniserie biográfica sobre Juan Pablo II. En su juventud, en Polonia bajo la ocupación nazi, Karol Wojtyla trabajó en una cantera de caliza para poder sobrevivir. La represión nazi causó numerosas víctimas no sólo entre los judíos, sino también entre los católicos. Es entonces cuando Karol decide responder a la llamada divina.', 1, '2021-04-23', 2, '2021-04-23', 1, 'Giacomo Battiato', 'Giacomo Battiato', 'Ennio Morricone', 'Piotr Adamczyk (Karol Wojtyla), Malgorzata Bela (Hanna Tuszynska), Ken Duken (Adam Zielinski), Hristo Shopov (Julian Kordek), Ennio Fantastichini (Maciej Nowak), Violante Placido (Maria Pomorska), Matt Craven (Hans Frank), Raoul Bova (padre Tomasz Zaleski), Lech Mackiewicz (card. Stefan Wyszynski), Patrycja Soliman (Wislawa)', 'Taodue Film')
;
CREATE TABLE fe_valores (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	valor INT UNSIGNED NOT NULL,	
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO fe_valores (id, orden, valor, nombre)
VALUES 
(4, 1, 3, 'Mucho'),
(3, 2, 2, 'Sí'),
(2, 3, 1, 'Poco'),
(1, 4, 0, 'No')
;
CREATE TABLE entretiene (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	valor INT UNSIGNED NOT NULL,	
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO entretiene (id, orden, valor, nombre)
VALUES 
(4, 1, 3, 'Mucho'),
(3, 2, 2, 'Sí'),
(2, 3, 1, 'Poco'),
(1, 4, 0, 'No')
;
CREATE TABLE calidad_sonora_visual (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	valor INT UNSIGNED NOT NULL,	
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO calidad_sonora_visual (id, orden, valor, nombre)
VALUES 
(2, 1, 3, 'No afecta al disfrute'),
(1, 2, 0, 'Perjudica el disfrute')
;
CREATE TABLE us_pel_calificaciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	fe_valores_id INT UNSIGNED NOT NULL,
	entretiene_id INT UNSIGNED NOT NULL,
	calidad_sonora_visual_id INT UNSIGNED NOT NULL,
	resultado DECIMAL(3,2) UNSIGNED NOT NULL DEFAULT 1,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id),
	FOREIGN KEY (fe_valores_id) REFERENCES fe_valores(id),
	FOREIGN KEY (entretiene_id) REFERENCES entretiene(id),
	FOREIGN KEY (calidad_sonora_visual_id) REFERENCES calidad_sonora_visual(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO us_pel_calificaciones (id, usuario_id, pelicula_id, fe_valores_id, entretiene_id, calidad_sonora_visual_id)
VALUES (1, 1, 1, 4, 4, 2)
;
CREATE TABLE interes_en_la_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden INT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL UNIQUE,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO interes_en_la_pelicula (id, orden, nombre)
VALUES 
(3, 1, 'Recordame que quiero verla'),
(2, 2, 'Ya la vi'),
(1, 3, 'Prefiero que no me la recomienden')
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
INSERT INTO us_pel_interes_en_la_pelicula (usuario_id, pelicula_id, interes_en_la_pelicula_id)
VALUES (1, 1, 2)
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
