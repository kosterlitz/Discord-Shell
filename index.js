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
		}
	},
	dm: {
		id: null,
		recipient: null
	}
};

client.on('ready', () => {
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
	
	vorpal.delimiter(`[#${current.guild.channel.name}]> `).show();
	loadCommands();
});

client.on('message', (msg) => {	

	if (msg.channel === Discord.DMChannel) {
		objAssignDeep(this.current.dm, { id: `${msg.channel.id}`, recipient: `${msg.channel.recipient}` });
		vorpal.ui.input(`${chalk.yellow('[DM]')} @${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`);
	}

	//Display other users messages.
	if (msg.guild.id === current.guild.id && msg.channel.id === current.guild.channel.id) {
		vorpal.ui.input(`[#${chalk.blue(msg.channel.name)}] @${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`);
	}
});

client.login(config.token);

function sendMessage(msg, current) {
	client.channels.get(this.current.guild.channel.id).sendMessage(msg);
}

function sendCode(code, syntax, current) {
	client.channels.get(this.current.guild.channel.id).sendCode(syntax, code);
}

function loadCommands() {
	vorpal
		.command('setserver', 'Sets the current guild.')
		.autocomplete(client.guilds.array)
		.action(function(args, callback) {
			if (args.length >= 2) {
				this.log(`Too many arguments!`);
				callback();
			} else {
				if (client.guilds.exists(args[0])) {
					this.log(`Connecting to ${args[0]}...`);
					current.guild.name = `${args[0]}`;
					current.guild.id = `${client.guilds.find('name', args[0]).id}`;
				} else {
					this.log(`Invalid guild: \'${args[0]}\'.`);
				}
				callback();
			}
		});

	vorpal
		.command('setchannel', 'Sets the current channel.')
		.autocomplete(client.guilds.get(current.guild.id).channels.array)
		.action(function(args, callback) {
			if (args.length >= 2) {
				this.log(`Too many arguments!`);
				callback();
			} else {
				if (client.guilds.find('id', current.guild.id).channels.exists(args[0])) {
					this.log(`Moving to #${args[0]}`);
					current.guild.channel.name = `${args[0]}`;
					current.guild.channel.id = `${client.guilds.find('id', current.guild.id).channels.find('name', args[0]).id}`;
				} else {
					this.log(`Invalid channel!`);
				}
				callback();
			}
		});

	vorpal
		.command('say', 'Says a message in the current channel.')
		.autocomplete(['s', 'say'])
		.action(function(args, callback) {
			if (args.length === 0) {
				callback();
			} else {
				sendMessage(args.join(' '), current);
			}
		});
}