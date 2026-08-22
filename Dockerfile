FROM node:24-slim

WORKDIR /app

RUN corepack enable
RUN corepack prepare --activate pnpm@11.22.0+sha512.1ff870c4c6133dfd88fb2afc46dd13d47f09c9794b438c6fdb47ca98caf3bc16381ee0be93a091b8e3824cf01f889f46d7d9e20910fb0be1ab0fb5baa80dd621

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .

RUN mkdir -p apps/web packages/function-cache packages/github-term-svg
COPY apps/web/package.json apps/web
COPY packages/function-cache/package.json packages/function-cache
COPY packages/github-term-svg/package.json packages/github-term-svg

RUN pnpm install --frozen-lockfile

COPY docker-entrypoint /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
