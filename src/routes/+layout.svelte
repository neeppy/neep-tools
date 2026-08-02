<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { tools } from '$lib/tools';
  import { page } from '$app/state';

  let { children } = $props();

  let mobileNavOpen = $state(false);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
  <aside
    class={[
      'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 transition-transform dark:border-zinc-800 dark:bg-zinc-900',
      'md:static md:translate-x-0',
      mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
    ]}
  >
    <div class="flex h-14 shrink-0 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
      <a href="/" class="font-semibold tracking-tight">nexi toolkit</a>
    </div>
    <nav class="flex flex-col gap-0.5 overflow-y-auto p-2">
      {#each tools as tool (tool.slug)}
        <a
          href="/{tool.slug}"
          onclick={() => (mobileNavOpen = false)}
          class={[
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            page.url.pathname === `/${tool.slug}`
              ? 'bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800 dark:text-white'
              : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white'
          ]}
        >
          {tool.title}
        </a>
      {/each}
    </nav>
  </aside>

  {#if mobileNavOpen}
    <button
      type="button"
      aria-label="Close navigation"
      class="fixed inset-0 z-30 bg-black/30 md:hidden"
      onclick={() => (mobileNavOpen = false)}
    ></button>
  {/if}

  <div class="flex min-w-0 flex-1 flex-col">
    <header
      class="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800"
    >
      <button
        type="button"
        class="-ml-2 rounded-md p-2 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
        aria-label="Open navigation"
        onclick={() => (mobileNavOpen = true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-5"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="flex-1"></div>
      <ThemeToggle />
    </header>
    <main class="flex-1 p-4 md:p-6">
      {@render children()}
    </main>
  </div>
</div>
