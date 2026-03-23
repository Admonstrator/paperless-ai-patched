ARG BASE_IMAGE=admonstrator/paperless-ai-next:latest-base-full
FROM ${BASE_IMAGE}

ARG PAPERLESS_AI_COMMIT_SHA=unknown

WORKDIR /app

# Copy application files
COPY --chown=node:node server.js main.py python_restart_manager.py start-services.sh ./
COPY docker-entrypoint.sh ./
COPY --chown=node:node config ./config/
COPY --chown=node:node models ./models/
COPY --chown=node:node routes ./routes/
COPY --chown=node:node services ./services/
COPY --chown=node:node views ./views/
COPY --chown=node:node public ./public/
COPY --chown=node:node OPENAPI ./OPENAPI/
COPY --chown=node:node scripts ./scripts/
COPY --chown=node:node schemas.js swagger.js ecosystem.config.js package.json ./

# Make startup script executable
RUN chmod +x start-services.sh docker-entrypoint.sh

# Configure persistent data volume
VOLUME ["/app/data"]

# Runtime starts as root to initialize mounted volumes, then drops to node via entrypoint
USER root

# Configure application port
EXPOSE ${PAPERLESS_AI_PORT:-3000}

# Add health check with dynamic port
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PAPERLESS_AI_PORT:-3000}/health || exit 1

# Set production environment
ENV NODE_ENV=production \
    LOG_LEVEL=info \
    ANONYMIZED_TELEMETRY=False \
    PAPERLESS_AI_COMMIT_SHA=${PAPERLESS_AI_COMMIT_SHA}

LABEL org.opencontainers.image.revision=${PAPERLESS_AI_COMMIT_SHA}

ENTRYPOINT ["./docker-entrypoint.sh"]

# Start both Node.js and Python services using our script
CMD ["./start-services.sh"]
