DELETE FROM c19353_elc.cam_hist_status WHERE sugeridoPor_id=2;
ALTER TABLE c19353_elc.cam_hist_status CHANGE sugeridoPor_id statusOrigPor_id int(10) unsigned NOT NULL;
ALTER TABLE c19353_elc.cam_hist_status CHANGE revisadoPor_id statusFinalPor_id int(10) unsigned NOT NULL;
ALTER TABLE c19353_elc.cam_hist_status CHANGE statusOriginal_id statusOrig_id tinyint(3) unsigned NOT NULL;
ALTER TABLE c19353_elc.cam_hist_status CHANGE sugeridoEn statusOrigEn datetime NOT NULL;
ALTER TABLE c19353_elc.cam_hist_status CHANGE revisadoEn statusFinalEn datetime NOT NULL;
ALTER TABLE c19353_elc.cam_hist_status MODIFY COLUMN statusFinalEn datetime DEFAULT utc_date() NOT NULL;
