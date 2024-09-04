ALTER TABLE c19353_elc.aux_logins_acums CHANGE cantLogins usLogueado smallint(5) unsigned DEFAULT 0 NOT NULL;

UPDATE c19353_elc.usuarios SET visita_id=concat('U000000000',id) where id<10;
UPDATE c19353_elc.usuarios SET visita_id=concat('U00000000',id) where id>10;

