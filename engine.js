const https = require('https')
const xml2js = require('xml2js')
const config = require('./config.json')
const express = require('express')
const app = express()

const database = require(`./modules/sources`)

const port = config.system.server.port

function fetchSourceFeed (source, callback) {
	https.get(source, (res) => {
		let content = ''
		res.setEncoding('utf8')

		res.on(`data`, (data) => {
			content += data
		})

		res.on(`end`, () => {
			callback(content)
		})
	})
}

function convertXmlToJson (xml, callback) {
	//currently using xml2js package
	xml2js.parseString(xml, function(err, result) {
		callback(result)
	})
}

function convertIdToValidJsonKey (id) {
	const string = JSON.stringify(id[0])
	const strippedId = string
		.replace('"', '')
		.replace(/https:\/\//, '')
		.replace(/http:\/\//, '')
		.replace('www.', '')
		.replace(/\/.+$/, '')
		.replace('.', '_')
	return strippedId
}

app.get('/', (req, res) => {
	res.writeHead(200, {'Content-Type': 'text/plain'})

	let completeJsonPayload = {}
	const sources = config.sources

	//for (let singleSource of config.sources) {
	for (let index = 0; index < sources.length; index++) {
		fetchSourceFeed(sources[index], (payload) => {
			convertXmlToJson(payload, (json) => {
				//needs to be only sent on / not on /favicon
				//console.log(req.url)
				const jsonAsString = JSON.stringify(json)
				const jsonKey = convertIdToValidJsonKey(json.feed.id)

				completeJsonPayload[jsonKey] = json

				//check if it is the last item checked beforen the loop stops
				//and send ending response
				if (index == sources.length -1) {
					res.write(JSON.stringify(completeJsonPayload))
					res.end()
				}
			})
		})
	}
})

//read sources
app.get('/sources', (req, res) => {
	database.sources.read(function(callback) {
		res.send(callback)
		res.end()
	})
})

//create sources
app.post('/sources/:url', (req, res) => {
	const url = req.params.url
	database.sources.create(url, function(callback) {
		res.send(callback)
		res.end()
	})
})

//update sources
app.put('/sources', (req, res) => {
	res.send('put sources')
	res.end()
})

//delete sources
app.delete('/sources/:url', (req, res) => {
	const url = req.params.url
	database.sources.delete(url, function(callback) {
		res.send(callback)
		res.end()
	})
})

app.listen(port)

console.log(`Engine running on port ${port}`)
