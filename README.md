# iota-discordbot

clone the repository with `git clone https://github.com/Thoralf-M/iota-discordbot.git`
go to the directory `cd iota-discordbot`
install it `npm i`
edit the discord token and the iota seed in the config.json file

You can get the discord token from https://discordapp.com/developers/applications

-create an application there or click at one that you already have

-click on the left side on `Bot`

-click on `Click to Reveal Token` and copy it into the config.json

start the bot with `node iotabot.js`

replace the client id in the link (the 3333) and let your bot join a server with https://discordapp.com/oauth2/authorize?client_id=333333333333333&scope=bot

You can find the client id at https://discordapp.com/developers/applications if you click on your application

write `-help` in the chat to get a list of the commands

if you see 
``prefix: - commands:
nodeinfo
transfer <amount: int> <address> (optional: <tag> <message>)
ignorependingtx
balance
address
pendingtx
test
promote <trunktx> (optional: <branchtx>)``

everything worked
