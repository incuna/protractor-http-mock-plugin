'use strict';

const mocks = require('../../lib/protractor-http-mock-plugin'); // require('protractor-http-mock-plugin');

describe('Example', function () {

    describe('working:', function () {

        describe('without mocks', function () {
            it('should call the real api', function () {
                browser.get('/');
                $('form').submit();
                expect($('.result').getText()).toBe('405: Method Not Allowed');
                // passed
            });
        });

        describe('default mocks loaded outside a spec before browser.get', function () {
            // See mocks.default property in plugin configuration.
            mocks.load();
            it('should show the mock success result', function () {
                browser.get('/');
                $('form').submit();
                expect($('.result').getText()).toBe('This is the default 200 result');
                // browser.pause();
                // passed
            });
        });

        describe('mock files loaded inside a spec before browser.get', function () {
            it('should show no response', function () {
                mocks.load([
                    'not-default'
                ]);
                browser.get('/');
                $('form').submit();
                expect($('.result').getText()).toBe('This is a non-default 200 result');
                // passed
            });
        });

        describe('inline mocks added after browser.get', function () {
            it('should work', function () {
                mocks.load();
                browser.get('/');
                // The default mocks will be loaded, but the inline one here will
                // override the default one.
                mocks.add([
                    {
                        request: {
                            method: 'POST',
                            path: '/form'
                        },
                        response: {
                            status: 418,
                            statusText: 'Oh my teapot'
                        }
                    }
                ]);
                $('form').submit();
                expect($('.result').getText()).toBe('418: Oh my teapot');
                // passed
            });
        });

    });

    describe('not working:', function () {

        describe('invalid mocks before browser.get', function () {
            it('should not work', function () {
                expect(() => {
                    mocks.load([
                        {
                            foo: 'bar',
                            x: 2
                        }
                    ]);
                }).toThrowError('Invalid mocks');
            });
        });

        describe('invalid mocks after browser.get', function () {
            it('should not work', function () {
                mocks.load();
                browser.get('/');
                expect(() => {
                    mocks.add([
                        {
                            foo: 'bar',
                            x: 2
                        }
                    ]);
                }).toThrowError('Invalid mocks for the browser: must be an inline request/response object');
            });
        });

        describe('mock files added after browser.get', function () {
            it('should not work', function () {
                mocks.load()
                browser.get('/');
                expect(() => {
                    mocks.add([
                        'foo',
                        'bar'
                    ]);
                }).toThrowError('Invalid mocks for the browser: must be an inline request/response object');
            });
        });

    });

});
