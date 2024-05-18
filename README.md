# Paragraph block tool for Editor.js

This [Editor.js](https://editorjs.io/) block tool extends [@editorjs/paragraph](https://github.com/editor-js/paragraph) to include alignment options (see [Preview](https://github.com/CoolBytesIN/editorjs-paragraph?tab=readme-ov-file#preview)).

## Preview

#### Block Tool
![paragraph](https://api.coolbytes.in/media/handle/view/image/298/)

#### Block Settings
![settings](https://api.coolbytes.in/media/handle/view/image/299/)

## Installation

**Using `npm`**

```sh
npm install @coolbytes/editorjs-paragraph
```

**Using `yarn`**

```sh
yarn add @coolbytes/editorjs-paragraph
```

## Usage

Include it in the `tools` property of Editor.js config:

```js
const editor = new EditorJS({
  tools: {
    paragraph: Paragraph
  }
});
```

## Config Params

|Field|Type|Optional|Default|Description|
|---|---|---|---|---|
|placeholder|`string`|`Yes`|''|Placeholder text when empty|
|preserveBlank|`boolean`|`Yes`|false|Indicates whether to include blank paragraphs when saving editor data|
|alignTypes|`string[]`|`Yes`|['left', 'center', 'right', 'justify']|All supported alignment options (%)|
|defaultAlignType|`string`|`Yes`|'left'|Preferred alignment type|

&nbsp;

```js
const editor = EditorJS({
  tools: {
    paragraph: {
      class: Paragraph,
      config: {
        placeholder: 'Start Typing...',
        preserveBlank: false,
        alignTypes: ['left', 'center', 'right', 'justify'],
        defaultAlignType: 'left'
      }
    }
  }
});
```

## Output data

|Field|Type|Description|
|---|---|---|
|text|`string`|Paragraph's text|
|align|`string`|Alignment type|

&nbsp;

Example:

```json
{
  "time": 1715969561758,
  "blocks": [
    {
      "id": "_K5QcJHHuK",
      "type": "paragraph",
      "data": {
        "text": "Cool Bytes",
        "align": "center"
      }
    }
  ],
  "version": "2.29.1"
}
```