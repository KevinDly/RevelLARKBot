const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stink')
		.setDescription('You stink!'),
	async execute(interaction) {
		await interaction.reply({ content: interaction.member.user.toString() + ' stinks!' });
	},
};