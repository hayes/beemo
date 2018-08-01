import { Tool } from 'boost';
import Driver from '../src/Driver';
import ExecuteDriverRoutine from '../src/ExecuteDriverRoutine';
import RunCommandRoutine from '../src/driver/RunCommandRoutine';
import {
  createDriver,
  createDriverContext,
  setupMockTool,
  getFixturePath,
  createTestDebugger,
} from '../../../tests/helpers';
import { DriverContext } from '../../../node_modules/@beemo/core/src';

jest.mock('boost/lib/Tool');

jest.mock('../src/driver/RunCommandRoutine', () => jest.fn());

describe('ExecuteDriverRoutine', () => {
  let routine: ExecuteDriverRoutine;
  let driver: Driver<any>;

  beforeEach(() => {
    const tool = new Tool({});

    driver = createDriver('primary', tool);

    routine = new ExecuteDriverRoutine('driver', 'Executing driver');
    routine.context = createDriverContext(driver);
    routine.tool = setupMockTool(tool);
    routine.debug = createTestDebugger();

    // RunCommandRoutine is mocked, so use plain objects
    // @ts-ignore
    routine.routines = [
      { key: 'primary' },
      { key: 'foo' },
      { key: 'bar' },
      { key: 'baz' },
      { key: 'qux' },
    ];

    routine.workspacePackages = [
      { name: '@scope/primary', workspaceName: 'primary' },
      { name: '@scope/foo', workspaceName: 'foo' },
      { name: '@scope/bar', workspaceName: 'bar' },
      { name: '@scope/baz', workspaceName: 'baz' },
      { name: '@scope/qux', workspaceName: 'qux' },
    ];

    // @ts-ignore
    RunCommandRoutine.mockClear();
  });

  describe('bootstrap()', () => {
    it('adds a routine for the primary driver', () => {
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(
        new RunCommandRoutine('primary', 'primary -a --foo bar baz'),
      );
    });

    it('adds multiple routines when --parallel is used', () => {
      routine.context.args.parallel = ['"--one --two=2"', '" --three -f "'];
      routine.context.argv.push('--parallel="--one --two=2"', '--parallel=" --three -f "');
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(
        new RunCommandRoutine('primary', 'primary -a --foo bar baz --one --two=2', {
          additionalArgv: ['--one', '--two=2'],
        }),
      );
      expect(routine.pipe).toHaveBeenCalledWith(
        new RunCommandRoutine('primary', 'primary -a --foo bar baz --three -f', {
          additionalArgv: ['--three', '-f'],
        }),
      );
    });

    it('adds a routine if parallel is empty', () => {
      routine.context.args.parallel = [];
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(
        new RunCommandRoutine('primary', 'primary -a --foo bar baz'),
      );
    });

    describe('workspaces', () => {
      beforeEach(() => {
        routine.context.args.workspaces = '*';
        routine.context.workspaces = ['packages/*'];
        routine.context.root = getFixturePath('workspaces-driver');
      });

      it('adds a routine for each', () => {
        routine.pipe = jest.fn();
        routine.bootstrap();

        expect(routine.pipe).toHaveBeenCalledTimes(3);
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('foo', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            workspaceRoot: './packages/foo',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('bar', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            workspaceRoot: './packages/bar',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('baz', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            workspaceRoot: './packages/baz',
          }),
        );
      });

      it('adds a routine for each when --parallel is used', () => {
        routine.context.args.parallel = ['"--one --two=2"', '" --three -f "'];
        routine.context.argv.push('--parallel="--one --two=2"', '--parallel=" --three -f "');
        routine.pipe = jest.fn();
        routine.bootstrap();

        expect(routine.pipe).toHaveBeenCalledTimes(6);
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('foo', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            workspaceRoot: './packages/foo',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('foo', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            workspaceRoot: './packages/foo',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('bar', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            workspaceRoot: './packages/bar',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('bar', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            workspaceRoot: './packages/bar',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('baz', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            workspaceRoot: './packages/baz',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('baz', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            workspaceRoot: './packages/baz',
          }),
        );
      });

      it('errors if workspaces config is not set', () => {
        expect(() => {
          delete routine.context.workspaces;
          routine.bootstrap();
        }).toThrowErrorMatchingSnapshot();
      });

      it('errors if workspaces config is empty', () => {
        expect(() => {
          routine.context.workspaces = [];
          routine.bootstrap();
        }).toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe('execute()', () => {
    let context: DriverContext;

    beforeEach(() => {
      context = createDriverContext(driver);
    });

    it('pools each routine', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));

      await routine.execute(context);

      expect(routine.poolRoutines).toHaveBeenCalledWith(null, {}, routine.routines);
    });

    it('passes concurrency to pooler', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));
      context.args.concurrency = 2;

      await routine.execute(context);

      expect(routine.poolRoutines).toHaveBeenCalledWith(null, { concurrency: 2 }, routine.routines);
    });

    it('throws an error if any failures', async () => {
      routine.poolRoutines = jest.fn(() =>
        Promise.resolve({ errors: [new Error('Failed'), new Error('Oops')], results: [] }),
      );

      try {
        await routine.execute(context);
      } catch (error) {
        expect(error).toEqual(new Error('Execution failure.\nFailed\n\nOops'));
      }
    });

    it('returns results', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [123] }));

      const response = await routine.execute(context);

      expect(response).toEqual([123]);
    });

    it('serializes priority routines before pooling other routines', async () => {
      routine.context.args.priority = 'qux,foo';
      routine.serializeRoutines = jest.fn(() => Promise.resolve());
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));
      routine.workspacePackages[1].peerDependencies = {
        '@scope/foo': '1.0.0',
      };

      await routine.execute(context);

      expect(routine.serializeRoutines).toHaveBeenCalledWith(null, [{ key: 'foo' }]);
      expect(routine.poolRoutines).toHaveBeenCalledWith(null, {}, [
        { key: 'primary' },
        { key: 'bar' },
        { key: 'baz' },
        { key: 'qux' },
      ]);
    });
  });

  describe('getFilteredWorkspaces()', () => {
    it('returns none for empty string', () => {
      routine.context.args.workspaces = '';

      expect(routine.getFilteredWorkspaces()).toEqual([]);
    });

    it('returns all for wildcard `*`', () => {
      routine.context.args.workspaces = '*';

      expect(routine.getFilteredWorkspaces()).toEqual([
        { name: '@scope/primary', workspaceName: 'primary' },
        { name: '@scope/foo', workspaceName: 'foo' },
        { name: '@scope/bar', workspaceName: 'bar' },
        { name: '@scope/baz', workspaceName: 'baz' },
        { name: '@scope/qux', workspaceName: 'qux' },
      ]);
    });

    it('filters by package name', () => {
      routine.context.args.workspaces = 'foo|bar';

      expect(routine.getFilteredWorkspaces()).toEqual([
        { name: '@scope/foo', workspaceName: 'foo' },
        { name: '@scope/bar', workspaceName: 'bar' },
      ]);
    });
  });

  describe('loadWorkspacePackages()', () => {
    it('returns a list of paths', () => {
      routine.context.args.workspaces = '*';
      routine.context.workspaces = ['packages/*'];
      routine.context.root = getFixturePath('workspaces-driver');

      expect(routine.loadWorkspacePackages()).toEqual([
        {
          name: 'bar',
          workspaceName: 'bar',
          workspacePath: getFixturePath('workspaces-driver/packages/bar'),
          packagePath: getFixturePath('workspaces-driver/packages/bar/package.json'),
        },
        {
          name: 'baz',
          workspaceName: 'baz',
          workspacePath: getFixturePath('workspaces-driver/packages/baz'),
          packagePath: getFixturePath('workspaces-driver/packages/baz/package.json'),
        },
        {
          name: 'foo',
          workspaceName: 'foo',
          workspacePath: getFixturePath('workspaces-driver/packages/foo'),
          packagePath: getFixturePath('workspaces-driver/packages/foo/package.json'),
        },
      ]);
    });

    it('returns empty if nothing found', () => {
      routine.context.args.workspaces = '*';
      routine.context.workspaces = ['packages/*'];
      routine.context.root = getFixturePath('workspaces-driver/fake-path');

      expect(routine.loadWorkspacePackages()).toEqual([]);
    });
  });

  describe('orderByWorkspacePriorityGraph()', () => {
    beforeEach(() => {
      routine.context.args.priority = true;
    });

    it('returns all as `other` if priority is false', () => {
      routine.context.args.priority = false;

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'bar' }, { key: 'baz' }, { key: 'qux' }],
        priority: [],
      });
    });

    it('returns all as `other` if no dependents', () => {
      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'bar' }, { key: 'baz' }, { key: 'qux' }],
        priority: [],
      });
    });

    it('prioritizes based on peerDependencies', () => {
      routine.workspacePackages[1].peerDependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'baz' }, { key: 'qux' }],
        priority: [{ key: 'bar' }],
      });
    });

    it('prioritizes based on dependencies', () => {
      routine.workspacePackages[1].dependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'baz' }, { key: 'qux' }],
        priority: [{ key: 'bar' }],
      });
    });

    it('sorts priority based on dependency count', () => {
      routine.workspacePackages[2].peerDependencies = {
        '@scope/primary': '2.0.0',
      };

      routine.workspacePackages[1].dependencies = {
        '@scope/bar': '1.0.0',
      };

      routine.workspacePackages[4].peerDependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'foo' }, { key: 'baz' }, { key: 'qux' }],
        priority: [{ key: 'bar' }, { key: 'primary' }],
      });
    });
  });
});