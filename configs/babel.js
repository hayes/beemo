module.exports = function babel(options) {
  return {
    babelrc: false,
    comments: false,
    plugins: [
      'babel-plugin-transform-export-extensions',
      ['babel-plugin-transform-dev', { evaluate: false }],
    ],
    presets: [
      ['babel-preset-env', {
        modules: 'commonjs',
        shippedProposals: true,
        targets: { node: '6.5' },
        useBuiltIns: 'usage',
      }],
      'babel-preset-stage-2',
      'babel-preset-flow',
    ],
  };
};