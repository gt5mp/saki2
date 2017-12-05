var discord = require("discord.js");
var toml = require("toml");
var googl = require("goo.gl");
var log = require("color-logs")(true, true, __filename);

var fs = require("fs");
var process = require("process");

class SakiBot
{
	constructor()
	{
		this.config = toml.parse(fs.readFileSync("config.toml", "utf8"));

		this.client = new discord.Client();
		this.client.on("ready", () => { this.onReady(); });
		this.client.on("message", msg => { this.onMessage(msg); });

		googl.setKey(this.config.googl.key);

		this.commands = [];
		for (var i = 0; i < this.config.chat.commands.length; i++) {
			this.commands.push(require("./Commands/" + this.config.chat.commands[i]));
		}

		this.components = [];
		for (var i = 0; i < this.config.chat.components.length; i++) {
			this.components.push(require("./Components/" + this.config.chat.components[i]));
		}
	}

	start()
	{
		log.info("Starting client");

		this.client.login(this.config.discord.token).catch(reason => {
			log.error("Failed to connect to Discord: " + reason);
		});
	}

	stop()
	{
		log.info("Stopping client");

		for (var i = 0; i < this.components.length; i++) {
			this.components[i].onStop(this);
		}

		this.client.destroy();
		process.exit();
	}

	isFromAdmin(msg)
	{
		let member = msg.member;
		if (member == null) {
			return false;
		}

		if (member.user.id == this.config.discord.owner) {
			return true;
		}

		for (var roleID of member.roles.keys()) {
			var role = member.roles.get(roleID);
			if (role.hasPermission("ADMINISTRATOR")) {
				return true;
			} else if (role.name == "Saki Admin") {
				return true;
			}
		}

		return false;
	}

	onTick()
	{
		for (var i = 0; i < this.components.length; i++) {
			this.components[i].onTick();
		}
	}

	onReady()
	{
		log.info("Saki is now connected to Discord!");

		for (var i = 0; i < this.components.length; i++) {
			this.components[i].onStart(this);
		}

		setInterval(() => { this.onTick(); }, 1000);
	}

	getShortUrl(url)
	{
		return googl.shorten(url).catch(err => {
			log.error("Failed to make short URL for \"" + url + "\": \"" + err + "\"");
		});
	}

	getCommand(trigger)
	{
		for (var i = 0; i < this.commands.length; i++) {
			var triggers = this.commands[i].getTriggers();
			if (triggers.indexOf(trigger) != -1) {
				return this.commands[i];
			}
		}
		return null;
	}

	onMessage(msg)
	{
		if (msg.member.user.id == this.client.user.id) {
			return;
		}

		var parse = msg.content.split(" ");
		for (var i = 0; i < parse.length; i++) {
			if (!parse[i].startsWith(".")) {
				continue;
			}

			var cmd = this.getCommand(parse[i]);
			if (!cmd) {
				continue;
			}

			if (cmd.admin && !this.isFromAdmin(msg)) {
				log.error("Non-admin user \"" + msg.member.user.tag + "\" tried triggering admin command \"" + cmd.trigger + "\"!");
				continue;
			}

			log.info("User \"" + msg.member.user.tag + "\" triggered command \"" + parse[i] + "\"");

			var args = parse.slice(i).join(" ");
			var add = cmd.func(this, msg, args);
			if (typeof(add) == "number") {
				i += add;
			}
		}
	}
}

module.exports = SakiBot;
