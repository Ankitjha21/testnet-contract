const createReservedNameSchema = {
  $id: '#/definitions/createReservedName',
  type: 'object',
  properties: {
    function: {
      type: 'string',
      const: 'createReservedName',
    },
    name: {
      type: 'string',
      pattern: '^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
    },
    target: {
      type: 'string',
      pattern: '^[a-zA-Z0-9-_]{43}$',
    },
    endTimestamp: {
      type: 'integer',
      minimum: 1,
    },
  },
  required: ['name', 'target'],
  additionalProperties: false,
};

module.exports = {
  createReservedNameSchema,
};
