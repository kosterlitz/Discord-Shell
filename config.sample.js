module.exports = {
	
	//Your Discord Token.
	token: "",

	//The Default guild that you want to be in when the script starts (This must be the ID of the guild).
	defaultGuildID: "",

	//The Default channel (in the default guild you set above) to join when the CLI starts.
	defaultChannelID: "",

	//The prefix you want to use in the shell.
	prefix: "!",

	//The muted channels by guild.
	// [
	// 	guildID: {
	// 		muted: [{channelID}]
	// 	}
	// ]
	mutedChannels: []
}
