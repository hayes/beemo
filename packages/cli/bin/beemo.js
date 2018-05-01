#!/usr/bin/env node

// require('../lib/CLI');

require('@oclif/command')
  .run()
  .catch(require('@oclif/errors/handle'));
