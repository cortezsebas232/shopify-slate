const SlateConfig = require('@shopify/slate-config');

jest.mock('../slate-rc.schema');

const MOCK_VALID_SLATE_RC = {
  uuid: '9a983jf94jk42',
};

beforeEach(() => jest.resetModules());

afterEach(() => require('mock-fs').restore());

describe('get()', () => {
  describe('if .slaterc exists in the `~/` directory', () => {
    test('returns its parsed JSON contents', () => {
      const slateRc = require('../index');
      const mock = require('mock-fs');
      const config = new SlateConfig(require('../slate-rc.schema'));

      mock({
        [config.get('paths.slateRc')]: JSON.stringify(MOCK_VALID_SLATE_RC),
      });

      expect(slateRc.get()).toMatchObject(MOCK_VALID_SLATE_RC);
    });

    test('throws an error if the JSON file is invalid', () => {
      const slateRc = require('../index');
      const SlateRcError = require('../slate-rc-error');
      const config = new SlateConfig(require('../slate-rc.schema'));
      const mock = require('mock-fs');

      mock({[config.get('paths.slateRc')]: 'some invalid JSON'});

      expect(() => {
        slateRc.get();
      }).toThrowError(SlateRcError);
    });

    test('returns null if file is empty', () => {
      const slateRc = require('../index');
      const config = new SlateConfig(require('../slate-rc.schema'));
      const mock = require('mock-fs');

      mock({[config.get('paths.slateRc')]: ''});

      expect(slateRc.get()).toBe(null);
    });
  });

  describe('if a .slaterc file does not exist in the `~/` ', () => {
    test('returns null', () => {
      const slateRc = require('../index');
      const results = slateRc.get();

      expect(results).toBe(null);
    });
  });
});

describe('generate()', () => {
  test('creates a .slaterc file in the `~/` directory and returns its contents', () => {
    const slateRc = require('../index');
    const config = new SlateConfig(require('../slate-rc.schema'));
    const mock = require('mock-fs');
    const fs = require('fs');

    mock();

    const content = slateRc.generate();

    expect(fs.existsSync(config.get('paths.slateRc'))).toBeTruthy();
    expect(content.uuid).toBeDefined();
  });

  describe('throws an error if', () => {
    test('.slaterc file already exists', () => {
      const slateRc = require('../index');
      const SlateRcError = require('../slate-rc-error');
      const mock = require('mock-fs');

      mock();

      slateRc.generate();

      expect(() => {
        slateRc.generate();
      }).toThrowError(SlateRcError);
    });
  });
});

describe('update()', () => {
  test('applies any changes to the .slaterc file', () => {
    const rc = require('../index');
    const mock = require('mock-fs');
    const config = new SlateConfig(require('../slate-rc.schema'));

    mock({[config.get('paths.slateRc')]: JSON.stringify(MOCK_VALID_SLATE_RC)});

    rc.update({someChange: 'value'});

    expect(rc.get().someChange).toBeDefined();
  });
});
