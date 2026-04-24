FROM node:18-alpine
WORKDIR /app
COPY app/package*.json ./
RUN npm install --omit=production
COPY app/ .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- -f http://localhost:3000/health || exit 1
CMD ["node", "app.js"]
