<script lang="ts">
  import { goto } from '$app/navigation';
  import { launcher } from '$lib/launcher.svelte';
  import { filterItems, type LauncherItem } from '$lib/launcher';
  import { matchCommand } from '$lib/commands';
  import { tools } from '$lib/tools';
  import SearchIcon from './icons/SearchIcon.svelte';

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  const items = $derived.by<LauncherItem[]>(() =>
    tools.map((tool) => ({
      id: tool.slug,
      title: tool.title,
      subtitle: tool.description,
      keywords: tool.slug,
      run: () => {
        goto(`/${tool.slug}`);
        launcher.hide();
      }
    }))
  );

  const results = $derived(filterItems(items, launcher.query));

  let selectedIndex = $derived(results.length > 0 ? 0 : -1);
  let inputEl: HTMLInputElement | undefined = $state();

  const commandMatch = $derived(matchCommand(launcher.query));

  let commandOutput = $state('');
  let commandError = $state<string | null>(null);
  let commandComputing = $state(false);
  let commandCopied = $state(false);

  $effect(() => {
    const match = commandMatch;
    commandCopied = false;

    if (!match) {
      commandOutput = '';
      commandError = null;
      commandComputing = false;
      return;
    }

    let cancelled = false;
    commandComputing = true;
    commandError = null;

    match.command
      .run(match.input)
      .then((result) => {
        if (!cancelled) commandOutput = result;
      })
      .catch((err) => {
        if (!cancelled) {
          commandOutput = '';
          commandError = (err as Error).message;
        }
      })
      .finally(() => {
        if (!cancelled) commandComputing = false;
      });

    return () => {
      cancelled = true;
    };
  });

  function copyCommandOutput() {
    if (!commandOutput) return;
    navigator.clipboard.writeText(commandOutput);
    commandCopied = true;
    setTimeout(() => (commandCopied = false), 1500);
  }

  $effect(() => {
    if (launcher.open) inputEl?.focus();
  });

  $effect(() => {
    if (!launcher.open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });

  function handleWindowKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      launcher.toggle();
      return;
    }

    if (launcher.open && event.key === 'Escape') {
      event.preventDefault();
      launcher.hide();
    }
  }

  function handleInputKeydown(event: KeyboardEvent) {
    if (commandMatch) {
      if (event.key === 'Enter') {
        event.preventDefault();
        copyCommandOutput();
      }
      return;
    }

    if (results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      results[selectedIndex]?.run();
    }
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if launcher.open}
  <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
    <button
      type="button"
      aria-label="Close launcher"
      class="fixed inset-0 bg-black/40"
      onclick={() => launcher.hide()}
    ></button>

    <div
      class="relative w-full max-w-lg overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div class="flex items-center gap-2 border-b border-zinc-200 px-3 dark:border-zinc-800">
        <span class="text-zinc-400"><SearchIcon size={16} /></span>
        <input
          bind:this={inputEl}
          bind:value={launcher.query}
          onkeydown={handleInputKeydown}
          type="text"
          placeholder="Search tools or run a command (e.g. bcrypt hello)…"
          aria-label="Search tools"
          class="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        <kbd
          class="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
        >
          Esc
        </kbd>
      </div>

      {#if commandMatch}
        <div class="p-3">
          <p class="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
            {commandMatch.command.description}
          </p>
          <pre
            class="overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">{commandComputing
              ? 'Computing…'
              : commandOutput}</pre>
          {#if commandError}
            <p class="mt-2 text-sm text-red-600 dark:text-red-400">{commandError}</p>
          {/if}
          <button
            type="button"
            onclick={copyCommandOutput}
            disabled={!commandOutput}
            class="mt-2 rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {commandCopied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </div>
      {:else}
        <ul class="max-h-80 overflow-y-auto p-1">
          {#each results as item, index (item.id)}
            <li>
              <button
                type="button"
                onclick={() => item.run()}
                onmouseenter={() => (selectedIndex = index)}
                class={[
                  'flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  index === selectedIndex
                    ? 'bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-700 dark:text-zinc-300'
                ]}
              >
                <span class="font-medium">{item.title}</span>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">{item.subtitle}</span>
              </button>
            </li>
          {:else}
            <li class="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No tools found.
            </li>
          {/each}
        </ul>
      {/if}

      <div
        class="flex items-center justify-end gap-1 border-t border-zinc-200 px-3 py-1.5 text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500"
      >
        Toggle with
        <kbd
          class="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.5 font-mono dark:border-zinc-700 dark:bg-zinc-800"
        >
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      </div>
    </div>
  </div>
{/if}
