const Discord = require('discord.js');
const config = require('./config.js');
const vorpal = require('vorpal')();
const chalk = require('chalk');
let objAssignDeep = require('object-assign-deep')
let client = new Discord.Client();

let current = {
	guild: {
		name: null,
		id: null,
		channel: {
			name: null,
			id: null
		},
		channels: []
	},
	guilds: [],
	dm: {
		id: null,
		recipient: null
	}
};

client.on('ready', (async () => {
	if (!client.guilds.get(config.defaultGuildID)) {
		return console.log(`config.defaultGuildID must be a valid Guild ID!`);
	}

	objAssignDeep(current.guild, {
		id: `${client.guilds.get(config.defaultGuildID).id}`,
		name: `${client.guilds.get(config.defaultGuildID).name}`,
		channel: {
			id: `${client.guilds.get(config.defaultGuildID).defaultChannel.id}`,
			name: `${client.guilds.get(config.defaultGuildID).defaultChannel.name}`,
		}
	});

	if (config.defaultChannelID) {
		if (client.guilds.get(config.defaultGuildID).channels.get(config.defaultChannelID)) {
			Object.assign(current.guild.channel, {
				name: `${client.guilds.get(config.defaultGuildID).channels.get(config.defaultChannelID).name}`,
				id: `${config.defaultChannelID}`
			});
		}
	}
	
	vorpal.delimiter(`[#${chalk.blue(current.guild.channel.name)}]> `).show();

	loadGuilds().then().catch(err => {
		vorpal.log(`Error while loading guilds!\n${err}`);
	})

	loadChannels().then().catch(err => {
		vorpal.log(`Error while loading channels!\n${err}`);
	});

	loadMutedChannels().then().catch(err => {
		vorpal.log(`Error while loading muted channels!\n${err}`);
	});

	loadCommands().then().catch(err => {
		vorpal.log(`Error while loading commands!\n${err}`);
	});

}));

client.on('message', (msg) => {	
	vorpal.delimiter(`[#${chalk.blue(current.guild.channel.name)}]> `).show();

	if (msg.channel === Discord.DMChannel) {
		objAssignDeep(this.current.dm, { id: `${msg.channel.id}`, recipient: `${msg.channel.recipient}` });
		vorpal.log(`${chalk.yellow('[DM]')} @${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`);
	}

	//Display other users messages.
	if (msg.guild.id === current.guild.id) {
		vorpal.log(`[#${chalk.blue(msg.channel.name)}] @${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`);
	}
});

client.login(config.token);

function sendMessage(msg) {
	if (msg) {
		client.channels.get(current.guild.channel.id).sendMessage(msg).then().catch(err => {
			vorpal.log(`${chalk.red('Failed to send message!')}\n${err.text}`);
		});
	}
}

function sendDM(msg) {
	if (msg) {
		client.channels.get(current.dm.id).sendMessage(msg).then().catch(err => {
			vorpal.log(`${chalk.red('Failed to send DM!')}\n${err.text}`);
		});
	}
}

function sendCode(code, syntax, current) {
	client.channels.get(current.guild.channel.id).sendCode(syntax, code);
}

async function loadCommands() {
	vorpal
		.command('setserver [servername]', 'Sets the current guild.')
		.autocomplete(current.guilds)
		.action(function(args, callback) {
			if (client.guilds.exists('name', args.servername)) {
				if (!client.guilds.find('name', args.servername).available) {
					this.log(`${args.servername} is currently unavailable.`);
				} else {
					this.log(`Connecting to ${args.servername}...`);
					current.guild.name = `${args.servername}`;
					current.guild.id = `${client.guilds.find('name', args.servername).id}`;
					current.guild.channel.name = `${client.guilds.find('name', args.servername).defaultChannel.name}`;
					current.guild.channel.id = `${client.guilds.find('name', args.servername).defaultChannel.id}`;
				}

			} else {
				this.log(`Invalid guild: \'${args.servername}\'.`);
			}
			callback();
		});

	vorpal
		.command('setchannel [channelname]', 'Sets the current channel.')
		.autocomplete(current.guild.channels)
		.action(function(args, callback) {
			if (client.guilds.find('id', current.guild.id).channels.exists('name', args.channelname)) {
				this.log(`Moving to #${args.channelname}`);
				current.guild.channel.name = `${args.channelname}`;
				current.guild.channel.id = `${client.guilds.find('id', current.guild.id).channels.find('name', args.channelname).id}`;
				vorpal.delimiter(`[#${chalk.blue(current.guild.channel.name)}]> `).show();
			} else {
				this.log(`Invalid channel!`);
			}
			callback();
		});

	vorpal
		.command('say [message...]', 'Says a message in the current channel.')
		.autocomplete(['s', 'say'])
		.action(function(args, callback) {
			if (args.message.length === 0) {
				callback();
			} else {
				sendMessage(args.message.join(' '));
				callback();
			}
		});
	
	vorpal
		.command(`reply [message...]`, `Responds to the last DM.`)
		.autocomplete(['r', 'R'])
		.action(function(args, callback) {
			if (!current.dm.id) {
				this.log(`There is no current DM.`);
			} else {

			}
		});
}

async function loadChannels() {
	current.guild.channels = [];
	client.guilds.get(current.guild.id).channels.map(function(channel) {
		current.guild.channels.push(channel.name);
	});
}

async function loadGuilds() {
	current.guilds = [];
	client.guilds.map(function(guild) {
		current.guilds.push(guild.name);
	});
}

async function loadMutedChannels() {

}