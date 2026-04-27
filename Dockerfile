FROM node:18-alpine
WORKDIR /app
COPY app/package*.json ./
RUN npm install
COPY app/ .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "app.js"]
