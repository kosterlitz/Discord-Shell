const DISCORD = require('discord.js');
const CONFIG = require('./config.js');
let client = new DISCORD.client();

client.on('ready', () => {
	
});

client.on('message', (msg) => {	

	//Ignore our own messages.
	if (msg.author.id === client.user.id) return;

	//Display other users messages.
	this.display(msg);
});

client.login(CONFIG.TOKEN);

function display(msg) {

}

