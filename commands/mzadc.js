const {
    SlashCommandBuilder,
    CommandInteraction,
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
            if (!isadmin && !interaction.member.permissions.has('Administrator')) return;
            if (typeof msg === 'undefined') return await interaction.reply({ content: `لايوجد مزاد حتى اللآن`, ephemeral: true })
            const database = 'mzaddata.json';
            if (fs.existsSync(database)) {
                fs.readFile(database, 'utf8', async (err, fileData) => {
                    try {
                        if (err) return console.error(err);
                        const data = JSON.parse(fileData);
                        if (data['ison'] === false) return interaction.reply({ content: `لايوجد مزاد حتى اللآن`, ephemeral: true })
                        try { await msg.delete() } catch (error) { console.log(error) }
                        try { await pmsg.delete() } catch (error) { console.log(error) }
                        const users = Object.values(data).filter(user => typeof user === 'object' && user.userid);
                        const channel = interaction.guild.channels.cache.get(config.channelid)
                        users.sort((a, b) => b.coins - a.coins);
                        let i = 0
                        // users.forEach(user => {
                        //     i += 2
                        //     if(data.total <= 0)return;
                        //     if(data[user.userid].isout === true) return
                        //     setTimeout(() => {
                        //         if (channel) channel.send(`${user.userid}:${user.coins}`)
                        //     }, `${i}000`);
                        // })
                        fs.writeFileSync(database, '{"ison":false}')
                        rp = await interaction.reply({ content: `تم إلغاء المزاد` })
                    } catch (err) {
                        console.log(err)
                        try { return interaction.reply({ content: `لايوجد مزاد حتى اللآن`, ephemeral: true }) } catch (error) { console.log(error) }
                    }
                })
            }
            setTimeout(async () => {
                try {
                    await rp.delete()
                } catch (error) { console.log(error) }
            }, 10000);
        } catch (error) { console.error(error) }
    }
};
