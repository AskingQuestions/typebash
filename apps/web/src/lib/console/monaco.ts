import * as monaco from 'monaco-editor';

self.MonacoEnvironment = {
	getWorker: function (workerId, label) {
		const getWorkerModule = (moduleUrl, label) => {
			return new Worker(self.MonacoEnvironment.getWorkerUrl(moduleUrl), {
				name: label,
				type: 'module'
			});
		};

		switch (label) {
			case 'json':
				return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker?worker', label);
			case 'css':
			case 'scss':
			case 'less':
			case 'html':
			case 'handlebars':
			case 'razor':
			case 'typescript':
			case 'javascript':
				return getWorkerModule('/monaco-editor/esm/vs/language/typescript/ts.worker?worker', label);
			default:
				return getWorkerModule('/monaco-editor/esm/vs/editor/editor.worker?worker', label);
		}
	}
};

monaco.editor.defineTheme('typebash-dark', {
	base: 'vs-dark',
	inherit: true,

	colors: {
		'editor.background': '#111111',
		'menu.background': '#1e1e1e'
	},
	rules: [
		{ token: '', fontStyle: 'B612 Mono' }
		// { token: 'comment', foreground: '808080' },
		// { token: 'string', foreground: 'ce9178' },
		// { token: 'number', foreground: 'b5cea8' },
		// { token: 'keyword', foreground: '#d95af0' },
		// { token: 'type', foreground: '#d95af0' },
		// { token: 'operator', foreground: 'd4d4d4' }
	]
});

export default monaco;
