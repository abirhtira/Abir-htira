# Plateforme SOC intelligente : détection et réponse aux incidents

> Présentation technique d'un projet de fin d'études consacré à l'intégration d'un SIEM, de Threat Intelligence, d'une orchestration SOAR et d'une réponse active IPS.

**Auteur :** Abir Htira  
**Périmètre :** laboratoire SOC et sécurité réseau

> Cette page documente l'architecture et les validations du laboratoire. Le dépôt public du portfolio ne contient pas les configurations opérationnelles, les scripts de l'orchestrateur ni les exports des tableaux de bord. Les adresses internes, noms d'hôtes, identifiants et secrets ne sont pas publiés.

## Sommaire

1. [Présentation](#1-présentation)
2. [Objectifs](#2-objectifs)
3. [Architecture](#3-architecture)
4. [Stack technologique](#4-stack-technologique)
5. [Plan d'adressage](#5-plan-dadressage)
6. [Fonctionnement du pipeline](#6-fonctionnement-du-pipeline)
7. [Scénarios d'attaque validés](#7-scénarios-dattaque-validés)
8. [Résultats et KPIs](#8-résultats-et-kpis)
9. [Périmètre du dépôt](#9-périmètre-du-dépôt)
10. [Reproduction du laboratoire](#10-reproduction-du-laboratoire)
11. [Sécurité et divulgation](#11-sécurité-et-divulgation)
12. [Documentation complémentaire](#12-documentation-complémentaire)

---

## 1. Présentation

Le projet consiste à concevoir, déployer et valider une plateforme de Security Operations Center (SOC). Elle collecte les journaux d'un pare-feu et des hôtes, analyse et corrèle les événements, enrichit les alertes avec de la Threat Intelligence, crée des cas d'investigation et peut déclencher une réponse active dans le laboratoire.

Le cycle de traitement couvert est : **collecte → détection → corrélation → enrichissement → décision → réponse → supervision**.

## 2. Objectifs

- Centraliser et normaliser les journaux du pare-feu Palo Alto et des hôtes Windows.
- Détecter les menaces avec des décodeurs et règles Wazuh, associés aux techniques MITRE ATT&CK pertinentes.
- Automatiser le triage, l'enrichissement et la gestion des incidents.
- Intégrer MISP pour la Threat Intelligence et la rétroaction des cas confirmés.
- Déclencher, dans le laboratoire, le blocage d'indicateurs validés via le groupe de règles `AUTO-BLOCK`.
- Superviser la plateforme et suivre le MTTD, le MTTA et le MTTR.
- Protéger l'accès aux outils SOC avec des contrôles tels que MFA et RBAC.

## 3. Architecture

### Pipeline global

```text
Palo Alto PA-220
      │ Syslog
      ▼
Wazuh (SIEM) ──► Décodeurs et règles personnalisés
      │ Alertes
      ▼
Orchestrateur Python (custom-w2thive.py)
      ├──► MISP     : corrélation IOC et Threat Intelligence
      ├──► Cortex   : enrichissement des observables
      ├──► TheHive  : alertes et cas d'investigation
      └──► IPS      : réponse active dans le laboratoire
                         │
                         ▼
                 Grafana / Loki
                 Supervision et KPIs
```

### Workflow à trois niveaux

| Niveau | Rôle |
|---|---|
| **1. Triage IOC** | Extraction et déduplication des observables, puis corrélation avec MISP. |
| **2. Enrichissement** | Analyse Cortex et évaluation des observables selon les règles du laboratoire. |
| **3. Réponse automatisée** | Création d'un cas TheHive, application de la réponse IPS prévue, notification et rétroaction MISP. |

## 4. Stack technologique

| Couche | Outils |
|---|---|
| Pare-feu et source de journaux | Palo Alto PA-220 |
| SIEM / HIDS | Wazuh |
| Gestion des incidents | TheHive |
| Analyse et enrichissement | Cortex |
| Threat Intelligence | MISP |
| Orchestration | Python, API REST et webhooks |
| Supervision | Grafana, Loki et Promtail |
| Conteneurisation | Docker / Docker Compose |
| Environnement de test | Machines virtuelles, dont Windows Server pour DNS et IIS |

## 5. Plan d'adressage

Les adresses IP et noms d'hôtes du laboratoire sont volontairement omis de cette version publique.

| Composant | Rôle |
|---|---|
| Wazuh | Collecte, analyse et visualisation des événements de sécurité. |
| Plateforme SOAR | Orchestration, gestion des cas, analyse des observables et tableaux de bord. |
| Pare-feu | Filtrage réseau, IPS et transfert Syslog vers le SIEM. |

## 6. Fonctionnement du pipeline

1. **Collecte** : le pare-feu transmet ses journaux Syslog à Wazuh.
2. **Décodage et normalisation** : des décodeurs traitent les événements du pare-feu.
3. **Détection et corrélation** : des règles Wazuh détectent les scénarios et sont associées aux techniques ATT&CK pertinentes.
4. **Orchestration** : l'orchestrateur Python récupère les alertes et exécute le workflow de traitement.
5. **Extraction** : les observables (par exemple IP, domaine ou hash) sont extraits et dédupliqués.
6. **Enrichissement** : les observables sont corrélés avec MISP et analysés par Cortex.
7. **Évaluation** : les résultats d'enrichissement et le contexte de l'alerte guident la décision selon les règles du laboratoire.
8. **Gestion d'incident** : les alertes et cas d'investigation sont créés ou mis à jour dans TheHive.
9. **Réponse active** : les indicateurs confirmés peuvent déclencher une action de blocage IPS dans l'environnement de test.
10. **Rétroaction** : les cas confirmés peuvent contribuer à l'enrichissement de MISP.
11. **Supervision** : Grafana et Loki présentent les indicateurs SOC et l'état des composants surveillés.

## 7. Scénarios d'attaque validés

| # | Scénario | Objectif de validation |
|---|---|---|
| 1 | **DNS C2 / sinkhole** | Détecter les requêtes vers un domaine de commande et contrôle et vérifier leur traitement par le sinkhole du laboratoire. |
| 2 | **Reconnaissance Nmap** | Détecter les scans de ports et les activités de découverte réseau. |
| 3 | **DoS / UDP flood** | Détecter un volume anormal de trafic UDP et valider la réponse configurée. |
| 4 | **Brute force Windows** | Détecter des échecs d'authentification répétés sur un hôte Windows. |
| 5 | **Malware (IOC endpoint)** | Détecter et enrichir un indicateur de compromission associé à un endpoint. |

Les validations couvrent la détection, l'association ATT&CK, l'investigation et la réponse prévue dans le laboratoire.

## 8. Résultats et KPIs

| Indicateur mesuré | Résultat communiqué |
|---|---:|
| **MTTD** — Mean Time to Detect | ≈ 1,2 s |
| **MTTA** — Mean Time to Acknowledge | ≈ 2,1 s |
| **MTTR** — Mean Time to Respond | ≈ 14 s |

Ces valeurs correspondent aux mesures rapportées pour les scénarios du laboratoire. Elles dépendent des conditions de test et ne constituent pas une garantie de performance dans un autre environnement.

## 9. Périmètre du dépôt

Ce dépôt publie le portfolio et cette présentation technique. Il ne fournit pas de paquet de déploiement prêt à l'emploi : les configurations Wazuh, scripts d'orchestration, exports Grafana, journaux et captures du laboratoire ne sont pas inclus.

## 10. Reproduction du laboratoire

La reproduction nécessite un hyperviseur, des machines virtuelles, Docker / Docker Compose, une source Syslog et les composants SIEM/SOAR décrits dans cette page. Les étapes de déploiement et fichiers de configuration ne sont pas fournis dans le dépôt du portfolio ; cette documentation ne doit donc pas être considérée comme un guide d'installation exécutable.

## 11. Sécurité et divulgation

- Ne jamais publier de clés API, mots de passe, tokens ou fichiers `.env`.
- Ne pas ajouter d'adresses internes, de noms d'hôtes, de journaux bruts ou de données identifiantes.
- N'appliquer le blocage automatique qu'à des indicateurs vérifiés et dans un environnement maîtrisé.
- Vérifier l'autorisation de publication des informations liées à une organisation avant toute diffusion.

## 12. Documentation complémentaire

La présentation du projet et ses 14 rubriques sont également accessibles depuis la [section SOC Platform du portfolio](https://abirhtira.github.io/Abir-htira/#soc-platform). Le dépôt public du portfolio est disponible sur [GitHub](https://github.com/abirhtira/Abir-htira).
