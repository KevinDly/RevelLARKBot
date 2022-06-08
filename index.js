// Require the necessary discord.js classes
// TODO: Move strings to a seperate file
// TODO: Seperate the class data to seperate files.
// TODO: Move the different interactions to different files.
const { Client, Intents, Collection } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const { MessageActionRow, MessageButton } = require('discord.js');

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
const modalfolders = fs.readdirSync(modalsPath, { withFileTypes: true }).filter(dirent => dirent.isDirectory())
	.map(folder => folder.name);

for (const file of modalfs) {
	const filePath = path.join(modalsPath, file);
	const modal = require(filePath);
	client.modals.set(modal.name, modal);
}

for (const fileName of modalfolders) {
	const folderPath = path.join(modalsPath, fileName);
	const subModals = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
	// console.log(subModals);
	const collection = new Collection();
	client.modals.set(fileName, collection);
	for (const subFile of subModals) {
		// console.log(subFile);
		const filePath = path.join(folderPath, subFile);
		// console.log(filePath);
		const modal = require(filePath);
		client.modals.get(fileName).set(modal.name, modal);
	}
	// console.log(client.modals.get(fileName));
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
			await interaction.reply({ content: 'There was an error executing this command', ephemeral: true });
		}
	}
	else if (interaction.isButton()) {

		// IDs will be delimitted by a .
		const idArray = interaction.customId.split('.');
		console.log(idArray);
		let button = client.modals.get(idArray[0]);

		client.modals.get(button);
		if (idArray.length > 1) {
			button = button.get(idArray[1]);
		}

		console.log(button);
		// console.log(client.modals);
		// console.log(button);

		try {
			await button.execute(interaction);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error executing this command', ephemeral: true });
		}
	}
	else if (interaction.isModalSubmit()) {
		console.log('ID: ' + interaction.customId);

		// TODO: HANDLE FOR GREATER THAN 5 BUTTONS!
		if (interaction.customId == 'infoEntry') {
			const name = interaction.fields.getTextInputValue('charName');

			const classes = client.modals.get('classes');
			console.log(classes);

			const buttonRow = new MessageActionRow();
			for (const gameClass of classes.keys()) {
				console.log(gameClass);
				buttonRow.addComponents(new MessageButton()
					.setCustomId('classes.' + gameClass)
					.setLabel(classes.get(gameClass).button)
					.setStyle('PRIMARY'));
			}
			const message = 'Hello, ' + name + ', pick a class!';
			console.log(message);

			console.log(buttonRow);
			await interaction.update({ content: message, components: [buttonRow] });
		}
		else {
			await interaction.update({ content: 'You\'re done! Enjoy your time in Revel.', components: [] });
		}
	}
	// if(interaction.commandName == '')
});

client.login(token);