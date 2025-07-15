import fs from 'fs';
import path from 'path';

describe('mario style cursor', () => {
  test('canvas uses glove cursor', () => {
    const cssPath = path.resolve(__dirname, '../style.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    const cursorRule = /#c\s*{[^}]*cursor:\s*url\(['"]?\.\/assets\/glove\.svg['"]?[^;]*;/s;
    expect(cursorRule.test(css)).toBe(true);
  });
});
