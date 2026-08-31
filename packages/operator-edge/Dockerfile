FROM node:24.20.0-alpine3.24
WORKDIR /app
USER root
# The edge runtime has no npm dependencies. Patch Alpine packages and remove the
# package managers bundled with the upstream development image so build-only
# dependency trees are not shipped aboard the vessel.
RUN apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
      /usr/local/bin/pnpm /usr/local/bin/pnpx /usr/local/bin/yarn /usr/local/bin/yarnpkg
COPY packages/operator-edge ./packages/operator-edge
RUN mkdir -p /data && chown -R node:node /app /data
USER node
ENV PORT=8787 CRUISECONNECT_EDGE_DB=/data/cruiseconnect-edge.sqlite
EXPOSE 8787
VOLUME ["/data"]
CMD ["node", "packages/operator-edge/src/index.mjs"]
