# Node 
FROM node:alpine as builder
WORKDIR '/app'
COPY package.json ./
RUN npm install
COPY ./ ./
RUN npm run build

# Nginx 
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# on veut copier le contenu du dossier build une fois
# qu'il a été compilé pendant la première phase ci-dessus
# (ce dossier se trouve donc dans /app/build) et le placer  
# dans le dossier servi par nginx (/usr/share/nginx/html, voir doc sur le hub)
COPY --from=builder /app/build /usr/share/nginx/html
