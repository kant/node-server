'use strict';

/**
 * @module config.js
 * @author Arne Seib <arne.seib@windy.com>
 * Loads, validates and augments config.
 */

const Fs = require('fs-extra');
const Path = require('path');

// Static config object.
module.exports.config = {
	root: Path.resolve(__dirname, '..'),
};

// Locations to look for config files:
module.exports.CONFIG_LOCATIONS = [
	'./config',
];

// Possible extensions, in order of precedence
module.exports.CONFIG_EXTENSIONS = [
	'.local.js',
	'.local.json',
	'.local.conf.js',
	'.local.conf.json',
	'.js',
	'.json',
	'.conf.js',
	'.conf.json',
];

// Default settings.
const DEFAULTS = {
	port: 8080,
	bind: '127.0.0.1',
	NODE_ENV: 'development',
	DEBUG: true,
};

//------------------------------------------------------------------------------
// Merge defaults and validate config.
const validateConfig = async (config) => {
	// some defaults
	config = Object.assign({}, DEFAULTS, config);
	return config;
};

//------------------------------------------------------------------------------
// Accepts an external object to copy to config.
module.exports.setConfig = async (config) => {
	Object.assign(module.exports.config, await validateConfig(config));
};

//------------------------------------------------------------------------------
// Finds and loads a config file. Returns validated config.
module.exports.loadConfig = async (name,
	locations = module.exports.CONFIG_LOCATIONS,
	variants = module.exports.CONFIG_EXTENSIONS) => {
	locations = locations
		.map(p => Path.resolve(module.exports.config.root, p))
		.filter(p => Fs.existsSync(p));
	for (const location of locations) {
		for (const ext of variants) {
			const file = Path.join(location, `${name}${ext}`);
			if (Fs.existsSync(file)) {
				const config = require(file); // eslint-disable-line
				config.__file = file;
				config.__name = name;
				return validateConfig(config);
			}
		}
	}
	throw new Error(`No valid configuration found. Searched for:
\t${name}${variants.join(`\n\t${name}`)}\nin:
\t${locations.join('\n\t')}`);
};

