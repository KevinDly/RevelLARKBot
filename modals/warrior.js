const { MessageActionRow, MessageButton, Modal, TextInputComponent, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'warrior',
	async execute(interaction) {
		const charModal = new Modal()
			.setCustomId('charInput2')
			.setTitle('Character Modal');

		const classSelect = new MessageSelectMenu()
			.setCustomId('classInput')
			.setPlaceholder('No class selected')
			.addOptions([
				{
					label: 'Paladin',
					description: 'Paladin!',
					value:'paladin',
				},
				{
					label: 'Berserker',
					description: 'Berserker!',
					value:'berserker',
				},
				{
					label: 'Destroyer',
					description: 'Destroyer!',
					value:'destroyer',
				},
				{
					label: 'Gunlancer',
					description: 'Gunlancer!',
					value:'gunlancer',
				},
			]);

		const classActionRow = new MessageActionRow().addComponents(classSelect);
		charModal.addComponents(classActionRow);

		await interaction.showModal(charModal);

		return;
	},
};