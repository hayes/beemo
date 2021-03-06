import fs from 'fs';
import DriverContext from '../../core/src/contexts/DriverContext';
import ESLintDriver from '../src/ESLintDriver';
import { createDriverContext, createTestTool } from '../../../tests/helpers';

describe('ESLintDriver', () => {
  let driver: ESLintDriver;
  let context: DriverContext;
  let spy: jest.SpyInstance;

  beforeEach(() => {
    driver = new ESLintDriver();
    driver.tool = createTestTool();
    driver.bootstrap();

    context = createDriverContext(driver);

    spy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => true);
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('sets options from constructor', () => {
    driver = new ESLintDriver({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: 'true' },
    });

    expect(driver.options).toEqual({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: 'true' },
      strategy: 'native',
    });
  });

  it('sets correct metadata', () => {
    expect(driver.metadata).toEqual(
      expect.objectContaining({
        bin: 'eslint',
        configName: '.eslintrc.js',
        configOption: '--config',
        dependencies: [],
        description: 'Lint files with ESLint',
        filterOptions: true,
        helpOption: '--help',
        title: 'ESLint',
        useConfigOption: false,
      }),
    );
  });

  describe('mergeConfig()', () => {
    it('merges using eslint engine', () => {
      expect(
        driver.mergeConfig(
          {
            env: {
              node: true,
            },
            rules: {
              foo: 'error',
            },
          },
          {
            rules: {
              foo: ['error', 'always'],
            },
          },
        ),
      ).toEqual({
        env: {
          node: true,
        },
        rules: {
          foo: ['error', 'always'],
        },
      });
    });
  });

  describe('handleCreateIgnoreFile()', () => {
    it('does nothing if no ignore field', () => {
      const config = { parser: 'babel' };

      driver.handleCreateIgnoreFile(context, '/some/path/.eslintrc.js', config);

      expect(config).toEqual({ parser: 'babel' });
    });

    it('errors if not an array', () => {
      expect(() => {
        driver.handleCreateIgnoreFile(context, '/some/path/.eslintrc.js', {
          // @ts-ignore
          ignore: 'foo',
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('creates ignore file and updates references', () => {
      const config = {
        parser: 'babel',
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.handleCreateIgnoreFile(context, '/some/path/.eslintrc.js', config);

      expect(spy).toHaveBeenCalledWith('/some/path/.eslintignore', 'foo\nbar\nbaz');

      expect(context.configPaths).toEqual([{ driver: 'eslint', path: '/some/path/.eslintignore' }]);

      expect(config).toEqual({ parser: 'babel' });
    });
  });
});
