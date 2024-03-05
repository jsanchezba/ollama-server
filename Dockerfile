FROM debian:bullseye-slim
RUN apt update && apt install curl -y
RUN curl https://ollama.ai/install.sh | sh

ENV OLLAMA_HOST=0.0.0.0

WORKDIR /app
COPY src/* .

ENTRYPOINT [ "ollama", "serve" ]
CMD [ "node", "server.mjs", ]