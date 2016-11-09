'use strict';

exports.name = 'protractor-http-mock-plugin';

const validate = require('./validate');
const protractorHttpMock = require('protractor-http-mock');
const _ = {
    without: require('lodash.without')
};

class HttpMockPluginError extends Error {
    constructor(message) {
        super(message);
        this.name = 'HttpMockPluginError';
    }
}

exports.isMocked = false;

exports.load = function () {
    throw new HttpMockPluginError('Cannot load mocks until Protractor has run onPrepare');
};
exports.loadWithoutDefaults = exports.load;

let loadingMocks = [];

let isSpecRunning = false;
let isBrowserGotten = false;
let protractorHttpMockCalled = false;

exports.onPrepare = function () {
    protractorHttpMock.config = {
        protractorConfig: exports.config
    };

    const originalBrowserGet = browser.get;
    browser.get = function () {
        isBrowserGotten = true;
        return originalBrowserGet.apply(browser, arguments);
    };

    beforeEach(function () {
        isSpecRunning = true;
    });
    afterEach(function () {
        isSpecRunning = false;
        isBrowserGotten = false;
        if (protractorHttpMockCalled) {
            protractorHttpMock.teardown();
            protractorHttpMockCalled = false;
            if (process.env.DEBUG) {
                exports.logRequestsMade();
            }
        }
        if (exports.isMocked) {
            exports.isMocked = false;
        }
    });

    const checkThenLoad = function (mocks, skipDefaults) {
        const checkIsMocked = function () {
            if (exports.isMocked) {
                /* eslint-disable no-console */
                console.warn('Mocks already loaded will be overridden');
                /* eslint-enable no-console */
            }
            exports.isMocked = true;
        };
        const checkIsBrowserGotten = function () {
            if (isBrowserGotten) {
                throw new HttpMockPluginError('Mocks must be loaded before browser.get()');
            }
        };
        const load = function () {
            checkIsMocked();
            checkIsBrowserGotten();
            const loadMocks = loadingMocks.concat(mocks || []);
            validate.many(loadMocks);
            protractorHttpMock(loadMocks, null, skipDefaults);
            protractorHttpMockCalled = true;
        };
        if (isSpecRunning) {
            load();
        } else {
            beforeEach(function () {
                load();
            });
        }
    };
    exports.load = function (mocks) {
        checkThenLoad(mocks, false);
    };
    exports.loadWithoutDefaults = function (mocks) {
        checkThenLoad(mocks, true);
    };
};

const catchBrowserErrorForMethod = function (methodName) {
    return function (error) {
        const errorMatches = error.message.match(/Module ['"]?httpMock['"]? is not available/i);
        if (errorMatches) {
            /* eslint-disable no-console */
            throw new HttpMockPluginError(`Cannot ${methodName}() until mocks have been loaded`);
            /* eslint-enable no-console */
        } else {
            throw error;
        }
    };
};

exports.logRequestsMade = function () {
    return protractorHttpMock.requestsMade()
        .then((requests) => {
            if (requests.length) {
                /* eslint-disable no-console */
                console.log('requests made', requests);
                /* eslint-enable no-console */
            }
        })
        .catch(catchBrowserErrorForMethod('logRequestsMade'));
};

const addMocks = function (mocks, catcher) {
    const addMocks = mocks || [];
    if (!exports.isMocked) {
        throw new HttpMockPluginError('Cannot add mocks when not loaded: first call mocks.load(arrayOfMocks)');
    } else if (!protractorHttpMockCalled) {
        // Append to the mocks for loading.
        validate.many(addMocks);
        loadingMocks = loadingMocks.concat(addMocks);
        return protractor.promise.fulfilled(loadingMocks);
    } else if (isBrowserGotten) {
        // Append to the mocks in the browser.
        validate.manyForBrowser(addMocks);
        return protractorHttpMock.add(addMocks)
            .catch(catcher);
    } else if (isSpecRunning) {
        throw new HttpMockPluginError('Cannot add mocks after loading and before browser.get(): either add them to mocks.load() or call mocks.add() after browser.get()');
    }
    throw new HttpMockPluginError('Cannot add: unknown mocks loading state');
};

exports.add = function (mocks) {
    return addMocks(mocks, catchBrowserErrorForMethod('add'));
};

const removeMocks = function (mocks, catcher) {
    const removeMocks = mocks || [];
    if (!exports.isMocked) {
        throw new HttpMockPluginError('Cannot remove mocks when not loaded: first call mocks.load(arrayOfMocks)');
    } else if (!protractorHttpMockCalled) {
        // Remove from the mocks for loading.
        validate.many(removeMocks);
        loadingMocks = _.without(loadingMocks, removeMocks);
        return protractor.promise.fulfilled(loadingMocks);
    } else if (isBrowserGotten) {
        // Remove from the mocks in the browser.
        validate.manyForBrowser(removeMocks);
        return protractorHttpMock.remove(removeMocks)
            .catch(catcher);
    } else if (isSpecRunning) {
        throw new HttpMockPluginError('Cannot remove mocks after loading and before browser.get(): either remove them from mocks.load() or call mocks.remove() after browser.get()');
    }
    throw new HttpMockPluginError('Cannot remove: unknown mocks loading state');
};

exports.remove = function (mocks) {
    return removeMocks(mocks, catchBrowserErrorForMethod('remove'));
};
