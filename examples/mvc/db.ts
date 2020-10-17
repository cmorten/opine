// Faux database

export const pets = [
  { name: "Smudge", id: 0 },
  { name: "Tilly", id: 1 },
  { name: "Georgie", id: 2 },
];

export const users = [
  { name: "C", pets: [], id: 0 },
  { name: "H", pets: [pets[0]], id: 1 },
  { name: "S", pets: [pets[1], pets[2]], id: 2 },
];
