'use strict';

// For testing, 'protractor-http-mock-plugin' has been replaced with requires.

const path = require('path');

exports.config = {
    baseUrl: 'http://localhost:9000/',
    capabilities: {
        browserName: process.env.TRAVIS ? 'firefox' : 'chrome'
    },
    directConnect: true,
    specs: ['tests/**/*[sS]cenario.js'],
    plugins: [
        {
            // Substitute inline with
            // package: 'protractor-http-mock-plugin',
            inline: require('../lib/protractor-http-mock-plugin'),
            mocks: {
                dir: path.join(__dirname, 'my-mocks'),
                default: ['default']
            }
        }
    ]
};
