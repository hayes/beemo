# Jest Driver

Provides [Jest](https://github.com/facebook/jest) support.

## Usage

In your configuration module, install the driver, Jest, and [Babel](./babel.md). Create a file at
`configs/jest.js` in which to house your Jest configuration.

In your consuming project, enable the driver by adding `jest` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/build-tool-config",
    "drivers": ["jest"]
  }
}
```