import { hashAlgorithms } from './hash';

export interface Command {
  name: string;
  description: string;
  run: (input: string) => Promise<string>;
}

const bcryptAlgorithm = hashAlgorithms.find((algorithm) => algorithm.id === 'bcrypt')!;

export const commands: Command[] = [
  {
    name: 'bc',
    description: 'Hash text with bcrypt using the default cost factor.',
    run: (input) => bcryptAlgorithm.hash(input, {})
  }
];

export interface CommandMatch {
  command: Command;
  input: string;
}

export function matchCommand(query: string): CommandMatch | null {
  const trimmed = query.trimStart();
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) return null;

  const name = trimmed.slice(0, spaceIndex).toLowerCase();
  const input = trimmed.slice(spaceIndex + 1);
  if (!input) return null;

  const command = commands.find((c) => c.name === name);
  return command ? { command, input } : null;
}
