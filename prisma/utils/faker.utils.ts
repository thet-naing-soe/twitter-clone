import { faker as fakerjs } from '@faker-js/faker';

fakerjs.seed(123); // deterministic seed

export const faker = fakerjs;

// export function randomPublicId(length = 10): string {
//   return faker.string.alphanumeric(length);
// }

export const tweetContentGenerators = [
  () => faker.lorem.sentence({ min: 5, max: 25 }),
  () => `Just finished ${faker.hacker.phrase()}! 💪`,
  () => `Thoughts on ${faker.company.buzzPhrase()}?`,
  () => `${faker.lorem.sentence()} #${faker.lorem.word()} #tech`,
  () => `Working on ${faker.lorem.words(3)}. Excited to share progress!`,
];
