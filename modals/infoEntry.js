const { MessageActionRow, Modal, TextInputComponent, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'infoEntry',
	async execute(interaction) {
		const charModal = new Modal()
			.setCustomId('infoEntry')
			.setTitle('Basic Character Information');

		const nameInput = new TextInputComponent()
			.setCustomId('charName')
			.setLabel('Enter your character\'s name')
			.setStyle('SHORT');

		const statusSelect = new MessageSelectMenu()
			.setCustomId('charStatus')
			.setPlaceholder('Nothing selected')
			.addOptions([
				{
					label: 'Main',
					description: 'The character you are entering is your Main',
					value:'main',
				},
				{
					label: 'Alt',
					description: 'The character you are entering is an ALT',
					value:'alt',
				},
			]);

		const nameInputRow = new MessageActionRow().addComponents(nameInput);
		const secondActionRow = new MessageActionRow().addComponents(statusSelect);

		charModal.addComponents(nameInputRow, secondActionRow);
		await interaction.showModal(charModal);

		return;
	},
};