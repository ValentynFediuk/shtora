FROM directus/directus:10.10

USER root

# Create necessary directories
RUN mkdir -p /directus/uploads /directus/extensions && \
    chown -R node:node /directus/uploads /directus/extensions

USER node

# Environment variables (will be overridden by Railway)
# KEY and SECRET must be at least 32 characters for Directus to start
ENV KEY="shtora_key_0123456789abcdef_0123456789abcd"
ENV SECRET="shtora_secret_0123456789abcdef_0123456"
ENV ADMIN_EMAIL="admin@shtora.ua"
ENV ADMIN_PASSWORD="admin123"
ENV DB_CLIENT="pg"
ENV DB_SSL="true"
ENV DB_SSL_REJECT_UNAUTHORIZED="false"
ENV CORS_ENABLED="true"
ENV CORS_ORIGIN="*"
ENV PUBLIC_URL="https://your-app.railway.app"
ENV PORT="8055"

EXPOSE 8055
