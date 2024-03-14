const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder
} = require('discord.js');
const fs = require('fs')

module.exports = {
    name: 'mzadc',
    data: new SlashCommandBuilder()
        .setName('mzadc')
        .setDescription('إلغاء المزاد'),
    /**
     * @param {CommandInteraction}  interaction
     * @param {Client} client
     */
    async execute(client, config, interaction) {
        try {
            const isadmin = interaction.member.roles.cache.some(role => config?.adminrolesid.includes(role.id))
            if(!isadmin && !interaction.member.permissions.has('Administrator')) return;
            if (typeof msg === 'undefined')return await interaction.reply({content:`لايوجد مزاد حتى اللآن` , ephemeral:true})

                const database = 'mzaddata.json';
                if (fs.existsSync(database)) {
                    fs.readFile(database, 'utf8', async (err, fileData) => {
                        try {
                            const data = JSON.parse(fileData);
                            if(data['ison'] === false) return interaction.reply({content:`لايوجد مزاد حتى اللآن` , ephemeral:true})
                            try { await msg.delete() } catch (error) { console.log(error) }
                            if (err) return console.error(err);
                            data['ison'] = false
                            fs.writeFileSync(database, JSON.stringify(data))
                            rp = await interaction.reply({content:`تم إلغاء المزاد`})
                        }catch(err){
                            console.log(err)
                            try { return interaction.reply({content:`لايوجد مزاد حتى اللآن` , ephemeral:true}) } catch (error) { console.log(error) }
                        }
                    })
                }
                setTimeout(async() => {
                    try {
                        await rp.delete()
                    } catch (error) { console.log(error) }
                }, 10000);
        } catch (error) {
            console.error(error);
        };
    }
};