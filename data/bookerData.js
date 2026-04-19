const { faker } = require('@faker-js/faker');

const generateBooking = () => ({
  firstname:      faker.person.firstName(),
  lastname:       faker.person.lastName(),
  totalprice:     faker.number.int({ min: 50, max: 999 }),
  depositpaid:    faker.datatype.boolean(),
  bookingdates: {
    checkin:  '2025-06-01',
    checkout: '2025-06-10',
  },
  additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Lunch', 'Dinner', 'None']),
});

const invalidBookings = {
  missingFirstname: {
    lastname:    faker.person.lastName(),
    totalprice:  100,
    depositpaid: true,
    bookingdates: { checkin: '2025-06-01', checkout: '2025-06-10' },
  },
  missingDates: {
    firstname:   faker.person.firstName(),
    lastname:    faker.person.lastName(),
    totalprice:  100,
    depositpaid: true,
  },
  emptyBody: {},
  invalidPrice: {
    firstname:   faker.person.firstName(),
    lastname:    faker.person.lastName(),
    totalprice:  'not-a-number',
    depositpaid: true,
    bookingdates: { checkin: '2025-06-01', checkout: '2025-06-10' },
  },
};

module.exports = { generateBooking, invalidBookings };
