const http = require('http')
const https = require('https')
const fs = require('fs')

const port = 3000

let s1 = 'https://www.computerbase.de/rss/news.xml'
//let s1 = 'https://www.heise.de/newsticker/heise-atom.xml'

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

//creating as https server?!
http.createServer((req, res) => {
	res.writeHead(200, {'Content-Type': 'text/plain'})
	fetchSourceFeed(s1, (payload) => {
		res.write(payload)
		res.end()
	})

}).listen(port)

console.log(`Engine running on port ${port}`)
