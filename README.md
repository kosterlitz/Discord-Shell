# Discord-Shell

[![Github License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/RyoshiKayo/Discord-Shell/master/LICENSE)
[![Code Climate](https://codeclimate.com/github/RyoshiKayo/Discord-Shell/badges/gpa.svg)](https://codeclimate.com/github/RyoshiKayo/Discord-Shell/)
[![Master Build Status](https://travis-ci.org/RyoshiKayo/Discord-Shell.svg?branch=master)](https://travis-ci.org/RyoshiKayo/Discord-Shell)

Discord for Shell, use Discord easily in the terminal!

***This is currently very unstable, please be patient and feel free to make pull requests!***

***Requires [Node v7+](https://nodejs.org/en/download/current/)***

----
### Installation:
*If you don't aready have Node installed, I high reccomend [installing n](https://github.com/tj/n#installation)*
```sh
# Clone this repository
# If you don't have git then do:
# sudo apt install git -y
git clone https://github.com/RyoshiKayo/Discord-Shell.git
# Move into the folder
cd Discord-Shell/
# Install required packages
npm install
# Continue to Configuration
```

----
### Configuration:
`cp ~/Discord-Shell/config.sample.js ~/Discord-Shell/config.js`

`token`: This is your discord token ([Find your token](#finding-your-token)).

`defaultGuildID`: This is the ID of guild you want to join when you first start up the CLI.

`defaultChannelID`: This is the ID of the channel (*In teh default guild you set*) you want to join when you first start the CLI.

`prefix`: This is the prefix you want to use to trigger [commands](#commands).

`mutedChannels`: This can be ignored. This is where the CLI will store the channels you mute by guild.

----

### Commands:
There are two main types of commnands, *general*, and *prefixed*. 

#### General Commands:
General commands do not require a prefix to be used.
```sh
    help [command...]         Provides help for a given command.
    exit                      Exits application.
    setserver [servername]    Sets the current guild.
    setchannel [channelname]  Sets the current channel.
    say [message...]          Says a message in the current channel.
    reply [message...]        Responds to the last DM.
```

#### Prefixed Commands:
Prefixed commands require the `prefix` you set in your `config.js`.

***Coming soon***

----
### Todo:
- [ ] Finish DM Handeling
- [ ] Add administrative commands (Prefixed)
- [ ] Add the ability to mute/unmute channels for the current guild.
- [X] Impliment default channel.
----
### Finding your token:
##### 1. Open the developers console. 
  In the Desktop application, or in the web browser press `Ctrl + Shift + I` on Windows and Linux (`Cmd + Option + I` on OSX).
##### 2. Open `Application > Local Storage` 
  <img src="https://safe.kayo.moe/LSkeOg40.png" height=500 width=auto></img>
##### 3. Right click on the value and copy the contents.

----

Thanks to @WeebDev for the "finding your token image" from [Discord.JS](https://discord.js.org/#/)
