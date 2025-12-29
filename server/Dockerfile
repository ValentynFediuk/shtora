FROM directus/directus:10.10

USER root

# Create necessary directories
RUN mkdir -p /directus/uploads /directus/extensions && \
    chown -R node:node /directus/uploads /directus/extensions

# Copy entrypoint script
COPY server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER node

# Default environment variables (will be overridden by Railway)
ENV DB_CLIENT="pg"
ENV DB_SSL="true"
ENV DB_SSL_REJECT_UNAUTHORIZED="false"
ENV CORS_ENABLED="true"
ENV CORS_ORIGIN="*"

# Expose default Directus port (Railway will override via PORT env var)
EXPOSE 8055

ENTRYPOINT ["/entrypoint.sh"]
