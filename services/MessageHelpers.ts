const serverCommand = '!chill';

interface IServerCommand {
    command: string | null;
    context: string | null;
}

export const parseServerCommand = (content: string): IServerCommand => {
    const normalized = content.toLocaleLowerCase().trim();
    const splitMessage = normalized ? normalized.split(' ') : [];
    if (!splitMessage[0] || splitMessage[0] !== serverCommand) {
        return {} as IServerCommand;
    }

    return {command: splitMessage[1] ? splitMessage[1].toLocaleLowerCase().trim() : null, context: splitMessage[2] ? splitMessage[2].toLocaleLowerCase().trim() : null}
}