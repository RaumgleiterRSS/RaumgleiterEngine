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

function convertUrl (url) {
	const modifiedUrl = url
		.replace(/__/g, ':')
		.replace(/_/g, `.`)
		.replace(/-/g, `/`)

	return modifiedUrl
}

const sources = {
	read: function (callback) {
		mdbClient.connect(mdbUrl, (err, db) => {
			db.collection('sources').find({}).toArray((err, items) => {
				callback(items)
				db.close()
			})
		})
	},
	create: function (source_url, callback) {
		const url = convertUrl(source_url)

		//Validating url before trying to add it to database
		//TODO need to validate if it is a rss feed
		https.get(url, (res) => {
			if (res.statusCode == 200) {
				mdbClient.connect(mdbUrl, (err, db) => {
					db.collection('sources').find({url: url}).toArray((err, item) => {
						if (item.length == 0) {
							db.collection('sources').insertOne({url: url})
							callback(callbackSchema(`allowed`, `New URL`, item))
						} else {
							callback(callbackSchema(`denied`, `URL is already in database`))
						}
						db.close()
					})
				})
			} else {
				callback(callbackSchema(`denied`, `URL is not valid`))
			}
		})
	},
	delete: function (source_url, callback) {
		const url = convertUrl(source_url)

		mdbClient.connect(mdbUrl, (err, db) => {
			db.collection(`sources`).deleteOne({url: url}, (err, del) => {
				if (del.deletedCount == 0) {
					callback(callbackSchema(`denied`, `No matching url found`))
				} else if (del.deletedCount > 0) {
					callback(callbackSchema(`allowed`, `URL deleted`))
				}

				db.close()
			})
		})
	}
}

exports.sources = sources
