const { MessageActionRow, Modal, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'martialartist',
	button: 'Martial Artist',
	async execute(interaction) {
		const charModal = new Modal()
			.setCustomId('charInput2')
			.setTitle('Character Modal');

		const classSelect = new MessageSelectMenu()
			.setCustomId('classInput')
			.setPlaceholder('No class selected')
			.addOptions([
				{
					label: 'Soulfist',
					description: 'Best class!',
					value:'soulfist',
				},
				{
					label: 'Wardancer',
					description: 'Wardancer!',
					value:'wardancer',
				},
				{
					label: 'Scrapper',
					description: 'Scrapper!',
					value:'scrapper',
				},
				{
					label: 'Glavier',
					description: 'Glavier!',
					value:'glavier',
				},
				{
					label: 'Striker',
					description: 'Bolington!',
					value:'striker',
				},
			]);

		const classActionRow = new MessageActionRow().addComponents(classSelect);
		charModal.addComponents(classActionRow);

		await interaction.showModal(charModal);

		return;
	},
};