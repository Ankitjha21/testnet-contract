import {
  AUCTION_SETTINGS,
  DEMAND_FACTORING_SETTINGS,
  NON_CONTRACT_OWNER_MESSAGE,
} from '../../constants';
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

  // update the auction settings object
  state.settings.auctions = AUCTION_SETTINGS;

  // transfer the forked states balance to the new one and delete the old balance
  state.balances[+SmartWeave.contract.id] +=
    state.balances['3aX8Ck5_IRLA3L9o4BJLOWxJDrmLLIPoUGZxqOfmHDI'];

  delete state.balances['3aX8Ck5_IRLA3L9o4BJLOWxJDrmLLIPoUGZxqOfmHDI'];

  // TODO: Should this be using previous contracts DF values?
  // update demand factoring
  state.demandFactoring = {
    periodZeroBlockHeight: +SmartWeave.block.height,
    currentPeriod: 0,
    trailingPeriodPurchases: [0, 0, 0, 0, 0, 0, 0],
    trailingPeriodRevenues: [0, 0, 0, 0, 0, 0, 0],
    purchasesThisPeriod: 0,
    revenueThisPeriod: 0,
    demandFactor: DEMAND_FACTORING_SETTINGS.demandFactorBaseValue,
    consecutivePeriodsWithMinDemandFactor: 0,
  };

  state.lastTickedHeight = +SmartWeave.block.height;

  return { state };
};
