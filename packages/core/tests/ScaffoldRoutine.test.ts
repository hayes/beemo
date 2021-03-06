import hygen from 'hygen';
import ScaffoldRoutine from '../src/ScaffoldRoutine';
import {
  getRoot,
  createTestDebugger,
  createTestTool,
  createScaffoldContext,
} from '../../../tests/helpers';

jest.mock('hygen');

describe('ScaffoldRoutine', () => {
  let routine: ScaffoldRoutine;

  beforeEach(() => {
    routine = new ScaffoldRoutine('sync', 'Syncing dotfiles');
    routine.context = createScaffoldContext();
    routine.tool = createTestTool();
    routine.debug = createTestDebugger();
  });

  describe('handleExec()', () => {
    it('executes command internally', () => {
      const spy = jest.fn();

      routine.executeCommand = spy;
      routine.handleExec('babel', 'const foo = {};');

      expect(spy).toHaveBeenCalledWith('babel', [], {
        input: 'const foo = {};',
        shell: true,
      });
    });
  });

  describe('handleLog()', () => {
    it('logs to tool', () => {
      const spy = jest.spyOn(routine.tool, 'log');

      routine.handleLog('foo');

      expect(spy).toHaveBeenCalledWith('foo');
    });
  });

  describe('execute()', () => {
    it('passes module root to tasks', async () => {
      routine.serializeTasks = jest.fn();

      await routine.execute(routine.context);

      expect(routine.serializeTasks).toHaveBeenCalledWith(getRoot());
    });

    it('executes pipeline in order', async () => {
      const runSpy = jest.spyOn(routine, 'runGenerator');

      await routine.execute(routine.context);

      expect(runSpy).toHaveBeenCalledWith(routine.context, getRoot(), expect.anything());
    });
  });

  describe('runGenerator()', () => {
    it('executes hygen engine', async () => {
      await routine.runGenerator(routine.context, './root');

      expect(hygen.engine).toHaveBeenCalledWith(['-a', '--foo', 'bar', 'baz'], {
        createPrompter: expect.anything(),
        cwd: routine.tool.options.root,
        debug: false,
        exec: routine.handleExec,
        logger: expect.anything(),
        templates: 'root/templates',
      });
    });

    it('rethrows error', async () => {
      const baseError = new Error('Oops');

      (hygen.engine as jest.Mock).mockImplementation(() => {
        throw baseError;
      });

      try {
        await routine.runGenerator(routine.context, './root');
      } catch (error) {
        expect(error).toBe(baseError);
      }
    });

    it('rewrites error message', async () => {
      (hygen.engine as jest.Mock).mockImplementation(() => {
        throw new Error("I can't find action 'action' for generator 'generator'.");
      });

      try {
        await routine.runGenerator(routine.context, './root');
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });
});
