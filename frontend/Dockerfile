FROM nginx:alpine

RUN apk add --no-cache gettext

COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY certs/ /etc/nginx/certs/

# "COPY . /usr/share/nginx/html" de arriba también copió la carpeta certs/
# (con la llave privada) dentro de la carpeta pública servida por Nginx.
# Se elimina esa copia: el certificado solo debe quedar accesible en
# /etc/nginx/certs, nunca servible como archivo estático.
RUN rm -rf /usr/share/nginx/html/certs

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
