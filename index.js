const Discord = require('discord.js');
const config = require('./config.js');
const vorpal = require('vorpal')();
const chalk = require('chalk');
let client = new Discord.client();

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

vorpal.delimiter(`[#${current.channel.name}]> `).show();

vorapl
	.command('setserver', 'Sets the current guild.')
	.autocomplete(client.guilds.array)
	.action((args, callback) => {
		if (args.length >= 2) {
			this.log(`Too many arguments!`);
			callback();
		} else {
			if (client.guilds.exists(args[0])) {
				this.log(`Connecting to ${args[0]}...`);
				this.current.guild.name = args[0];
				this.current.guild.id = client.guilds.find('name', args[0]).id;
			} else {
				this.log(`Invalid guild: \'${args[0]}\'.`);
			}
			callback();
		}
	});

vorpal
	.command('setchannel', 'Sets the current channel.')
	.autocomplete(client.guilds.find('id', this.current.guild.id).channels.array)
	.action((args, callback) => {
		if (args.length >= 2) {
			this.log(`Too many arguments!`);
			callback();
		} else {
			if (client.guilds.find('id', this.current.guild.id).channels.exists(args[0])) {
				this.log(`Moving to #${args[0]}`);
				this.current.guild.channel.name = args[0];
				this.current.guild.channel.id = client.guilds.find('id', this.current.guild.id).channels.find('name', args[0]).id;
			} else {
				this.log(`Invalid channel!`);
			}
			callback();
		}
	});

vorpal
	.command('say', 'Says a message in the current channel.')
	.autocomplete(['s', 'say'])
	.action((args, callback) => {
		if (args.length === 0) {
			callback();
		} else {
			this.sendMessage(args.join(' '), this.current);
		}
	});

client.on('ready', () => {

});

client.on('message', (msg) => {	

	if (msg.channel === Discord.DMChannel) {
		vorpal.ui.input(`${chalk.yellow('[DM]')} @${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`);
	}

	//Display other users messages.
	if (msg.guild.id === current.guild.id && msg.channel.id === current.channel.id) {
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