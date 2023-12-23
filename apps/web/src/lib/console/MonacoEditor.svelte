<script lang="ts">
	import { onMount, createEventDispatcher, onDestroy } from 'svelte';

	import type { MonacoEditorInstance as MonacoEditorInstanceType } from './editor';
	import { parse } from 'typebash-engine';

	function indexToRowColumn(str: string, index: number) {
		let row = 0;
		let column = 0;
		for (let i = 0; i < index; i++) {
			if (str[i] === '\n') {
				row++;
				column = 0;
			} else {
				column++;
			}
		}
		return { row, column };
	}
	const dispatch = createEventDispatcher();

	let el: HTMLElement | null = null;

	export let targetHeightCSS = '100vh';

	export let verticalScrollbar: 'hidden' | 'visible' = 'hidden';

	export let hiddenStateExternal = false;
	export let readOnly = false;

	export let monacoEditorBinding: MonacoEditorInstanceType | null = null;

	export const focus = () => {
		if (editorInst) {
			editorInst.editor?.focus();
		}
	};

	let editorInst: MonacoEditorInstanceType | null = null;

	let gid = 0;

	let loaded = false;

	let lastDecorations: any | null = null;

	onMount(async () => {
		gid = ((window as any).$shd_monaco || 0) + 1;
		(window as any).$shd_monaco = gid;

		const registerLanguages = (await import('./languages')).default;
		if (gid === 1) {
			registerLanguages();
		}

		const MonacoEditorInstance = (await import('./editor')).MonacoEditorInstance;
		const monaco = (await import('./monaco')).default;
		let monacoFilename = `${gid}_monaco` as any;
		const editor = new MonacoEditorInstance(monacoFilename, {
			minimap: {
				enabled: false
			},
			scrollbar: {
				vertical: verticalScrollbar
			},
			tabSize: 2,
			insertSpaces: false,
			detectIndentation: false,
			lineNumbers: 'off',
			glyphMargin: false,
			fontFamily: 'B612 Mono, monospace',
			fontSize: 14,
			folding: false,
			// Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
			lineDecorationsWidth: 0,
			lineNumbersMinChars: 0,
			readOnly,
			renderValidationDecorations: 'on',
			theme: 'typebash-dark',
			cursorStyle: 'block',
			renderLineHighlight: 'none'
		});

		editorInst = editor;
		monacoEditorBinding = editor;

		loaded = true;
		let lastDecorations: any | null = null;

		setTimeout(() => {
			if (el) editor.mount(el);

			editor.editor?.getModel()?.pushEOL(monaco.editor.EndOfLineSequence.LF);

			editor.editor?.onDidChangeModelContent(() => {
				const value = editor.editor?.getValue() || '';
				if (value.includes('\n')) {
					dispatch('submit', { value: (editor.editor?.getValue() || '').replace(/\r?\n$/g, '') });
					editor.editor?.getModel()?.setValue('');
				} else {
					dispatch('change', { value: editor.editor?.getValue() || '' });
				}

				lastDecorations?.clear();

				let parsed = parse(value);
				console.log(JSON.stringify(parsed, null, 2));
				let decors = [];
				for (let part of parsed) {
					// console.log('dec', start, end, startRowCol, endRowCol, kind);
					let subParts = [part];
					if (part.type == 'string') {
						subParts = part.parts;
					}
					for (let subPart of subParts) {
						let startRowCol = indexToRowColumn(value, subPart.start);
						let endRowCol = indexToRowColumn(value, subPart.end);
						decors.push({
							range: {
								startLineNumber: startRowCol.row + 1,
								startColumn: startRowCol.column + 1,
								endLineNumber: endRowCol.row + 1,
								endColumn: endRowCol.column + 1
							},
							options: {
								inlineClassName: {
									part: 'function',
									string: 'string',
									expression: 'expression',
									'raw-string': 'string',
									operator: 'operator'
								}[subPart.type]
							}
						});
					}
				}
				console.log(decors);

				lastDecorations?.clear();

				lastDecorations = editor.editor?.createDecorationsCollection(decors);
			});

			editor.editor?.layout();
			// editor.editor?.onKeyDown((e) => {
			// 	if (e.code == 'Enter') {
			// 		editor.editor?.getModel()?.setValue('');
			// 	}
			// });
		}, 1);
	});

	onDestroy(() => {});

	$: {
		hiddenStateExternal;
		if (editorInst) {
			editorInst.editor?.layout();
		}
	}
</script>

<div class="h-full" style="min-height: {targetHeightCSS}">
	{#if loaded}
		<div
			class="monaco-editor"
			class:hide-deco={verticalScrollbar == 'hidden'}
			data-gid={gid}
			bind:this={el}
			style="min-height: {targetHeightCSS}"
		/>
	{:else}
		<div class="bg-[#111111] flex justify-start items-start flex-col text-gray-500 h-full"></div>
	{/if}
</div>

<style lang="postcss">
	:global(.monaco-editor.hide-deco .decorationsOverviewRuler) {
		display: none !important;
	}
	:global(.method, .function) {
		color: #dcdcaa !important;
	}

	:global(.string) {
		color: #ce9178 !important;
	}

	:global(.property) {
		color: #9cdcfe !important;
	}

	:global(.let) {
		color: #9cdcfe !important;
	}

	:global(.const) {
		color: #2bb3ff !important;
	}

	:global(.parameter) {
		color: #9cdcfe !important;
	}

	:global(.class) {
		color: #d95af0 !important;
	}
</style>
