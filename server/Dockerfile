FROM directus/directus:11.14.0

USER root
RUN mkdir -p /directus/uploads /directus/extensions && \
    chown -R node:node /directus/uploads /directus/extensions

USER node
EXPOSE 8055
