CREATE TABLE `aktivity` (
  `id` int(11) NOT NULL,
  `nazov` varchar(100) NOT NULL,
  `den` enum('streda','stvrtok','piatok') NOT NULL,
  `kapacita` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `aktivity` (`id`, `nazov`, `den`, `kapacita`) VALUES
(1, 'Chvalospevka', 'streda', 10),
(2, 'Chvalospevka', 'stvrtok', 10),
(3, 'Chvalospevka', 'piatok', 10),
(4, 'Biblický seminár', 'streda', 10),
(5, 'Biblický seminár', 'stvrtok', 10),
(6, 'Biblický seminár', 'piatok', 10),
(7, 'Umelecký ateliér', 'streda', 10),
(8, 'Umelecký ateliér', 'stvrtok', 10),
(9, 'Športy', 'streda', 10),
(10, 'Športy', 'stvrtok', 10),
(11, 'Športy', 'piatok', 10),
(12, 'Dráma', 'piatok', 10),
(13, 'Choreografia', 'stvrtok', 10);

CREATE TABLE `alergie` (
  `id` int(11) NOT NULL,
  `nazov` varchar(255) NOT NULL,
  `popis` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `alergie` (`id`, `nazov`, `popis`) VALUES
(1, 'Lepok', 'Pšenica, raž, jačmeň, ovos, špalda, kamut alebo ich hybridné odrody.'),
(2, 'Vajcia', 'Alergia na vajcia a výrobky z nich.'),
(3, 'Ryby', 'Ryby a výrobky z nich.'),
(4, 'Arašidy', 'Alergia na arašidy a výrobky z nich.'),
(5, 'Sójové zrná', 'Sójové produkty vrátane sójového mlieka a tofu.'),
(6, 'Mlieko', 'Alergia na mlieko, mliečne bielkoviny, mliečne výrobky.'),
(7, 'Orechy', 'Mandle, lieskové orechy, vlašské orechy, kešu, pekanové orechy, para orechy, pistácie, makadamové orechy.'),
(8, 'Horčica', 'Horčica a výrobky z nej.'),
(9, 'Sezamové semienka', 'Alergia na sezam a výrobky z neho.'),
(10, 'Histamín', 'Obmedzenie potravín s vysokým obsahom histamínu.'),
(11, 'Citrusy', 'Alergia na citrusové ovocie, ako sú pomaranče, citróny, limetky.'),
(12, 'Penicilín', 'Alergia na antibiotikum penicilín.');

CREATE TABLE `dostupne_ubytovanie` (
`id` int(11)
,`izba` varchar(50)
,`kapacita` int(11)
,`typ` enum('muz','zena','veduci','spolocne')
,`obsadene` bigint(21)
);

CREATE TABLE `mladez` (
  `id` int(11) NOT NULL,
  `nazov` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `mladez` (`id`, `nazov`) VALUES
(3, 'Bratislava Palisády'),
(5, 'Košice'),
(4, 'Lučenec'),
(1, 'SHIFT Komárno'),
(2, 'Teen-Z-One Viera');

CREATE TABLE `os_udaje` (
  `id` int(11) NOT NULL,
  `meno` varchar(50) NOT NULL,
  `priezvisko` varchar(50) NOT NULL,
  `datum_narodenia` date NOT NULL,
  `pohlavie` enum('M','F') NOT NULL,
  `mladez` varchar(100) DEFAULT NULL,
  `poznamka` text,
  `mail` varchar(100) NOT NULL,
  `novy` tinyint(1) DEFAULT '1',
  `ucastnik` enum('taborujuci','veduci','host') DEFAULT 'taborujuci',
  `GDPR` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `os_udaje_aktivity` (
  `os_udaje_id` int(11) NOT NULL DEFAULT '0',
  `aktivita_id` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `os_udaje_alergie` (
  `os_udaje_id` int(11) NOT NULL DEFAULT '0',
  `alergie_id` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `os_udaje_ubytovanie` (
  `os_udaje_id` int(11) NOT NULL DEFAULT '0',
  `ubytovanie_id` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ubytovanie` (
  `id` int(11) NOT NULL,
  `izba` varchar(50) NOT NULL,
  `kapacita` int(11) NOT NULL,
  `typ` enum('muz','zena','veduci','spolocne') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `ubytovanie` (`id`, `izba`, `kapacita`, `typ`) VALUES
(1, 'Chata', 15, 'muz'),
(2, 'Chata', 15, 'zena'),
(3, 'Špeciálna izba', 6, 'zena'),
(4, 'Kancelária', 2, 'veduci'),
(5, 'Stan/Hamak', 35, 'spolocne');

DROP TABLE IF EXISTS `dostupne_ubytovanie`;

CREATE ALGORITHM=UNDEFINED DEFINER=`db1846`@`%` SQL SECURITY DEFINER VIEW `dostupne_ubytovanie`  AS SELECT `u`.`id` AS `id`, `u`.`izba` AS `izba`, `u`.`kapacita` AS `kapacita`, `u`.`typ` AS `typ`, (select count(0) from `os_udaje_ubytovanie` where (`os_udaje_ubytovanie`.`ubytovanie_id` = `u`.`id`)) AS `obsadene` FROM `ubytovanie` AS `u` HAVING (`obsadene` < `kapacita`) ;

ALTER TABLE `aktivity`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `alergie`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `mladez`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nazov` (`nazov`);

ALTER TABLE `os_udaje`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mail` (`mail`);

ALTER TABLE `os_udaje_aktivity`
  ADD PRIMARY KEY (`os_udaje_id`,`aktivita_id`),
  ADD KEY `aktivita_id` (`aktivita_id`);

ALTER TABLE `os_udaje_alergie`
  ADD PRIMARY KEY (`os_udaje_id`,`alergie_id`),
  ADD KEY `alergie_id` (`alergie_id`);

ALTER TABLE `os_udaje_ubytovanie`
  ADD PRIMARY KEY (`os_udaje_id`,`ubytovanie_id`),
  ADD KEY `ubytovanie_id` (`ubytovanie_id`);

ALTER TABLE `ubytovanie`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `aktivity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

ALTER TABLE `alergie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

ALTER TABLE `mladez`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `os_udaje`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `ubytovanie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `os_udaje_aktivity`
  ADD CONSTRAINT `os_udaje_aktivity_ibfk_1` FOREIGN KEY (`os_udaje_id`) REFERENCES `os_udaje` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `os_udaje_aktivity_ibfk_2` FOREIGN KEY (`aktivita_id`) REFERENCES `aktivity` (`id`) ON DELETE CASCADE;

ALTER TABLE `os_udaje_alergie`
  ADD CONSTRAINT `os_udaje_alergie_ibfk_1` FOREIGN KEY (`os_udaje_id`) REFERENCES `os_udaje` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `os_udaje_alergie_ibfk_2` FOREIGN KEY (`alergie_id`) REFERENCES `alergie` (`id`) ON DELETE CASCADE;

ALTER TABLE `os_udaje_ubytovanie`
  ADD CONSTRAINT `os_udaje_ubytovanie_ibfk_1` FOREIGN KEY (`os_udaje_id`) REFERENCES `os_udaje` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `os_udaje_ubytovanie_ibfk_2` FOREIGN KEY (`ubytovanie_id`) REFERENCES `ubytovanie` (`id`) ON DELETE CASCADE;
COMMIT;
