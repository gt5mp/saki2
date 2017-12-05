var SakiBot = require("./Saki");

var bot = new SakiBot();
bot.start();

process.on("SIGINT", function() {
	bot.stop();
});
