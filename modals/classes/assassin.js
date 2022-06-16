const { MessageActionRow, Modal, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'assassin',
	button: 'Assassin',
	async execute(interaction) {
		const charModal = new Modal()
			.setCustomId('charInput2')
			.setTitle('Character Modal');

		const classSelect = new MessageSelectMenu()
			.setCustomId('classInput')
			.setPlaceholder('No class selected')
			.addOptions([
				{
					label: 'Shadowhunter',
					description: 'Shadowhunter!',
					value:'shadowhunter',
				},
				{
					label: 'Deathblade',
					description: 'Deathblade!',
					value:'deathblade',
				},
			]);

		const classActionRow = new MessageActionRow().addComponents(classSelect);
		charModal.addComponents(classActionRow);

		await interaction.showModal(charModal);

		return;
	},
};