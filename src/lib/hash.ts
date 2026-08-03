import { bcrypt, createHMAC, createMD5, createSHA1, createSHA256 } from 'hash-wasm';
import type { IHasher } from 'hash-wasm';

export interface RoundsConfig {
  label: string;
  min: number;
  max: number;
  default: number;
  hint?: string;
}

export interface HashOptions {
  secret?: string;
  rounds?: number;
}

export interface HashAlgorithm {
  id: string;
  label: string;
  supportsSecret: boolean;
  rounds?: RoundsConfig;
  hash: (input: string, options: HashOptions) => Promise<string>;
}

const digestRounds: RoundsConfig = {
  label: 'Iterations',
  min: 1,
  max: 10000,
  default: 1,
  hint: 'Feeds the output back in as input this many times.'
};

async function digest(
  createHasher: () => Promise<IHasher>,
  input: string,
  { secret, rounds = 1 }: HashOptions
): Promise<string> {
  let value = input;
  for (let i = 0; i < rounds; i++) {
    const hasher = secret ? await createHMAC(createHasher(), secret) : await createHasher();
    hasher.init();
    hasher.update(value);
    value = hasher.digest();
  }
  return value;
}

export const hashAlgorithms: HashAlgorithm[] = [
  {
    id: 'sha256',
    label: 'SHA-256',
    supportsSecret: true,
    rounds: digestRounds,
    hash: (input, options) => digest(createSHA256, input, options)
  },
  {
    id: 'bcrypt',
    label: 'bcrypt',
    supportsSecret: false,
    rounds: {
      label: 'Cost factor',
      min: 4,
      max: 14,
      default: 10,
      hint: 'Work doubles per step (2^n rounds) — values above ~12 can take seconds.'
    },
    hash: async (input, { rounds = 10 }) => {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      return bcrypt({ password: input, salt, costFactor: rounds, outputType: 'encoded' });
    }
  },
  {
    id: 'sha1',
    label: 'SHA-1',
    supportsSecret: true,
    rounds: digestRounds,
    hash: (input, options) => digest(createSHA1, input, options)
  },
  {
    id: 'md5',
    label: 'MD5',
    supportsSecret: true,
    rounds: digestRounds,
    hash: (input, options) => digest(createMD5, input, options)
  }
];
