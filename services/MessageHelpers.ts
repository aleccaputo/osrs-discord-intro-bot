const serverCommand = '!chill';

interface IServerCommand {
    command: string | null;
    context: string | null;
    context2: string | null;
}

export const parseServerCommand = (content: string): IServerCommand => {
    console.log(`content: ${content}`)
    const normalized = content.toLocaleLowerCase().trim();
    const splitMessage = normalized ? normalized.split(' ') : [];
    if (!splitMessage[0] || splitMessage[0] !== serverCommand) {
        return {} as IServerCommand;
    }

    return {
        command: splitMessage[1]
            ? splitMessage[1].toLocaleLowerCase().trim()
            : null,
        context: splitMessage[2]
            ? splitMessage[2].toLocaleLowerCase().trim()
            : null,
        context2: splitMessage[3]
            ? splitMessage[3].toLocaleLowerCase().trim()
            : null
    }
}

export const formatDiscordUserTag = (id: string) => `<@${id}>`

export const stripDiscordCharactersFromId = (idString: string) => idString.replace(/[^0-9]/g, '');

// https://techozu.com/how-to-split-messages-in-discord-js/
export const splitMessage = (message: string, size: number) => {
    const numChunks = Math.ceil(message.length / size)
    const chunks = new Array(numChunks)

    for (let i = 0, c = 0; i < numChunks; ++i, c += size) {
        chunks[i] = message.slice(c, size)
    }

    return chunks
}