const { faker } = require('@faker-js/faker');

const generateUser = () => ({
  name: faker.person.fullName(),
  job:  faker.person.jobTitle(),
});

const generatePartialUser = () => ({
  name: faker.person.fullName(),
});

const invalidPayloads = {
  emptyBody:       {},
  nullName:        { name: null, job: 'Developer' },
  numericName:     { name: 12345, job: 'Tester' },
  oversizedName:   { name: 'a'.repeat(5000), job: faker.person.jobTitle() },
};

const userIds = {
  valid:       [1, 2, 3, 4, 5, 6],
  nonExistent: [9999, 99998, 99997],
};

module.exports = { generateUser, generatePartialUser, invalidPayloads, userIds };
