# protractor-http-mock-plugin [![Build Status](https://travis-ci.org/incuna/protractor-http-mock-plugin.svg?branch=master)](https://travis-ci.org/incuna/protractor-http-mock-plugin)

A wrapper around [protractor-http-mock](https://github.com/atecarlos/protractor-http-mock) to make it a Protractor plugin.

- Allows configuration as a Protractor plugin
- Provides user-friendly errors and instructions
- Can be run inside or outside specs with the same results

## Usage

See [example](example/) for more information on usage.

### Protractor file

```js
exports.config = {
    // ... the rest of your config
    plugins: [
        {
            package: 'protractor-http-mock-plugin',
            // This is passed through to protractor-http-mock.
            // Example copied from https://github.com/atecarlos/protractor-http-mock/
            mocks: {
                // For consistent results, use an absolute path for dir.
                // E.g. for a folder sibling to this config file:
                // dir: path.join(__dirname, 'my-mocks')
                dir: 'my-mocks',
                default: ['default']
            },
            httpMockPlugins: {
                default: ['protractor-http-mock-sample-plugin']
            }
        }
    ]
};
```

### Test file

Mocks can be inline objects or string references to files in the mocks dir defined above.

As files, mocks can be any requireable file: `.json`, or `.js` that exports an array.

See [protractor-http-mock](https://github.com/atecarlos/protractor-http-mock) for more mock examples.

```js
describe('My suite', function () {

    mocks.load([
        'a-mock-filename'
    ]);

    it('should use the mocks', function () {
        // test code here
    });

});
```

`my-mocks/default.json`
```json
[
    {
        "request": {
            "method": "POST",
            "path": "/default"
        },
        "response": {
            "data": {
                "message": "This is a default response"
            }
        }
    }
]
```

`my-mocks/a-mock-filename.js`
```js
module.exports = [
    {
        "request": {
            "method": "POST",
            "path": "/error"
        },
        "response": {
            "status": 401
        }
    }
]
```

## How to run the tests here

- `cd example && bower install` (requires bower)
- `npm run server` in a separate shell to run the example app
- `npm test`
