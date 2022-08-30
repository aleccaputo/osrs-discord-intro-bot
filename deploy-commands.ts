import {REST} from '@discordjs/rest';
import {Routes} from 'discord.js';
import * as fs from 'fs';

const commands: Array<unknown> = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const token = '';
const clientId = '';
const serverId = '';

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, serverId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${(data as Array<unknown>).length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
