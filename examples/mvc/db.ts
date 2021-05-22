// Faux database

export interface Pet {
  name?: string;
  id?: number;
}

export interface User {
  name?: string;
  pets?: Pet[];
  id?: number;
}

export const pets: Pet[] = [
  { name: "Smudge", id: 0 },
  { name: "Tilly", id: 1 },
  { name: "Georgie", id: 2 },
];

export const users: User[] = [
  { name: "C", pets: [], id: 0 },
  { name: "H", pets: [pets[0]], id: 1 },
  { name: "S", pets: [pets[1], pets[2]], id: 2 },
];
