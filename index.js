// Require the necessary discord.js classes
// TODO: Move strings to a seperate file
// TODO: Seperate the class data to seperate files.
// TODO: Move the different interactions to different files.
const { Client, Intents, Collection } = require('discord.js');
const { MongoClient } = require('mongodb');
const { token, uri } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { waitForDebugger } = require('node:inspector');
const { isContextMenuApplicationCommandInteraction } = require('discord-api-types/utils/v10');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const database = new MongoClient(uri);

// Load Database
initDB();

// Load Command
client.commands = new Collection();
client.userData = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandfs = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandfs) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
}

client.modals = new Collection();
client.jsondata = new Collection();
// Convert bottom into function
const modalsPath = path.join(__dirname, 'modals');
const modalfs = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));
const modalfolders = fs.readdirSync(modalsPath, { withFileTypes: true }).filter(dirent => dirent.isDirectory())
	.map(folder => folder.name);

const jsonPath = path.join(__dirname, 'json_data');
const jsonfs = fs.readdirSync(jsonPath).filter(file => file.endsWith('.js'));
const jsonfolders = fs.readdirSync(jsonPath, { withFileTypes: true }).filter(dirent => dirent.isDirectory())
	.map(folder => folder.name);

for (const file of modalfs) {
	const filePath = path.join(modalsPath, file);
	const modal = require(filePath);
	client.modals.set(modal.name, modal);
}

// Modal Folder
for (const fileName of modalfolders) {
	const folderPath = path.join(modalsPath, fileName);
	const subModals = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
	const collection = new Collection();
	client.modals.set(fileName, collection);
	for (const subFile of subModals) {
		const filePath = path.join(folderPath, subFile);
		const modal = require(filePath);
		client.modals.get(fileName).set(modal.name, modal);
	}
}

// Json Folder
for (const fileName of jsonfolders) {
	const folderPath = path.join(jsonPath, fileName);
	const subJsons = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));
	const collection = new Collection();
	client.jsondata.set(fileName, collection);
	for (const subFile of subJsons) {
		// console.log(subFile);
		// console.log(folderPath);
		const filePath = path.join(folderPath, subFile);
		// console.log(filePath);
		const data = require(filePath);
		// console.log(data);
		client.jsondata.get(fileName).set(data.name, data);
	}
}

// Begin Client Information
client.once('ready', () => {
	console.log('Ready!');
});

client.on('guildMemberAdd', async join => {
	console.log(join.id);
	// join.
});

// Add client commands or something
client.on('interactionCreate', async interaction => {

	try {
		console.log('ID: ' + interaction.customId);
	}
	catch (error) {
		console.log(error);
	}

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

		if (idArray[0] == 'classEntry') {
			const classData = client.jsondata.get('classes').get(idArray[1]);
			console.log('class data');
			console.log(classData);
			const selection = new MessageActionRow()
				.addComponents([ new MessageSelectMenu()
					.setCustomId('classSelector')
					.setPlaceholder('Pick an Advanced Class!')
					.addOptions(
						classData.classes,
					),
				]);
			await interaction.update({ content: 'Pick your class!', components: [selection] });
		}
		else {
			console.log(idArray[0]);
			const button = client.modals.get(idArray[0]);

			/* client.modals.get(button);
		if (idArray.length > 1) {
			button = button.get(idArray[1]);
		}*/

			console.log(button);

			try {
				await button.execute(interaction);
			}
			catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error executing this command', ephemeral: true });
			}
		}
	}
	else if (interaction.isModalSubmit()) {

		// TODO: HANDLE FOR GREATER THAN 5 BUTTONS!
		if (interaction.customId == 'infoEntry') {
			const charName = interaction.fields.getTextInputValue('charName');

			const charStatus = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('charStatus')
						.setPlaceholder('Nothing selected')
						.addOptions([
							{
								label: 'Main',
								description: 'The character you are entering is your main',
								value:'main',
							},
							{
								label: 'Alt',
								description: 'The character you are entering is an alt',
								value:'alt',
							},
						]),
				);
			const message = 'Hello, ' + charName + ', please choose if you are a main or an alt!';
			console.log(message);

			client.userData.set(interaction.user.id, {
				name: charName,
			});

			executeSelect(interaction, charStatus, message);
		}
		else {
			await interaction.update({ content: 'You\'re done! Enjoy your time in Revel.', components: [] });
		}
	}
});

client.login(token);

async function initDB() {
	try {
		await database.connect();
		console.log('Connected to database: ' + database);
	}
	catch (error) {
		console.log(error);
	}
}

async function executeSelect(interaction, charStatus, message) {
	try {
		const filter = i => {
			// i.deferUpdate();
			return i.user.id === interaction.user.id;
		};
		// console.log(buttonRow);
		const msgResult = await interaction.update({ content: message, components: [charStatus], fetchReply: true });

		const collector = msgResult.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 15000, max: 1 });

		collector.on('collect', async interact => {
			const componentButtons = [];
			console.log(client.jsondata);
			for (const classFile of client.jsondata.get('classes')) {
				const gameClass = classFile[1];
				componentButtons.push(
					new MessageButton()
						.setCustomId('classEntry.' + gameClass.name)
						.setLabel(gameClass.button)
						.setStyle('PRIMARY'));
			}
			console.log('done!');
			console.log(componentButtons);
			const classActionRow = new MessageActionRow().addComponents(componentButtons);

			// await interact.deferUpdate();
			await interact.update({ content: 'Great!', components: [classActionRow] });
		});

		collector.on('end', async (interact) => {

			const finalInteraction = interact.get(interact.firstKey());

			client.userData.get(interaction.user.id)['charStatus'] = finalInteraction.values[0];

			console.log('data');
			console.log(client.userData.get(interaction.user.id));

		});
	}
	catch (error) {
		console.log(error);
	}
}