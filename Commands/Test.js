var log = require("color-logs")(true, true, __filename);

module.exports = {
	getTriggers: function() {
		return [ ".test" ];
	},
	admin: true,

	func: function(bot, msg, args) {
		log.info("Test command used: \"" + args + "\"");
	}
};
