// Require the necessary discord.js classes
const { Client, Intents, Collection } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const { MessageActionRow, MessageSelectMenu } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandfs = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandfs) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
}

client.modals = new Collection();

const modalsPath = path.join(__dirname, 'modals');
const modalfs = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));

for (const file of modalfs) {
	const filePath = path.join(modalsPath, file);
	const modal = require(filePath);
	client.modals.set(modal.name, modal);

}
// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Login to Discord with your client's token

// Add client.join or something
client.on('guildMemberAdd', async join => {
	console.log(join.id);
	// join.
});

// Add client commands or something

client.on('interactionCreate', async interaction => {

	if (interaction.isCommand()) {

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error executing this command', ephemeral: true} );
		}
	}
	else if (interaction.isButton()) {

		// console.log(interaction.customId);
		const button = client.modals.get(interaction.customId);
		// console.log(client.modals);
		// console.log(button);

		try {
			await button.execute(interaction);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error executing this command', ephemeral: true} );
		}
	}
	else if (interaction.isModalSubmit()) {
		const name = interaction.fields.getTextInputValue('charName');

		/* if (interaction.customId == 'charInput') {
			await client.modals.get('warrior').execute(interaction);
		} */

		await interaction.update('POG');
		console.log('User\'s name is: ' + name);
	}
	// if(interaction.commandName == '')
});

client.on('modalSubmit', async (modal) => {
	const name = modal.getTextInputValue('charName');

	/* if (interaction.customId == 'charInput') {
		await client.modals.get('warrior').execute(interaction);
	} */

	modal.followUp('POG');
	console.log('User\'s name is: ' + name);
});
client.login(token);