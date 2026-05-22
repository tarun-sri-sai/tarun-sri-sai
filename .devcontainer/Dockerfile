FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3-pip pipx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER node

RUN pipx install 'python-dotenv[cli]'
