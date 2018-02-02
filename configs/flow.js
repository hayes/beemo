const flowConfig = require('@milesj/build-tool-config/configs/flow');

module.exports = function flow(options) {
  return {
    ...flowConfig(options),

    libs: [
      './packages/core/beemo.js.flow',
      './node_modules/boost/boost.js.flow',
      './node_modules/optimal/optimal.js.flow',
    ],
  };
};
