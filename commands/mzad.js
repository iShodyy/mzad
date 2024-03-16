const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder
} = require('discord.js');
const fs = require('fs')

const database = 'mzaddata.json';
let timeInMillis = 0;
let edit = false

module.exports = {
    name: 'mzad',
    data: new SlashCommandBuilder()
        .setName('mzad')
        .setDescription('بدأ المزاد')
        .addUserOption(option =>
            option.setName('صاحب_السلعة')
                .setDescription('صاحب السلعة لهذا المزاد')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('اسم_السلعة')
            .setDescription('اسم السلعة المقدمة للمزاد')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('مدة_السلعة')
            .setDescription('مدة انتهاء المزاد')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('مبلغ_المزايدة')
            .setDescription('اقل مبلغ للمزيادة')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('الصورة')
            .setDescription('رابط صورة للسلعة')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('الوصف')
            .setDescription('وصف للسلعة')),
    /**
     * @param {CommandInteraction}  interaction
     * @param {Client} client
     */
    async execute(client, config, interaction) {
        try {
            const isadmin = interaction.member.roles.cache.some(role => config?.adminrolesid.includes(role.id))
            if(!isadmin && !interaction.member.permissions.has('Administrator')) return;
            
            try {
                if (!fs.existsSync(database)) fs.writeFileSync(database, '{}')
                fs.readFile(database, 'utf8', async (err, fileData) => {
                    if (err) return console.error(err);
                    const data = JSON.parse(fileData);
                    if(data['ison'] === true) return await interaction.reply({content : `يجب انتظار انتهاء المزاد` , ephemeral:true})
                    if(!data['ison']){
                        data['ison'] = true
                        edit=false
                        fs.writeFileSync(database, JSON.stringify(data))
                    }
                })
            } catch (error) {
                console.log(error)
            }
                
            const suser = interaction.options.getUser('صاحب_السلعة');
            const name = interaction.options.getString('اسم_السلعة');
            const time = interaction.options.getString('مدة_السلعة');
            const plusM = interaction.options.getInteger('مبلغ_المزايدة');
            const pic = interaction.options.getString('الصورة');
            const des = interaction.options?.getString('الوصف');
            pr=plusM;
            sa=suser;

            if (time.toLowerCase().endsWith('m')) {
                timeInMillis = parseInt(time) * 60000;
            } else if (time.toLowerCase().endsWith('h')) {
                timeInMillis = parseInt(time) * 3600000;
            } else if (time.toLowerCase().endsWith('d')) {
                timeInMillis = parseInt(time) * 86400000;
            }else {
                await interaction.deferReply({ephemeral:true})
                await interaction.editReply(`يجب ان ينتهي الوقت ب \nm او h او d`)
                return
            }

            const createDiscordTimestamp = (timeString) => {
                const regex = /(\d+)([hms])/g;
                let totalMilliseconds = 0;
                let match;
                while ((match = regex.exec(timeString)) !== null) {
                    const value = parseInt(match[1]);
                    const unit = match[2];
                    
                    if (unit === 'h') {
                        totalMilliseconds += value * 3600 * 1000;
                    } else if (unit === 'm') {
                        totalMilliseconds += value * 60 * 1000;
                    } else if (unit === 's') {
                        totalMilliseconds += value * 1000;
                    }
                }
                return `<t:${Math.floor((Date.now() + totalMilliseconds) / 1000)}:R>`;
            }
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(`${name}`)
                .setThumbnail(suser.avatarURL())
                .setFields(
                    {name:` ` , value:` ` , inline:false},
                    {name:` ` , value:`${suser}` , inline:false},
                    {name:`مبلغ المزايدة :` , value:`${plusM}` , inline:true},
                    {name:`مدة المزاد :` , value:createDiscordTimestamp(time) , inline:true},
                    {name:` ` , value:` ` , inline:false},
                    {name:`${des||` `}` , value:` ` , inline:false},
                    {name:` ` , value:` ` , inline:false},
                    {name:`لمعرفة الرصيد المتوفر في حسابك اكتب رصيدي في <#1014604300846116904>` , value:` ` , inline:false},
                    {name:`وتستطيع معرفة طريقة جمع السيون من خلال كتابة ZCOIN في <#1014604300846116904>` , value:` ` , inline:false},
                )
                .setImage(pic)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('plus')
                            .setLabel('مزايدة')
                            .setStyle(ButtonStyle.Danger),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('out')
                            .setLabel('انسحاب')
                            .setStyle(ButtonStyle.Secondary)
                    );
                
                setTimeout(async() => {
                    try {
                        await interaction.deferReply()
                        msg = await interaction.editReply({ embeds: [embed], components: [row] })
                    } catch (error) {
                        console.log(error)
                    }
                }, 1000);
                here = await interaction.channel.send(`@here`)
                setTimeout(async() => {
                        await here.delete()
                }, 2000);
                
                setTimeout(async () => {
                    try {
                        await interaction.editReply({content:' '})
                        if (fs.existsSync(database)) {
                            fs.readFile(database, 'utf8', async (err, fileData) => {
                            if (err) return console.error(err);
                            const data = JSON.parse(fileData);
                            if (edit) return;
                            if(data['ison'] === false) return;
                            if (data['winer'] === ''){
                                const winer = Object.values(data).filter(user => typeof user === 'object' && user.userid && !user.isout);
                                winer.sort((a, b) => b.coins - a.coins);
                                if(winer.length < 0){
                                    data['winer'] = winer[0].userid
                                }
                            }
                            const users = Object.values(data).filter(user => typeof user === 'object' && user.userid);
                            const channel = interaction.guild.channels.cache.get(config.channelid)
                            users.sort((a, b) => b.coins - a.coins);
                            users.forEach(async user => {
                                if(user.userid === data['winer']){
                                    if (channel){
                                        await channel.send(`${user.userid}:${user.coins}`)
                                        setTimeout(async () => {
                                            if(data.total <= 0)return;
                                            await channel.send(`${user.userid}:-${data.total}`)
                                            setTimeout(async () => {
                                                if(data.total <= 0)return;
                                                await channel.send(`${suser.id}:${data.total}`)
                                            }, 2000);
                                        }, 2000);
                                    }
                                }else{
                                    if(data.total <= 0)return;
                                    if(data[user.userid].isout === true) return
                                    if (channel) await channel.send(`${user.userid}:${user.coins}`)
                                }
                            })
                            try {
                                embed.setColor('#313338')
                                embed.setFields(
                                    {name:` ` , value:` ` , inline:false},
                                    {name:` ` , value:`${suser}` , inline:false},
                                    {name:`مبلغ المزايدة :` , value:`${plusM}` , inline:true},
                                    {name:`مدة المزاد :` , value:`\`END\`` , inline:true},
                                    {name:` ` , value:` ` , inline:false},
                                    {name:`${des||` `}` , value:` ` , inline:false},
                                    {name:` ` , value:` ` , inline:false},
                                    {name:`لمعرفة الرصيد المتوفر في حسابك اكتب رصيدي في <#1014604300846116904>` , value:` ` , inline:false},
                                    {name:`وتستطيع معرفة طريقة جمع السيون من خلال كتابة ZCOIN في <#1014604300846116904>` , value:` ` , inline:false},)

                                    await interaction.editReply({ embeds: [embed], components: [] })
                                    if(data['winer'] && data['total'] > 0){
                                        await interaction.channel.send({ content:`> # انتهى المزاد بفور <@${data['winer']}> بسعر \`${data['total']}\`` })
                                    }else{
                                        await interaction.channel.send({ content:`> # انتهى الوقت ولم يشارك احد في المزاد` })
                                    }
                                    edit = true;
                                    setTimeout(() => {
                                        fs.writeFileSync(database, '{"ison":false}');
                                    }, 2000);
                                } catch (error) { console.log(error) }
                            })
                        }
                    } catch (error) { console.log(error) }
                }, timeInMillis)
            } catch (error) {
            console.error(error);
        };
    }
}
