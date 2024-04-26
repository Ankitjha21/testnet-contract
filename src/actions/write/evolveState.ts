import { NON_CONTRACT_OWNER_MESSAGE } from '../../constants';
import { ContractWriteResult, Fees, IOState, PstAction } from '../../types';

// Updates this contract to new source code
export const evolveState = async (
  state: IOState,
  { caller }: PstAction,
): Promise<ContractWriteResult> => {
  const owner = state.owner;

  if (caller !== owner) {
    throw new ContractError(NON_CONTRACT_OWNER_MESSAGE);
  }

  const updatedFees = Object.keys(state.fees).reduce((acc: Fees, key) => {
    const existingFee = state.fees[key];
    // convert the base fee to mIO
    acc[key] = existingFee / 1_000_000;
    return acc;
  }, {});

  state.fees = updatedFees;

  return { state };
};
