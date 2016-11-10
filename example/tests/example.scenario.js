'use strict';

const mocks = require('../../lib/protractor-http-mock-plugin');
// Substitute with:
// const mocks = require('protractor-http-mock-plugin');

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

    /* eslint-disable no-console */
    describe('not working:', function () {

        beforeEach(function () {
            spyOn(console, 'log');
            spyOn(console, 'error');
        });

        describe('invalid mocks before browser.get', function () {
            it('should not work for non-objects', function () {
                expect(() => {
                    mocks.load([
                        null
                    ]);
                }).toThrowError('Invalid mocks');
                expect(console.error).toHaveBeenCalledWith('Invalid mock: must be an object or string');
                expect(console.log).toHaveBeenCalledWith(null);
            });
            it('should not work for invalid objects', function () {
                expect(() => {
                    mocks.load([
                        {
                            foo: 'bar',
                            x: 2
                        }
                    ]);
                }).toThrowError('Invalid mocks');
                expect(console.error).toHaveBeenCalledWith('Invalid mock object: must have a request property');
                expect(console.error).toHaveBeenCalledWith('Invalid mock object: must have a response property');
                expect(console.log).toHaveBeenCalledWith({
                    foo: 'bar',
                    x: 2
                });
            });
        });

        describe('invalid mocks added after browser.get', function () {
            it('should not work for non-objects', function () {
                mocks.load();
                browser.get('/');
                expect(() => {
                    mocks.add([
                        undefined,
                        null,
                        false,
                        true
                    ]);
                }).toThrowError('Invalid mocks for the browser: must be an inline request/response object');
                expect(console.error).toHaveBeenCalledWith('Invalid mock: must be an object or string');
            });
            it('should validate all mocks', function () {
                mocks.load();
                browser.get('/');
                expect(() => {
                    mocks.add([
                        undefined,
                        null,
                        false,
                        true
                    ]);
                }).toThrowError('Invalid mocks for the browser: must be an inline request/response object');
                expect(console.error).toHaveBeenCalledWith('Invalid mock: must be an object or string');
                expect(console.log).toHaveBeenCalledWith(undefined);
                expect(console.log).toHaveBeenCalledWith(null);
                expect(console.log).toHaveBeenCalledWith(false);
                expect(console.log).toHaveBeenCalledWith(true);
            });
            it('should not work for invalid objects', function () {
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
                expect(console.error).toHaveBeenCalledWith('Invalid mock object: must have a request property');
                expect(console.error).toHaveBeenCalledWith('Invalid mock object: must have a response property');
                expect(console.log).toHaveBeenCalledWith({
                    foo: 'bar',
                    x: 2
                });
            });
        });

        describe('mock files added after browser.get', function () {
            it('should fail validation early and not work', function () {
                mocks.load();
                browser.get('/');
                expect(() => {
                    mocks.add([
                        'foo',
                        'bar'
                    ]);
                }).toThrowError('Invalid mocks for the browser: must be an inline request/response object');
                expect(console.error).toHaveBeenCalledWith('Invalid mock for browser: cannot be string');
                expect(console.error).not.toHaveBeenCalledWith('Invalid mock: must be an object or string');
                expect(console.log).not.toHaveBeenCalledWith('foo');
                expect(console.log).not.toHaveBeenCalledWith('bar');
            });
        });

    });
    /* eslint-disable no-console */

});
