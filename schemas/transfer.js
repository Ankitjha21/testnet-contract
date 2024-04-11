const transferTokensSchema = {
  $id: '#/definitions/transferTokens',
  type: 'object',
  properties: {
    function: {
      type: 'string',
      const: 'transfer',
    },
    target: {
      type: 'string',
      pattern: '^[a-zA-Z0-9-_]{43}$',
    },
    qty: {
      type: 'number',
      minimum: 1,
    },
    denomination: {
      type: 'string',
      enum: ['IO', 'mIO'],
      default: 'mIO',
    },
  },
  required: ['target', 'qty'],
  additionalProperties: false,
};

module.exports = {
  transferTokensSchema,
};
