import { BLOCKS_PER_DAY, NON_CONTRACT_OWNER_MESSAGE } from '../../constants';
import { ContractWriteResult, IOState, PstAction } from '../../types';

// Updates this contract to new source code
export const evolveState = async (
  state: IOState,
  { caller }: PstAction,
): Promise<ContractWriteResult> => {
  const owner = state.owner;

  if (caller !== owner) {
    throw new ContractError(NON_CONTRACT_OWNER_MESSAGE);
  }

  for (const [address, gateway] of Object.entries(state.gateways)) {
    if (gateway.status === 'leaving') {
      // fix the expiration to 21 days (was set at 90)
      const currentEndFor90Days = gateway.end;
      const currentEndFor21Days = currentEndFor90Days - 69 * BLOCKS_PER_DAY;
      state.gateways[address].end = currentEndFor21Days;
      state.gateways[address].vaults[address].end = currentEndFor21Days;
    }
  }

  return { state };
};
