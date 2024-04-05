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
      const correctEndFor21Days =
        currentEndFor90Days - 69 * BLOCKS_PER_DAY + 4 * BLOCKS_PER_DAY; // add 4 days given the mistake
      state.gateways[address].end = correctEndFor21Days;
      state.gateways[address].vaults[address].end = correctEndFor21Days;
    }
  }

  return { state };
};
