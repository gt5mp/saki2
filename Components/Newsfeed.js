var FeedParser
var log = require("color-logs")(true, true, __filename);

module.exports = {
	lastCheck = new Date(),

	onStart: function(bot) {
		//
	},

	onStop: function(bot) {
		//
	},

	onTick: function(bot) {
		if (new Date() - lastCheck < bot.config.newsfeed.interval * 1000) {
			return;
		}

		log.info("Checking news feeds...");

		var promises = [];
		for (var i = 0; i < bot.config.newsfeed.feeds.length; i++) {
			//promises.push();
		}

		Promise.all(promises).then(() => {
			//
		});
	}
};
