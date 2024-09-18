/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(2));
let provider; // 이전 provider를 추적하기 위한 변수
function activate(context) {
    console.log('INIT');
    // 처음에 HTML 파일에 대한 자동완성 제공자 등록
    registerCompletionItemProvider(context);
    // JavaScript 파일이 변경될 때 자동완성을 갱신하는 이벤트 리스너
    const textChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        const document = event.document;
        if (document.languageId === 'javascript') {
            console.log('JavaScript Document Changed: ', document.uri.fsPath);
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
            if (activeEditor &&
                activeEditor.document.languageId === 'html') {
            }
            // console.log(context.subscriptions, ' :  context.subscriptions');
            vscode.commands.executeCommand('editor.action.triggerSuggest');
        }
    });
    context.subscriptions.push(textChangeDisposable);
    console.log('END');
}
function registerCompletionItemProvider(context) {
    provider = vscode.languages.registerCompletionItemProvider('html', {
        provideCompletionItems(document, position) {
            if (provider) {
                provider.dispose();
            }
            const jsFilePath = getAssociatedJSFilePath(document.uri.fsPath);
            if (!jsFilePath) {
                return [];
            }
            // JS 파일의 최신 상태를 읽어와 자동완성 항목 생성
            const completionItems = generateCompletionItems(jsFilePath);
            console.log(completionItems, ' : complete items');
            return completionItems;
        },
    }, '');
    // 새로운 provider를 컨텍스트에 추가하여 관리
    context.subscriptions.push(provider);
}
function getAssociatedJSFilePath(htmlFilePath) {
    const jsFilePath = htmlFilePath.replace(/\.html$/, '.js');
    return fs.existsSync(jsFilePath) ? jsFilePath : null;
}
function generateCompletionItems(jsFilePath) {
    const jsContent = fs.readFileSync(jsFilePath, 'utf-8');
    return generateCompletionItemsFromContent(jsContent);
}
function generateCompletionItemsFromContent(jsContent) {
    const jsVariables = extractJSVariables(jsContent);
    const jsFunctions = extractJSFunctions(jsContent);
    const completionItems = [];
    jsVariables.forEach((variable) => {
        const item = new vscode.CompletionItem(variable, vscode.CompletionItemKind.Variable);
        completionItems.push(item);
    });
    jsFunctions.forEach((func) => {
        const item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Function);
        completionItems.push(item);
    });
    console.log('waht?? >>>> ', completionItems);
    return completionItems;
}
function extractJSVariables(jsContent) {
    // @track, @api, get, let, const, var, 그리고 단순 변수 선언을 추출
    const variableRegex = /(?:@track\s+|@api\s+|get\s+)?(?:let|const|var)?\s*(\w+)\s*(?:=|;|\()/g;
    const variables = [];
    let match;
    while ((match = variableRegex.exec(jsContent)) !== null) {
        console.log('While match >>>>', match);
        variables.push(match[1]);
    }
    return variables;
}
function extractJSFunctions(jsContent) {
    // function 키워드 없이 선언된 함수 이름을 추출
    const functionRegex = /(?:^|\s)(\w+)\s*\(.*\)\s*\{/g;
    const functions = [];
    let match;
    while ((match = functionRegex.exec(jsContent)) !== null) {
        functions.push(match[1]);
    }
    return functions;
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map