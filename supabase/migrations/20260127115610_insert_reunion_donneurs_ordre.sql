/*
  # Insert donneurs d'ordre de La Réunion
  
  1. Data Insertion
    - Insert 50+ donneurs d'ordre from the provided list
    - Each with their markets_url, special_notes, and display_order
    - Department set to '974' (La Réunion)
  
  2. Order
    - Maintains the order from the original list
    - Can be reordered later by updating display_order
*/

-- Insert all donneurs d'ordre from the list
INSERT INTO manual_markets_donneurs_ordre (name, markets_url, special_notes, display_order, department, is_active) VALUES
  ('Région Réunion', 'https://marches-publics.regionreunion.com/?page=Entreprise.EntrepriseAdvancedSearch&AllCons', NULL, 1, '974', true),
  ('Département de La Réunion', NULL, NULL, 2, '974', true),
  ('CINOR', 'https://marches.cinor.fr/?page=Entreprise.EntrepriseAdvancedSearch&AllCons', NULL, 3, '974', true),
  ('TCO', 'https://www.marches-securises.fr/entreprise/?module=liste_consultations&presta=%3Bservices%3Btravaux%3Bfournitures%3Bautres&r=tco&date_cloture=21-01-2026&date_cloture_type=1&liste_dept=974&', 'faire une recherche sur TCO et avec la date de cloture apres la date du jour', 4, '974', true),
  ('CIREST', 'https://www.marches-securises.fr/entreprise/?module=liste_consultations&presta=%3Bservices%3Btravaux%3Bfournitures%3Bautres&r=cirest&date_cloture=21-01-2026&date_cloture_type=1&', 'idem TCO', 5, '974', true),
  ('CIVIS', 'https://www.civis.re/index.php/projets/marches-publics-appels-d-offres', NULL, 6, '974', true),
  ('CASUD', 'https://casud.achatpublic.com/sdm/ent2/gen/accueil.action?selectedMenu=prospect&tp=1768980284780', '??', 7, '974', true),
  ('Saint-Denis', 'https://www.saintdenis.re/marchespublics', NULL, 8, '974', true),
  ('Sainte-Suzanne', 'https://ville-saintesuzanne.re/type-de-document/decisions-marches-publics/', '??', 9, '974', true),
  ('Saint-André', 'https://villesaintandre.e-marchespublics.com/pack/recherche_d_appels_d_offres_marches_publics_1_aapc_________1.html', NULL, 10, '974', true),
  ('Saint-Benoît', 'https://www.saint-benoit.re/page/16-marche-publics', NULL, 11, '974', true),
  ('Sainte-Rose', 'https://sainterose.re/fr/pm/1772123/marches-publics-799', '??', 12, '974', true),
  ('Saint-Paul', 'https://www.mairie-saintpaul.re/marches-publics/', NULL, 13, '974', true),
  ('La Possession', 'https://www.lapossession.re/page/marches-publics', NULL, 14, '974', true),
  ('Trois-Bassins', 'https://trois-bassins.re/marche-public/', '??', 15, '974', true),
  ('Les Avirons', 'https://www.marches-securises.fr/entreprise/?module=liste_consultations&presta=%3Bservices%3Btravaux%3Bfournitures%3Bautres&r=les+avirons&date_cloture=22-01-2026&date_cloture_type=1&liste_dept=974&', NULL, 16, '974', true),
  ('Le Tampon', 'https://agysoft.marches-publics.info/accueil.htm', 'faire recherche région réunion 974 / Ville: Le tampon', 17, '974', true),
  ('Saint-Pierre', 'https://www.marches-publics.info/accueil.htm', 'faire recherche, tout type d''offre, region réunion 974, mot clé : saint pierre', 18, '974', true),
  ('Saint-Louis', 'https://saintlouis.re/municipalite/2598-commande-publique', NULL, 19, '974', true),
  ('Petite-Île', 'https://www.petite-ile.re/mes-services/marches-publics', NULL, 20, '974', true),
  ('Saint-Joseph', 'https://ville-saintjoseph.e-marchespublics.com/pack/recherche_d_appels_d_offres_marches_publics_1_aapc_________1.html', NULL, 21, '974', true),
  ('Saint-Philippe', 'https://saintphilippe.e-marchespublics.com/pack/recherche_d_appels_d_offres_marches_publics_1_aapc_________1.html', NULL, 22, '974', true),
  ('L''Étang-Salé', 'https://www.letangsale.fr/mes-acces-rapides/mes-services/les-marches-publics', NULL, 23, '974', true),
  ('Cilaos', 'https://www.e-marchespublics.com/appel-offre/outre-mer/la-reunion/cilaos', NULL, 24, '974', true),
  ('L''Entre-Deux', 'https://www.entredeux.re/marches-publics', '??', 25, '974', true),
  ('La Plaine-des-Palmistes', 'https://www.e-marchespublics.com/appel-offre/outre-mer/la-reunion/plaine-des-palmistes', NULL, 26, '974', true),
  ('SPLAR', 'https://www.splar.re/espace-pro/nos-appels-d-offres', 'voir avis de marché et non attribution', 27, '974', true),
  ('SEMADER', 'https://semader.achatpublic.com/sdm/ent2/gen/accueil.action?selectedMenu=prospect&tm=1754568318725', NULL, 28, '974', true),
  ('SEDRE', 'https://www.sedre.fr/appels-doffres/', NULL, 29, '974', true),
  ('SDIS 974', 'http://www.sdis974.re/navigation-haut/marches-publics.html', '??', 30, '974', true),
  ('Police nationale – La Réunion', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 31, '974', true),
  ('CHU de La Réunion', 'http://achats.chu-reunion.fr/avis/index.cfm?fuseaction=pub.affResultats', NULL, 32, '974', true),
  ('Préfecture de La Réunion', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 33, '974', true),
  ('DEAL', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 34, '974', true),
  ('ARS Réunion', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 35, '974', true),
  ('DAAF', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 36, '974', true),
  ('Rectorat / Éducation nationale', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 37, '974', true),
  ('CAF La Réunion', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 38, '974', true),
  ('CPAM La Réunion', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 39, '974', true),
  ('France Travail Réunion', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 40, '974', true),
  ('CCI Réunion', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 41, '974', true),
  ('CMA Réunion', 'https://www.artisanat974.re/marche-public/', '??', 42, '974', true),
  ('Ministère de la justice', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 43, '974', true),
  ('Ministères sociaux', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 44, '974', true),
  ('Ministère de l''intérieur', 'https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=r%C3%A9union&categorie=0&localisations=RE', 'PLACE', 45, '974', true),
  ('Divers - AchatPublic', 'https://www.achatpublic.com/sdm/ent2/gen/rechercheCsl.action', NULL, 46, '974', true),
  ('Divers - Linfo.re', 'https://legales.linfo.re/consultation-marche.html', NULL, 47, '974', true)
ON CONFLICT (name) DO UPDATE SET
  markets_url = EXCLUDED.markets_url,
  special_notes = EXCLUDED.special_notes,
  display_order = EXCLUDED.display_order,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active,
  updated_at = now();