const { dllUrl, getLibrary } = require('./libUrl');
const {
  NODE_ENV,
  ANTD_STYLE_SWATCH,
  CDN_HOST,
  LIBRARY_CSS_LIST,
  LIBRARY_JS_LIST,
  SCRIPT_STRING_BEFORE,
  SCRIPT_STRING_AFTER,
} = process.env;

const IS_DEV = NODE_ENV === 'development' ? true : false;

let JSAry = [];
let CssAry = [];
let ScriptStringBefore = '';
let ScriptStringAfter = '';

// DLL JS
if (CDN_HOST) {
  JSAry.push(IS_DEV ? dllUrl.stg.js : dllUrl.prd.js);
} else {
  JSAry.push(IS_DEV ? '/dll/vendor.dev.dll.js' : '/dll/vendor.dll.js');
}
if (ANTD_STYLE_SWATCH == 'true') {
  CssAry.push(IS_DEV ? dllUrl.stg.css : dllUrl.prd.css);
}

// DLL CSS
if (ANTD_STYLE_SWATCH == 'true') {
  CssAry.push(IS_DEV ? dllUrl.stg.css : dllUrl.prd.css);
}

// 加载JS CSS库资源
if (LIBRARY_CSS_LIST) {
  CssAry = CssAry.concat(getLibrary(LIBRARY_CSS_LIST));
}

if (LIBRARY_JS_LIST) {
  JSAry = JSAry.concat(getLibrary(LIBRARY_JS_LIST));
}

if (SCRIPT_STRING_BEFORE) {
  ScriptStringBefore += SCRIPT_STRING_BEFORE;
}

if (SCRIPT_STRING_AFTER) {
  ScriptStringAfter += SCRIPT_STRING_AFTER;
}

exports.JSAryUrl = JSAry;
exports.CssAryUrl = CssAry;
exports.ScriptStringBefore = ScriptStringBefore;
exports.ScriptStringAfter = ScriptStringAfter;
