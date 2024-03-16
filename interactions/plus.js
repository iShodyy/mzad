const { ButtonInteraction } = require('discord.js');
const fs = require('fs')
const config = require('../config.json');
const { EconomyManager } = require('quick.eco');
const eco = new EconomyManager({
  adapter: 'sqlite',
  adapterOptions: { filename: './sqlite/eco' },
});

let cooldown = false

module.exports = {
    name: 'plus',
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
            const check = await ec.get(`Economy_${interaction.guild.id}_${interaction.user.id}.money`);
            if (typeof pr === 'undefined')return interaction.reply({content:`حدث خطأ` , ephemeral:true})
            if (typeof sa === 'undefined')return interaction.reply({content:`حدث خطأ` , ephemeral:true})
            if(interaction.user.id === sa.id) return interaction.reply({content:`لايمكنك المزايدة على سلعتك` , ephemeral:true})
            if(check && check >= pr){
                 const database = 'mzaddata.json';
                if (fs.existsSync(database)) {
                    const data = JSON.parse(fs.readFileSync(database, 'utf-8'));
                    if (data[interaction.user.id]?.isout === true ) return await interaction.reply({content:`لقد انسحبت` , ephemeral:true})
                    if (data['total'] && data['total'] + pr > check) return interaction.reply({content:`ليس لديك مبلغ كافي` , ephemeral:true})

                    if(interaction.user.id === data['winer']) return await interaction.reply({content:`يجب ان يقوم شخص اخر بالمزايدة` , ephemeral:true})

                    if (data['total']) {
                        data['total'] += pr;
                        data['winer'] = interaction.user.id;
                    } else {
                        data['total'] = pr
                        data['winer'] = interaction.user.id;
                    }
                    if (data[interaction.user.id]) {
                        data[interaction.user.id].coins += pr
                    } else {
                        data[interaction.user.id] = {
                            "userid": interaction.user.id,
                            "coins": pr,
                            "isout":false
                        }
                    }

                    fs.writeFileSync(database, JSON.stringify(data))
                    await interaction.reply(`قام <@${interaction.user.id}> بالمزايدة على المبلغ, ${data['total']}`)
                    const channel = interaction.guild.channels.cache.get(config.channelid)
                    if (channel) channel.send(`${interaction.user.id}:-${pr}`)
                }
            }else{
                await interaction.deferReply({ephemeral:true})
                await interaction.editReply('ليس لديك مبلغ كافي')
            }
        } catch (error) {
            console.error(error);
        }
    },
};
