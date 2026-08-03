<script lang="ts">
  import { computeLineDiff } from '$lib/diff';

  let original = $state('');
  let changed = $state('');

  const rows = $derived(computeLineDiff(original, changed));
  const hasDiff = $derived(rows.some((row) => row.type !== 'context'));

  const stats = $derived.by(() => {
    let added = 0;
    let removed = 0;
    for (const row of rows) {
      if (row.type === 'added') added++;
      if (row.type === 'removed') removed++;
    }
    return { added, removed };
  });

  function swap() {
    [original, changed] = [changed, original];
  }

  function clear() {
    original = '';
    changed = '';
  }
</script>

<svelte:head><title>Text Diff · nexi toolkit</title></svelte:head>

<div class="flex h-full flex-col">
  <div class="mb-4">
    <h1 class="text-xl font-semibold tracking-tight">Text Diff</h1>
    <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
      Compare two blocks of text line by line, with word-level highlights for lines that are mostly
      the same.
    </p>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-2">
    {#if hasDiff}
      <span class="text-sm text-zinc-600 dark:text-zinc-400">
        <span class="text-green-600 dark:text-green-400">+{stats.added}</span>
        <span class="text-red-600 dark:text-red-400">-{stats.removed}</span>
      </span>
    {/if}

    <div class="flex-1"></div>

    <button
      type="button"
      onclick={swap}
      disabled={!original && !changed}
      class="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      Swap
    </button>
    <button
      type="button"
      onclick={clear}
      disabled={!original && !changed}
      class="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      Clear
    </button>
  </div>

  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div class="flex flex-col">
      <span class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-500">Original</span>
      <textarea
        bind:value={original}
        spellcheck="false"
        placeholder="Paste original text…"
        class="h-40 resize-none rounded-lg border border-zinc-200 bg-white p-3 font-mono text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
      ></textarea>
    </div>

    <div class="flex flex-col">
      <span class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-500">Changed</span>
      <textarea
        bind:value={changed}
        spellcheck="false"
        placeholder="Paste changed text…"
        class="h-40 resize-none rounded-lg border border-zinc-200 bg-white p-3 font-mono text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
      ></textarea>
    </div>
  </div>

  <div
    class="mt-4 min-h-0 flex-1 overflow-auto rounded-lg border border-zinc-200 font-mono text-sm dark:border-zinc-800"
  >
    {#if !original && !changed}
      <p class="p-4 text-zinc-500 dark:text-zinc-500">Paste text in both boxes to see the diff.</p>
    {:else if !hasDiff}
      <p class="p-4 text-zinc-500 dark:text-zinc-500">No differences found.</p>
    {:else}
      {#each rows as row, i (i)}
        <div
          class={[
            'flex',
            row.type === 'removed' && 'bg-red-50 dark:bg-red-950/40',
            row.type === 'added' && 'bg-green-50 dark:bg-green-950/40'
          ]}
        >
          <span
            class="w-10 shrink-0 border-r border-zinc-200 px-2 py-0.5 text-right text-zinc-400 select-none dark:border-zinc-800 dark:text-zinc-600"
          >
            {row.type === 'added' ? '' : row.oldLine}
          </span>
          <span
            class="w-10 shrink-0 border-r border-zinc-200 px-2 py-0.5 text-right text-zinc-400 select-none dark:border-zinc-800 dark:text-zinc-600"
          >
            {row.type === 'removed' ? '' : row.newLine}
          </span>
          <span
            class={[
              'w-5 shrink-0 text-center select-none',
              row.type === 'removed' && 'text-red-600 dark:text-red-400',
              row.type === 'added' && 'text-green-600 dark:text-green-400'
            ]}
          >
            {row.type === 'removed' ? '-' : row.type === 'added' ? '+' : ''}
          </span>
          <span class="min-w-0 flex-1 px-2 py-0.5 break-all whitespace-pre-wrap">
            {#if row.type === 'context'}
              {row.text}
            {:else}
              {#each row.parts as part, j (j)}
                <span
                  class={part.highlighted
                    ? row.type === 'removed'
                      ? 'bg-red-200 dark:bg-red-900/70'
                      : 'bg-green-200 dark:bg-green-900/70'
                    : ''}>{part.value}</span
                >
              {/each}
            {/if}
          </span>
        </div>
      {/each}
    {/if}
  </div>
</div>
