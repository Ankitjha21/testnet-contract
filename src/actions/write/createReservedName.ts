import { getInvalidAjvMessage } from 'src/utilities';

import { NON_CONTRACT_OWNER_MESSAGE } from '../../constants';
import { ContractWriteResult, IOState, PstAction } from '../../types';
import { validateCreateReservedName } from '../../validations';

export class ReservedName {
  name: string;
  target: string;
  endTimestamp: number;

  constructor(input: any) {
    // validate using ajv validator
    if (!validateCreateReservedName(input)) {
      throw new ContractError(
        getInvalidAjvMessage(
          validateCreateReservedName,
          input,
          'createReservedName',
        ),
      );
    }
    const { name, target, endTimestamp } = input;
    this.endTimestamp = endTimestamp;
    this.target = target;
    this.name = name;
  }
}

// Updates this contract to new source code
export const createReservedName = async (
  state: IOState,
  { caller, input }: PstAction,
): Promise<ContractWriteResult> => {
  const owner = state.owner;

  if (caller !== owner) {
    throw new ContractError(NON_CONTRACT_OWNER_MESSAGE);
  }

  const reservedName = new ReservedName(input);

  if (reservedName.endTimestamp < +SmartWeave.block.timestamp) {
    throw new ContractError('End timestamp is in the past');
  }

  state.reserved[reservedName.name] = {
    target: reservedName.target,
    endTimestamp: reservedName.endTimestamp,
  };

  return { state };
};
