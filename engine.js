const http = require('http')
const https = require('https')
const fs = require('fs')
const xml2js = require('xml2js')

const port = 3000

let s1 = 'https://www.computerbase.de/rss/news.xml'

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

//creating as https server?!
http.createServer((req, res) => {
	res.writeHead(200, {'Content-Type': 'text/plain'})
	fetchSourceFeed(s1, (payload) => {
		convertXmlToJson(payload, (json) => {
			console.log(json.feed.entry[0].title)
			//needs to be only sent on / not on /favicon
			console.log(req.url)
			let jsonAsString = JSON.stringify(json)
			res.write(jsonAsString)
			res.end()
		})
	})
}).listen(port)

console.log(`Engine running on port ${port}`)
