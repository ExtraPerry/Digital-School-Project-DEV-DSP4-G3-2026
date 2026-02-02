# Questionnaire compréhension du projet

Ce questionnaire a été établi pour que nous puissions vérifier votre compréhension du sujet ainsi que les premières informations trouvées pour le projet.

Cela nous permettra de vous recadrer si nécessaire et éviter les hors sujet.

Ce questionnaire est donc découpé en 3 parties à savoir :
1. Compréhension de la demande
2. Benchmark
3. Analyse de stratégie

Nous ne vous demandons pas de copier-coller ce qui se trouve dans votre cahier des charges mais de synthétiser en quelques phrases votre travail pour répondre au mieux aux questions posées.

---

## Management de projet

### Qui est le chef de projet au sein de votre équipe ?

Pierre GERVAIS

### Quels sont les logiciels et outils utilisés pour communiquer ?

Discord, Teams, WhatsApp

### Quels sont les logiciels et outils utilisés pour travailler en commun ?

Git, Github, Trello

### Merci de nous donner accès ici à l'outil demandé pour la répartition et le suivi du travail (Trello, Notion…).

_(Il nous faut ici bien évidemment l'URL publique ainsi que les identifiants de connexion au cas où)_

- **Github**: https://github.com/ExtraPerry/Digital-School-Project-DEV-DSP4-G3-2026
- **Trello**: https://trello.com/b/5vAWFSDO/digital-school-project-dev-dsp4-g3-2026

### Y a-t-il des problématiques de groupe particulières à soulever ?

Non

---

## A. Partie agence

### 1. Dans quelle agence travaillez-vous et quelles sont ses domaines de compétence à mettre en avant ?

Dans le cas du projet ou dans nos alternances ?

**Dans le cas de nos alternances :**

**Pierre GERVAIS & Eduardo GAGLIARDI :**
- **Agence** : MerciMister
- **Compétences** :
  - Framework : Next.js / ExpoGo
  - Front : React / React Native
  - Back : Supabase / Postgresql / Google Cloud

**Lucas Dias :**
**Agence** : Heaven Agency
- **Compétences** :
  - Framework : Next.js
  - Front : React / React Native
  - Back : Supabase / Postgresql

### 2. Sans parler des livrables attendus pour répondre au besoin du client (CF partie suivante), quels sont les documents et éléments techniques qui vont devoir être mis en place ?

#### 1. Documents de cadrage technique

- **Cahier des charges technique / Spécifications techniques**
  - Décrit l'architecture, les technologies à utiliser, les contraintes techniques.
  - Peut inclure : choix front-end/back-end, framework, CMS, base de données, API, sécurité.

- **Document d'architecture logicielle**
  - Diagrammes d'architecture (ex : client-serveur, microservices, MVC).
  - Définition des composants, modules et interactions.

- **Spécifications API / Interfaces**
  - Documentation des endpoints, paramètres, réponses et format des données.
  - Indispensable si l'application communique avec d'autres systèmes.

- **Modèle de données / Diagramme de base de données (ERD)**
  - Structure des tables, relations, clés primaires/étrangères.

#### 2. Documents liés au développement

- **Plan de versioning / Git workflow**
  - Décrit la gestion du code source (branches, merges, releases).

- **Guide de normes et conventions de code**
  - Naming conventions, indentation, documentation des fonctions, patterns à respecter.

- **Plan de tests techniques**
  - Tests unitaires, tests d'intégration, tests de performance, tests de sécurité.

- **Environnements de développement et de déploiement**
  - Liste des environnements (dev, staging, prod).
  - Configuration des serveurs, conteneurs Docker, cloud, CI/CD.

#### 3. Documents de sécurité et conformité

- **Plan de sécurité / sécurité applicative**
  - Gestion des accès et authentification (OAuth, JWT, RBAC).
  - Protection contre les vulnérabilités (XSS, SQLi, etc.).

- **RGPD / protection des données personnelles**
  - Définition des flux de données sensibles et mesures de protection.

#### 4. Gestion de projet et suivi technique

- **Roadmap technique / backlog**
  - Liste des tâches techniques à réaliser, priorisées par sprint ou étape.

- **Diagrammes de workflow / user flows (techniques)**
  - Décrit comment les données circulent entre les composants.

- **Journal de bord technique / suivi des incidents**
  - Suivi des bugs, problèmes de serveur, tâches en cours.

- **Documentation d'installation et de déploiement**
  - Procédures pour mettre en place l'environnement local ou serveur.

#### 5. Documents complémentaires

- Diagrammes UML (classe, séquence, activité) pour la conception détaillée.
- Mockups ou wireframes techniques (optionnel si nécessaire pour comprendre le flux technique).
- Checklist qualité / recette technique avant mise en production.

---

## B. Partie client

### Compréhension de la demande client

#### 1. Qui est votre client et quelle est son activité ?

- **Client** : Le client est Mr Voisin.
- **Activité** : Il souhaite lancer une société nommée « SailingLoc ». L'activité consiste en la location de voiliers et de bateaux à moteurs entre particuliers uniquement.

#### 2. Quel est le besoin ou la problématique de votre client ?

- **Besoin principal** : Mr Voisin souhaite digitaliser son activité pour permettre la mise en relation entre particuliers (propriétaires et locataires).
- **Objectifs économiques** : Rendre l'activité pérenne en encaissant 10% de chaque transaction, ainsi que des profits via la publicité, les partenariats (assurances, magasins spécialisés) et la revente de données.
- **Attentes spécifiques** : Il a besoin d'une identité visuelle, du prototypage, et du développement d'un site internet complet.

#### 3. Quels sont les livrables attendus pour répondre au besoin / la problématique ?

- **Cahier des charges complet** : Incluant l'étude marketing, les préconisations techniques, et l'analyse des risques.
- **Identité visuelle** : Recherche de logos, charte graphique, zonings, wireframes et maquettes.
- **Site Internet** : Un site fonctionnel, responsive, et sécurisé permettant la location, la gestion des bateaux et l'administration.
- **Documentation technique** : Cahier des spécifications techniques (en français et anglais), documentation de la chaîne de développement, et manuel de déploiement.
- **Tests** : Rapports de tests unitaires, fonctionnels (avec code coverage) et de montée en charge.
- **Gestion de projet** : Un Gantt complet, une estimation des coûts (devis), un outil de pilotage et une gestion de tickets.

#### 4. Y a-t-il des contraintes particulières imposées par le client à respecter ? (temporelle, financière, technique…)

**Techniques :**
- Le site doit être accessible sur tout type de device (ordinateur, tablette, smartphone).
- Il faut anticiper la mise en place d'une application mobile quelques mois après la sortie du site.
- Le cahier des spécifications techniques doit être rédigé en français et en anglais.
- Les informations sensibles doivent être sécurisées (client et serveur).

**Financières :**
- Aucun budget prévisionnel n'est fourni ; c'est à vous de proposer un "juste prix".

**Académiques / Mise en ligne :**
- Le site doit être obligatoirement mis en ligne pour la soutenance avec un nom de domaine spécifique incluant le numéro de classe et de groupe (ex: dsp-dev-O24A-G1.fr).
- Des mentions légales spécifiques indiquant qu'il s'agit d'un projet étudiant fictif doivent être présentes.

### Benchmark

#### 5. Quel(s) marché(s) doit(doivent) être analysé(s) au vu de l'activité du client et de sa demande ?

Le marché principal à analyser est celui du **nautisme et de la plaisance collaborative** (économie du partage), spécifiquement le segment de la **location de bateaux entre particuliers (C2C)**.

Ce marché se caractérise par une forte croissance due à la tendance de "l'usage plutôt que la propriété" (un bateau coûte cher et navigue peu). Il est également marqué par une très forte saisonnalité (juin à septembre en Europe) et des contraintes légales spécifiques (assurances, équipements de sécurité, permis).

#### 6. Qui sont les concurrents directs que vous avez identifiés ?

_(Vous devez ici donner le nom des concurrents identifiés)_

- **Click&Boat** : Leader européen, souvent surnommé l'« Airbnb du bateau ». Dispose d'un catalogue très large et d'une application mobile performante.
- **SamBoat** : Acteur majeur français, très positionné sur la confiance et les assurances sécurisées pour les propriétaires.

#### 7. Qui sont les concurrents indirects que vous avez identifiés ?

_(Vous devez ici donner le nom des concurrents identifiés)_

- **Dream Yacht Charter** : Loueur professionnel mondial qui possède sa propre flotte (contrairement à SailingLoc qui n'a pas de stock). Le service est standardisé mais souvent plus onéreux.
- **Freedom Boat Club** : Modèle de "Boat Club" fonctionnant par abonnement mensuel (sans propriété ni location à l'acte).

### Analyse de stratégie

#### 8. Qui est pour vous la cible principale identifiée grâce à l'étude de marché ?

_(Mettez ici en avant les informations socio-démographiques ainsi que les motivations d'achat et/ou de consommation des produits ou services proposés)_

- **Profil** : Les "Vacanciers nautiques". Hommes et femmes, 25-45 ans, CSP intermédiaire à supérieure.
- **Motivations** : Recherchent une expérience de loisir accessible (prix inférieur à la location pro) et simple pour une journée ou une semaine. Ils privilégient souvent les bateaux à moteur pour des sorties côtières ou les petits voiliers. Ils sont habitués aux plateformes numériques (type Airbnb).

#### 9. Qui est pour vous le cœur de cible grâce à l'étude de marché ?

_(Mettez ici en avant les informations socio-démographiques ainsi que les motivations d'achat et/ou de consommation des produits ou services proposés)_

- **Profil** : Les "Passionnés non-propriétaires". 30-55 ans, majoritairement hommes, détenteurs du permis bateau (côtier ou hauturier).
- **Motivations** : Ils savent naviguer mais ne souhaitent pas (ou ne peuvent pas) assumer les charges d'un bateau à l'année. Ils recherchent des bateaux spécifiques ou techniques (voiliers de propriétaires bien équipés) et l'authenticité de l'échange avec un autre passionné (le propriétaire). C'est la clientèle la plus fidèle et la plus soigneuse.

#### 10. Qui est pour vous la cible secondaire grâce à l'étude de marché ?

_(Mettez ici en avant les informations socio-démographiques ainsi que les motivations d'achat et/ou de consommation des produits ou services proposés)_

- **Profil** : Les Propriétaires de bateaux (Côté offre) et les Partenaires B2B.
- **Motivations (Propriétaires)** : Amortir les frais annuels d'entretien et de place de port (environ 10% de la valeur du bateau/an). Ils ont besoin d'outils de gestion de planning et d'assurances fiables.
- **Motivations (Partenaires)** : Compagnies d'assurances et magasins d'accastillage souhaitant accéder aux données qualifiées de SailingLoc pour proposer leurs produits.

#### 11. Quelle est la zone de chalandise proposée ?

_(Mettez ici en avant les agglomérations identifiées réparties par zone)_

- **Zone France Méditerranée** : Marseille, Hyères, Antibes, Saint-Tropez, Corse (Ajaccio, Bonifacio).
- **Zone France Atlantique** : La Rochelle, La Trinité-sur-Mer, Le Crouesty.
- **Zone Europe du Sud** : Baléares (Ibiza, Palma), Croatie (Split, Dubrovnik), Grèce (Cyclades), Italie (Sardaigne).
