import { safeTransfer } from '../../transfer';
import {
  ContractWriteResult,
  IOState,
  IOToken,
  PstAction,
  mIOToken,
} from '../../types';
import { getInvalidAjvMessage } from '../../utilities';
import { validateTransferToken } from '../../validations';

// TODO: use top level class
export class TransferToken {
  target: string;
  qty: mIOToken;

  constructor(input: any) {
    if (!validateTransferToken(input)) {
      throw new ContractError(
        getInvalidAjvMessage(validateTransferToken, input, 'transferToken'),
      );
    }
    const { target, qty, denomination = 'mIO' } = input;
    this.target = target;
    this.qty =
      denomination === 'mIO' ? new mIOToken(qty) : new IOToken(qty).toMIO();
  }
}

export const transferTokens = async (
  state: IOState,
  { caller, input }: PstAction,
): Promise<ContractWriteResult> => {
  const { balances } = state;
  const { target, qty } = new TransferToken(input);

  safeTransfer({
    balances,
    fromAddress: caller,
    toAddress: target,
    qty,
  });

  return { state };
};
