// Require the necessary discord.js classes
// TODO: Move strings to a seperate file
// TODO: Seperate the class data to seperate files.
// TODO: Move the different interactions to different files.
const { Client, Intents, Collection } = require('discord.js');
const { MongoClient } = require('mongodb');
const { token, uri } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const wait = require('node:timers/promises').setTimeout;

const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { waitForDebugger } = require('node:inspector');

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

		// TODO: HANDLE FOR GREATER THAN 5 BUTTONS!
		if (interaction.customId == 'infoEntry') {
			const charName = interaction.fields.getTextInputValue('charName');
			// const charStatus = interaction.fields.getField('charStatus').value;

			// const classes = client.modals.get('classes');
			// console.log(interaction.fields);
			// console.log(charName + ' is a ' + charStatus);

			/* const buttonRow = new MessageActionRow();
			for (const gameClass of classes.keys()) {
				console.log(gameClass);
				buttonRow.addComponents(new MessageButton()
					.setCustomId('classes.' + gameClass)
					.setLabel(classes.get(gameClass).button)
					.setStyle('PRIMARY'));
			} */

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
			// const collector = interaction.message.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 15000, max: 1 });

			/* const filter = i => {
				i.deferUpdate();
				return i.user.id === interaction.user.id;
			};
			// console.log(buttonRow);
			const msgResult = await interaction.update({ content: message, components: [charStatus] });

			console.log(msgResult);
			msgResult.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
				.then(interact => {
					client.userData.get(interaction.user.id)['charStatus'] = interact.values[0];
					console.log(client.userData.get(interaction.user.id));
					interact.update('Nice');
				})
				.catch(err => console.log('No interactions...'));*/


		}
		else {
			await interaction.update({ content: 'You\'re done! Enjoy your time in Revel.', components: [] });
		}
	}
	else if (interaction.isSelectMenu) {
		// console.log(client.userData.get(interaction.user.id));
	}
	// if(interaction.commandName == '')
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
			i.deferUpdate();
			return i.user.id === interaction.user.id;
		};
		// console.log(buttonRow);
		const msgResult = await interaction.update({ content: message, components: [charStatus], fetchReply: true });

		const collector = msgResult.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 15000, max: 1 });

		collector.on('collect', async interact => {
			await interact.update({ content: 'Great!', components: [] });
		});

		collector.on('end', async (interact) => {
			// interact.get(interact.keys().next().value)
			// console.log(interact);
			const finalInteraction = interact.get(interact.firstKey());
			// console.log('ended');
			// console.log(interact.get(interact.firstKey()).values[0]);
			client.userData.get(interaction.user.id)['charStatus'] = finalInteraction.values[0];

			console.log('data');
			console.log(client.userData.get(interaction.user.id));
			/* await interact.deferUpdate();
			await interact.wait(1000);
			await interact.update('Nice'); */
		});
		/* console.log(msgResult);
		msgResult.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
			.then(async interact => {
				client.userData.get(interaction.user.id)['charStatus'] = interact.values[0];
				console.log(client.userData.get(interaction.user.id));

				await interact.deferUpdate(1000);
				await wait(1000);
				await interact.update('Nice');
			})
			.catch(err => console.log(err)); */
	}
	catch (error) {
		console.log(error);
	}
}