FROM node:22-alpine AS base

LABEL org.opencontainers.image.source=https://github.com/mayaankvad/lambda-visualizer

FROM base AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=golang:1.24-alpine /usr/local/go/ /usr/local/go/
ENV PATH="/usr/local/go/bin:${PATH}"
RUN apk update && apk add --no-cache make

ENV HUSKY=0

WORKDIR /workspace
COPY . .
RUN pnpm install --frozen-lockfile \
    && pnpm build \
    && pnpm export


FROM base AS production
WORKDIR /app

COPY --from=builder /workspace/export/. .

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

CMD [ "npm", "start" ]
