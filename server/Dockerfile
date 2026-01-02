FROM directus/directus:10.10

USER root
RUN mkdir -p /directus/uploads /directus/extensions && \
    chown -R node:node /directus/uploads /directus/extensions

USER node
EXPOSE 8055
