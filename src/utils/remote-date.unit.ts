import {
  dateStringToRemoteISO,
  humanDateToDateString, remoteISOToDateString,
  remoteISOToExtendedISO,
} from './remote-date';

describe('Remote date utils', () => {
  it('humanDateToDateString', () => {
    expect(humanDateToDateString('22.10.2020')).toEqual('2020-10-22');
    expect(humanDateToDateString('29.02.2020')).toEqual('2020-02-29');
    expect(humanDateToDateString('3.2.2020')).toEqual('2020-02-03');
    expect(humanDateToDateString('03.02.2020')).toEqual('2020-02-03');
    expect(humanDateToDateString('17.01.2015')).toEqual('2015-01-17');
    expect(humanDateToDateString('22.04.1998')).toEqual('1998-04-22');
  });

  it('remoteISOToExtendedISO', () => {
    const tests = [
      ['2021-01-11 17:30:15', '2021-01-11T17:30:15+01:00'],
      ['2020-03-15 00:20:40', '2020-03-15T00:20:40+01:00'],
      ['2013-08-01 00:20:40', '2013-08-01T00:20:40+02:00'],
    ];
    tests.forEach(([actual, expected]) => {
      expect(new Date(remoteISOToExtendedISO(actual)).getTime())
        .toEqual(new Date(expected).getTime());
    });
  });

  it('dateStringToRemoteISO', () => {
    expect(dateStringToRemoteISO('2021-01-11')).toEqual('2021-01-11T00:00:00');
    expect(dateStringToRemoteISO('1999-09-19')).toEqual('1999-09-19T00:00:00');
    expect(dateStringToRemoteISO('1996-9-3')).toEqual('1996-09-03T00:00:00');
    expect(dateStringToRemoteISO('2014-01-01')).toEqual('2014-01-01T00:00:00');
    expect(dateStringToRemoteISO('2016-02-29')).toEqual('2016-02-29T00:00:00');
  });

  it('remoteISOToDateString', () => {
    expect(remoteISOToDateString('2021-01-11 00:00:00')).toEqual('2021-01-11');
    expect(remoteISOToDateString('1999-09-19 00:00:00')).toEqual('1999-09-19');
    expect(remoteISOToDateString('1996-9-3 00:00:00')).toEqual('1996-09-03');
    expect(remoteISOToDateString('2014-01-01 00:00:00')).toEqual('2014-01-01');
    expect(remoteISOToDateString('2016-02-29 00:00:00')).toEqual('2016-02-29');
    expect(remoteISOToDateString('2015-01-01 13:27:59')).toEqual('2015-01-01');
  });
});
