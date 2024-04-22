const { buyRecordSchema } = require('./buyRecord');
const { auctionBidSchema } = require('./auction');
const { increaseUndernameCountSchema } = require('./undernames');
const { extendRecordSchema } = require('./extend');
const { joinNetworkSchema } = require('./network');
const { transferTokensSchema } = require('./transfer');
const { transferTokensLockedSchema } = require('./vaultedTransfer');
const { createVaultSchema } = require('./createVault');
const { extendVaultSchema } = require('./extendVault');
const { increaseVaultSchema } = require('./increaseVault');
const { saveObservationsSchema } = require('./saveObservations');
const { updateGatewaySchema } = require('./updateGateway');
const { delegateStakeSchema } = require('./delegateStake');
const { decreaseDelegateStakeSchema } = require('./decreaseDelegateStake');
const { decreaseOperatorStakeSchema } = require('./decreaseOperatorStake');
const { createReservedNameSchema } = require('./createReservedName');
module.exports = {
  auctionBidSchema,
  buyRecordSchema,
  createReservedNameSchema,
  extendRecordSchema,
  increaseUndernameCountSchema,
  joinNetworkSchema,
  transferTokensSchema,
  transferTokensLockedSchema,
  createVaultSchema,
  extendVaultSchema,
  increaseVaultSchema,
  saveObservationsSchema,
  updateGatewaySchema,
  delegateStakeSchema,
  decreaseDelegateStakeSchema,
  decreaseOperatorStakeSchema,
};
