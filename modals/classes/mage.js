const { MessageActionRow, Modal, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'mage',
	button: 'Mage',
	async execute(interaction) {
		const charModal = new Modal()
			.setCustomId('charInput2')
			.setTitle('Character Modal');

		const classSelect = new MessageSelectMenu()
			.setCustomId('classInput')
			.setPlaceholder('No class selected')
			.addOptions([
				{
					label: 'Sorceress',
					description: 'Sorceress!',
					value:'sorceress',
				},
				{
					label: 'Bard',
					description: 'Bard!',
					value:'bard',
				},
				{
					label: 'Arcanist',
					description: 'Arcana!',
					value:'arcanist',
				},
			]);

		const classActionRow = new MessageActionRow().addComponents(classSelect);
		charModal.addComponents(classActionRow);

		await interaction.showModal(charModal);

		return;
	},
};