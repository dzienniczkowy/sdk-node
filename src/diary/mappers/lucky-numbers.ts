import type { HomepageData } from '../interfaces/homepage/homepage-data';
import type { LuckyNumber } from '../interfaces/homepage/lucky-number';

export function mapLuckyNumbers(data: HomepageData): LuckyNumber[] {
  return data
    .flatMap((unit) => unit.Zawartosc
      .flatMap((school) => school.Zawartosc
        .map(
          (number) => ({
            unitName: unit.Nazwa,
            schoolName: school.Nazwa,
            number: parseInt(number.Nazwa.split(': ')[1], 10),
          }),
        )));
}
