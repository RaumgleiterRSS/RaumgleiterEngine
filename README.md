# RaumgleiterEngine

**bleeding edge**

This is the engine behind the RaumgleiterRSS Reader.
It's a nodejs application with an RESTful API writing its data to MongDB collections.

## Requirements:
- MongoDB instance

## Installation:

1. Clone the repo
2. Install dependencies with `npm install`
3. Rename the config file and fill in the needed information: `cp config.json.sample confg.json`
- PORT: The port which the nodejs server should listen to (for example `3000`)
- MONGODB_URL: The url to your mongodb instance, for example: `mongodb://localhost:27017/raumgleiter_engine`
4. Start the engine with `node engine.js`

## Usage:

RaumgleiterEngine uses a RESTful API.
Following requests are possible:

**Note: Currently, the parameter `:url` needs to be modified to have RaumgleiterEngine parse it correctly.
Some characters need to be replaced like following:

`:` => `__`
`.` => `_`
`/` => `-`


### Reading current saved source urls from database
`*GET* /sources`

### Adding a new source url to the database
`*POST* /sources/:url`

### Removing a source url from the database
`*DELETE* /sources/:url`
