import { formatDateString, parseDateString } from './date';

describe('Date util tests', () => {
  describe('parseDateString', () => {
    it('Basic', () => {
      const date = parseDateString('2020-11-20');
      expect(date.getFullYear()).toEqual(2020);
      expect(date.getMonth()).toEqual(10);
      expect(date.getDate()).toEqual(20);
      expect(date.getHours()).toEqual(0);
      expect(date.getMinutes()).toEqual(0);
      expect(date.getSeconds()).toEqual(0);
    });

    it('Leading 0', () => {
      const date = parseDateString('2019-05-03');
      expect(date.getFullYear()).toEqual(2019);
      expect(date.getMonth()).toEqual(4);
      expect(date.getDate()).toEqual(3);
      expect(date.getHours()).toEqual(0);
      expect(date.getMinutes()).toEqual(0);
      expect(date.getSeconds()).toEqual(0);
    });

    it('No leading 0', () => {
      const date = parseDateString('2019-5-3');
      expect(date.getFullYear()).toEqual(2019);
      expect(date.getMonth()).toEqual(4);
      expect(date.getDate()).toEqual(3);
      expect(date.getHours()).toEqual(0);
      expect(date.getMinutes()).toEqual(0);
      expect(date.getSeconds()).toEqual(0);
    });
  });

  describe('formatDateString', () => {
    it('Simple', () => {
      expect(formatDateString(new Date('2020-11-20T00:00:00'))).toEqual('2020-11-20');
      expect(formatDateString(new Date('2020-11-20T23:00:00'))).toEqual('2020-11-20');
      expect(formatDateString(new Date('2019-05-03T00:00:00'))).toEqual('2019-05-03');
    });

    it('Detailed', () => {
      ['2011-10-15', '2000-01-01', '2050-02-04', '2020-01-11'].forEach((testDate) => {
        for (let h = 0; h < 24; h += 1) {
          for (let m = 0; m < 60; m += 15) {
            const date = new Date(testDate);
            date.setHours(h);
            date.setMinutes(m);
            date.setSeconds(0);
            expect(formatDateString(date)).toEqual(testDate);
          }
        }
      });
    });
  });
});
