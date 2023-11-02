import {
  CALLER_NOT_VALID_OBSERVER_MESSAGE,
  INVALID_INPUT_MESSAGE,
} from '../../constants';
import { Gateway, IOState, Observations, WeightedObserver } from '../../types';
import { getPrescribedObservers } from '../../utilities';
import { saveObservations } from './saveObservations';
import { getBaselineState } from './submitAuctionBid.test';

jest.mock('../../utilities', () => ({
  ...jest.requireActual('../../utilities'),
  getPrescribedObservers: jest.fn(),
}));

const validTxId = 'thevalidtransactionidthatis43characterslong';
export const baselineGatewayData: Gateway = {
  operatorStake: 10_000,
  vaults: [],
  observerWallet: 'fake-observer-wallet',
  start: 0,
  status: 'joined',
  end: 0,
  settings: {
    label: 'test',
    fqdn: 'fqdn.com',
    port: 443,
    protocol: 'https',
  },
};

const stubbedWeightedObservers: WeightedObserver = {
  gatewayAddress: 'observer-address',
  observerAddress: 'observer-address',
  stake: 10_000,
  start: 0,
  stakeWeight: 1,
  tenureWeight: 1,
  gatewayRewardRatioWeight: 1,
  observerRewardRatioWeight: 1,
  compositeWeight: 1,
  normalizedCompositeWeight: 1,
};

describe('saveObservations', () => {
  describe('invalid inputs', () => {
    it.each([
      [
        'should throw an error if the observerReportTxId is not properly formatted',
        {
          ...getBaselineState(),
        },
        {
          caller: 'fake-caller',
          input: {
            observerReportTxId: 'invalid-tx-id',
            failedGateways: [],
          },
        },
        INVALID_INPUT_MESSAGE,
      ],
      [
        'should throw an error if the failedGateways is not an array',
        {
          ...getBaselineState(),
        },
        {
          caller: 'fake-caller',
          input: {
            observerReportTxId: 'invalid-tx-id',
            failedGateways: {},
          },
        },
        INVALID_INPUT_MESSAGE,
      ],
      [
        'should throw an error if the failedGateways is not an array of tx ids',
        {
          ...getBaselineState(),
        },
        {
          caller: 'fake-caller',
          input: {
            observerReportTxId: 'invalid-tx-id',
            failedGateways: ['invalid-tx-id'],
          },
        },
        INVALID_INPUT_MESSAGE,
      ],
    ])('%s', async (_, initialState: IOState, inputData, errorMessage) => {
      const error = await saveObservations(initialState, inputData).catch(
        (e) => e,
      );
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual(expect.stringContaining(errorMessage));
    });
  });

  describe('valid input', () => {
    beforeAll(() => {
      // adds two prescribed observers to the mock
      (getPrescribedObservers as jest.Mock).mockResolvedValue([
        stubbedWeightedObservers,
        {
          ...stubbedWeightedObservers,
          gatewayAddress: 'a-second-observer-address',
          observerAddress: 'a-second-observer-address',
        },
      ]);
    });

    describe('invalid caller', () => {
      it.each([
        [
          'should throw an error if the caller is not a registered gateway address or observer address on a registered gateway',
          {
            ...getBaselineState(),
            gateways: {
              validTxId: baselineGatewayData,
            },
          },
          {
            caller: 'fake-caller',
            input: {
              observerReportTxId: validTxId,
              failedGateways: [],
            },
          },
          CALLER_NOT_VALID_OBSERVER_MESSAGE,
        ],
        [
          'should throw an error if the caller is a registered gateway that has not started observing yet',
          {
            ...getBaselineState(),
            gateways: {
              validTxId: {
                ...baselineGatewayData,
                start: 10,
              },
            },
          },
          {
            caller: 'fake-observer-wallet',
            input: {
              observerReportTxId: validTxId,
              failedGateways: [],
            },
          },
          CALLER_NOT_VALID_OBSERVER_MESSAGE,
        ],
        [
          'should throw an error if the caller is not a prescribed observer for the epoch',
          {
            ...getBaselineState(),
            gateways: {
              'fake-observer-wallet': {
                ...baselineGatewayData,
                observerWallet: 'fake-observer-wallet',
              },
            },
          },
          {
            caller: 'fake-observer-wallet',
            input: {
              observerReportTxId: validTxId,
              failedGateways: [],
            },
          },
          CALLER_NOT_VALID_OBSERVER_MESSAGE,
        ],
      ])('%s', async (_, initialState: IOState, inputData, errorMessage) => {
        const error = await saveObservations(initialState, inputData).catch(
          (e) => e,
        );
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual(expect.stringContaining(errorMessage));
      });
    });

    describe('valid caller', () => {
      it('should not save a gateway to the observations list for the epoch if it is already there', async () => {
        const existingObservations: Observations = {
          [0]: {
            failureSummaries: {
              [validTxId]: ['observer-address'],
            },
            reports: {},
          },
        };
        const initialState = {
          ...getBaselineState(),
          gateways: {
            'observer-address': baselineGatewayData,
          },
          observations: existingObservations,
        };
        const { state } = await saveObservations(initialState, {
          caller: 'observer-address',
          input: {
            observerReportTxId: validTxId,
            failedGateways: [],
          },
        });
        expect(state).toEqual(initialState);
      });
    });

    it('should not save a gateway to the failure summaries for the epoch if it the observed gateway does not exist in the registry', async () => {
      const initialState = {
        ...getBaselineState(),
        gateways: {
          'observer-address': baselineGatewayData,
        },
      };
      const { state } = await saveObservations(initialState, {
        caller: 'observer-address',
        input: {
          observerReportTxId: validTxId,
          failedGateways: [validTxId],
        },
      });
      const expectedState = {
        ...initialState,
        observations: {
          [0]: {
            failureSummaries: {},
            reports: {
              'observer-address': validTxId,
            },
          },
        },
      };
      expect(state).toEqual(expectedState);
    });

    it('should not save a gateway to the failure summaries for the epoch if it the observed gateway has not yet started serving', async () => {
      const initialState = {
        ...getBaselineState(),
        gateways: {
          'observer-address': baselineGatewayData,
          [validTxId]: {
            ...baselineGatewayData,
            start: 10,
          },
        },
      };
      const { state } = await saveObservations(initialState, {
        caller: 'observer-address',
        input: {
          observerReportTxId: validTxId,
          failedGateways: [validTxId],
        },
      });
      const expectedState = {
        ...initialState,
        observations: {
          [0]: {
            failureSummaries: {},
            reports: {
              'observer-address': validTxId,
            },
          },
        },
      };
      expect(state).toEqual(expectedState);
    });

    it('should create the epoch observations object and save observed gateway summaries if it does not already exist', async () => {
      const initialState = {
        ...getBaselineState(),
        gateways: {
          'observer-address': baselineGatewayData,
          [validTxId]: {
            ...baselineGatewayData,
            observerAddress: validTxId,
          },
        },
        observations: {},
      };
      const { state } = await saveObservations(initialState, {
        caller: 'observer-address',
        input: {
          observerReportTxId: validTxId,
          failedGateways: [validTxId],
        },
      });
      const expectedObservationsForEpoch: Observations = {
        [0]: {
          failureSummaries: {
            [validTxId]: ['observer-address'],
          },
          reports: {
            'observer-address': validTxId,
          },
        },
      };
      const expectedState = {
        ...initialState,
        observations: expectedObservationsForEpoch,
      };
      expect(state).toEqual(expectedState);
    });

    it('should append to the list of failure summaries for a gateway if one already exists and a new report is submitted', async () => {
      const initialObservationsForEpoch: Observations = {
        [0]: {
          failureSummaries: {
            [validTxId]: ['observer-address'],
          },
          reports: {
            'observer-address': validTxId,
          },
        },
      };
      const initialState = {
        ...getBaselineState(),
        gateways: {
          'observer-address': baselineGatewayData,
          'a-second-observer-address': {
            ...baselineGatewayData,
            observerAddress: 'a-second-observer-address',
          },
          [validTxId]: {
            ...baselineGatewayData,
            observerAddress: validTxId,
          },
        },
        observations: initialObservationsForEpoch,
      };

      const { state } = await saveObservations(initialState, {
        caller: 'a-second-observer-address',
        input: {
          observerReportTxId: validTxId,
          failedGateways: [validTxId],
        },
      });
      const expectedObservationsForEpoch: Observations = {
        [0]: {
          failureSummaries: {
            [validTxId]: ['observer-address', 'a-second-observer-address'],
          },
          reports: {
            'observer-address': validTxId,
            'a-second-observer-address': validTxId,
          },
        },
      };
      const expectedState = {
        ...initialState,
        observations: expectedObservationsForEpoch,
      };
      expect(state).toEqual(expectedState);
    });
  });
});
