FROM node:24

RUN corepack enable
RUN corepack prepare --activate pnpm@12.17.0

WORKDIR /app

COPY docker-entrypoint /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
