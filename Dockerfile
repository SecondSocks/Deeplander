FROM oven/bun:1.2.22 AS base

WORKDIR /app

FROM base AS install

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS runtime

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=install /app/node_modules ./node_modules
COPY package.json bun.lock prisma.config.ts ./
COPY prisma ./prisma
COPY index.ts ./index.ts
COPY src ./src
COPY prisma.service.ts ./prisma.service.ts

# Generate the Prisma client during the deployment image build.
RUN DIRECT_URL=postgresql://user:password@localhost:5432/database bunx prisma generate

EXPOSE 8080

CMD ["bun", "run", "index.ts"]
