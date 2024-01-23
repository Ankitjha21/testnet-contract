import {
  DEFAULT_EPOCH_BLOCK_LENGTH,
  FEE_STRUCTURE,
  MIN_DELEGATED_STAKE,
  TALLY_PERIOD_BLOCKS,
} from '../constants';
import {
  ArNSLeaseAuctionData,
  DelegateData,
  Delegates,
  DemandFactoringData,
  Gateway,
  Gateways,
  IOState,
} from '../types';

export const stubbedArweaveTxId = 'thevalidtransactionidthatis43characterslong';
export const baselineDemandFactorData: DemandFactoringData = {
  periodZeroBlockHeight: 0,
  currentPeriod: 0,
  trailingPeriodPurchases: [0, 0, 0, 0, 0, 0, 0],
  trailingPeriodRevenues: [0, 0, 0, 0, 0, 0, 0],
  purchasesThisPeriod: 0,
  revenueThisPeriod: 0,
  demandFactor: 1,
  consecutivePeriodsWithMinDemandFactor: 0,
};

export const baselineAuctionSettings = {
  auctionDuration: 100,
  scalingExponent: 10,
  exponentialDecayRate: 0.001,
  startPriceMultiplier: 100,
  floorPriceMultiplier: 1,
};

export const getBaselineState: () => IOState = (): IOState => ({
  ticker: 'ARNS-TEST',
  name: 'Arweave Name System Test',
  canEvolve: true,
  owner: '',
  evolve: '',
  records: {},
  balances: {},
  vaults: {},
  distributions: {
    epochZeroStartHeight: 0,
    epochStartHeight: 0,
    epochEndHeight: DEFAULT_EPOCH_BLOCK_LENGTH - 1,
    epochDistributionHeight:
      DEFAULT_EPOCH_BLOCK_LENGTH - 1 + TALLY_PERIOD_BLOCKS,
    gateways: {},
    observers: {},
  },
  reserved: {},
  fees: {
    ...FEE_STRUCTURE,
  },
  auctions: {},
  settings: {
    registry: {
      minLockLength: 720,
      maxLockLength: 788400,
      minNetworkJoinStakeAmount: 10000,
      minGatewayJoinLength: 3600,
      gatewayLeaveLength: 3600,
      operatorStakeWithdrawLength: 3600,
    },
    auctions: baselineAuctionSettings,
  },
  gateways: {},
  lastTickedHeight: 0,
  observations: {},
  demandFactoring: {
    ...baselineDemandFactorData,
    trailingPeriodPurchases:
      baselineDemandFactorData.trailingPeriodPurchases.slice(),
    trailingPeriodRevenues:
      baselineDemandFactorData.trailingPeriodRevenues.slice(),
  },
});

export const baselineAuctionData: ArNSLeaseAuctionData = {
  startHeight: 1,
  startPrice: 1_000,
  endHeight: 101,
  floorPrice: 100,
  type: 'lease',
  initiator: 'initiator',
  contractTxId: 'contractTxId',
  years: 1,
  settings: baselineAuctionSettings,
};

export const baselineAuctionState: Partial<IOState> = {
  auctions: {
    'test-auction-close': {
      ...baselineAuctionData,
    },
  },
};

export const baselineGatewayData: Gateway = {
  observerWallet: 'test-observer-wallet',
  start: 0,
  end: 0,
  vaults: {},
  delegates: {},
  operatorStake: 100,
  delegatedStake: 0,
  settings: {
    label: 'test-gateway',
    fqdn: 'test.com',
    port: 443,
    protocol: 'https',
  },
  status: 'joined',
};

export const baselineDelegateData: DelegateData = {
  delegatedStake: 100,
  start: 0,
  vaults: {},
};

export const baselineDelegatedGatewayData: Gateway = {
  observerWallet: 'test-observer-wallet',
  start: 0,
  end: 0,
  vaults: {},
  delegates: {
    ['delegate-1']: {
      ...baselineDelegateData,
    },
    ['delegate-2']: {
      ...baselineDelegateData,
    },
  },
  operatorStake: 100,
  delegatedStake: 200,
  settings: {
    label: 'test-gateway',
    fqdn: 'test.com',
    port: 443,
    protocol: 'https',
    allowDelegatedStaking: true,
    delegateRewardShareRatio: 5,
  },
  status: 'joined',
};

export const baselineGatewaysData: Gateways = {
  [stubbedArweaveTxId]: {
    ...baselineGatewayData,
  },
};

// Helper function to create mock delegates
export function createMockDelegates(numDelegates: number) {
  const delegates: Delegates = {};
  for (let i = 0; i < numDelegates; i++) {
    const delegateAddress = `delegateAddress${i}`; // Mock unique delegate address
    delegates[delegateAddress] = {
      delegatedStake: MIN_DELEGATED_STAKE, // or any mock value you need
      start: 0, // Mock start block
      vaults: {}, // Mock vaults data or add as needed
    };
  }
  return delegates;
}
