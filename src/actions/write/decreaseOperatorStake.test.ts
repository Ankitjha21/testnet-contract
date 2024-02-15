import {
  GATEWAY_REGISTRY_SETTINGS,
  INVALID_GATEWAY_EXISTS_MESSAGE,
  INVALID_INPUT_MESSAGE,
} from '../../constants';
import {
  getBaselineState,
  stubbedArweaveTxId,
  stubbedGatewayData,
} from '../../tests/stubs';
import { GatewayStatus } from '../../types';
import { decreaseOperatorStake } from './decreaseOperatorStake';

describe('decreaseOperatorStake', () => {
  describe('invalid inputs', () => {
    it.each([[0, '', stubbedArweaveTxId.concat(stubbedArweaveTxId), true]])(
      'should throw an error on invalid qty',
      async (badQty: unknown) => {
        const initialState = {
          ...getBaselineState(),
          gateways: {
            [stubbedArweaveTxId]: stubbedGatewayData,
          },
          balances: {
            [stubbedArweaveTxId]: 10000,
          },
        };
        const error = await decreaseOperatorStake(initialState, {
          caller: stubbedArweaveTxId,
          input: {
            qty: badQty,
          },
        }).catch((e: any) => e);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual(
          expect.stringContaining(INVALID_INPUT_MESSAGE),
        );
      },
    );
  });

  describe('valid inputs', () => {
    it('should throw an error if the caller does not sufficient funds staked', async () => {
      const initialState = {
        ...getBaselineState(),
        gateways: {
          [stubbedArweaveTxId]: {
            ...stubbedGatewayData,
            operatorStake: 100,
          },
        },
      };
      const error = await decreaseOperatorStake(initialState, {
        caller: stubbedArweaveTxId,
        input: {
          qty: 101,
        },
      }).catch((e: any) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual(
        expect.stringContaining(
          `101 is not enough operator stake to maintain the minimum of ${GATEWAY_REGISTRY_SETTINGS.minOperatorStake}`,
        ),
      );
    });

    it('should throw an error if the caller is not an existing gateway', async () => {
      const initialState = getBaselineState();
      const error = await decreaseOperatorStake(initialState, {
        caller: stubbedArweaveTxId,
        input: {
          qty: 100,
        },
      }).catch((e: any) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual(
        expect.stringContaining(INVALID_GATEWAY_EXISTS_MESSAGE),
      );
    });

    it('should throw an error if the gateway is leaving the network', async () => {
      const initialState = {
        ...getBaselineState(),
        gateways: {
          [stubbedArweaveTxId]: {
            ...stubbedGatewayData,
            status: 'leaving' as GatewayStatus,
          },
        },
      };
      const error = await decreaseOperatorStake(initialState, {
        caller: stubbedArweaveTxId,
        input: {
          qty: 100,
        },
      }).catch((e: any) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual(
        expect.stringContaining(
          'Gateway is leaving the network and cannot accept additional stake.',
        ),
      );
    });

    it('should vault the stake decrease and update the state if it is an active gateway and will stay above the minimum required', async () => {
      const initialState = {
        ...getBaselineState(),
        gateways: {
          [stubbedArweaveTxId]: {
            ...stubbedGatewayData,
            operatorStake: GATEWAY_REGISTRY_SETTINGS.minOperatorStake + 1000,
            vaults: {},
          },
        },
      };
      const { state } = await decreaseOperatorStake(initialState, {
        caller: stubbedArweaveTxId,
        input: {
          qty: 1000,
        },
      });
      expect(state.gateways[stubbedArweaveTxId]).toEqual({
        ...stubbedGatewayData,
        operatorStake: GATEWAY_REGISTRY_SETTINGS.minOperatorStake,
        vaults: {
          [SmartWeave.transaction.id]: {
            balance: 1000,
            start: SmartWeave.block.height,
            end:
              SmartWeave.block.height +
              GATEWAY_REGISTRY_SETTINGS.operatorStakeWithdrawLength,
          },
        },
      });
    });
  });
});
