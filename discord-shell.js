const Discord = require('discord.js');
const config = {
	token: require('./token.json').token,
	defaultGuildID: process.env.npm_package_config_defaultGuildID, // eslint-disable-line no-process-env
	defaultChannelID: process.env.npm_package_config_defaultChannelID, // eslint-disable-line no-process-env
	prefix: process.env.npm_package_config_prefix, // eslint-disable-line no-process-env
	syntax: process.env.npm_package_config_syntax // eslint-disable-line no-process-env
};
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
		let currentGuild = client.guilds.get(config.defaultGuildID);
		objAssignDeep(current.guild, {
			id: `${currentGuild.id}`,
			name: `${currentGuild.name}`,
			channel: {
				id: `${currentGuild.defaultChannel.id}`,
				name: `${currentGuild.defaultChannel.name}`
			}
		});

		if (config.defaultChannelID) {
			if (currentGuild.channels.get(config.defaultChannelID)) {
				Object.assign(current.guild.channel, {
					name: `${currentGuild.channels.get(config.defaultChannelID).name}`,
					id: `${config.defaultChannelID}`
				});
			}
		}

		loadGuilds();
		current.guild.channels = getChannels(config.defaultGuildID);
		loadDMs();
		loadCommands();
		vorpal.log(chalk.green(`Connected to ${current.guild.channel.name} in ${current.guild.name}`));
		showPrefix();
	}
});

client.on('message', msg => {
	if (msg.channel === Discord.DMChannel) {
		objAssignDeep(current.dm, {	id: `${msg.channel.id}`, recipient: `${msg.channel.recipient}` });
		vorpal.log(`${chalk.yellow('[DM]')} @${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`);
	}
	if (msg.guild.id === current.guild.id && current.mutedChannels.indexOf(msg.channel.name) !== -1) {
		vorpal.log(`[#${chalk.blue(msg.channel.name)}] @${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`); // eslint-disable-line max-len
	}
	showPrefix();
});

if (!config.token) {
	vorpal.command('')
		.action((args, callback) => {
			return vorpal.prompt({
				type: 'input',
				name: 'discordToken',
				message: 'Paste your full discord token and press enter.',
				validate: input => {
					if (!input) return 'You must paste your discord token!';
					else return true;
				}
			}, result => {
				require('./token.json').token = result.discordToken;
			}, callback());
		});
} else {
	client.login(config.token);
}

const loadCommands = () => {
	vorpal
		.command(`${PREFIX}setguild [guildname]`, 'Sets the current guild.')
		.autocomplete(current.guilds)
		.action(async (args, callback) => {
			let guild = args.guildname;
			if (client.guilds.exists('name', guild)) {
				if (!client.guilds.find('name', guild).available) {
					vorpal.log(chalk.yellow(`${guild} is currently unavailable.`));
				} else {
					vorpal.log(chalk.green(`Connecting to ${guild}...`));
					let _guild = await client.guilds.find('name', guild);
					objAssignDeep(current.guild, {
						name: _guild.name,
						id: _guild.id,
						channel: {
							name: _guild.defaultChannel.name,
							id: _guild.defaultChannel.id
						}
					});
					current.mutedChannels = [];
					objAssignDeep(current.guild.channels, getChannels(_guild.id));
					vorpal.log(chalk.green('Connected!'));
					showPrefix();
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
				vorpal.log(chalk.green(`Moving to #${args.channelname} in ${current.guild.name}`));
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

	vorpal
		.command('say [message...]', 'Says a message in the current channel.')
		.autocomplete(['s', 'say'])
		.action((args, callback) => {
			if (args.message.length !== 0) sendMessage(args.message.join(' '));
			callback();
		});
};

const hasPermissionIn = (permissionResolvable, channelID) => client.guilds.get(current.guild.id).channels.get(channelID)
	.permissionsFor(client.user)
	.hasPermission(permissionResolvable);

const showPrefix = () => {
	let color = 'yellow';
	if (hasPermissionIn('SEND_MESSAGES', current.guild.channel.id)) color = 'blue';
	vorpal.delimiter(`[${chalk.blue(current.guild.name)}#${chalk[color](current.guild.channel.name)}]> `).show();
};

const getChannels = guildID => {
	let tmp = [];
	for (const channel of client.guilds.get(guildID).channels.values()) {
		if (channel.type === 'text' && hasPermissionIn('READ_MESSAGES', channel.id)) tmp.push(channel.name);
		else continue;
	}
	return tmp;
};

const loadDMs = () => client.channels.filter(channel => channel.type === 'dm').map(channel => current.dms.push({ user: channel.recipient.username, id: channel.id })); // eslint-disable-line max-len

const loadGuilds = () => client.guilds.map(guild => current.guilds.push(guild.name));

const sendMessage = msg => client.channels.get(current.guild.channel.id).sendMessage(msg).then()
	.catch(err => vorpal.log(`${chalk.red('Failed to send message!')}\n${err.text}`));

const sendDM = (msg, id) => client.channels.get(id).sendMessage(msg).then()
	.catch(err => vorpal.log(`${chalk.red('Failed to send DM!')}\n${err.text}`));

const sendCode = (syntax, code) => client.channels.get(current.guild.channel.id).sendCode(syntax, code).then()
	.catch(err => vorpal.log(`${chalk.red(`Failed to send code!`)}\n${err.text}`));
