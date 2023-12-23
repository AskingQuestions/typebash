<script lang="ts">
	import MonacoEditor from '$lib/console/MonacoEditor.svelte';
	import { onMount } from 'svelte';
	import Policy from './Policy.svelte';
	import { parse } from 'typebash-engine';

	let focus = () => {};

	let lines: string[] = [];

	onMount(() => {
		setTimeout(() => {
			focus();
		}, 400);
	});
</script>

<svelte:head>
	<Policy />
</svelte:head>

<div
	class="flex flex-col h-full p-4 cursor-text"
	role="button"
	tabindex="0"
	on:click={(e) => {
		// focus();
	}}
	on:keydown={(e) => {
		if (e.code == 'Enter') {
			focus();
		}
	}}
>
	{#each lines as line}
		<div class="flex flex-row">
			<span class="mr-2">&gt;</span>
			<div class="flex-1">{line}</div>
		</div>
	{/each}
	<div class="flex flex-row">
		<span class="mr-2">&gt;</span>
		<div class="flex-1">
			<MonacoEditor
				bind:focus
				on:submit={(e) => {
					console.log(JSON.stringify(e.detail.value));
					console.log(JSON.stringify(parse(e.detail.value), null, 2));
					if (e.detail.value == 'clear') {
						lines = [];
					} else {
						lines.push(e.detail.value);
						lines = [...lines];
					}
				}}
			></MonacoEditor>
		</div>
	</div>
</div>
