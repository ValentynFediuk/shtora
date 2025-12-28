FROM directus/directus:10.10

USER root

# Create necessary directories
RUN mkdir -p /directus/uploads /directus/extensions && \
    chown -R node:node /directus/uploads /directus/extensions

USER node

# Environment variables (will be overridden by Railway)
ENV KEY="change-me-in-production"
ENV SECRET="change-me-in-production-too"
ENV ADMIN_EMAIL="admin@shtora.ua"
ENV ADMIN_PASSWORD="admin123"
ENV DB_CLIENT="pg"
ENV CORS_ENABLED="true"
ENV CORS_ORIGIN="*"
ENV PUBLIC_URL="https://your-app.railway.app"

EXPOSE 8055
