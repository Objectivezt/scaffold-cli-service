const { NODE_ENV, CDN_HOST } = process.env;
const IS_DEV = NODE_ENV == 'development' ? true : false;
const cdnStgHost = CDN_HOST;
const cdnPrdHost = CDN_HOST;
let cdnHOST = IS_DEV ? cdnStgHost : cdnPrdHost;

exports.dllUrl = {
  stg: {
    js: `${cdnHOST}/ant/vendor.dev.dll.js`,
    css: `${cdnHOST}/ant/antd.css`,
  },
  prd: {
    js: `${cdnHOST}/ant/vendor.dll.js`,
    css: `${cdnHOST}/ant/antd.min.css`,
  },
};

exports.getLibrary = () => {
  const libraryAry = library.split('|');
  let newLibAry = [];
  libraryAry.map(item => {
    const isCdn = item.split('?cdn');
    newLibAry.push(isCdn.length > 1 ? `${cdnHost + isCdn[0]}` : item);
  });
  return newLibAry;
};
