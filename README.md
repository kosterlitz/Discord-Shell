# Discord-Shell

[![Github License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/RyoshiKayo/Discord-Shell/blob/master/LICENSE.md)
[![Code Climate](https://codeclimate.com/github/RyoshiKayo/Discord-Shell/badges/gpa.svg)](https://codeclimate.com/github/RyoshiKayo/Discord-Shell/)
[![Master Build Status](https://travis-ci.org/RyoshiKayo/Discord-Shell.svg?branch=master)](https://travis-ci.org/RyoshiKayo/Discord-Shell)

Discord for Shell, use Discord easily in the terminal!

***This is currently very unstable, please be patient and feel free to make pull requests!***

***Requires [Node v7+](https://nodejs.org/en/download/current/)***

----

## Installation

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

## Configuration

`cp ~/Discord-Shell/config.sample.json ~/Discord-Shell/config.json`

`token`: This is your discord token ([Find your token](#finding-your-token)).

`defaultGuildID`: This is the ID of guild you want to join when you first start up the CLI.

`defaultChannelID`: ***Optional*** This is the ID of the channel (*In the default guild you set*) you want to join when you first start the CLI. The default is the default guild channel if nothing is set.

`prefix`: This is the prefix you want to use to trigger [commands](#commands).

`syntax`: These are the different types of syntaxes you would like to autocomplete when sending a code message.

----

### Commands

```code
    help [command...]            Provides help for a given command.
    exit                         Exits application.
    !setguild [guildname]        Sets the current guild.
    !setchannel [channelname]    Sets the current channel.
    !reply [message...]          Responds to the last Direct Message.
    !dm [username] [message...]  Sends a direct messsage to the given user.
    !mute [channel]              Mutes the specified channel within this script.
    !unmute [channel]            Unmutes the specified channel within this script.
    !togglemute [channel]        Toggles the mute status of the given channel within this script.
    !code [syntax] [code...]     Sends a code block with the given syntax.
    say [message...]             Says a message in the current channel.
```

----

### Todo

- [X] Finish DM Handeling.
- [ ] Add administrative commands (Prefixed).
- [ ] Add the ability to mute/unmute channels for the current guild.
  - [X] Implement functionality.
  - [ ] Save muted channels when closing.
- [X] Impliment default channel.

----

### Finding your token

#### 1. Open the developers console

  In the Desktop application, or in the web browser, on Windows and Linux press `Ctrl + Shift + I`, for macOS press `Cmd + Option + I`.

#### 2. Open `Application > Local Storage`

  <img src="https://safe.kayo.moe/LSkeOg40.png" height=500 width=auto></img>

#### 3. Right click on the value and copy the contents

----

## Author

Discord-Shell © RyoshiKayo, Released under the MIT License.
Authored and maintained by RyoshiKayo.

Thanks to [@WeebDev](https://github.com/WeebDev) for the "finding your token image" from [Discord.JS](https://discord.js.org/#/)
