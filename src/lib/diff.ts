import { diffChars, diffLines, diffWordsWithSpace } from 'diff';

export interface WordPart {
	value: string;
	highlighted: boolean;
}

export type DiffRow =
	| { type: 'context'; oldLine: number; newLine: number; text: string }
	| { type: 'removed'; oldLine: number; parts: WordPart[] }
	| { type: 'added'; newLine: number; parts: WordPart[] };

const SIMILARITY_THRESHOLD = 0.5;

function similarity(a: string, b: string): number {
	if (a === b) return 1;
	if (!a || !b) return 0;
	const common = diffChars(a, b).reduce(
		(sum, part) => (part.added || part.removed ? sum : sum + part.value.length),
		0
	);
	return (2 * common) / (a.length + b.length);
}

function wordDiffParts(oldLine: string, newLine: string, side: 'removed' | 'added'): WordPart[] {
	if (similarity(oldLine, newLine) < SIMILARITY_THRESHOLD) {
		return [{ value: side === 'removed' ? oldLine : newLine, highlighted: true }];
	}

	return diffWordsWithSpace(oldLine, newLine)
		.filter((part) => (side === 'removed' ? !part.added : !part.removed))
		.map((part) => ({ value: part.value, highlighted: Boolean(part.added || part.removed) }));
}

function splitLines(value: string): string[] {
	const lines = value.split('\n');
	if (lines[lines.length - 1] === '') lines.pop();
	return lines;
}

export function computeLineDiff(oldText: string, newText: string): DiffRow[] {
	const rows: DiffRow[] = [];
	let oldLine = 1;
	let newLine = 1;

	const hunks = diffLines(oldText.replace(/\r\n/g, '\n'), newText.replace(/\r\n/g, '\n'));

	for (let i = 0; i < hunks.length; i++) {
		const hunk = hunks[i];

		if (!hunk.added && !hunk.removed) {
			for (const text of splitLines(hunk.value)) {
				rows.push({ type: 'context', oldLine, newLine, text });
				oldLine++;
				newLine++;
			}
			continue;
		}

		if (hunk.removed) {
			const removedLines = splitLines(hunk.value);
			const next = hunks[i + 1];
			const addedLines = next?.added ? splitLines(next.value) : [];
			const pairCount = next?.added ? Math.min(removedLines.length, addedLines.length) : 0;

			for (let j = 0; j < removedLines.length; j++) {
				const parts =
					j < pairCount
						? wordDiffParts(removedLines[j], addedLines[j], 'removed')
						: [{ value: removedLines[j], highlighted: true }];
				rows.push({ type: 'removed', oldLine, parts });
				oldLine++;
			}

			for (let j = 0; j < addedLines.length; j++) {
				const parts =
					j < pairCount
						? wordDiffParts(removedLines[j], addedLines[j], 'added')
						: [{ value: addedLines[j], highlighted: true }];
				rows.push({ type: 'added', newLine, parts });
				newLine++;
			}

			if (next?.added) i++;
			continue;
		}

		// pure addition with no preceding removal to pair against
		for (const value of splitLines(hunk.value)) {
			rows.push({ type: 'added', newLine, parts: [{ value, highlighted: true }] });
			newLine++;
		}
	}

	return rows;
}
