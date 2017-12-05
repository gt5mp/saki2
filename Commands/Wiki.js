var log = require("color-logs")(true, true, __filename);

var request = require("request");

module.exports = {
	getTriggers: function() {
		return [ ".wiki", ".api" ];
	},
	admin: false,

	func: function(bot, msg, args) {
		var parse = args.split(" ");
		if (parse.length <= 1) {
			return 0;
		}

		var query = parse[1];
		var ret = 1;

		if (parse[0] == ".wiki") {
			query = parse.slice(1).join(" ");
			ret = parse.length - 1;
		}

		request("https://wiki.gt-mp.net/api.php?action=opensearch&limit=3&search=" + encodeURIComponent(query), (err, res, body) => {
			if (err) {
				log.error("Failed getting wiki response: " + err);
				msg.channel.send("I couldn't reach the wiki server! :sob:");
				return;
			}

			var json = JSON.parse(body);
			if (!json) {
				log.error("Wiki Json response was invalid!");
				msg.channel.send("The wiki server sent something unexpected.. :thinking:");
				return;
			}

			var titles = json[1];
			var links = json[3];

			if (titles.length == 0 || links.length == 0) {
				msg.channel.send("I couldn't find `" + query + "` on the wiki. :(");
				return;
			}

			var shortenUrls = [];

			var results = "";
			for (var i = 0; i < titles.length; i++) {
				let title = titles[i];
				let link = links[i];
				shortenUrls.push(bot.getShortUrl(link).then(shortLink => {
					results += "`" + title + "` <" + shortLink + ">\n";
				}));
			}

			Promise.all(shortenUrls).then(() => {
				msg.channel.send(results);
			});
		});

		return ret;
	}
};
