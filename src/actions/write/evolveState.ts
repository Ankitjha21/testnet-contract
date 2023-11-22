import { NON_CONTRACT_OWNER_MESSAGE, RESERVED_NAMES } from '../../constants';
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

  for (const name of RESERVED_NAMES) {
    const existingRecord = state.records[name];
    const existingReserved = state.reserved[name];
    const existingAuction = state.auctions[name];
    if (existingRecord || existingReserved || existingAuction) {
      // skip any that are already owned/in auction/reserved
      continue;
    }
    // add the reserved name for the contract owner
    state.reserved[name] = {
      target: owner,
    };
  }

  // TODO: remove this
  state.lastTickedHeight = +SmartWeave.block.height;

  return { state };
};
