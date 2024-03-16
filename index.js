const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
} = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const { EconomyManager } = require('quick.eco');
const eco = new EconomyManager({
  adapter: 'sqlite',
  adapterOptions: { filename: config.ecoDatabase },
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.interactions = new Collection();
const commands = [];
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
  commands.push(command.data);
}

const interactionsFiles = fs
  .readdirSync('./interactions')
  .filter((file) => file.endsWith('.js'));
for (const file of interactionsFiles) {
  const interaction = require(`./interactions/${file}`);
  client.interactions.set(interaction.name, interaction);
}

const rest = new REST().setToken(config.token);

client.once('ready', async (bot) => {
  await rest.put(Routes.applicationCommands(client.user.id), {
    body: commands,
  });
  console.log(`${bot.user.tag} is Ready`);
  const database = 'mzaddata.json';
  if (fs.existsSync(database)) {
    fs.writeFileSync(database, '{}');
  }

  console.log(await ec.all());
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand()) {
      const commandsRunner = client.commands.get(interaction.commandName);
      commandsRunner.execute(client, config, interaction);
    }
    if (
      !interaction.isStringSelectMenu() &&
      !interaction.isButton() &&
      !interaction.isModalSubmit()
    )
      return;

    const interactionRun = client.interactions.get(
      interaction.customId.split('*')[0]
    );

    if (interactionRun) interactionRun.execute(client, config, interaction);
  } catch (error) {
    console.log(error);
  }
});
client.login(config.token);
