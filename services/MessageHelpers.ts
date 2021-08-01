interface IServerCommand {
    command: string | null;
    context: string | null;
}

export const parseServerCommand = (content: string): IServerCommand => {
    const normalized = content.toLocaleLowerCase().trim();
    const splitMessage = normalized ? normalized.split(' ') : [];

    return {command: splitMessage[0] ? splitMessage[0].toLocaleLowerCase().trim() : null, context: splitMessage[1] ? splitMessage[1].toLocaleLowerCase().trim() : null}
}