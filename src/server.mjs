import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let context = []
let responseTime

const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

while (true) {
    const text = await prompt("Pregunta >> ")
    await sendMessage(text)
}


async function sendMessage(text) {
    console.log('Sending message...')
    console.log('___________________________________________')
    responseTime = new Date().getTime()

    const body = {
        'model': 'codellama',
        'prompt': text
    }
    if (context.length) {
        body.context = context
    }

    const response = await fetch('http://localhost:11434/api/generate', {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(body)
    })

    if (response) {
        console.log('Generating response...')
        const message = []
        for await (const data of parseJsonStream(response.body)) {
            if (data.context) {
                context = data.context
                console.log('Adding context...')
            }
        message.push(data.response)
        }

        console.log(message.join(''))
        console.log('Executed in ', ((new Date().getTime() - responseTime) / 1000), ' seconds')
    }
}

async function *parseJsonStream(readableStream) {
    for await (const line of readLines(readableStream.getReader())) {
        const trimmedLine = line.trim().replace(/,$/, '');

        if (trimmedLine !== '[' && trimmedLine !== ']') {
            yield JSON.parse(trimmedLine);
        }
    }
}

async function *readLines(reader) {
    const textDecoder = new TextDecoder();
    let partOfLine = '';
    for await (const chunk of readChunks(reader)) {
        const chunkText = textDecoder.decode(chunk);
        const chunkLines = chunkText.split('\n');
        if (chunkLines.length === 1) {
            partOfLine += chunkLines[0];
        } else if (chunkLines.length > 1) {
            yield partOfLine + chunkLines[0];
            for (let i=1; i < chunkLines.length - 1; i++) {
                yield chunkLines[i];
            }
            partOfLine = chunkLines[chunkLines.length - 1];
        }
    }
}

function readChunks(reader) {
    return {
        async* [Symbol.asyncIterator]() {
            let readResult = await reader.read();
            while (!readResult.done) {
                yield readResult.value;
                readResult = await reader.read();
            }
        },
    };
}