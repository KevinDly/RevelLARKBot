// Require the necessary discord.js classes
// TODO: Move strings to a seperate file
// TODO: Seperate the class data to seperate files.
// TODO: Move the different interactions to different files.
const { Client, Intents, Collection } = require('discord.js');
const { MongoClient } = require('mongodb');
const { token, uri, db_name, db_user } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { waitForDebugger } = require('node:inspector');
const { isContextMenuApplicationCommandInteraction } = require('discord-api-types/utils/v10');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const database = new MongoClient(uri);

// Load Database
initDB().then(() => initData());

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
		const filePath = path.join(folderPath, subFile);
		const data = require(filePath);
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
					.setCustomId(`classSelector.${idArray[2]}.${idArray[3]}`)
					.setPlaceholder('Pick an Advanced Class!')
					.addOptions(
						classData.classes,
					),
				]);

			executeAdvSelect(interaction, selection, 'Pick your class!');
			// await interaction.update({ content: 'Pick your class!', components: [selection] });
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
						.setCustomId('charStatus.' + charName)
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

			/* client.userData.set(interaction.user.id, {
				name: charName,
			}); */

			executeClassSelect(interaction, charStatus, message);
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
		initDB();
	}
}

async function initData() {
	try {
		// const datafromDB = [];
		const dbo = database.db(db_name);
		console.log('Writing data from cloud into local memory.');

		dbo.collection(db_user).find({}).toArray(function(err, res) {
			// console.log(res);
			for (const doc of res) {
				const userId = doc['_id'];
				/* const document = {
					classes: doc['classes'],
				}; */
				// console.log(doc);
				// console.log(doc['classes']);
				client.userData[userId] = {
					classes: doc['classes'],
				};
			}
		});
		// console.log(`userData: ${client.userData}`);
	}
	catch (error) {
		console.log(error);
	}
}

// Final function of character entry
// TODO: Move to own file
async function executeAdvSelect(interaction, charStatus, message) {
	try {
		const filter = i => {

			return i.user.id === interaction.user.id;
		};

		const idArray = interaction.customId.split('.');
		const msgResult = await interaction.update({ content: message, components: [charStatus], fetchReply: true });

		const collector = msgResult.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 15000, max: 1 });

		collector.on('collect', async interact => {
			console.log('Collected adv class');
			await interact.update({ content: 'You\'re all done, welcome!', components: [] });
		});

		collector.on('end', async interact => {
			console.log('Ended data collection');
			const finalInteraction = interact.get(interact.firstKey());

			console.log(idArray);
			const dbo = database.db(db_name);
			const userId = `${interaction.user.id}`;
			const idObj = { '_id': userId };
			const userObj = {
				name: idArray[2],
				status: idArray[3],
				class: finalInteraction.values[0],
			};

			// If the id is not in the local database
			if (!(userId in client.userData)) {
				client.userData[userId] = {};
			}

			if (!('classes' in client.userData[userId])) {
				// If the key classes does not exist for the id in the local database
				const classArray = [];
				classArray.push(userObj);
				client.userData[userId]['classes'] = classArray;
			}
			else {
				// If it does
				client.userData[userId]['classes'].push(userObj);
			}

			console.log('data');
			console.log(client.userData[userId]);
			dbo.collection(db_user).findOne(idObj, function(err, res) {
				if (err) throw err;

				if (!res) {
					// If the ID does not have the key 'classes' in the cloud database
					idObj['classes'] = [userObj];
					dbo.collection(db_user).insertOne(idObj, function(err, res) {
						console.log('Inserted');
					});
				}
				else {
					// If the ID has the key 'classes' in the cloud database
					const classArr = res ? res['classes'] : [];
					console.log(`ClassArr ${classArr}`);
					classArr.push(userObj);
					const newValues = { $set: { classes:classArr } };

					dbo.collection(db_user).updateOne({ '_id': `${interaction.user.id}` }, newValues, function(err, res) {
						if (err) throw err;
						console.log('Updated');
						console.log(res);
					});
				}
			});

		});
	}
	catch (err) {
		console.log(err);
	}
}

// TODO: Move to own file
async function executeClassSelect(interaction, charStatus, message) {
	try {
		const filter = i => {
			// i.deferUpdate();
			return i.user.id === interaction.user.id;
		};
		// console.log(buttonRow);
		const msgResult = await interaction.update({ content: message, components: [charStatus], fetchReply: true });

		const collector = msgResult.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 15000, max: 1 });

		// const idArray = interaction.customId.split('.');

		// console.log('Array');
		// console.log(idArray);
		collector.on('collect', async interact => {
			const componentButtons = [];
			console.log(client.jsondata);
			// const finalInteraction = interact.get();

			// console.log('Interaction');
			// console.log(interact.values[0]);
			console.log(`objectid: classEntry.${interaction.fields.getTextInputValue('charName')}.${interact.values[0]}`);
			for (const classFile of client.jsondata.get('classes')) {
				const gameClass = classFile[1];
				componentButtons.push(
					new MessageButton()
						.setCustomId(`classEntry.${gameClass.name}.${interaction.fields.getTextInputValue('charName')}.${interact.values[0]}`)
						.setLabel(gameClass.button)
						.setStyle('PRIMARY'));
			}
			// console.log('done!');
			// console.log(componentButtons);
			const classActionRow = new MessageActionRow().addComponents(componentButtons);

			await interact.update({ content: 'Great!', components: [classActionRow] });
		});
	}
	catch (error) {
		console.log(error);
	}
}

// Converts an object id to a collection
// ids: A list of additional ids
// data: The data attached to the id
function idToObject(id) {
	const idArray = id.split('.');
	const collectedId = {
		ids: [],
		data: {},
	};

	for (const word in idArray) {
		if (word.includes(':')) {
			const pair = word.split(':');
			collectedId['data'][pair[0]] = pair[1];
		}
		else {
			collectedId['ids'].push(word);
		}
	}

	return collectedId;
}