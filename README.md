# SailingLoc - Digital School Project

**DEV DSP4 – Groupe 3 – 2026**

**Avertissement Légal :** Ce document et le site internet qui en découle s'inscrivent strictement dans le cadre d'un projet étudiant académique et fictif. L'entreprise « SailingLoc » n'a aucune existence légale ou commerciale. Par conséquent, la plateforme présentée est une démonstration technique sur laquelle aucun achat réel ni aucune réservation véritable ne sauraient être effectués.

---

## 🇫🇷 Français | 🇬🇧 English

### How to use this project

**EN**: To use this project locally you must make sure to do the following :

- Install NPM packages/dependencies : `npm install`
- If no .supabase folder at the project root : `npx supabase init`
- Login into supabase : `npx supabase login`
- Link to supabase database : `npx supabase link --project-ref "PROJECT_ID_HERE"`
- Make sure remote DB is not ahead of local DB : `npx supabase db pull`
- Start the local supabase database : `npx supabase start`
- Get local supabase information to update .env file : `npx supabase status`
- Regenerate the typescript types : `npx supabase gen types typescript --local --schema public > src/lib/supabase/database.types.ts`
- Load the listing photography into Storage : `npm run seed:media`

**FR**: Pour utiliser ce projet en local, vous devez vous assurer de faire les étapes suivantes :

- Installer les packages/dépendances NPM : `npm install`
- Si pas de dossier .supabase à la racine du projet : `npx supabase init`
- Se connecter à supabase : `npx supabase login`
- Lier à la base de données supabase : `npx supabase link --project-ref "PROJECT_ID_HERE"`
- Assurez-vous que la DB distante n'est pas en avance sur la DB locale : `npx supabase db pull`
- Démarrer la base de données supabase locale : `npx supabase start`
- Obtenir les informations supabase locales pour mettre à jour le fichier .env : `npx supabase status`
- Régénérer les types typescript : `npx supabase gen types typescript --local --schema public > src/lib/supabase/database.types.ts`
- Charger les photos des annonces dans le Storage : `npm run seed:media`

### Local seed data & demo accounts / Données de test et comptes de démo

**EN**: Running `npx supabase db reset` applies every migration and then loads the modular fixtures in `supabase/seeds/` (`01_reference_ports` → `08_demo_admin`, run alphabetically). The seeds are idempotent and use relative dates, so the dataset stays valid over time.

Listing photography is the one fixture SQL cannot carry, because the image bytes have to reach the `boat-images` Storage bucket. Run `npm run seed:media` after the reset to upload the photos and write the matching `boat_media` rows — it is idempotent, and until it runs listings simply show a neutral placeholder.

All demo accounts share the local-only password **`Sailing2026!`**:

- `jean.voisin@sailingloc.com` — Administrator
- `marc.thevenot@example.com`, `sophie.laurent@example.com` — Owners
- `lea.bernard@example.com`, `lucas.martin@example.com` — Renters
- `thomas.petit@example.com` — Visitor

**FR**: La commande `npx supabase db reset` applique toutes les migrations puis charge les fixtures modulaires de `supabase/seeds/` (`01_reference_ports` → `08_demo_admin`, exécutées par ordre alphabétique). Les seeds sont idempotents et utilisent des dates relatives, afin de rester valides dans le temps.

Les photos des annonces sont la seule fixture que le SQL ne peut pas charger, car les fichiers doivent être déposés dans le bucket Storage `boat-images`. Lancez `npm run seed:media` après le reset pour les téléverser et créer les lignes `boat_media` correspondantes — la commande est idempotente, et tant qu'elle n'a pas été lancée les annonces affichent simplement un bloc neutre.

Tous les comptes de démonstration partagent le mot de passe **`Sailing2026!`** (usage local uniquement) :

- `jean.voisin@sailingloc.com` — Administrateur
- `marc.thevenot@example.com`, `sophie.laurent@example.com` — Propriétaires
- `lea.bernard@example.com`, `lucas.martin@example.com` — Locataires
- `thomas.petit@example.com` — Visiteur



### About the Project / À propos du projet

**EN**: SailingLoc is a peer-to-peer boat rental platform connecting private boat owners with individuals looking to rent sailboats and motorboats. This project is developed as part of the Digital School Project (DEV DSP4) and represents a complete digital solution including visual identity, website development, and comprehensive technical documentation.

**FR**: SailingLoc est une plateforme de location de bateaux entre particuliers, mettant en relation des propriétaires de bateaux privés avec des personnes souhaitant louer des voiliers et des bateaux à moteur. Ce projet est développé dans le cadre du Digital School Project (DEV DSP4) et représente une solution digitale complète incluant l'identité visuelle, le développement du site web et une documentation technique exhaustive.

---



## 📚 Documentation



### Project Understanding Questionnaire / Questionnaire de compréhension du projet

- **🇬🇧 English Version**: [documentation/en/DEV DSP4 – G3.md](documentation/en/DEV%20DSP4%20–%20G3.md)
- **🇫🇷 Version Française**: [documentation/fr/DEV DSP4 – G3.md](documentation/fr/DEV%20DSP4%20–%20G3.md)

---



## 👥 Team / Équipe

**Project Manager / Chef de projet**: Pierre GERVAIS

**Team Members / Membres de l'équipe**:

- Pierre GERVAIS (MerciMister)
- Eduardo GAGLIARDI (MerciMister)
- Lucas Dias (Heaven Agency)

---



## 🛠️ Technology Stack / Stack Technique

- **Framework**: TBD...
- **Frontend**: TBD...
- **Backend**: TBD...
- **Version Control**: Git, GitHub
- **Project Management**: Trello

---



## 🔗 Resources / Ressources

- **GitHub Repository**: [https://github.com/ExtraPerry/Digital-School-Project-DEV-DSP4-G3-2026](https://github.com/ExtraPerry/Digital-School-Project-DEV-DSP4-G3-2026)
- **Trello Board**: [https://trello.com/b/5vAWFSDO/digital-school-project-dev-dsp4-g3-2026](https://trello.com/b/5vAWFSDO/digital-school-project-dev-dsp4-g3-2026)

---



## 🎯 Project Objectives / Objectifs du projet

**EN**:

- Develop a complete peer-to-peer boat rental platform
- Create a responsive and secure website
- Implement a sustainable business model (10% commission per transaction)
- Design visual identity and user experience
- Provide comprehensive bilingual technical documentation
- Prepare for future mobile application development

**FR**:

- Développer une plateforme complète de location de bateaux entre particuliers
- Créer un site web responsive et sécurisé
- Mettre en place un modèle économique pérenne (10% de commission par transaction)
- Concevoir l'identité visuelle et l'expérience utilisateur
- Fournir une documentation technique bilingue complète
- Préparer le développement futur d'une application mobile

---



## 📌 Client Information / Informations Client

**Client**: Mr. Voisin  
**Company / Société**: SailingLoc  
**Business Model / Modèle d'affaires**: 

- 10% commission on each transaction / 10% de commission sur chaque transaction
- Advertising revenue / Revenus publicitaires
- Partnerships (insurance, specialized stores) / Partenariats (assurances, magasins spécialisés)
- Data monetization / Monétisation des données

---



## 🌍 Target Market / Marché Cible

**Geographic Zones / Zones Géographiques**:

- **France Mediterranean**: Marseille, Hyères, Antibes, Saint-Tropez, Corsica
- **France Atlantic**: La Rochelle, La Trinité-sur-Mer, Le Crouesty
- **Southern Europe**: Balearic Islands, Croatia, Greece, Italy

**Target Audience / Public Cible**:

- Nautical vacationers (25-45 years) / Vacanciers nautiques (25-45 ans)
- Passionate non-owners (30-55 years) / Passionnés non-propriétaires (30-55 ans)
- Boat owners / Propriétaires de bateaux
- B2B partners / Partenaires B2B

---



## 🏆 Main Competitors / Principaux Concurrents

**Direct / Directs**:

- Click&Boat (European leader)
- SamBoat (French major player)

**Indirect / Indirects**:

- Dream Yacht Charter
- Freedom Boat Club

---

*This is an academic project / Ceci est un projet académique*