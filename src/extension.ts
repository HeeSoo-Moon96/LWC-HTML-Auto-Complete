import * as vscode from 'vscode';
import { Project, SourceFile } from 'ts-morph';
import * as _ from 'lodash';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	console.log(' !!!INIT!!! ');
	const project = new Project();
	let sourceFileCache: { [key: string]: SourceFile } = {};

	const updateSourceFile = (jsFilePath: string) => {
		console.log(sourceFileCache, ' : sourceFileCache');
		if (sourceFileCache[jsFilePath]) {
			project.removeSourceFile(sourceFileCache[jsFilePath]);
			delete sourceFileCache[jsFilePath];
		}
		const sourceFile = project.addSourceFileAtPath(jsFilePath);
		sourceFileCache[jsFilePath] = sourceFile;
	};

	const provider = vscode.languages.registerCompletionItemProvider(
		'html',
		{
			provideCompletionItems(
				document: vscode.TextDocument,
				position: vscode.Position,
			) {
				const jsFilePath = path.join(
					path.dirname(document.uri.fsPath),
					`${path.basename(document.uri.fsPath, '.html')}.js`,
				);

				if (!sourceFileCache[jsFilePath]) {
					updateSourceFile(jsFilePath);
				}

				const sourceFile = sourceFileCache[jsFilePath];
				const completions: vscode.CompletionItem[] = [];

				const lineText = document.lineAt(position.line).text;
				const beforeCursor = lineText.substring(0, position.character);

				// 자동완성 트리거가 {} 안에서만 동작하도록
				const openBrace = beforeCursor.lastIndexOf('{');
				const closeBrace = lineText.indexOf('}', position.character);
				if (openBrace === -1 || closeBrace === -1) {
					return undefined;
				}

				const classes = sourceFile.getClasses();
				classes.forEach((cls) => {
					cls.getGetAccessors().forEach((getter) => {
						const item = new vscode.CompletionItem(
							getter.getName(),
							vscode.CompletionItemKind.Property,
						);
						completions.push(item);
					});

					cls.getMethods().forEach((method) => {
						const item = new vscode.CompletionItem(
							method.getName(),
							vscode.CompletionItemKind.Method,
						);
						completions.push(item);
					});
				});

				sourceFile.getVariableDeclarations().forEach((variable) => {
					const item = new vscode.CompletionItem(
						variable.getName(),
						vscode.CompletionItemKind.Variable,
					);
					completions.push(item);
				});

				return completions;
			},
		},
		'{',
	);

	context.subscriptions.push(provider);

	const jsWatcher = vscode.workspace.createFileSystemWatcher('**/*.js');

	const debouncedUpdate = _.debounce((uri: vscode.Uri) => {
		console.log(uri, ' : debounce update uri');
		updateSourceFile(uri.fsPath);
	}, 300);

	jsWatcher.onDidChange(debouncedUpdate);
	jsWatcher.onDidCreate(debouncedUpdate);
	jsWatcher.onDidDelete((uri) => {
		if (sourceFileCache[uri.fsPath]) {
			project.removeSourceFile(sourceFileCache[uri.fsPath]);
			delete sourceFileCache[uri.fsPath];
		}
	});

	vscode.workspace.onDidChangeTextDocument((event) => {
		console.log('Change Event');
		if (event.document.languageId === 'javascript') {
			const jsFilePath = event.document.uri.fsPath;
			updateSourceFile(jsFilePath);

			const htmlFilePath = jsFilePath.replace('.js', '.html');
			const htmlDoc = vscode.workspace.textDocuments.find(
				(doc) => doc.fileName === htmlFilePath,
			);
			if (htmlDoc) {
				// HTML 파일을 강제로 열고 다시 닫기 (갱신하기 위해)
				vscode.window.showTextDocument(htmlDoc.uri).then((editor) => {
					setTimeout(() => {
						vscode.commands.executeCommand(
							'workbench.action.closeActiveEditor',
						);
					}, 100); // 적절한 시간 딜레이 후 닫기
				});
			}
		}
	});

	context.subscriptions.push(jsWatcher);
}

export function deactivate() {
	console.log('Deactivating!!');
}
