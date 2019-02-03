//https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3
//https://github.com/iotaledger/iota.js/blob/next/api_reference.md

const fs = require('fs');

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.


const Iota = require('@iota/core')
const Converter = require('@iota/converter')
const txconverter = require('@iota/transaction-converter');

const iota = Iota.composeAPI({
  provider: 'https://nodes.thetangle.org:443'
})

const address = 'TROLLBOXBOT9999999999999999999999999999999999999999999999999999999999999999999999'
const seed = config.seed

const adressen = require("./adressen.json");
function neueAdresse(index) {
  return Iota.generateAddress(seed, index, 2, false)
}

function getbalance(address) {
  return iota.getBalances([address], 100)
}

function balanceanfragen(address) {
  return new Promise((resolve, reject) => {
    getbalance(address)
      .then(balanceobj => {
        resolve(balanceobj.balances[0])
      })
      .catch(err => { reject(err) })
  });
}

var pendingtransaction = false;
var tails = []


// Load up the discord.js library
const { Client, RichEmbed } = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Client();


client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`trololol prefix -`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;

  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if (message.content.indexOf(config.prefix) !== 0) return;

  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Let's go with a few common example commands! Feel free to delete or change those.


  if (command === "purge") {
    const deleteCount = parseInt(args[0], 10);
    if (!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    const fetched = await message.channel.fetchMessages({ limit: deleteCount });
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }

  if (command === 'nodeinfo') {
    iota.getNodeInfo()
      .then(info => {
        const embed = new RichEmbed()
          // Set the title of the field
          .setTitle('Nodeinfo:')
          // Set the color of the embed
          .setColor("#17b6d6")
          // Set the main content of the embed
          .setDescription(JSON.stringify(info, null, 1));
        // Send the embed to the same channel as the message
        message.channel.send(embed);
      })
      .catch(err => message.channel.send(err))
  }

  if (command === 'test') {
    iota.prepareTransfers(seed, [{ "value": 0, "address": address, "tag": "TEST" }])
      .then(trytes => iota.sendTrytes(trytes, (depth = 3), (mwm = 14)))
      .then(bundle => {
        message.channel.send(`<https://thetangle.org/transaction/${bundle[0].hash}>`)
        // console.log(bundle)
      }).catch(err => {
        message.channel.send(err)
        // catch any errors
      })
  }

  if (command == 'ignorependingtx') {
    pendingtransaction = false;
    message.channel.send(`Deleted pending transaction: <https://thetangle.org/transaction/${tails[0]}>`)
    tails = [];
  }

  if (command === 'transfer') {

    const trytemessage = Converter.asciiToTrytes('Trololol')


    const transfers = [
      {
        value: Math.abs(parseInt(args[0])),
        address: args[1].toUpperCase().concat('9'.repeat(81)).slice(0, 81),
        message: trytemessage,
        tag: 'TROLLBOT'
      }
    ]

    if (/^[a-zA-Z9]+$/.test(args[2]) == true && typeof args[2] !== 'undefined') {
      transfers[0].tag = args[2].toUpperCase().slice(0, 27)
    }

    function deUmlaut(value) {
      value = value.replace(/Ä/g, 'Ae');
      value = value.replace(/Ö/g, 'Oe');
      value = value.replace(/Ü/g, 'Ue');
      value = value.replace(/ä/g, 'ae');
      value = value.replace(/ö/g, 'oe');
      value = value.replace(/ü/g, 'ue');
      value = value.replace(/ß/g, 'ss');
      return value;
    }

    if (args[3] !== undefined) {
      transfers[0].message = Converter.asciiToTrytes(deUmlaut(args.slice(3, args.length).join(' ')))
    }

    if (args[0] == 0) {
      iota.prepareTransfers(seed, transfers)
        .then(trytes => iota.sendTrytes(trytes, (depth = 3), (mwm = 14)))
        .then(bundle => {
          message.channel.send(`<https://thetangle.org/transaction/${bundle[0].hash}>`)
          console.log("Tx sent: " + bundle[0].hash)
        })
        .then(res => {
          pendingprüfung()
        })
        .catch(err => {
          message.channel.send(err.message)
          console.log(err);
        })

    } else {
      if (pendingtransaction == true) {
        message.channel.send(`Unconfirmed tx must be confirmed first: <https://thetangle.org/transaction/${tails[0]}>`)
        pendingprüfung()
        return;
      }
      var currentbalance = await balanceanfragen(neueAdresse(adressen.index))
      const options = {
        'inputs': [{
          address: neueAdresse(adressen.index),
          keyIndex: adressen.index,
          balance: currentbalance,
          // balance: parseInt(args[0]), //for testing allows sending value transaction without funds
          security: 2,
          tag: 'TROLLBOT'
        }]
      }
      if (args[0] < options.inputs[0].balance) {
        transfers[1] = {
          //remainder 
          value: Math.abs(options.inputs[0].balance - parseInt(args[0])),
          address: neueAdresse(adressen.index + 1),
          message: 'REMAINDER',
          tag: 'REMAINDER'
        }
      }

      iota.prepareTransfers(seed, transfers, options)
        .then(trytes => iota.sendTrytes(trytes, (depth = 3), (mwm = 14)))
        .then(bundle => {

          adressen.index += 1;
          fs.writeFile('adressen.json', JSON.stringify(adressen, null, 1), error => {
            if (error) {
              console.log(error)
            }
          })
          pendingtransaction = true;
          tails.push(bundle[0].hash)
          message.channel.send(`<https://thetangle.org/transaction/${bundle[0].hash}>`)
          console.log("Tx sent: " + bundle[0].hash)
        })
        .then(res => {
          pendingprüfung()
        })
        .catch(err => {
          message.channel.send(err.message)
          console.log(err.message);
        })
    }
  }

  if (command === 'balance') {
    getbalance(neueAdresse(adressen.index))
      .then(balanceobj => {
        message.channel.send(`Balance: ${balanceobj.balances[0]} i`)
      })
      .catch(err => { reject(err) })
  }

  if (command === 'address') {
    message.channel.send(`Address: ${neueAdresse(adressen.index)}`)
  }

  if (command === 'pendingtx') {
    if (tails[0] !== undefined) {
      message.channel.send(`Pending tx: <https://thetangle.org/transaction/${tails[0]}>`)
    } else {
      message.channel.send(`No pending transaction`)
    }
  }

  if (command === 'promote') {
    promote(args[0], args[1])
      .then(txhash => { message.channel.send(`Promotetx1: <https://thetangle.org/transaction/${txhash}>`); return txhash })
      .then(txhash => promote(txhash))
      .then(txhash => message.channel.send(`Promotetx2: <https://thetangle.org/transaction/${txhash}>`))
      .catch(err => message.channel.send(err.message))
  }

  if (command === 'help') {
    // We can create embeds using the MessageEmbed constructor
    // Read more about all that you can do with the constructor
    // over at https://discord.js.org/#/docs/main/stable/class/RichEmbed
    const embed = new RichEmbed()
      // Set the title of the field
      .setTitle('prefix: - commands:')
      // Set the color of the embed
      .setColor("#17b6d6")
      // Set the main content of the embed
      .setDescription('nodeinfo\ntransfer <amount: int> <address> (optional: <tag> <message>)\nignorependingtx\nbalance\naddress\npendingtx\ntest\npromote <trunktx> (optional: <branchtx>)');
    // Send the embed to the same channel as the message
    message.channel.send(embed);
  }


});

client.login(config.token);


setInterval(() => {
  if (tails.length == 0) {
    return
  } else {
    pendingprüfung()
  }
}, 1000000)


var reattachanzahl = 2;

function pendingprüfung() {
  if (typeof tails[0] !== 'undefined') {
    iota.getLatestInclusion(tails)
      .then(states => {
        // Check if none of transactions confirmed
        if (states.indexOf(true) === -1) {
          const tail = tails[tails.length - 1] // Get latest tail hash
          return iota.isPromotable(tail)
            .then(isPromotable => (isPromotable) ? promote(tail) : iota.replayBundle(tail, 3, 14)
              .then(([reattachedTail]) => {
                const newTailHash = reattachedTail.hash
                console.log(`Reattacht/promote transaction: ${newTailHash}`)
                tails.push(newTailHash)
              })
            )
        } else {
          console.log("No pending transaction");
          pendingtransaction = false;
          tails = [];
        }
      })
      .catch(err => {
        console.log(err);
      })

    iota.getLatestInclusion(tails)
      .then(states => {
        // Check if none of transactions confirmed
        if (states.indexOf(true) !== -1) {
          tails = []
        }
      })
      .catch(err => console.log(err))
  }
}


async function promote(trunktx, branchtx) {

  let branch = new Promise((resolve, reject) => {
    iota.getTransactionsToApprove(3)
      .then(res => { resolve(res.branchTransaction); return res.branchTransaction })
      .catch(err => { reject(err) })
  })

  var branchtx = (typeof branchtx === 'undefined') ? await branch : branchtx;
  const seed = 'A'.repeat(81)
  const transfers = [{
    address: 'TROLLBOXBOTPROMOTER99999999999999999999999999999999999999999999999999999999999999',
    value: 0,
    tag: 'TROLLBOXBOTPROMOTER'
  }]
  const trytes = await iota.prepareTransfers(seed, transfers)
  const tips = { trunk: trunktx, branch: branchtx } //iota.getTransactionsToApprove(3)
  const attachedTrytes = await iota.attachToTangle(tips.trunk, tips.branch, 14, trytes)
  iota.storeAndBroadcast(attachedTrytes)
  return txconverter.asTransactionObject(attachedTrytes[0]).hash
}