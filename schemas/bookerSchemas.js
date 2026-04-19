const bookingDatesSchema = {
  type: 'object',
  required: ['checkin', 'checkout'],
  properties: {
    checkin:  { type: 'string', minLength: 1 },
    checkout: { type: 'string', minLength: 1 },
  },
};

const bookingDetailsSchema = {
  type: 'object',
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  properties: {
    firstname:       { type: 'string', minLength: 1 },
    lastname:        { type: 'string', minLength: 1 },
    totalprice:      { type: 'number', minimum: 0 },
    depositpaid:     { type: 'boolean' },
    bookingdates:    bookingDatesSchema,
    additionalneeds: { type: 'string' },
  },
  additionalProperties: false,
};

const createBookingResponseSchema = {
  type: 'object',
  required: ['bookingid', 'booking'],
  properties: {
    bookingid: { type: 'number', minimum: 1 },
    booking:   bookingDetailsSchema,
  },
  additionalProperties: false,
};

const bookingListItemSchema = {
  type: 'object',
  required: ['bookingid'],
  properties: {
    bookingid: { type: 'number', minimum: 1 },
  },
};

module.exports = {
  bookingDetailsSchema,
  createBookingResponseSchema,
  bookingListItemSchema,
};
