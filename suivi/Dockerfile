# Image de la plateforme de suivi. Le projet n'a aucune dépendance : pas de
# npm install, pas de node_modules, pas d'étape de compilation.
#
#   docker build -t suivi suivi/
#   docker run -p 8080:8080 -v suivi-donnees:/donnees suivi
#
# Le volume est le point important : sans lui, l'état vit dans le conteneur et
# disparaît au premier redémarrage — avec les chiffres de l'équipe.

FROM node:22-alpine

WORKDIR /app
COPY . /app

# L'état et la configuration hors de l'image, sur un volume monté.
ENV SUIVI_DONNEES=/donnees
VOLUME ["/donnees"]

ENV PORT=8080
EXPOSE 8080

# Le serveur écoute en clair : derrière un reverse proxy TLS, poser aussi
# SUIVI_HTTPS=1 pour que le cookie de session prenne l'attribut Secure.
USER node
CMD ["node", "serveur.mjs"]
