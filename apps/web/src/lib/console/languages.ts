import MonarchDef from './monarch.js';
import monaco from './monaco';

import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

export default function registerLanguages() {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.MonacoEnvironment = {
		getWorker(_: string, label: string) {
			if (label === 'typescript' || label === 'javascript') return new TsWorker();
			if (label === 'json') return new JsonWorker();
			return new EditorWorker();
		}
	};

	monaco.languages.register({
		id: 'plaintext',
		extensions: ['.txt'],
		aliases: ['PLAINTEXT', 'plaintext'],
		mimetypes: ['text/plain']
	});

	monaco.languages.register({
		id: 'shadeup',
		extensions: ['.shadeup'],
		aliases: ['SHADEUP', 'shadeup'],
		mimetypes: ['text/shadeup']
	});

	monaco.languages.setMonarchTokensProvider('typebash', MonarchDef);

	monaco.languages.registerCompletionItemProvider('typebash', {
		triggerCharacters: ['.'],
		async provideCompletionItems(model, position) {
			if (model.$shd) return await model.$shd.provideCompletionItems(model, position);
		}
	});

	monaco.languages.registerHoverProvider('typebash', {
		provideHover(model, pos) {
			if (model.$shd) return model.$shd.provideHover(model, pos);
		}
	});

	monaco.languages.registerDefinitionProvider('typebash', {
		provideDefinition(model, pos) {
			if (model.$shd) return model.$shd.provideDefinition(model, pos);
		}
	});
}
