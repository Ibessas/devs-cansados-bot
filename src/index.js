const fs = require('fs')
const { Client, Intents, Collection } = require('discord.js')
const { botToken, guildId } = require('./config') // TODO: change the guildId to DevsCansados Id

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

client.commands = new Collection()

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

client.once('ready', async () => {
  console.log('Ready!')
  const filter = message => message.content.includes('discord') // TODO: create message filter
  const guild = await client.guilds.fetch(guildId)
  guild.channels.cache.each(channel => {
    if (channel.type === 'GUILD_TEXT') {
      const collector = channel.createMessageCollector({ filter })
      collector.on('collect', message => {
        message.channel.send('VOCÊ NÃO PODE MANDAR ISSO SEU COISA')
        message.delete()
      })
    }
  })
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  const command = client.commands.get(interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
  }
})

client.login(botToken)

module.exports = client
