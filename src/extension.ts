import * as vscode from 'vscode';
import * as fs from 'fs';

let provider: vscode.Disposable | undefined; // 이전 provider를 추적하기 위한 변수

export function activate(context: vscode.ExtensionContext) {
	console.log('INIT');

	// 처음에 HTML 파일에 대한 자동완성 제공자 등록
	registerCompletionItemProvider(context);

	// JavaScript 파일이 변경될 때 자동완성을 갱신하는 이벤트 리스너
	const textChangeDisposable = vscode.workspace.onDidChangeTextDocument(
		(event) => {
			const document = event.document;

			if (document.languageId === 'javascript') {
				console.log(
					'JavaScript Document Changed: ',
					document.uri.fsPath,
				);

				// 기존 구독 해제
				context.subscriptions.forEach((subscription) => {
					subscription.dispose();
				});
				context.subscriptions.length = 0;

				// 기존 provider 해제
				if (provider) {
					provider.dispose();
				}

				// 새로운 provider 등록
				registerCompletionItemProvider(context);

				// 자동완성 목록 강제 갱신
				const activeEditor = vscode.window.activeTextEditor;
				if (
					activeEditor &&
					activeEditor.document.languageId === 'html'
				) {
				}
				// vscode.commands.executeCommand('editor.action.triggerSuggest');
			}
		},
	);

	context.subscriptions.push(textChangeDisposable);
	console.log('END');
}

function registerCompletionItemProvider(context: vscode.ExtensionContext) {
	provider = vscode.languages.registerCompletionItemProvider(
		'html',
		{
			provideCompletionItems(
				document: vscode.TextDocument,
				position: vscode.Position,
			): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
				if (provider) {
					provider.dispose();
				}

				const jsFilePath = getAssociatedJSFilePath(document.uri.fsPath);

				if (!jsFilePath) {
					return [];
				}

				// JS 파일의 최신 상태를 읽어와 자동완성 항목 생성
				const completionItems: vscode.CompletionItem[] =
					generateCompletionItems(jsFilePath);
				console.log(completionItems, ' : complete items');
				return completionItems;
			},
		},
		'{',
	);

	context.subscriptions.push(provider);
}

function getAssociatedJSFilePath(htmlFilePath: string): string | null {
	const jsFilePath = htmlFilePath.replace(/\.html$/, '.js');
	return fs.existsSync(jsFilePath) ? jsFilePath : null;
}

function generateCompletionItems(jsFilePath: string): vscode.CompletionItem[] {
	const jsContent = fs.readFileSync(jsFilePath, 'utf-8');
	return generateCompletionItemsFromContent(jsContent);
}

function generateCompletionItemsFromContent(
	jsContent: string,
): vscode.CompletionItem[] {
	const jsVariables = extractJSVariables(jsContent);
	const jsFunctions = extractJSFunctions(jsContent);

	const completionItems: vscode.CompletionItem[] = [];

	jsVariables.forEach((variable) => {
		const item = new vscode.CompletionItem(
			variable,
			vscode.CompletionItemKind.Variable,
		);
		completionItems.push(item);
	});

	jsFunctions.forEach((func) => {
		const item = new vscode.CompletionItem(
			func,
			vscode.CompletionItemKind.Function,
		);
		completionItems.push(item);
	});

	console.log('waht?? >>>> ', completionItems);

	return completionItems;
}

function extractJSVariables(jsContent: string): string[] {
	// @track, @api, get, let, const, var, 그리고 단순 변수 선언을 추출
	const variableRegex =
		/(?:@track\s+|@api\s+|get\s+)?(?:let|const|var)?\s*(\w+)\s*(?:=|;|\()/g;
	const variables: string[] = [];
	let match;

	while ((match = variableRegex.exec(jsContent)) !== null) {
		console.log('While match >>>>', match);
		variables.push(match[1]);
	}

	return variables;
}

function extractJSFunctions(jsContent: string): string[] {
	// function 키워드 없이 선언된 함수 이름을 추출
	const functionRegex = /(?:^|\s)(\w+)\s*\(.*\)\s*\{/g;
	const functions: string[] = [];
	let match;

	while ((match = functionRegex.exec(jsContent)) !== null) {
		functions.push(match[1]);
	}

	return functions;
}
