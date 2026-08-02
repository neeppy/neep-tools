<script lang="ts">
  import { theme } from '$lib/theme.svelte';
  import SunIcon from './icons/SunIcon.svelte';
  import MoonIcon from './icons/MoonIcon.svelte';
</script>

<button
  type="button"
  onclick={() => theme.toggle()}
  class="rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
  aria-label={theme.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
>
  {#if theme.current === 'dark'}
    <SunIcon />
  {:else}
    <MoonIcon />
  {/if}
</button>
