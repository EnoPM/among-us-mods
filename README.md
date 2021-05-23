# [Among Us - Mods v3.0.1](https://github.com/clicpanel/among-us-mods)
## Gestionnaire de mod pour Among Us
La gestion des mods pour Among Us simplifiée au maximum. Grâce à cette application vous pourrez installer, mettre à jour et restaurer une version précédente des mods Among Us sans aucune manipulation.

### [Télécharger Among Us Mods v3.0.1 pour Windows (installeur)](https://github.com/clicpanel/among-us-mods/releases/download/v3.0.1/Among.Us.-.Mods.installer.exe)

> Cette application utilise les liens symboliques pour greffer les mods à votre jeu Among Us. De cette façon vous n'avez pas besoin de créer une copie de votre dossier contenant le jeu pour y installer des mods.

## Sommaire
- [Première utilisation](#première-utilisation)
- [Fonctionnalités](#fonctionnalités)
- [Compatibilité des mods](#compatibilité-des-mods)
- [Signaler un problème](#signaler-un-problème)
- [Contributions](#contributions)

### Première utilisation
Lors du premier lancement de l'application vous vous retrouverez sur la configuration. 
Vous devrez sélectionner l'exécutable `Among Us.exe` que l'application utilisera pour y greffer les mods que vous voudrez utiliser. Veillez à bien sélectionner l'exécutable et non le raccourci.

![Paramètres](./documentation/settings.png)

### Fonctionnalités
- Une interface simple et intuitive.
  
![Liste des mods](./documentation/mods-list.png)
- Téléchargement des mods simplement via l'URL de leur dépôt Github.
  
![Ajouter un mod](./documentation/add-mod.png)
- Ouvrir le dépôt, le dossier, restaurer une version précédente ou désinstaller simplement avec un clique-droit.

![Paramètres avancés d'un mod](./documentation/mods-list-context-menu.png)
- Restaurer une version précédente d'un mod installé.

![Restaurer une version précédente](./documentation/restore-previous-version.png)
- L'application informe de la dernière version disponible si celle-ci n'est pas déjà installée.

![Mod avec une mise à jour](./documentation/mod-with-new-version.png)
- Effectuer une mise à jour en un seul clique.

![Mise à jour](./documentation/update-mod.png)
- Gérer les serveurs privés.

![Serveurs privés](./documentation/private-servers.png)
- Ajouter un serveur privé.

![Ajouter un serveur privé](./documentation/add-private-server.png)
- Impossible d'intéragir avec l'application si `Among Us` est lancé.

![Among Us en cours d'exécution](./documentation/among-us-running.png)

### Compatibilité des mods
Les mods qui souhaitent être compatible avec cette application doivent respecter certains critères :
- Disposer d'une archive `.zip` dans chaque release de version content la version BepInEx compatible et le plugin `.dll` du mod.
- (optionnel) Disposer du plugin `.dll` dans chaque release uniquement si la release précédente utilise la même version de BepInEx.
- Les fichiers dans l'archive de la release ne doivent pas être dans un sous-dossier.
  
### Signaler un problème
Verifier si le problème rencontré n'a pas déjà été signalé dans [les issues](https://github.com/clicpanel/among-us-mod-manager/issues). Si ça n'est pas le cas vous pouvez [ouvrir une nouvelle issue](https://github.com/clicpanel/among-us-mods/issues/new).

### Contributions
Ce projet accepte les `pull requests` si le code est propre, respecte les conventions du projet et si la modification apportée est jugée pertinente.
