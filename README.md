# LLama 2 API server

## Create docker image
$ docker build -t ollama-server .

# Run container
$ docker run -itd --name ollama-server ollama-server

## Run server
$ node ./src/server.mjs
