import {parseServerCommand} from '../../services/MessageHelpers';

describe('MessageHelpers', () => {
    describe('parseServerCommand', () => {
        it('Should parse a valid server command', () => {
            const serverCommand = '!chill apply';
            const parsedCommand = parseServerCommand(serverCommand);
            expect(parsedCommand.context).toEqual(null);
            expect(parsedCommand.command).toEqual('apply');
        })
    });
    it('Should parse a command with context', () => {
        const serverCommand = '!chill test thing';
        const parsedCommand = parseServerCommand(serverCommand);
        expect(parsedCommand.context).toEqual('thing');
        expect(parsedCommand.command).toEqual('test');
        expect(parsedCommand.context2).toEqual(null);
    });
    it('Should parse a command with 2 contexts', () => {
        const serverCommand = '!chill test thing context2';
        const parsedCommand = parseServerCommand(serverCommand);
        expect(parsedCommand.context).toEqual('thing');
        expect(parsedCommand.command).toEqual('test');
        expect(parsedCommand.context2).toEqual('context2');
    });
    it('Ignores any context after the 2nd', () => {
        const serverCommand = '!chill test thing context2 context3';
        const parsedCommand = parseServerCommand(serverCommand);
        expect(parsedCommand.context).toEqual('thing');
        expect(parsedCommand.command).toEqual('test');
        expect(parsedCommand.context2).toEqual('context2');
    });
    it('Handles empty string', () => {
        const serverCommand = '';
        const parsedCommand = parseServerCommand(serverCommand);
        expect(parsedCommand.context).toBe(undefined);
        expect(parsedCommand.command).toBe(undefined);
        expect(parsedCommand.context2).toBe(undefined);
    });
});