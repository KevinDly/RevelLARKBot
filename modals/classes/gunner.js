const { MessageActionRow, Modal, MessageSelectMenu } = require('discord.js');

module.exports = {
	name: 'gunner',
	button: 'Gunner',
	async execute(interaction) {
		const charModal = new Modal()
			.setCustomId('charInput2')
			.setTitle('Character Modal');

		const classSelect = new MessageSelectMenu()
			.setCustomId('classInput')
			.setPlaceholder('No class selected')
			.addOptions([
				{
					label: 'Gunslinger',
					description: 'Gunslinger!',
					value:'gunslinger',
				},
				{
					label: 'Artillerist',
					description: 'Artillerist!',
					value:'artillerist',
				},
				{
					label: 'Deadeye',
					description: 'Deadeye!',
					value:'deadeye',
				},
				{
					label: 'Sharpshooter',
					description: 'Sharpshooter!',
					value:'sharpshooter',
				},
			]);

		const classActionRow = new MessageActionRow().addComponents(classSelect);
		charModal.addComponents(classActionRow);

		await interaction.showModal(charModal);

		return;
	},
};