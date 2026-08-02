<script lang="ts">
  type IndentOption = '2' | '4' | 'tab' | 'minify';

  let input = $state('');
  let indent = $state<IndentOption>('2');
  let copied = $state(false);

  const result = $derived.by(() => {
    if (input.trim() === '') return { output: '', error: null };
    try {
      const parsed: unknown = JSON.parse(input);
      const space = indent === 'minify' ? undefined : indent === 'tab' ? '\t' : Number(indent);
      return { output: JSON.stringify(parsed, null, space), error: null };
    } catch (err) {
      return { output: '', error: (err as Error).message };
    }
  });

  function clear() {
    input = '';
  }

  async function copy() {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<svelte:head><title>JSON Formatter · nexi toolkit</title></svelte:head>

<div class="flex h-full flex-col">
  <div class="mb-4">
    <h1 class="text-xl font-semibold tracking-tight">JSON Formatter</h1>
    <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
      Paste JSON on the left to validate and format it.
    </p>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-2">
    <label class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      Indent
      <select
        bind:value={indent}
        class="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="2">2 spaces</option>
        <option value="4">4 spaces</option>
        <option value="tab">Tab</option>
        <option value="minify">Minify</option>
      </select>
    </label>

    <div class="flex-1"></div>

    <button
      type="button"
      onclick={copy}
      disabled={!result.output}
      class="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
    <button
      type="button"
      onclick={clear}
      disabled={!input}
      class="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      Clear
    </button>
  </div>

  <div class="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
    <div class="flex min-h-0 flex-col">
      <textarea
        bind:value={input}
        spellcheck="false"
        placeholder={'{\n  "hello": "world"\n}'}
        class="min-h-64 flex-1 resize-none rounded-lg border border-zinc-200 bg-white p-3 font-mono text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
      ></textarea>
      {#if result.error}
        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{result.error}</p>
      {/if}
    </div>

    <div class="flex min-h-0 flex-col">
      <pre
        class="min-h-64 flex-1 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">{result.output}</pre>
    </div>
  </div>
</div>
