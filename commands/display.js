const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow,  MessageSelectMenu } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('display')
		.setDescription('Display your character\'s information.'),
	async execute(interaction) {
		const client = interaction.client;

		const messageEmbed = new MessageEmbed()
			.setColor('#00000')
			.setTitle('Character Information')
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() });
		let message = '';
		try {

			console.log('id: ' + interaction.user.id);
			const userId = `${interaction.user.id}`;
			const charArray = client.userData[userId]['classes'];

			// TODO: Change this into something that takes each object from data
			// and turns it into an array appropriate for the selection
			// formatting below
			/* {
				label: ''
				description: ''
				value: ''
			} */
			console.log('data: ' + client.userData);
			const charData = charArray[0];
			console.log(charArray[0]);
			const name = charData['name'];
			const charClass = charData['class'];
			const charStatus = charData['status'];

			messageEmbed.addField('Character Name', name, true);
			messageEmbed.addField('Class', charClass, true);
			messageEmbed.addField('Main or Alt', charStatus, true);

			const selection = new MessageActionRow()
				.addComponents([ new MessageSelectMenu()
					.setCustomId(`userDisplaySelector.${interaction.user.id}`)
					.setPlaceholder('Pick an Advanced Class!')
					.addOptions([
						{
							'label': 'Test',
							'description': 'Test',
							'value': 'Test',
						},
					]),
				]);

			await interaction.reply({ embeds: [messageEmbed], ephemeral: true, components: [selection] });

		}
		catch (err) {
			console.log(err);
			message = 'You do not have character information yet! Type /character to enter your information.';
			messageEmbed.setDescription(message);
			messageEmbed.setTitle('Error');
			await interaction.reply({ embeds: [messageEmbed], ephemeral: true });
		}

		// TODO: Add selection component to this that contains all the user's classes
		// When the user selects a new character, it switches out the info on the embed.
	},
};