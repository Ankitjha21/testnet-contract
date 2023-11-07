import { SECONDS_IN_A_YEAR } from '../../constants';
import { IOState } from '../../types';
import { getBaselineState } from '../write/submitAuctionBid.test';
import { getPriceForInteraction } from './price';

describe('getPriceForInteraction', () => {
  const state = getBaselineState();

  it.each([
    [
      'should return the correct price for buyRecord',
      state,
      {
        caller: 'test-caller',
        input: {
          function: 'buyRecord',
          name: 'test-buy-record',
          type: 'permabuy',
        },
      },
      500000,
    ],
    [
      'should return the correct price for extendRecord',
      {
        ...state,
        records: {
          'existing-record': {
            contractTxId: 'test-contract-tx-id',
            endTimestamp: +SmartWeave.block.timestamp + SECONDS_IN_A_YEAR, // one years,
            type: 'lease',
            startTimestamp: +SmartWeave.block.timestamp,
            undernames: 10,
            purchasePrice: 1000,
          },
        },
      } as IOState,
      {
        caller: 'test-caller',
        input: {
          function: 'extendRecord',
          name: 'existing-record',
          years: 1,
        },
      },
      50_000,
    ],
    [
      'should return the correct price for increaseUndernameCount',
      {
        ...state,
        records: {
          'existing-record': {
            contractTxId: 'test-contract-tx-id',
            endTimestamp: +SmartWeave.block.timestamp + SECONDS_IN_A_YEAR, // one year from the current block timestamp,
            type: 'lease',
            startTimestamp: +SmartWeave.block.timestamp,
            undernames: 10,
            purchasePrice: 1000,
          },
        },
      } as IOState,
      {
        caller: 'test-caller',
        input: {
          function: 'increaseUndernameCount',
          name: 'existing-record',
          qty: 5,
        },
      },
      1250,
    ],
    [
      'should return the correct price for increaseUndernameCount',
      {
        ...state,
        records: {
          'existing-record': {
            contractTxId: 'test-contract-tx-id',
            type: 'permabuy',
            startTimestamp: +SmartWeave.block.timestamp,
            undernames: 10,
            purchasePrice: 1000,
          },
        },
      } as IOState,
      {
        caller: 'test-caller',
        input: {
          function: 'increaseUndernameCount',
          name: 'existing-record',
          qty: 5,
        },
      },
      62500,
    ],
    [
      'should return the current bid for an existing auction and submitAuctionBid',
      {
        ...state,
        auctions: {
          'existing-auction': {
            startPrice: 1000,
            floorPrice: 1,
            startHeight: 0,
            endHeight: 10,
            initiator: 'initiator',
            contractTxId: 'atomic',
            type: 'lease',
            years: 1,
            settings: {
              decayInterval: 1,
              decayRate: 0.01,
              auctionDuration: 10,
              floorPriceMultiplier: 1,
              startPriceMultiplier: 10,
            },
          },
        },
      } as IOState,
      {
        caller: 'test-caller',
        input: {
          function: 'submitAuctionBid',
          name: 'existing-auction',
        },
      },
      990,
    ],
    [
      'should return the floor price a new auction and submitAuctionBid',
      {
        ...state,
        settings: {
          ...state.settings,
          auctions: {
            decayInterval: 1,
            decayRate: 0.01,
            auctionDuration: 10,
            floorPriceMultiplier: 1,
            startPriceMultiplier: 10,
          },
        },
      },
      {
        caller: 'test-caller',
        input: {
          function: 'submitAuctionBid',
          name: 'new-auction',
        },
      },
      540000,
    ],
  ])(
    '%s',
    (
      _: string,
      inputState: IOState,
      inputData: {
        caller: string;
        input: { function: string; [x: string]: unknown };
      },
      expectedResult: number,
    ) => {
      const fee = getPriceForInteraction(inputState, inputData);
      expect(fee).toEqual(expectedResult);
    },
  );
});
