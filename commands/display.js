const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

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
			const charData = client.userData.get(interaction.user.id);

			const name = charData['name'];
			const charClass = charData['class'];
			const charStatus = charData['charStatus'];

			messageEmbed.addField('Character Name', name, true);
			messageEmbed.addField('Class', charClass, true);
			messageEmbed.addField('Main or Alt', charStatus, true);
		}
		catch (err) {
			console.log(err);
			message = 'You do not have character information yet! Type /character to enter your information.';
			messageEmbed.setDescription(message);
			messageEmbed.setTitle('Error');
		}

		await interaction.reply({ embeds: [messageEmbed], ephemeral: true });
	},
};