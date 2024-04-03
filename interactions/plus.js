const { ButtonInteraction } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const { EconomyManager } = require('quick.eco');
const eco = new EconomyManager({
  adapter: 'sqlite',
  adapterOptions: { filename: config.ecoDatabase },
});
// const { QuickDB } = require('quick.db');
// const ec = new QuickDB({ filePath: 'database/sqlite/mzad/ec.sqlite' });
let cooldown = false;
let test
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
      }, 1500);
      const check = await eco.fetchMoney(interaction.user.id)
      // const check = await ec.get(`Economy_${interaction.guild.id}_${interaction.user.id}.money`);
      if (typeof pr === 'undefined')
        return interaction.reply({ content: `حدث خطأ`, ephemeral: true });
      if (typeof sa === 'undefined')
        return interaction.reply({ content: `حدث خطأ`, ephemeral: true });
      if (interaction.user.id === sa.id)
        return interaction.reply({
          content: `لايمكنك المزايدة على سلعتك`,
          ephemeral: true,
        })

      const database = 'database/mzad/mzaddata.json';
      if (fs.existsSync(database)) {
        const data = JSON.parse(fs.readFileSync(database, 'utf-8'));
        if (data[interaction.user.id]?.isout === true)
          return await interaction.reply({
            content: `لقد انسحبت`,
            ephemeral: true,
          });
        if (data['total'] + pr > check)
          return interaction.reply({
            content: `ليس لديك مبلغ كافي`,
            ephemeral: true,
          });

        if (interaction.user.id === data['winer'])
          return await interaction.reply({
            content: `يجب ان يقوم شخص اخر بالمزايدة`,
            ephemeral: true,
          });
        let test1 = data['total'] + pr - data[interaction.user.id]?.coins
        if (check < pr || check === 0 || check - test1 < 0) return interaction.reply({ content: 'ليس لديك مبلغ كافي', ephemeral: true });
        try { await pmsg.delete() } catch (error) { console.log(error) }
        if (!data['total']) { data['total'] = pr } else { data['total'] += pr }
        data['winer'] = interaction.user.id;
        if (data[interaction.user.id]) {
          test = data['total'] - data[interaction.user.id].coins
          data[interaction.user.id].coins += test;
          // data[interaction.user.id].coins = data['total'];
        } else {
          data[interaction.user.id] = {
            userid: interaction.user.id,
            coins: data['total'],
            isout: false,
          }
          test = data['total']
        }
        fs.writeFileSync(database, JSON.stringify(data));
        pmsg = await interaction.reply(
          `قام <@${interaction.user.id}> بالمزايدة على المبلغ, ${data['total']}`
        )
        // const channel = interaction.guild.channels.cache.get(
        //   config.channelid
        // )
        // await ec.sub(
        //   `Economy_${interaction.guild.id}_${interaction.user.id}.money`,
        //   parseInt(test)
        // )
        // if (channel) channel.send(`${interaction.user.id}:-${test}`);
      }
    } catch (error) {
      console.error(error);
    }
  },
}
