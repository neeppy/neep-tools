<script lang="ts">
  import { tools } from '$lib/tools';
</script>

<svelte:head><title>nexi toolkit</title></svelte:head>

<div class="mx-auto max-w-3xl">
  <h1 class="text-2xl font-semibold tracking-tight">nexi toolkit</h1>
  <p class="mt-2 text-zinc-600 dark:text-zinc-400">
    A self-hosted collection of everyday developer tools.
  </p>

  <div class="mt-8 grid gap-4 sm:grid-cols-2">
    {#each tools as tool (tool.slug)}
      <a
        href="/{tool.slug}"
        class="rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
      >
        <h2 class="font-medium">{tool.title}</h2>
        <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{tool.description}</p>
      </a>
    {/each}
  </div>
</div>
