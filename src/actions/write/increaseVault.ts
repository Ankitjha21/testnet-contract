import { ContractWriteResult, IOState, PstAction } from '../../types';
import { getInvalidAjvMessage } from '../../utilities';
import { validateIncreaseVault } from '../../validations';
import { safeIncreaseVault } from '../../vaults';

// TODO: use top level class
export class IncreaseVault {
  id: number;
  qty: number;

  constructor(input: any) {
    if (!validateIncreaseVault(input)) {
      throw new ContractError(
        getInvalidAjvMessage(validateIncreaseVault, input, 'increaseVault'),
      );
    }
    const { id, qty } = input;
    this.id = id;
    this.qty = qty;
  }
}

export const increaseVault = async (
  state: IOState,
  { caller, input }: PstAction,
): Promise<ContractWriteResult> => {
  const { balances, vaults } = state;
  const { id, qty } = new IncreaseVault(input);

  safeIncreaseVault({ balances, vaults, address: caller, id, qty });

  return { state };
};
