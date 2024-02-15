import {
  INSUFFICIENT_FUNDS_MESSAGE,
  INVALID_GATEWAY_EXISTS_MESSAGE,
  INVALID_INPUT_MESSAGE,
  NETWORK_LEAVING_STATUS,
} from '../../constants';
import { ContractWriteResult, IOState, PstAction } from '../../types';
import {
  unsafeDecrementBalance,
  walletHasSufficientBalance,
} from '../../utilities';

// Locks tokens into a new gateway operator vault
export const increaseOperatorStake = async (
  state: IOState,
  { caller, input }: PstAction,
): Promise<ContractWriteResult> => {
  const { gateways, balances } = state;

  const qty = input.qty;

  if (isNaN(qty) || qty <= 0) {
    throw new ContractError(INVALID_INPUT_MESSAGE);
  }

  if (!(caller in gateways)) {
    throw new ContractError(INVALID_GATEWAY_EXISTS_MESSAGE);
  }

  if (gateways[caller].status === NETWORK_LEAVING_STATUS) {
    throw new ContractError(
      'Gateway is leaving the network and cannot accept additional stake.',
    );
  }

  if (!walletHasSufficientBalance(balances, caller, qty.valueOf())) {
    throw new ContractError(INSUFFICIENT_FUNDS_MESSAGE);
  }

  unsafeDecrementBalance(state.balances, caller, qty.valueOf());
  state.gateways[caller].operatorStake += qty.valueOf();
  return { state };
};
