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
VALUES ('AX','ALA','Aland','Europa','Swedish','+02:00','ala.svg'), ('AS','ASM','Samoa Americana','Oceanía','English','-11:00','asm.svg'), ('AD','AND','Andorra','Europa','Catalan','+01:00','and.svg'), ('AO','AGO','Angola','Africa','Portuguese','+01:00','ago.svg'), ('AI','AIA','Anguila','América','English','-04:00','aia.svg'), ('AQ','ATA','Antártida','Polar','English','-03:00','ata.svg'), ('AG','ATG','Antigua y Barbuda','América','English','-04:00','atg.svg'), ('AR','ARG','Argentina','América','Spanish','-03:00','arg.svg'), ('AW','ABW','Aruba','América','Dh','-04:00','abw.svg'), ('AU','AUS','Australia','Oceanía','English','+05:00','aus.svg'), ('AZ','AZE','Azerbaiyán','Asia','Azerbaijani','+04:00','aze.svg'), ('BS','BHS','Bahamas','América','English','-05:00','bhs.svg'), ('BD','BGD','Bangladés','Asia','Bengali','+06:00','bgd.svg'), ('BB','BRB','Barbados','América','English','-04:00','brb.svg'), ('BE','BEL','Bélgica','Europa','Dh','+01:00','bel.svg'), ('BZ','BLZ','Belice','América','English','-06:00','blz.svg'), ('BJ','BEN','Benín','Africa','French','+01:00','ben.svg'), ('BM','BMU','Bermudas','América','English','-04:00','bmu.svg'), ('BO','BOL','Bolivia','América','Spanish','-04:00','bol.svg'), ('BQ','BES','Bonaire, San Eustaquio y Saba','América','Dh','-04:00','bes.svg'), ('BA','BIH','Bosnia y Herzegovina','Europa','Bosnian','+01:00','bih.svg'), ('BW','BWA','Botswana','Africa','English','+02:00','bwa.svg'), ('BV','BVT','Isla Bouvet','Polar','Norwegian','+01:00','bvt.svg'), ('BR','BRA','Brasil','América','Portuguese','-05:00','bra.svg'), ('IO','IOT','Territorio Británico Índico','Africa','English','+06:00','iot.svg'), ('VG','VGB','Islas Vírgenes Británicas','América','English','-04:00','vgb.svg'), ('BT','BTN','Bután','Asia','Dzongkha','+06:00','btn.svg'), ('BF','BFA','Burkina Faso','Africa','French','','bfa.svg'), ('BI','BDI','Burundi','Africa','French','+02:00','bdi.svg'), ('CV','CPV','Cabo Verde','Africa','Portuguese','-01:00','cpv.svg'), ('CM','CMR','Camerún','Africa','English','+01:00','cmr.svg'), ('CA','CAN','Canadá','América','English','-08:00','can.svg'), ('KY','CYM','Islas Caimán','América','English','-05:00','cym.svg'), ('CZ','CZE','República Checa','Europa','Czech','+01:00','cze.svg'), ('CL','CHL','Chile','América','Spanish','-06:00','chl.svg'), ('CX','CXR','Isla de Navidad','Oceanía','English','+07:00','cxr.svg'), ('CC','CCK','Islas Cocos','Oceanía','English','+06:30','cck.svg'), ('CO','COL','Colombia','América','Spanish','-05:00','col.svg'), ('CK','COK','Islas Cook','Oceanía','English','-10:00','cok.svg'), ('CR','CRI','Costa Rica','América','Spanish','-06:00','cri.svg'), ('CI','CIV','Costa de Marfil','Africa','French','','civ.svg'), ('CU','CUB','Cuba','América','Spanish','-05:00','cub.svg'), ('CW','CUW','Curazao','América','Dh','-04:00','cuw.svg'), ('DK','DNK','Dinamarca','Europa','Danish','-04:00','dnk.svg'), ('DE','DEU','Alemania','Europa','German','+01:00','deu.svg'), ('DJ','DJI','Yibuti','Africa','French','+03:00','dji.svg'), ('DM','DMA','Dominica','América','English','-04:00','dma.svg'), ('EC','ECU','Ecuador','América','Spanish','-06:00','ecu.svg'), ('EE','EST','Estonia','Europa','Estonian','+02:00','est.svg'), ('IE','IRL','Irlanda','Europa','Irish','','irl.svg'), ('SV','SLV','El Salvador','América','Spanish','-06:00','slv.svg'), ('ES','ESP','España','Europa','Spanish','','esp.svg'), ('FJ','FJI','Fiyi','Oceanía','English','+12:00','fji.svg'), ('FO','FRO','Islas Feroe','Europa','Faroese','+00:00','fro.svg'), ('FR','FRA','Francia','Europa','French','-10:00','fra.svg'), ('GA','GAB','Gabón','Africa','French','+01:00','gab.svg'), ('GM','GMB','Gambia','Africa','English','+00:00','gmb.svg'), ('GH','GHA','Ghana','Africa','English','','gha.svg'), ('GI','GIB','Gibraltar','Europa','English','+01:00','gib.svg'), ('GD','GRD','Granada','América','English','-04:00','grd.svg'), ('GP','GLP','Guadalupe','América','French','-04:00','glp.svg'), ('GU','GUM','Guam','Oceanía','English','+10:00','gum.svg'), ('GT','GTM','Guatemala','América','Spanish','-06:00','gtm.svg'), ('GG','GGY','Guernsey','Europa','English','+00:00','ggy.svg'), ('GQ','GNQ','Guinea Ecuatorial','Africa','Spanish','+01:00','gnq.svg'), ('GW','GNB','Guinea-Bisáu','Africa','Portuguese','','gnb.svg'), ('GN','GIN','Guinea','Africa','French','','gin.svg'), ('GY','GUY','Guyana','América','English','-04:00','guy.svg'), ('GF','GUF','Guayana Francesa','América','French','-03:00','guf.svg'), ('HT','HTI','Haití','América','French','-05:00','hti.svg'), ('HM','HMD','Islas Heard y McDonald','Oceanía','English','+05:00','hmd.svg'), ('HN','HND','Honduras','América','Spanish','-06:00','hnd.svg'), ('HR','HRV','Croacia','Europa','Croatian','+01:00','hrv.svg'), ('ID','IDN','Indonesia','Asia','Indonesian','+07:00','idn.svg'), ('IS','ISL','Islandia','Europa','Icelandic','','isl.svg'), ('FK','FLK','Islas Malvinas','América','English','-04:00','flk.svg'), ('IM','IMN','Isla de Man','Europa','English','+00:00','imn.svg'), ('IT','ITA','Italia','Europa','Italian','+01:00','ita.svg'), ('JM','JAM','Jamaica','América','English','-05:00','jam.svg'), ('JE','JEY','Jersey','Europa','English','+01:00','jey.svg'), ('GL','GRL','Groenlandia','América','Kalaallisut','-04:00','grl.svg'), ('KH','KHM','Camboya','Asia','Khmer','+07:00','khm.svg'), ('KE','KEN','Kenia','Africa','English','+03:00','ken.svg'), ('KI','KIR','Kiribati','Oceanía','English','+12:00','kir.svg'), ('CF','CAF','República Centroafricana','Africa','French','+01:00','caf.svg'), ('KM','COM','Comoras','Africa','Arabic','+03:00','com.svg'), ('RE','REU','Reunión','Africa','French','+04:00','reu.svg'), ('LV','LVA','Letonia','Europa','Latvian','+02:00','lva.svg'), ('LS','LSO','Lesoto','Africa','English','+02:00','lso.svg'), ('LR','LBR','Liberia','Africa','English','','lbr.svg'), ('LI','LIE','Liechtenstein','Europa','German','+01:00','lie.svg'), ('LT','LTU','Lituania','Europa','Lithuanian','+02:00','ltu.svg'), ('LU','LUX','Luxemburgo','Europa','French','+01:00','lux.svg'), ('MG','MDG','Madagascar','Africa','French','+03:00','mdg.svg'), ('HU','HUN','Hungría','Europa','Hungarian','+01:00','hun.svg'), ('MH','MHL','Islas Marshall','Oceanía','English','+12:00','mhl.svg'), ('MW','MWI','Malaui','Africa','English','+02:00','mwi.svg'), ('MY','MYS','Malasia','Asia','Malaysian','+08:00','mys.svg'), ('MV','MDV','Maldivas','Asia','Divehi','+05:00','mdv.svg'), ('ML','MLI','Malí','Africa','French','','mli.svg'), ('MT','MLT','Malta','Europa','Maltese','+01:00','mlt.svg'), ('MQ','MTQ','Martinica','América','French','-04:00','mtq.svg'), ('MU','MUS','Mauricio','Africa','English','+04:00','mus.svg'), ('YT','MYT','Mayotte','Africa','French','+03:00','myt.svg'), ('MX','MEX','México','América','Spanish','-08:00','mex.svg'), ('FM','FSM','Micronesia','Oceanía','English','+10:00','fsm.svg'), ('MZ','MOZ','Mozambique','Africa','Portuguese','+02:00','moz.svg'), ('MD','MDA','Moldavia','Europa','Romanian','+02:00','mda.svg'), ('MC','MCO','Mónaco','Europa','French','+01:00','mco.svg'), ('MS','MSR','Montserrat','América','English','-04:00','msr.svg'), ('MM','MMR','Myanmar','Asia','Burmese','+06:30','mmr.svg'), ('NA','NAM','Namibia','Africa','English','+01:00','nam.svg'), ('NR','NRU','Nauru','Oceanía','English','+12:00','nru.svg'), ('NL','NLD','Países Bajos','Europa','Dh','-04:00','nld.svg'), ('BN','BRN','Brunéi','Asia','Malay','+08:00','brn.svg'), ('NZ','NZL','Nueva Zelanda','Oceanía','English','-11:00','nzl.svg'), ('NI','NIC','Nicaragua','América','Spanish','-06:00','nic.svg'), ('NE','NER','Níger','Africa','French','+01:00','ner.svg'), ('NG','NGA','Nigeria','Africa','English','+01:00','nga.svg'), ('NU','NIU','Niue','Oceanía','English','-11:00','niu.svg'), ('NF','NFK','Isla Norfolk','Oceanía','English','+11:30','nfk.svg'), ('NO','NOR','Noruega','Europa','Norwegian','+01:00','nor.svg'), ('MP','MNP','Islas Marianas del Norte','Oceanía','English','+10:00','mnp.svg'), ('NC','NCL','Nueva Caledonia','Oceanía','French','+11:00','ncl.svg'), ('UZ','UZB','Uzbekistán','Asia','Uzbek','+05:00','uzb.svg'), ('AT','AUT','Austria','Europa','German','+01:00','aut.svg'), ('PK','PAK','Pakistán','Asia','English','+05:00','pak.svg'), ('PW','PLW','Palaos','Oceanía','English','+09:00','plw.svg'), ('PA','PAN','Panamá','América','Spanish','-05:00','pan.svg'), ('PG','PNG','Papúa Nueva Guinea','Oceanía','English','+10:00','png.svg'), ('PY','PRY','Paraguay','América','Spanish','-04:00','pry.svg'), ('PE','PER','Perú','América','Spanish','-05:00','per.svg'), ('PH','PHL','Filipinas','Asia','English','+08:00','phl.svg'), ('PN','PCN','Islas Pitcairn','Oceanía','English','-08:00','pcn.svg'), ('PL','POL','Polonia','Europa','Polish','+01:00','pol.svg'), ('PF','PYF','Polinesia Francesa','Oceanía','French','-10:00','pyf.svg'), ('PT','PRT','Portugal','Europa','Portuguese','-01:00','prt.svg'), ('PR','PRI','Puerto Rico','América','Spanish','-04:00','pri.svg'), ('DO','DOM','República Dominicana','América','Spanish','-04:00','dom.svg'), ('XK','KOS','República de Kosovo','Europe','Albanian','+01:00','kos.svg'), ('CD','COD','Congo','Africa','French','+01:00','cod.svg'), ('CG','COG','República del Congo','Africa','French','+01:00','cog.svg'), ('RO','ROU','Rumania','Europa','Romanian','+02:00','rou.svg'), ('RW','RWA','Ruanda','Africa','Kinyarwanda','+02:00','rwa.svg'), ('SH','SHN','Santa Elena','Africa','English','+00:00','shn.svg'), ('KN','KNA','San Cristóbal y Nieves','América','English','-04:00','kna.svg'), ('LC','LCA','Santa Lucía','América','English','-04:00','lca.svg'), ('VC','VCT','San Vicente y las Granadinas','América','English','-04:00','vct.svg'), ('BL','BLM','San Bartolomé','América','French','-04:00','blm.svg'), ('MF','MAF','San Martín','América','English','-04:00','maf.svg'), ('PM','SPM','San Pedro y Miquelón','América','French','-03:00','spm.svg'), ('WS','WSM','Samoa','Oceanía','Samoan','+13:00','wsm.svg'), ('SM','SMR','San Marino','Europa','Italian','+01:00','smr.svg'), ('VA','VAT','Ciudad del Vaticano','Europa','Latin','+01:00','vat.svg'), ('ST','STP','Santo Tomé y Príncipe','Africa','Portuguese','','stp.svg'), ('CH','CHE','Suiza','Europa','German','+01:00','che.svg'), ('SN','SEN','Senegal','Africa','French','','sen.svg'), ('SC','SYC','Seychelles','Africa','French','+04:00','syc.svg'), ('AL','ALB','Albania','Europa','Albanian','+01:00','alb.svg'), ('SL','SLE','Sierra Leona','Africa','English','','sle.svg'), ('SG','SGP','Singapur','Asia','English','+08:00','sgp.svg'), ('SX','SXM','San Martín','América','Dh','-04:00','sxm.svg'), ('SI','SVN','Eslovenia','Europa','Slovene','+01:00','svn.svg'), ('SK','SVK','Eslovaquia','Europa','Slovak','+01:00','svk.svg'), ('SB','SLB','Islas Salomón','Oceanía','English','+11:00','slb.svg'), ('SO','SOM','Somalia','Africa','Somali','+03:00','som.svg'), ('ZA','ZAF','Sudáfrica','Africa','Afrikaans','+02:00','zaf.svg'), ('GS','SGS','Islas Georgias del Sur','América','English','-02:00','sgs.svg'), ('SS','SSD','Sudán del Sur','Africa','English','+03:00','ssd.svg'), ('LK','LKA','Sri Lanka','Asia','Sinhalese','+05:30','lka.svg'), ('FI','FIN','Finlandia','Europa','Finnish','+02:00','fin.svg'), ('SR','SUR','Surinam','América','Dh','-03:00','sur.svg'), ('SJ','SJM','Svalbard y Jan Mayen','Europa','Norwegian','+01:00','sjm.svg'), ('SE','SWE','Suecia','Europa','Swedish','+01:00','swe.svg'), ('SZ','SWZ','Suazilandia','Africa','English','+02:00','swz.svg'), ('TZ','TZA','Tanzania','Africa','Swahili','+03:00','tza.svg'), ('TD','TCD','Chad','Africa','French','+01:00','tcd.svg'), ('TF','ATF','Tierras Antárticas Francesas','Africa','French','+05:00','atf.svg'), ('TL','TLS','Timor Oriental','Asia','Portuguese','+09:00','tls.svg'), ('TG','TGO','Togo','Africa','French','','tgo.svg'), ('TK','TKL','Tokelau','Oceanía','English','+13:00','tkl.svg'), ('TO','TON','Tonga','Oceanía','English','+13:00','ton.svg'), ('TT','TTO','Trinidad y Tobago','América','English','-04:00','tto.svg'), ('TR','TUR','Turquía','Asia','Turkish','+03:00','tur.svg'), ('TM','TKM','Turkmenistán','Asia','Turkmen','+05:00','tkm.svg'), ('TC','TCA','Islas Turcas y Caicos','América','English','-04:00','tca.svg'), ('TV','TUV','Tuvalu','Oceanía','English','+12:00','tuv.svg'), ('UG','UGA','Uganda','Africa','English','+03:00','uga.svg'), ('GB','GBR','Reino Unido','Europa','English','-08:00','gbr.svg'), ('US','USA','Estados Unidos','América','English','-12:00','usa.svg'), ('UM','UMI','Islas Menores de EE.UU.','América','English','-11:00','umi.svg'), ('UY','URY','Uruguay','América','Spanish','-03:00','ury.svg'), ('VU','VUT','Vanuatu','Oceanía','Bislama','+11:00','vut.svg'), ('VE','VEN','Venezuela','América','Spanish','-04:00','ven.svg'), ('VN','VNM','Vietnam','Asia','Vietnamese','+07:00','vnm.svg'), ('VI','VIR','Islas Vírgenes de EE.UU.','América','English','-04:00','vir.svg'), ('WF','WLF','Wallis y Futuna','Oceanía','French','+12:00','wlf.svg'), ('ZM','ZMB','Zambia','Africa','English','+02:00','zmb.svg'), ('ZW','ZWE','Zimbabue','Africa','English','+02:00','zwe.svg'), ('GR','GRC','Grecia','Europa','Greek modern','+02:00','grc.svg'), ('CY','CYP','Chipre','Europa','Greek modern','+02:00','cyp.svg'), ('BY','BLR','Bielorrusia','Europa','Belarusian','+03:00','blr.svg'), ('BG','BGR','Bulgaria','Europa','Bulgarian','+02:00','bgr.svg'), ('KG','KGZ','Kirguistán','Asia','Kyrgyz','+06:00','kgz.svg'), ('KZ','KAZ','Kazajistán','Asia','Kazakh','+05:00','kaz.svg'), ('MK','MKD','Macedonia del Norte','Europa','Macedonian','+01:00','mkd.svg'), ('MN','MNG','Mongolia','Asia','Mongolian','+07:00','mng.svg'), ('RU','RUS','Rusia','Europa','Russian','+03:00','rus.svg'), ('RS','SRB','Serbia','Europa','Serbian','+01:00','srb.svg'), ('TJ','TJK','Tayikistán','Asia','Tajik','+05:00','tjk.svg'), ('UA','UKR','Ucrania','Europa','Ukrainian','+02:00','ukr.svg'), ('ME','MNE','Montenegro','Europa','Serbian','+01:00','mne.svg'), ('AM','ARM','Armenia','Asia','Armenian','+04:00','arm.svg'), ('GE','GEO','Georgia','Asia','Georgian','-05:00','geo.svg'), ('IL','ISR','Israel','Asia','Hebrew modern','+02:00','isr.svg'), ('AF','AFG','Afganistán','Asia','Pashto','+04:30','afg.svg'), ('JO','JOR','Jordania','Asia','Arabic','+03:00','jor.svg'), ('BH','BHR','Baréin','Asia','Arabic','+03:00','bhr.svg'), ('DZ','DZA','Argelia','Africa','Arabic','+01:00','dza.svg'), ('SD','SDN','Sudán','Africa','Arabic','+03:00','sdn.svg'), ('EH','ESH','República Árabe Saharaui','Africa','Arabic','+00:00','esh.svg'), ('IQ','IRQ','Irak','Asia','Arabic','+03:00','irq.svg'), ('SA','SAU','Arabia Saudita','Asia','Arabic','+03:00','sau.svg'), ('KW','KWT','Kuwait','Asia','Arabic','+03:00','kwt.svg'), ('MA','MAR','Marruecos','Africa','Arabic','','mar.svg'), ('YE','YEM','Yemen','Asia','Arabic','+03:00','yem.svg'), ('IR','IRN','Irán','Asia','Persian Farsi','+03:30','irn.svg'), ('TN','TUN','Túnez','Africa','Arabic','+01:00','tun.svg'), ('AE','ARE','Emiratos Árabes Unidos','Asia','Arabic','+04','are.svg'), ('SY','SYR','Siria','Asia','Arabic','+02:00','syr.svg'), ('OM','OMN','Omán','Asia','Arabic','+04:00','omn.svg'), ('PS','PSE','Palestina','Asia','Arabic','+02:00','pse.svg'), ('QA','QAT','Catar','Asia','Arabic','+03:00','qat.svg'), ('LB','LBN','Líbano','Asia','Arabic','+02:00','lbn.svg'), ('LY','LBY','Libia','Africa','Arabic','+01:00','lby.svg'), ('EG','EGY','Egipto','Africa','Arabic','+02:00','egy.svg'), ('MR','MRT','Mauritania','Africa','Arabic','','mrt.svg'), ('NP','NPL','Nepal','Asia','Nepali','+05:45','npl.svg'), ('IN','IND','India','Asia','Hindi','+05:30','ind.svg'), ('TH','THA','Tailandia','Asia','Thai','+07:00','tha.svg'), ('LA','LAO','Laos','Asia','Lao','+07:00','lao.svg'), ('ET','ETH','Etiopía','Africa','Amharic','+03:00','eth.svg'), ('ER','ERI','Eritrea','Africa','Tigrinya','+03:00','eri.svg'), ('KR','KOR','Corea del Sur','Asia','Korean','+09:00','kor.svg'), ('KP','PRK','Corea del Norte','Asia','Korean','+09:00','prk.svg'), ('CN','CHN','China','Asia','Chinese','+08:00','chn.svg'), ('JP','JPN','Japón','Asia','Japanese','+09:00','jpn.svg'), ('MO','MAC','Macao','Asia','Chinese','+08:00','mac.svg'), ('TW','TWN','Taiwán','Asia','Chinese','+08:00','twn.svg'), ('HK','HKG','Hong Kong','Asia','English','+08:00','hkg.svg'), ('NN','NNN','- Sin un país de referencia -','-','-','00:00','-')
;
CREATE TABLE idiomas (
	id VARCHAR(2) NOT NULL UNIQUE,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO idiomas (id, nombre)
VALUES ('aa','Afar'),('ab','Abjasio'),('ae','Avéstico'),('af','Afrikáans'),('ak','Akano'),('am','Amhárico'),('an','Aragonés'),('ar','Árabe'),('as','Asamés'),('av','Ávaro'),('ay','Aimara'),('az','Azerí'),('ba','Baskir'),('be','Bielorruso'),('bg','Búlgaro'),('bh','Bhoyapurí'),('bi','Bislama'),('bm','Bambara'),('bn','Bengalí'),('bo','Tibetano'),('br','Bretón'),('bs','Bosnio'),('ca','Catalán'),('ce','Checheno'),('ch','Chamorro'),('co','Corso'),('cr','Cree'),('cs','Checo'),('cu','Eslavo eclesiástico'),('cv','Chuvasio'),('cy','Galés'),('da','Danés'),('de','Alemán'),('dv','Maldivo'),('dz','Dzongkha'),('ee','Ewé'),('el','Griego'),('en','Inglés'),('eo','Esperanto'),('es','Castellano'),('et','Estonio'),('eu','Euskera'),('fa','Persa'),('ff','Fula'),('fi','Finés'),('fj','Fiyiano'),('fo','Feroés'),('fr','Francés'),('fy','Frisón'),('ga','Gaélico'),('gd','Gaélico escocés'),('gl','Gallego'),('gn','Guaraní'),('gu','Guyaratí'),('gv','Gaélico manés'),('ha','Hausa'),('he','Hebreo'),('hi','Hindi'),('ho','Hiri motu'),('hr','Croata'),('ht','Haitiano'),('hu','Húngaro'),('hy','Armenio'),('hz','Herero'),('ia','Interlingua'),('id','Indonesio'),('ie','Occidental'),('ig','Igbo'),('ii','Yi de Sichuán'),('ik','Iñupiaq'),('io','Ido'),('is','Islandés'),('it','Italiano'),('iu','Inuktitut'),('ja','Japonés'),('jv','Javanés'),('ka','Georgiano'),('kg','Kongo'),('ki','Kikuyu'),('kj','Kuanyama'),('kk','Kazajo'),('kl','Kalaallisut'),('km','Camboyano'),('kn','Canarés'),('ko','Coreano'),('kr','Kanuri'),('ks','Cachemiro'),('ku','Kurdo'),('kv','Komi'),('kw','Córnico'),('ky','Kirguís'),('la','Latín'),('lb','Luxemburgués'),('lg','Luganda'),('li','Limburgués'),('ln','Lingala'),('lo','Lao'),('lt','Lituano'),('lu','Luba-katanga'),('lv','Letón'),('mg','Malgache'),('mh','Marshalés'),('mi','Maorí'),('mk','Macedonio'),('ml','Malayalam'),('mn','Mongol'),('mr','Maratí'),('ms','Malayo'),('mt','Maltés'),('my','Birmano'),('na','Nauruano'),('nb','Noruego bokmål'),('nd','Ndebele del norte'),('ne','Nepalí'),('ng','Ndonga'),('nl','Neerlandés'),('nn','Nynorsk'),('no','Noruego'),('nr','Ndebele del sur'),('nv','Navajo'),('ny','Chichewa'),('oc','Occitano'),('oj','Ojibwa'),('om','Oromo'),('or','Oriya'),('os','Osético'),('pa','Panyabí'),('pi','Pali'),('pl','Polaco'),('ps','Pastú'),('pt','Portugués'),('qu','Quechua'),('rm','Romanche'),('rn','Kirundi'),('ro','Rumano'),('ru','Ruso'),('rw','Ruandés'),('sa','Sánscrito'),('sc','Sardo'),('sd','Sindhi'),('se','Sami septentrional'),('sg','Sango'),('si','Cingalés'),('sk','Eslovaco'),('sl','Esloveno'),('sm','Samoano'),('sn','Shona'),('so','Somalí'),('sq','Albanés'),('sr','Serbio'),('ss','Suazi'),('st','Sesotho'),('su','Sundanés'),('sv','Sueco'),('sw','Suajili'),('ta','Tamil'),('te','Télugu'),('tg','Tayiko'),('th','Tailandés'),('ti','Tigriña'),('tk','Turcomano'),('tl','Tagalo'),('tn','Setsuana'),('to','Tongano'),('tr','Turco'),('ts','Tsonga'),('tt','Tártaro'),('tw','Twi'),('ty','Tahitiano'),('ug','Uigur'),('uk','Ucraniano'),('ur','Urdu'),('uz','Uzbeko'),('ve','Venda'),('vi','Vietnamita'),('vo','Volapük'),('wa','Valón'),('wo','Wolof'),('xh','Xhosa'),('yi','Yídish'),('yo','Yoruba'),('za','Zhuang'),('zh','Chino'),('zu','Zulú')
;
CREATE TABLE roles_iglesia (
	id VARCHAR(3) NOT NULL,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	usuario BOOLEAN NOT NULL,
	personaje BOOLEAN NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO roles_iglesia (id, orden, nombre, usuario, personaje)
VALUES 
('PC', 0, 'Computadora', 0, 0),
('LS', 1, 'Laico soltero', 1, 1),
('LSV', 1, 'Laico soltero', 1, 1),
('LSM', 1, 'Laica soltera', 1, 1),
('LC', 2, 'Laico casado', 1, 1),
('LCV', 2, 'Laico casado', 1, 1),
('LCM', 2, 'Laico casada', 1, 1),
('RC', 3, 'Religioso consagrado', 1, 1),
('RCV', 3, 'Religioso consagrado', 1, 1),
('RCM', 3, 'Religioso consagrado', 1, 1),
('PP', 4, 'Papa', 0, 1),
('PPV', 4, 'Papa', 0, 1)
;

CREATE TABLE procesos_canonizacion (
	id VARCHAR(3) NOT NULL,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO procesos_canonizacion (id, orden, nombre)
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

CREATE TABLE roles_usuario (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
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
VALUES ('M','Mujer', 'a'), ('V','Varón', 'o'), ('O','Otro','o')
;
CREATE TABLE status_registro_usuario (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO status_registro_usuario (id, orden, nombre)
VALUES 
(1, 1, 'Mail a validar'), 
(2, 2, 'Mail validado'), 
(3, 3, 'Datos perennes OK'), 
(4, 4, 'Datos editables OK')
;
CREATE TABLE penalizaciones_motivos (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	duracion SMALLINT UNSIGNED NOT NULL,
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
CREATE TABLE categorias (
	id VARCHAR(3) NOT NULL,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO categorias (id, orden, nombre)
VALUES 
('CFC', 1, 'Centradas en la Fe Católica'), 
('VPC', 2, 'Valores Presentes en la Cultura')
;
CREATE TABLE categorias_sub (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	personaje BOOLEAN DEFAULT 0,
	hecho BOOLEAN DEFAULT 0,
	valor BOOLEAN DEFAULT 0,
	url VARCHAR(20) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO categorias_sub (id, orden, categoria_id, nombre, personaje, hecho, valor, url)
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
CREATE TABLE publicos_sugeridos (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,	
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
CREATE TABLE motivos_para_borrar (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	productos BOOLEAN DEFAULT 0,
	RCLV BOOLEAN DEFAULT 0,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO motivos_para_borrar (nombre, productos, RCLV)
VALUES
('Registro duplicado', 1, 1),
('Sin relación con ninguna Película o Colección', 0, 1),
('Spam dañino, no alineado con nuestro perfil', 1, 1),
('Spam inocuo, no alineado con nuestro perfil', 1, 1)
;
CREATE TABLE meses (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(20) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO meses (nombre)
VALUES ('Enero'), ('Febrero'), ('Marzo'), ('Abril'), ('Mayo'), ('Junio'), ('Julio'), ('Agosto'), ('Septiembre'), ('Octubre'), ('Noviembre'), ('Diciembre');
CREATE TABLE dias_del_ano (
	id SMALLINT UNSIGNED NOT NULL,
	dia TINYINT UNSIGNED NOT NULL,
	mes_id TINYINT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (mes_id) REFERENCES meses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO dias_del_ano (id, dia, mes_id)
VALUES (1, 1, 1), (2, 2, 1), (3, 3, 1), (4, 4, 1), (5, 5, 1), (6, 6, 1), (7, 7, 1), (8, 8, 1), (9, 9, 1), (10, 10, 1), (11, 11, 1), (12, 12, 1), (13, 13, 1), (14, 14, 1), (15, 15, 1), (16, 16, 1), (17, 17, 1), (18, 18, 1), (19, 19, 1), (20, 20, 1), (21, 21, 1), (22, 22, 1), (23, 23, 1), (24, 24, 1), (25, 25, 1), (26, 26, 1), (27, 27, 1), (28, 28, 1), (29, 29, 1), (30, 30, 1), (31, 31, 1), (32, 1, 2), (33, 2, 2), (34, 3, 2), (35, 4, 2), (36, 5, 2), (37, 6, 2), (38, 7, 2), (39, 8, 2), (40, 9, 2), (41, 10, 2), (42, 11, 2), (43, 12, 2), (44, 13, 2), (45, 14, 2), (46, 15, 2), (47, 16, 2), (48, 17, 2), (49, 18, 2), (50, 19, 2), (51, 20, 2), (52, 21, 2), (53, 22, 2), (54, 23, 2), (55, 24, 2), (56, 25, 2), (57, 26, 2), (58, 27, 2), (59, 28, 2), (60, 29, 2), (61, 1, 3), (62, 2, 3), (63, 3, 3), (64, 4, 3), (65, 5, 3), (66, 6, 3), (67, 7, 3), (68, 8, 3), (69, 9, 3), (70, 10, 3), (71, 11, 3), (72, 12, 3), (73, 13, 3), (74, 14, 3), (75, 15, 3), (76, 16, 3), (77, 17, 3), (78, 18, 3), (79, 19, 3), (80, 20, 3), (81, 21, 3), (82, 22, 3), (83, 23, 3), (84, 24, 3), (85, 25, 3), (86, 26, 3), (87, 27, 3), (88, 28, 3), (89, 29, 3), (90, 30, 3), (91, 31, 3), (92, 1, 4), (93, 2, 4), (94, 3, 4), (95, 4, 4), (96, 5, 4), (97, 6, 4), (98, 7, 4), (99, 8, 4), (100, 9, 4), (101, 10, 4), (102, 11, 4), (103, 12, 4), (104, 13, 4), (105, 14, 4), (106, 15, 4), (107, 16, 4), (108, 17, 4), (109, 18, 4), (110, 19, 4), (111, 20, 4), (112, 21, 4), (113, 22, 4), (114, 23, 4), (115, 24, 4), (116, 25, 4), (117, 26, 4), (118, 27, 4), (119, 28, 4), (120, 29, 4), (121, 30, 4), (122, 1, 5), (123, 2, 5), (124, 3, 5), (125, 4, 5), (126, 5, 5), (127, 6, 5), (128, 7, 5), (129, 8, 5), (130, 9, 5), (131, 10, 5), (132, 11, 5), (133, 12, 5), (134, 13, 5), (135, 14, 5), (136, 15, 5), (137, 16, 5), (138, 17, 5), (139, 18, 5), (140, 19, 5), (141, 20, 5), (142, 21, 5), (143, 22, 5), (144, 23, 5), (145, 24, 5), (146, 25, 5), (147, 26, 5), (148, 27, 5), (149, 28, 5), (150, 29, 5), (151, 30, 5), (152, 31, 5), (153, 1, 6), (154, 2, 6), (155, 3, 6), (156, 4, 6), (157, 5, 6), (158, 6, 6), (159, 7, 6), (160, 8, 6), (161, 9, 6), (162, 10, 6), (163, 11, 6), (164, 12, 6), (165, 13, 6), (166, 14, 6), (167, 15, 6), (168, 16, 6), (169, 17, 6), (170, 18, 6), (171, 19, 6), (172, 20, 6), (173, 21, 6), (174, 22, 6), (175, 23, 6), (176, 24, 6), (177, 25, 6), (178, 26, 6), (179, 27, 6), (180, 28, 6), (181, 29, 6), (182, 30, 6), (183, 1, 7), (184, 2, 7), (185, 3, 7), (186, 4, 7), (187, 5, 7), (188, 6, 7), (189, 7, 7), (190, 8, 7), (191, 9, 7), (192, 10, 7), (193, 11, 7), (194, 12, 7), (195, 13, 7), (196, 14, 7), (197, 15, 7), (198, 16, 7), (199, 17, 7), (200, 18, 7), (201, 19, 7), (202, 20, 7), (203, 21, 7), (204, 22, 7), (205, 23, 7), (206, 24, 7), (207, 25, 7), (208, 26, 7), (209, 27, 7), (210, 28, 7), (211, 29, 7), (212, 30, 7), (213, 31, 7), (214, 1, 8), (215, 2, 8), (216, 3, 8), (217, 4, 8), (218, 5, 8), (219, 6, 8), (220, 7, 8), (221, 8, 8), (222, 9, 8), (223, 10, 8), (224, 11, 8), (225, 12, 8), (226, 13, 8), (227, 14, 8), (228, 15, 8), (229, 16, 8), (230, 17, 8), (231, 18, 8), (232, 19, 8), (233, 20, 8), (234, 21, 8), (235, 22, 8), (236, 23, 8), (237, 24, 8), (238, 25, 8), (239, 26, 8), (240, 27, 8), (241, 28, 8), (242, 29, 8), (243, 30, 8), (244, 31, 8), (245, 1, 9), (246, 2, 9), (247, 3, 9), (248, 4, 9), (249, 5, 9), (250, 6, 9), (251, 7, 9), (252, 8, 9), (253, 9, 9), (254, 10, 9), (255, 11, 9), (256, 12, 9), (257, 13, 9), (258, 14, 9), (259, 15, 9), (260, 16, 9), (261, 17, 9), (262, 18, 9), (263, 19, 9), (264, 20, 9), (265, 21, 9), (266, 22, 9), (267, 23, 9), (268, 24, 9), (269, 25, 9), (270, 26, 9), (271, 27, 9), (272, 28, 9), (273, 29, 9), (274, 30, 9), (275, 1, 10), (276, 2, 10), (277, 3, 10), (278, 4, 10), (279, 5, 10), (280, 6, 10), (281, 7, 10), (282, 8, 10), (283, 9, 10), (284, 10, 10), (285, 11, 10), (286, 12, 10), (287, 13, 10), (288, 14, 10), (289, 15, 10), (290, 16, 10), (291, 17, 10), (292, 18, 10), (293, 19, 10), (294, 20, 10), (295, 21, 10), (296, 22, 10), (297, 23, 10), (298, 24, 10), (299, 25, 10), (300, 26, 10), (301, 27, 10), (302, 28, 10), (303, 29, 10), (304, 30, 10), (305, 31, 10), (306, 1, 11), (307, 2, 11), (308, 3, 11), (309, 4, 11), (310, 5, 11), (311, 6, 11), (312, 7, 11), (313, 8, 11), (314, 9, 11), (315, 10, 11), (316, 11, 11), (317, 12, 11), (318, 13, 11), (319, 14, 11), (320, 15, 11), (321, 16, 11), (322, 17, 11), (323, 18, 11), (324, 19, 11), (325, 20, 11), (326, 21, 11), (327, 22, 11), (328, 23, 11), (329, 24, 11), (330, 25, 11), (331, 26, 11), (332, 27, 11), (333, 28, 11), (334, 29, 11), (335, 30, 11), (336, 1, 12), (337, 2, 12), (338, 3, 12), (339, 4, 12), (340, 5, 12), (341, 6, 12), (342, 7, 12), (343, 8, 12), (344, 9, 12), (345, 10, 12), (346, 11, 12), (347, 12, 12), (348, 13, 12), (349, 14, 12), (350, 15, 12), (351, 16, 12), (352, 17, 12), (353, 18, 12), (354, 19, 12), (355, 20, 12), (356, 21, 12), (357, 22, 12), (358, 23, 12), (359, 24, 12), (360, 25, 12), (361, 26, 12), (362, 27, 12), (363, 28, 12), (364, 29, 12), (365, 30, 12), (366, 31, 12);
CREATE TABLE status_registro (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(22) NOT NULL UNIQUE,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO status_registro (id, orden, nombre)
VALUES 
(1, 1, 'Creada'), 
(6, 2, 'Editada'),
(2, 3, 'Aprobada'),
(5, 4, 'Sugerida p/borrar'),
(3, 5, 'Borrada')
;
CREATE TABLE epocas_estreno (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(20) NOT NULL,
	ano_comienzo SMALLINT UNSIGNED NOT NULL,
	ano_fin SMALLINT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO epocas_estreno (id, orden, nombre, ano_comienzo, ano_fin)
VALUES 
(4, 1, '2015 - Presente', 2015, 2025),
(3, 2, '2000 - 2014', 2000, 2014), 
(2, 3, '1970 - 1999', 1970, 1999), 
(1, 4, 'Antes de 1970', 1900, 1969)
;
CREATE TABLE si_no_parcial (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(10) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO si_no_parcial (id, nombre)
VALUES (1, 'SI'), (2, 'Parcial'), (3, 'NO');
CREATE TABLE cal_fe_valores (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	valor TINYINT UNSIGNED NOT NULL,	
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO cal_fe_valores (id, orden, valor, nombre)
VALUES 
(5, 1, 100, 'Mucho'),
(4, 2, 75, 'Sí'),
(3, 3, 50, 'Moderado'),
(2, 4, 25, 'Poco'),
(1, 5, 0, 'No')
;
CREATE TABLE cal_entretiene (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	valor TINYINT UNSIGNED NOT NULL,	
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO cal_entretiene (id, orden, valor, nombre)
VALUES 
(5, 1, 100, 'Mucho'),
(4, 2, 75, 'Sí'),
(3, 3, 50, 'Moderado'),
(2, 4, 25, 'Poco'),
(1, 5, 0, 'No')
;
CREATE TABLE cal_calidad_tecnica (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	valor TINYINT UNSIGNED NOT NULL,	
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO cal_calidad_tecnica (id, orden, valor, nombre)
VALUES 
(3, 1, 100, 'Sin problemas'),
(2, 2, 50, 'Afecta un poco el disfrute'),
(1, 3, 0, 'Complica el disfrute')
;
CREATE TABLE interes_en_prod (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	nombre VARCHAR(50) NOT NULL UNIQUE,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO interes_en_prod (id, orden, nombre)
VALUES 
(3, 1, 'Recordame que quiero verla'),
(2, 2, 'Ya la vi'),
(1, 3, 'Prefiero que no me la recomienden')
;

CREATE TABLE USUARIOS (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	email VARCHAR(100) NOT NULL UNIQUE,
	contrasena VARCHAR(100) NOT NULL,
	nombre VARCHAR(50) NULL,
	apellido VARCHAR(50) NULL,
	apodo VARCHAR(50) NULL,
	avatar VARCHAR(100) DEFAULT '-',
	fecha_nacimiento DATE NULL,
	sexo_id VARCHAR(1) NULL,
	pais_id VARCHAR(2) NULL,
	rol_usuario_id TINYINT UNSIGNED DEFAULT 1,
	rol_iglesia_id VARCHAR(3) NULL,
	autorizado_fa BOOLEAN NULL DEFAULT 0,
	aut_data_entry BOOLEAN DEFAULT 0,

	creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	completado_en DATETIME NULL,
	borrado_motivo_id TINYINT UNSIGNED NULL,
	borrado_motivo_comentario VARCHAR(500) NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,
	
	editado_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (sexo_id) REFERENCES sexos(id),
	FOREIGN KEY (pais_id) REFERENCES paises(id),
	FOREIGN KEY (rol_usuario_id) REFERENCES roles_usuario(id),
	FOREIGN KEY (rol_iglesia_id) REFERENCES roles_iglesia(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro_usuario(id),
	FOREIGN KEY (borrado_motivo_id) REFERENCES motivos_para_borrar(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE us_penalizaciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	usuario_id INT UNSIGNED NOT NULL,
	rol_usuario_id TINYINT UNSIGNED NOT NULL,
	penalizado_por_id INT UNSIGNED NULL,
	penalizacion_id TINYINT UNSIGNED NOT NULL,
	comentario VARCHAR(500) NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (rol_usuario_id) REFERENCES roles_usuario(id),
	FOREIGN KEY (penalizado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (penalizacion_id) REFERENCES penalizaciones_motivos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE us_filtros_personales_cabecera (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	usuario_id INT UNSIGNED NOT NULL,
	palabras_clave VARCHAR(100),
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE us_filtros_personales_campos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	filtro_cabecera_id INT UNSIGNED,
	campo_id VARCHAR(100),
	valor_id SMALLINT UNSIGNED,
	PRIMARY KEY (id),
	FOREIGN KEY (filtro_cabecera_id) REFERENCES us_filtros_personales_cabecera(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE rclv_personajes_historicos (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	nombre VARCHAR(30) NOT NULL UNIQUE,
	proceso_canonizacion_id VARCHAR(3) NULL,
	rol_iglesia_id VARCHAR(3) NULL,
	
	creada_por_id INT UNSIGNED DEFAULT 1,
	creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	analizada_por_id INT UNSIGNED NULL,
	analizada_en DATETIME NULL,
	borrada_motivo_id TINYINT UNSIGNED NULL,
	borrada_motivo_comentario VARCHAR(500) NULL,
	lead_time_creacion SMALLINT UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,
	editada_por_id INT UNSIGNED NULL,
	editada_en DATETIME NULL,
	revisada_por_id INT UNSIGNED NULL,
	revisada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	capturada_por_id INT UNSIGNED NULL,
	capturada_en DATETIME NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES dias_del_ano(id),
	FOREIGN KEY (proceso_canonizacion_id) REFERENCES procesos_canonizacion(id),
	FOREIGN KEY (rol_iglesia_id) REFERENCES roles_iglesia(id),
	FOREIGN KEY (creada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (borrada_motivo_id) REFERENCES motivos_para_borrar(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro(id),	
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (revisada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturada_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE rclv_hechos_historicos (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	nombre VARCHAR(30) NOT NULL UNIQUE,

	creada_por_id INT UNSIGNED DEFAULT 1,
	creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	analizada_por_id INT UNSIGNED NULL,
	analizada_en DATETIME NULL,
	borrada_motivo_id TINYINT UNSIGNED NULL,
	borrada_motivo_comentario VARCHAR(500) NULL,
	lead_time_creacion SMALLINT UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,
	editada_por_id INT UNSIGNED NULL,
	editada_en DATETIME NULL,
	revisada_por_id INT UNSIGNED NULL,
	revisada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	capturada_por_id INT UNSIGNED NULL,
	capturada_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES dias_del_ano(id),
	FOREIGN KEY (creada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (borrada_motivo_id) REFERENCES motivos_para_borrar(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro(id),	
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (revisada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturada_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE rclv_valores (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(30) NOT NULL UNIQUE,

	status_registro_id TINYINT UNSIGNED DEFAULT 1,
	creada_por_id INT UNSIGNED DEFAULT 1,
	creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	editada_por_id INT UNSIGNED NULL,
	editada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	revisada_por_id INT UNSIGNED NULL,
	revisada_en DATETIME NULL,
	borrada_motivo_id TINYINT UNSIGNED NULL,
	borrada_motivo_comentario VARCHAR(500) NULL,
	capturada_por_id INT UNSIGNED NULL,
	capturada_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro(id),	
	FOREIGN KEY (creada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (borrada_motivo_id) REFERENCES motivos_para_borrar(id),
	FOREIGN KEY (revisada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturada_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE PROD_peliculas (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	TMDB_id VARCHAR(10) NULL UNIQUE,
	FA_id VARCHAR(10) NULL UNIQUE,
	IMDB_id VARCHAR(10) NULL UNIQUE,
	fuente VARCHAR(5) NOT NULL,
	nombre_original VARCHAR(50) NOT NULL,
	nombre_castellano VARCHAR(50) NOT NULL,
	duracion SMALLINT UNSIGNED NOT NULL,
	ano_estreno SMALLINT UNSIGNED NOT NULL,
	idioma_original_id VARCHAR(2) NOT NULL,
	direccion VARCHAR(100) NOT NULL,
	guion VARCHAR(100) NOT NULL,
	musica VARCHAR(100) NOT NULL,
	actuacion VARCHAR(500) NOT NULL,
	produccion VARCHAR(100) NOT NULL,
	sinopsis VARCHAR(800) NOT NULL,
	avatar VARCHAR(100) NOT NULL,
	en_castellano_id TINYINT UNSIGNED NOT NULL,
	en_color_id TINYINT UNSIGNED NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	subcategoria_id TINYINT UNSIGNED NOT NULL,
	publico_sugerido_id TINYINT UNSIGNED NOT NULL,
	personaje_historico_id SMALLINT UNSIGNED NULL,
	hecho_historico_id SMALLINT UNSIGNED NULL,
	valor_id SMALLINT UNSIGNED NULL,
	link_trailer VARCHAR(200) NULL,
	link_pelicula VARCHAR(200) NULL,
	fe_valores TINYINT UNSIGNED NOT NULL,
	entretiene TINYINT UNSIGNED NOT NULL,
	calidad_tecnica TINYINT UNSIGNED NOT NULL,
	calificacion TINYINT UNSIGNED NOT NULL,

	creada_por_id INT UNSIGNED NOT NULL,
	creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	analizada_por_id INT UNSIGNED NULL,
	analizada_en DATETIME NULL,
	borrada_motivo_id TINYINT UNSIGNED NULL,
	borrada_motivo_comentario VARCHAR(500) NULL,
	lead_time_creacion SMALLINT UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editada_por_id INT UNSIGNED NULL,
	editada_en DATETIME NULL,
	revisada_por_id INT UNSIGNED NULL,
	revisada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	
	capturada_por_id INT UNSIGNED NULL,
	capturada_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES publicos_sugeridos(id),
	FOREIGN KEY (en_castellano_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (idioma_original_id) REFERENCES idiomas(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES categorias_sub(id),
	FOREIGN KEY (personaje_historico_id) REFERENCES rclv_personajes_historicos(id),
	FOREIGN KEY (hecho_historico_id) REFERENCES rclv_hechos_historicos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_valores(id),
	FOREIGN KEY (creada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (borrada_motivo_id) REFERENCES motivos_para_borrar(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro(id),	
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (revisada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturada_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE PROD_colecciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	TMDB_id VARCHAR(10) NULL UNIQUE,
	FA_id VARCHAR(10) NULL UNIQUE,
	entidad_TMDB VARCHAR(10) NULL,
	fuente VARCHAR(5) NOT NULL,
	nombre_original VARCHAR(100) NOT NULL,
	nombre_castellano VARCHAR(100) NOT NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
	ano_fin SMALLINT UNSIGNED NULL,
	idioma_original_id VARCHAR(2) NOT NULL,
	cant_temporadas TINYINT UNSIGNED NULL,
	cant_capitulos SMALLINT UNSIGNED NULL,
	direccion VARCHAR(100) NOT NULL,
	guion VARCHAR(100) NOT NULL,
	musica VARCHAR(100) NOT NULL,
	actuacion VARCHAR(500) NOT NULL,
	produccion VARCHAR(50) NULL,
	sinopsis VARCHAR(800) NOT NULL,
	avatar VARCHAR(100) NULL,
	en_castellano_id TINYINT UNSIGNED NOT NULL,
	en_color_id TINYINT UNSIGNED NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	subcategoria_id TINYINT UNSIGNED NOT NULL,
	publico_sugerido_id TINYINT UNSIGNED NOT NULL,
	personaje_historico_id SMALLINT UNSIGNED NULL,
	hecho_historico_id SMALLINT UNSIGNED NULL,
	valor_id SMALLINT UNSIGNED NULL,
	link_trailer VARCHAR(200) NULL,
	link_pelicula VARCHAR(200) NULL,
	fe_valores TINYINT UNSIGNED NOT NULL,
	entretiene TINYINT UNSIGNED NOT NULL,
	calidad_tecnica TINYINT UNSIGNED NOT NULL,
	calificacion TINYINT UNSIGNED NOT NULL,

	creada_por_id INT UNSIGNED NOT NULL,
	creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	analizada_por_id INT UNSIGNED NULL,
	analizada_en DATETIME NULL,
	borrada_motivo_id TINYINT UNSIGNED NULL,
	borrada_motivo_comentario VARCHAR(500) NULL,
	lead_time_creacion SMALLINT UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editada_por_id INT UNSIGNED NULL,
	editada_en DATETIME NULL,
	revisada_por_id INT UNSIGNED NULL,
	revisada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	
	capturada_por_id INT UNSIGNED NULL,
	capturada_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES publicos_sugeridos(id),
	FOREIGN KEY (en_castellano_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES categorias_sub(id),
	FOREIGN KEY (personaje_historico_id) REFERENCES rclv_personajes_historicos(id),
	FOREIGN KEY (hecho_historico_id) REFERENCES rclv_hechos_historicos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_valores(id),
	FOREIGN KEY (creada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (borrada_motivo_id) REFERENCES motivos_para_borrar(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro(id),	
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (revisada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturada_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE PROD_capitulos (
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
	duracion TINYINT UNSIGNED NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
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
	personaje_historico_id SMALLINT UNSIGNED NULL,
	hecho_historico_id SMALLINT UNSIGNED NULL,
	valor_id SMALLINT UNSIGNED NULL,
	link_trailer VARCHAR(200) NULL,
	link_pelicula VARCHAR(200) NULL,
	fe_valores TINYINT UNSIGNED NULL,
	entretiene TINYINT UNSIGNED NULL,
	calidad_tecnica TINYINT UNSIGNED NULL,
	calificacion TINYINT UNSIGNED NULL,

	creada_por_id INT UNSIGNED NOT NULL,
	creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	analizada_por_id INT UNSIGNED NULL,
	analizada_en DATETIME NULL,
	borrada_motivo_id TINYINT UNSIGNED NULL,
	borrada_motivo_comentario VARCHAR(500) NULL,
	lead_time_creacion SMALLINT UNSIGNED NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,

	editada_por_id INT UNSIGNED NULL,
	editada_en DATETIME NULL,
	revisada_por_id INT UNSIGNED NULL,
	revisada_en DATETIME NULL,
	lead_time_edicion SMALLINT UNSIGNED NULL,
	
	capturada_por_id INT UNSIGNED NULL,
	capturada_en DATETIME NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_id) REFERENCES PROD_colecciones(id),
	FOREIGN KEY (en_castellano_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (idioma_original_id) REFERENCES idiomas(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES categorias_sub(id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES publicos_sugeridos(id),
	FOREIGN KEY (personaje_historico_id) REFERENCES rclv_personajes_historicos(id),
	FOREIGN KEY (hecho_historico_id) REFERENCES rclv_hechos_historicos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_valores(id),
	FOREIGN KEY (creada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (borrada_motivo_id) REFERENCES motivos_para_borrar(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro(id),	
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (revisada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturada_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pr_us_calificaciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NULL,
	coleccion_id INT UNSIGNED NULL,
	capitulo_id INT UNSIGNED NULL,
	fe_valores_id TINYINT UNSIGNED NOT NULL,
	entretiene_id TINYINT UNSIGNED NOT NULL,
	calidad_tecnica_id TINYINT UNSIGNED NOT NULL,
	fe_valores_valor TINYINT UNSIGNED NOT NULL,
	entretiene_valor TINYINT UNSIGNED NOT NULL,
	calidad_tecnica_valor TINYINT UNSIGNED NOT NULL,
	resultado TINYINT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES PROD_peliculas(id),
	FOREIGN KEY (coleccion_id) REFERENCES PROD_colecciones(id),
	FOREIGN KEY (capitulo_id) REFERENCES PROD_capitulos(id),
	FOREIGN KEY (fe_valores_id) REFERENCES cal_fe_valores(id),
	FOREIGN KEY (entretiene_id) REFERENCES cal_entretiene(id),
	FOREIGN KEY (calidad_tecnica_id) REFERENCES cal_calidad_tecnica(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE pr_us_interes_en_prod (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NULL,
	coleccion_id INT UNSIGNED NULL,
	capitulo_id INT UNSIGNED NULL,
	interes_en_prod_id TINYINT UNSIGNED NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES PROD_peliculas(id),
	FOREIGN KEY (coleccion_id) REFERENCES PROD_colecciones(id),
	FOREIGN KEY (capitulo_id) REFERENCES PROD_capitulos(id),
	FOREIGN KEY (interes_en_prod_id) REFERENCES interes_en_prod(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE pr_relacion_pais_prod (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	pais_id VARCHAR(2) NOT NULL,
	pelicula_id INT UNSIGNED NULL,
	coleccion_id INT UNSIGNED NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (pais_id) REFERENCES paises(id),
	FOREIGN KEY (pelicula_id) REFERENCES PROD_peliculas(id),
	FOREIGN KEY (coleccion_id) REFERENCES PROD_colecciones(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO USUARIOS (id, email, contrasena, status_registro_id, rol_usuario_id, autorizado_fa, nombre, apellido, apodo, avatar, fecha_nacimiento, sexo_id, pais_id, rol_iglesia_id, creado_en, completado_en)
VALUES 
(1, 'sinMail1', 'sinContraseña', 4, 4, 1, 'Startup', '', 'Startup', '', '2000-01-01', 'O', 'AR', 'PC', '2000-01-01', '2000-01-01'),
(2, 'sinMail2', 'sinContraseña', 4, 4, 1, 'Automatizado', '', 'Automatizado', '', '2000-01-01', 'O', 'AR', 'PC', '2000-01-01', '2000-01-01'),
(10, 'diegoiribarren2015@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 4, 2, 1, 'Diego', 'Iribarren', 'Diego', '1617370359746.jpg', '1969-08-16', 'V', 'AR', 'LC', '2021-03-26', '2021-03-26'),
(11, 'diegoiribarren2021@gmail.com', '$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm', 4, 4, 1, 'Diego', 'Iribarren', 'Diego', '1632959816163.jpg', '1969-08-16', 'V', 'AR', 'LC', '2021-03-26', '2021-03-26')
;

INSERT INTO rclv_personajes_historicos (id, nombre )
VALUES 
(2, 'Jesús'),
(3, 'María, madre de Jesús')
;
INSERT INTO rclv_personajes_historicos (id, nombre, dia_del_ano_id, proceso_canonizacion_id, rol_iglesia_id)
VALUES 
(10, 'José, padre de Jesús', 79, 'STV', 'LCV'),
(11, 'Juan Pablo II', 296, 'STV', 'PPV')
;
INSERT INTO rclv_hechos_historicos (id, dia_del_ano_id, nombre)
VALUES 
(2, 100, 'Sem. Santa - 1. General'),
(3, 105, 'Sem. Santa - 2. Viernes Santo'),
(4, 107, 'Sem. Santa - 3. Resurrección'),
(5, 150, 'Pentecostés'),
(6, 210, 'Guerra Mundial - 1a'),
(7, 245, 'Guerra Mundial - 2a')
;

INSERT INTO rclv_valores (id, nombre)
VALUES 
(1, 'Ninguno del listado'),
(10, 'Valores en el deporte'),
(11, 'Perseverancia'),
(12, 'Pacificar un país dividido'),
(13, 'Pasión por ayudar'),
(14, 'Superación personal')
;