const Discord = require('discord.js');
const config = require('./config.json');
const vorpal = require('vorpal')();
const chalk = require('chalk');
const PREFIX = config.prefix;
let objAssignDeep = require('object-assign-deep');
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
	},
	dms: [],
	mutedChannels: []
};

client.on('ready', () => {
	if (!client.guilds.get(config.defaultGuildID)) {
		vorpal.log(chalk.red(`config.defaultGuildID must be a valid Guild ID!`));
	} else {
		objAssignDeep(current.guild, {
			id: `${client.guilds.get(config.defaultGuildID).id}`,
			name: `${client.guilds.get(config.defaultGuildID).name}`,
			channel: {
				id: `${client.guilds.get(config.defaultGuildID).defaultChannel.id}`,
				name: `${client.guilds.get(config.defaultGuildID).defaultChannel.name}`
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

		loadGuilds();
		loadChannels();
		loadDMs();
		loadCommands();
		showPrefix();
	}
});

client.on('message', msg => {
	showPrefix();

	if (msg.channel === Discord.DMChannel) {
		objAssignDeep(current.dm,
			{
				id: `${msg.channel.id}`,
				recipient: `${msg.channel.recipient}`
			}
		);
		vorpal.log(`${chalk.yellow('[DM]')} @${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`);
	}

	//	Display other users messages.
	if (msg.guild.id === current.guild.id && current.mutedChannels.indexOf(msg.channel.name) !== -1) {
		vorpal.log(`[#${chalk.blue(msg.channel.name)}] @${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`); // eslint-disable-line max-len
	}
});

client.login(config.token);

function loadCommands() {
	/**
	 * 		Prefixed Commands.
	 */

	vorpal
		.command(`${PREFIX}setguild [guildname]`, 'Sets the current guild.')
		.autocomplete(current.guilds)
		.action((args, callback) => {
			let guild = args.guildname;
			if (client.guilds.exists('name', guild)) {
				if (!client.guilds.find('name', guild).available) {
					vorpal.log(chalk.yellow(`${guild} is currently unavailable.`));
				} else {
					vorpal.log(chalk.green(`Connecting to ${guild}...`));
					let _guild = client.guilds.get('name', guild);
					current.guild = {
						name: _guild.name,
						id: _guild.id,
						channel: {
							name: _guild.defaultChannel.name,
							id: _guild.defaultChannel.id
						}
					};
					current.mutedChannels = [];
				}
			} else {
				vorpal.log(chalk.red(`Invalid guild!`));
			}
			callback();
		});

	vorpal
		.command(`${PREFIX}setchannel [channelname]`, 'Sets the current channel.')
		.autocomplete(current.guild.channels)
		.action((args, callback) => {
			if (client.guilds.find('id', current.guild.id).channels.exists('name', args.channelname)) {
				vorpal.log(chalk.green(`Moving to #${args.channelname}`));
				current.guild.channel.name = `${args.channelname}`;
				current.guild.channel.id = `${client.guilds.find('id', current.guild.id).channels.find('name', args.channelname).id}`; // eslint-disable-line max-len
				showPrefix();
			} else {
				vorpal.log(chalk.red(`Invalid channel!`));
			}
			callback();
		});

	vorpal
		.command(`${PREFIX}reply [message...]`, `Responds to the last Direct Message.`)
		.action((args, callback) => {
			if (!current.dm.id) vorpal.log(chalk.red(`There is no current DM.`));
			else if (args.message.length === 0) vorpal.log(chalk.red('Invalid message!'));
			else sendDM(args.message.join(' '), current.dm.id);

			callback();
		});

	vorpal
		.command(`${PREFIX}dm [username] [message...]`, 'Sends a direct messsage to the given user.')
		.autocomplete(current.dms.map(dm => dm.id))
		.action((args, callback) => {
			if (current.dms.map(dm => dm.username).indexOf(args.username) === -1) vorpal.log(chalk.red('Invalid user!'));
			else sendDM(args.message.join(' '), current.dms.filter(dm => dm.username === args.username));

			callback();
		});

	vorpal
		.command(`${PREFIX}mute [channel]`, `Mutes the specified channel within this script.`)
		.autocomplete(current.guilds.channels)
		.action((args, callback) => {
			if (current.guilds.channels.indexOf(args.channel) === -1) {
				vorpal.log(chalk.red('Invalid channel!'));
			} else if (current.mutedChannels.indexOf(args.channel) !== -1) {
				vorpal.log(chalk.red('Channel is already muted!'));
			} else {
				current.mutedChannels.push(`${args.channel}`);
				vorpal.log('Muted channel!');
			}
			callback();
		});

	vorpal
		.command(`${PREFIX}unmute [channel]`, 'Unmutes the specified channel within this script.')
		.autocomplete(current.mutedChannels)
		.action((args, callback) => {
			if (current.mutedChannels.indexOf(args.channel) === -1) {
				vorpal.log(chalk.red('Channel is not muted!'));
			} else {
				current.mutedChannels.splice(current.mutedChannels.indexOf(args.channel), 1);
				vorpal.log('Unmuted Channel!');
			}
			callback();
		});

	vorpal
		.command(`${PREFIX}togglemute [channel]`, 'Toggles the mute status of the given channel within this script.')
		.autocomplete(current.guilds.channels)
		.action((args, callback) => {
			if (current.guilds.channels.indexOf(args.channel) === -1) {
				vorpal.log('Invalid channel!');
			} else if (current.mutedChannels.indexOf(args.channel) === -1) {
				current.mutedChannels.push(args.channel);
				vorpal.log('Muted channel!');
			} else {
				current.mutedChannels.splice(current.mutedChannels.indexOf(args.channel), 1);
				vorpal.log('Unmuted channel!');
			}
			callback();
		});

	vorpal
		.command(`${PREFIX}code [syntax] [code...]`, 'Sends a code block with the given syntax.')
		.autocomplete(config.syntax)
		.action((args, callback) => {
			if (config.syntax.indexOf(args.syntax) === -1) vorpal.log(chalk.red(`Invalid Syntax: '${args.syntax}'!`));
			else if (args.code.length === 0) vorpal.log(chalk.red('Invalid arguments!'));
			else sendCode(args.syntax, args.code.join(' '));

			callback();
		});

/**
 * 		Non-prefixed Commands
 */

	vorpal
		.command('say [message...]', 'Says a message in the current channel.')
		.autocomplete(['s', 'say'])
		.action((args, callback) => {
			if (args.message.length !== 0) sendMessage(args.message.join(' '));

			callback();
		});
}

// Only load guild channels.
function loadChannels() {
	client.guilds.get(current.guild.id).channels.map(channel => current.guild.channels.push(channel.name));
}

function loadDMs() {
	client.channels.filter(channel => channel.type === 'dm').map(channel => current.dms.push({ user: channel.recipient.username, id: channel.id })); // eslint-disable-line max-len
}

function loadGuilds() {
	client.guilds.map(guild => current.guilds.push(guild.name));
}

function showPrefix() {
	vorpal.delimiter(`[#${chalk.blue(current.guild.channel.name)}]> `).show();
}

function sendMessage(msg) {
	if (msg) {
		client.channels.get(current.guild.channel.id).sendMessage(msg)
			.then()
			.catch(err => {
				vorpal.log(`${chalk.red('Failed to send message!')}\n${err.text}`);
			});
	}
}

function sendDM(msg, id) {
	if (msg) {
		client.channels.get(id).sendMessage(msg)
			.then()
			.catch(err => {
				vorpal.log(`${chalk.red('Failed to send DM!')}\n${err.text}`);
			});
	}
}

function sendCode(syntax, code) {
	client.channels.get(current.guild.channel.id).sendCode(syntax, code);
}