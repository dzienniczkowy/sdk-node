import { URL } from 'url';
import { joinPathNames, joinUrl } from '../src/utils';

describe('URL utils', () => {
  it('joinPathNames', () => {
    expect(joinPathNames('/one', 'two', 'three', '/four')).toEqual('/four');
    expect(joinPathNames('/one')).toEqual('/one');
    expect(joinPathNames('/one/')).toEqual('/one/');
    expect(joinPathNames('/one', 'two')).toEqual('/one/two');
    expect(joinPathNames('/one', 'two/')).toEqual('/one/two/');
  });

  it('joinPathNames errors', () => {
    expect(() => joinPathNames('one/', 'two', 'three', 'four/')).toThrow();
    expect(() => joinPathNames('one')).toThrow();
    expect(() => joinPathNames('one/')).toThrow();
    expect(() => joinPathNames('one/', 'two')).toThrow();
  });

  it('joinUrl', () => {
    expect(joinUrl(new URL('https://example.com/')).toString()).toEqual('https://example.com/');
    expect(joinUrl(new URL('https://example.com')).toString()).toEqual('https://example.com/');
    expect(joinUrl('https://example.com').toString()).toEqual('https://example.com/');
    expect(joinUrl(new URL('https://example.com'), 'one', 'two').toString()).toEqual('https://example.com/one/two');
    expect(joinUrl(new URL('https://example.com/'), 'one', 'two').toString()).toEqual('https://example.com/one/two');
    expect(joinUrl(new URL('https://example.com/one'), '/two').toString()).toEqual('https://example.com/two');
    expect(joinUrl(new URL('https://example.com/one/'), 'two').toString()).toEqual('https://example.com/one/two');
    expect(joinUrl(new URL('https://example.com'), 'one/', 'two/').toString()).toEqual('https://example.com/one/two/');
    expect(joinUrl('https://example.com', 'one/', 'two/').toString()).toEqual('https://example.com/one/two/');
    expect(joinUrl('http://example.com', 'one/').toString()).toEqual('http://example.com/one/');
    expect(joinUrl('https://example.com:3000', 'one/').toString()).toEqual('https://example.com:3000/one/');
    expect(joinUrl('https://example.com?foo=bar#1234').toString()).toEqual('https://example.com/?foo=bar#1234');
    expect(joinUrl('https://example.com/?foo=bar#1234').toString()).toEqual('https://example.com/?foo=bar#1234');
    expect(joinUrl('https://example.com/one?foo=bar#1234').toString()).toEqual('https://example.com/one?foo=bar#1234');
    expect(joinUrl('https://example.com/one/?foo=bar#1234').toString()).toEqual('https://example.com/one/?foo=bar#1234');
    expect(joinUrl('https://example.com/one?foo=bar#1234', 'two').toString()).toEqual('https://example.com/one/two?foo=bar#1234');
    expect(joinUrl('https://example.com/one?foo=bar#1234', '/two').toString()).toEqual('https://example.com/two?foo=bar#1234');
  });
});
