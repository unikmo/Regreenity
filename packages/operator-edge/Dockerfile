FROM node:24.7.0-alpine
WORKDIR /app
COPY packages/operator-edge ./packages/operator-edge
RUN mkdir -p /data && chown -R node:node /app /data
USER node
ENV PORT=8787 CRUISECONNECT_EDGE_DB=/data/cruiseconnect-edge.sqlite
EXPOSE 8787
VOLUME ["/data"]
CMD ["node", "packages/operator-edge/src/index.mjs"]
