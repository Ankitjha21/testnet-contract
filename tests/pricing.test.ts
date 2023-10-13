import {
  demandFactorPeriodIndex,
  periodAtHeight,
  tallyNamePurchase,
} from '../src/pricing';
import { BlockHeight } from '../src/types';

describe('Pricing functions:', () => {
  describe('periodAtHeight function', () => {
    it.each([
      [[0, 0], 0],
      [[1, 0], 0],
      [[719, 0], 0],
      [[720, 0], 1],
      [[721, 0], 1],
      [[1439, 0], 1],
      [[1440, 0], 2],
      [[101, 101], 0],
      [[102, 101], 0],
      [[820, 101], 0],
      [[821, 101], 1],
      [[1540, 101], 1],
      [[1541, 101], 2],
    ])(
      'given valid block height and height of zero-th period %j, should return the correct period %d',
      ([inputBlockHeight, inputPeriodZeroHeight], expectedOutputPeriod) => {
        expect(
          periodAtHeight(
            new BlockHeight(inputBlockHeight),
            new BlockHeight(inputPeriodZeroHeight),
          ),
        ).toEqual(expectedOutputPeriod);
      },
    );
  });

  describe('demandFactorPeriodIndex function', () => {
    it.each([
      [[0], 0],
      [[1], 1],
      [[6], 6],
      [[7], 0],
      [[8], 1],
      [[15], 1],
      [[16], 2],
    ])(
      'given valid period %j, should return the correct index %d',
      ([inputPeriod], expectedOutputIndex) => {
        expect(demandFactorPeriodIndex(inputPeriod)).toEqual(
          expectedOutputIndex,
        );
      },
    );
  });

  describe('tallyNamePurchase function', () => {
    it('should increment purchasesThisPeriod', () => {
      expect(
        tallyNamePurchase({
          periodZeroBlockHeight: 0,
          currentPeriod: 0,
          trailingPeriodPurchases: [0, 0, 0, 0, 0, 0, 0],
          purchasesThisPeriod: 0,
          demandFactor: 1,
          consecutivePeriodsWithMinDemandFactor: 0,
        }),
      ).toEqual({
        periodZeroBlockHeight: 0,
        currentPeriod: 0,
        trailingPeriodPurchases: [0, 0, 0, 0, 0, 0, 0],
        purchasesThisPeriod: 1,
        demandFactor: 1,
        consecutivePeriodsWithMinDemandFactor: 0,
      });
      expect(
        tallyNamePurchase({
          periodZeroBlockHeight: 0,
          currentPeriod: 6,
          trailingPeriodPurchases: [0, 0, 0, 0, 0, 0, 0],
          purchasesThisPeriod: 0,
          demandFactor: 1,
          consecutivePeriodsWithMinDemandFactor: 0,
        }),
      ).toEqual({
        periodZeroBlockHeight: 0,
        currentPeriod: 6,
        trailingPeriodPurchases: [0, 0, 0, 0, 0, 0, 0],
        purchasesThisPeriod: 1,
        demandFactor: 1,
        consecutivePeriodsWithMinDemandFactor: 0,
      });
      expect(
        tallyNamePurchase({
          periodZeroBlockHeight: 0,
          currentPeriod: 7,
          trailingPeriodPurchases: [1, 1, 1, 1, 1, 1, 1],
          purchasesThisPeriod: 1,
          demandFactor: 1.5,
          consecutivePeriodsWithMinDemandFactor: 3,
        }),
      ).toEqual({
        periodZeroBlockHeight: 0,
        currentPeriod: 7,
        trailingPeriodPurchases: [1, 1, 1, 1, 1, 1, 1],
        purchasesThisPeriod: 2,
        demandFactor: 1.5,
        consecutivePeriodsWithMinDemandFactor: 3,
      });
    });
  });
});
