const { ButtonInteraction } = require('discord.js');
const fs = require('fs')
let cooldown = false;

module.exports = {
    name: 'out',
    /**
     * @param {ButtonInteraction} interaction
     * @param {Client} client
     */
    async execute(client, config, interaction) {
        try {
            if (cooldown) return;
            cooldown = true;
            setTimeout(() => {
                cooldown = false;
            }, 1000);                                                                                                                                           
            const database = 'mzaddata.json';
            if (fs.existsSync(database)) {
                const data = JSON.parse(fs.readFileSync(database, 'utf-8'));

                if (data[interaction.user.id]?.isout === true ) return await interaction.reply({content:`لقد انسحبت` , ephemeral:true})
                if (data[interaction.user.id]) {
                    if(interaction.user.id === data['winer']){
                        data['total'] -= data[interaction.user.id].coins
                        data['winer'] = ""
                        data[interaction.user.id].isout = true                                                                                                                                           
                        fs.writeFileSync(database, JSON.stringify(data, null, 2))
                        await interaction.reply({content:`انسحب <@${interaction.user.id}> من المزاد ${data['total']}`})
                    }else{                                                                                                                                           
                        return await interaction.reply({content:`يجب ان تقوم بالمزايدة` , ephemeral:true})
                    }                                                                                                                                           
                } else {
                    await interaction.reply({content:`يجب ان تقوم بالمزايدة` , ephemeral:true})
                }
            }
        } catch (error) { console.error(error) }
    },
};