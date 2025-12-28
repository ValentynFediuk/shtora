FROM directus/directus:10.10

# Set environment variables (will be overridden by Railway)
ENV KEY="replace-with-random-key"
ENV SECRET="replace-with-random-secret"
ENV ADMIN_EMAIL="admin@shtora.ua"
ENV ADMIN_PASSWORD="admin123"

# Database connection (PostgreSQL from Railway)
ENV DB_CLIENT="pg"

# CORS settings
ENV CORS_ENABLED="true"
ENV CORS_ORIGIN="*"

# Expose Directus port
EXPOSE 8055

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8055/server/health || exit 1
