const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('character')
		.setDescription('Enter your character\'s information.'),
	async execute(interaction) {
		const message = 'Hello! Welcome to the revel server! Please press the below button to begin entering your character information.';
		const buttonRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('infoEntry')
					.setLabel('Get Started!')
					.setStyle('PRIMARY'),
			);

		await interaction.reply({ content: message, components: [buttonRow], ephemeral: true });
	},
};