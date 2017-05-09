const config = require('../config.json')
const mdbClient = require(`mongodb`).MongoClient
const mdbUrl = config.system.server.mongodb_url
const https = require('https')

function callbackSchema (status, reason, content) {
	return {
		status: status !== undefined ? status : null,
		reason: reason !== undefined ? reason : null,
		content: content !== undefined ? content : null
	}
}

const sources = {
	read: function (callback) {
		mdbClient.connect(mdbUrl, (err, db) => {
			console.log(`mdbConnect successfull`)
			db.collection('sources').find({}).toArray((err, items) => {
				console.log(items)
				callback(items)
				db.close()
			})
		})
	},
	create: function (source_url, callback) {
		const url = source_url
			.replace(/__/g, ':')
			.replace(/_/g, `.`)
			.replace(/-/g, `/`)

		//Validating url before trying to add it to database
		//TODO need to validate if it is a rss feed
		https.get(url, (res) => {
			console.log(res.statusCode)
			if (res.statusCode == 200) {
				mdbClient.connect(mdbUrl, (err, db) => {
					console.log(`mdbConnect successfull`)
					db.collection('sources').find({url: url}).toArray((err, item) => {
						if (item.length == 0) {
							db.collection('sources').insertOne({url: url})
							callback(callbackSchema(`allowed`, `New URL`, item))
						} else {
							callback(callbackSchema(`denied`, `URL is already in database`))
						}
					})
				})
			} else {
				callback(callbackSchema(`denied`, `URL is not valid`))
			}
		})
	},
	delete: function () {
		return `delete`
	}
}

exports.sources = sources
