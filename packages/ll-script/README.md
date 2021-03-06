# ll-script

A simple webpack builder for react (inspired by react-scripts), already built into the ll-create cli. If you want to use this script to bundle your application, you should consider using ll-create to create your react-template.

## feat

1. support mock
2. support customize webpack config

## install

```zsh
yarn add ll-script -D
```

## use

Update the scripts section of your package.json file to use the ll-script CLI

```js
/* package.json */
"scripts": {
  "start": "ll-script start",
  "build": "ll-script",
}

```

### customize webpack config and devServer config

add ll.config.js in your project root.

```js
module.exports = {
  webpackConfig: (prevConfig, { isDev, isBuild }) => {
    //the best way is use webpack-merge to merge webpack config
    return prevConfig;
  },
  //webpack-dev-server config
  devServer: {}
};
```

### mock

now, mock data api is a simple feature. add `mock/index.json` file in your project root,
the structure of it like following.

```json
{
  "mock": true,
  "api": [
    {
      "path": "/api/get-info",
      "method": "GET",
      "res": {
        "data": {},
        "success": true
      },
      "mock": false
    },
    {
      "path": "/api/get-info/${infoId}",
      "method": "GET",
      "res": {
        "data": {},
        "success": true
      },
      "mock": true
    }
  ]
}
```
