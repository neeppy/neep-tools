<script lang="ts">
  import { hashAlgorithms } from '$lib/hash';

  let input = $state('');
  let algorithmId = $state(hashAlgorithms[0].id);
  let secret = $state('');
  let rounds = $state(hashAlgorithms[0].rounds?.default ?? 1);

  let output = $state('');
  let error = $state<string | null>(null);
  let computing = $state(false);
  let copied = $state(false);

  const algorithm = $derived(hashAlgorithms.find((a) => a.id === algorithmId)!);

  function selectAlgorithm(id: string) {
    algorithmId = id;
    const next = hashAlgorithms.find((a) => a.id === id)!;
    rounds = next.rounds?.default ?? 1;
    if (!next.supportsSecret) secret = '';
  }

  $effect(() => {
    const currentAlgorithm = algorithm;
    const currentInput = input;
    const currentSecret = currentAlgorithm.supportsSecret ? secret : undefined;
    const roundsConfig = currentAlgorithm.rounds;
    const currentRounds = roundsConfig
      ? Math.min(Math.max(Math.round(rounds), roundsConfig.min), roundsConfig.max)
      : undefined;

    if (!currentInput) {
      output = '';
      error = null;
      computing = false;
      return;
    }

    let cancelled = false;
    computing = true;
    error = null;

    currentAlgorithm
      .hash(currentInput, { secret: currentSecret, rounds: currentRounds })
      .then((result) => {
        if (!cancelled) output = result;
      })
      .catch((err) => {
        if (!cancelled) {
          output = '';
          error = (err as Error).message;
        }
      })
      .finally(() => {
        if (!cancelled) computing = false;
      });

    return () => {
      cancelled = true;
    };
  });

  function clear() {
    input = '';
    secret = '';
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<svelte:head><title>Hash Generator · nexi toolkit</title></svelte:head>

<div class="flex h-full flex-col">
  <div class="mb-4">
    <h1 class="text-xl font-semibold tracking-tight">Hash Generator</h1>
    <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
      Hash text using MD5, SHA-1, SHA-256, or bcrypt, with an optional secret and rounds.
    </p>
  </div>

  <div class="mb-1 flex flex-wrap items-end gap-3">
    <label class="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
      Algorithm
      <select
        value={algorithmId}
        onchange={(e) => selectAlgorithm(e.currentTarget.value)}
        class="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {#each hashAlgorithms as algo (algo.id)}
          <option value={algo.id}>{algo.label}</option>
        {/each}
      </select>
    </label>

    {#if algorithm.supportsSecret}
      <label class="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
        Secret (optional)
        <input
          type="text"
          bind:value={secret}
          placeholder="HMAC key"
          class="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
      </label>
    {/if}

    {#if algorithm.rounds}
      <label class="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
        {algorithm.rounds.label}
        <input
          type="number"
          bind:value={rounds}
          min={algorithm.rounds.min}
          max={algorithm.rounds.max}
          class="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
    {/if}

    <div class="flex-1"></div>

    <button
      type="button"
      onclick={copy}
      disabled={!output}
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

  {#if algorithm.rounds?.hint}
    <p class="mb-3 text-xs text-zinc-500 dark:text-zinc-500">{algorithm.rounds.hint}</p>
  {:else}
    <div class="mb-3"></div>
  {/if}

  <div class="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
    <div class="flex flex-col">
      <span class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-500">Input</span>
      <textarea
        bind:value={input}
        spellcheck="false"
        placeholder="Text to hash…"
        class="h-40 flex-1 resize-none rounded-lg border border-zinc-200 bg-white p-3 font-mono text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
      ></textarea>
    </div>

    <div class="flex flex-col">
      <span class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-500">
        {computing ? 'Hashing…' : 'Output'}
      </span>
      <pre
        class="h-40 flex-1 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">{output}</pre>
      {#if error}
        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      {/if}
    </div>
  </div>
</div>
