require('./index.css');

const paragraphIcon = require('./icons/paragraph.js');
const getAlignmentIcon = require('./icons/alignment.js');

/**
 * Paragraph plugin for Editor.js
 * Supported config:
 *     * placeholder {string} (Default: '')
 *     * preserveBlank {boolean} (Default: false)
 *     * alignTypes {string[]} (Default: Paragraph.ALIGN_TYPES)
 *     * defaultAlignType {string} (Default: 'left')
 *
 * @class Paragraph
 * @typedef {Paragraph}
 */
export default class Paragraph {
  /**
   * Editor.js Toolbox settings
   *
   * @static
   * @readonly
   * @type {{ icon: any; title: string; }}
   */
  static get toolbox() {
    return {
      icon: paragraphIcon, title: 'Paragraph',
    };
  }

  /**
   * To notify Editor.js core that read-only is supported
   *
   * @static
   * @readonly
   * @type {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * All supported alignment types
   *
   * @static
   * @readonly
   * @type {string[]}
   */
  static get ALIGN_TYPES() {
    return ['left', 'center', 'right', 'justify'];
  }

  /**
   * Default alignment type
   *
   * @static
   * @readonly
   * @type {string}
   */
  static get DEFAULT_ALIGN_TYPE() {
    return 'left';
  }

  /**
   * Automatic sanitize config for Editor.js
   *
   * @static
   * @readonly
   * @type {{ text: {}; align: boolean; }}
   */
  static get sanitize() {
    return {
      text: {},
      align: false,
    };
  }

  /**
   * Editor.js config to convert one block to another
   *
   * @static
   * @readonly
   * @type {{ export: string; import: string; }}
   */
  static get conversionConfig() {
    return {
      export: 'text', // this property of tool data will be used as string to pass to other tool
      import: 'text', // to this property imported string will be passed
    };
  }

  /**
   * Editor.js config to substitute pasted HTML
   *
   * @static
   * @readonly
   * @type {{ tags: string[] }}
   */
  static get pasteConfig() {
    return {
      tags: ['P'],
    };
  }

  /**
   * Creates an instance of Paragraph.
   *
   * @constructor
   * @param {{ api: {}; readOnly: boolean; config: {}; data: {}; }} props
   */
  constructor({
    api, readOnly, config, data,
  }) {
    this._api = api;
    this._readOnly = readOnly;
    this._config = config || {};
    this._data = this._normalizeData(data);
    this._CSS = {
      block: this._api.styles.block,
      wrapper: 'ce-paragraph',
      wrapperForAlignment: (alignType) => `ce-paragraph-align-${alignType}`,
    };
    this._element = this._getElement();
  }

  /**
   * All available alignment types
   * - Finds intersection between supported and user selected alignment types
   *
   * @readonly
   * @type {string[]}
   */
  get availableAlignTypes() {
    return this._config.alignTypes ? Paragraph.ALIGN_TYPES.filter(
      (align) => this._config.alignTypes.includes(align),
    ) : Paragraph.ALIGN_TYPES;
  }

  /**
   * User's default alignment type
   * - Finds union of user choice and the actual default
   *
   * @readonly
   * @type {string}
   */
  get userDefaultAlignType() {
    if (this._config.defaultAlignType) {
      const userSpecified = this.availableAlignTypes.find(
        (align) => align === this._config.defaultAlignType,
      );
      if (userSpecified) {
        return userSpecified;
      }
      // eslint-disable-next-line no-console
      console.warn('(ง\'̀-\'́)ง Paragraph Tool: the default align type specified is invalid');
    }
    return Paragraph.DEFAULT_ALIGN_TYPE;
  }

  /**
   * User's preference for preserving blanks
   *
   * @readonly
   * @type {boolean}
   */
  get userPreserveBlank() {
    return Boolean(this._config.preserveBlank);
  }

  /**
   * To normalize input data
   *
   * @param {*} data
   * @returns {{ text: string; level: number; align: string; }}
   */
  _normalizeData(data) {
    const newData = {};
    if (typeof data !== 'object') {
      data = {};
    }

    newData.text = data.text || '';
    newData.align = data.align || this.userDefaultAlignType;
    return newData;
  }

  /**
   * Current alignment type
   *
   * @readonly
   * @type {string}
   */
  get currentAlignType() {
    let alignType = this.availableAlignTypes.find((align) => align === this._data.align);
    if (!alignType) {
      alignType = this.userDefaultAlignType;
    }
    return alignType;
  }

  /**
   * Create and return block element
   *
   * @returns {*}
   */
  _getElement() {
    const div = document.createElement('DIV');
    div.classList.add(
      this._CSS.wrapper,
      this._CSS.block,
      this._CSS.wrapperForAlignment(this.currentAlignType),
    );
    div.contentEditable = !this._readOnly;
    div.dataset.placeholder = this._api.i18n.t(this._config.placeholder || '');
    div.innerHTML = this._data.text || '';
    return div;
  }

  /**
   * Callback for Alignment block tune setting
   *
   * @param {string} newAlign
   */
  _setAlignType(newAlign) {
    this._data.align = newAlign;

    // Remove old CSS class and add new class
    Paragraph.ALIGN_TYPES.forEach((align) => {
      const alignClass = this._CSS.wrapperForAlignment(align);
      this._element.classList.remove(alignClass);
      if (newAlign === align) {
        this._element.classList.add(alignClass);
      }
    });
  }

  /**
   * HTML element to render on the UI by Editor.js
   *
   * @returns {*}
   */
  render() {
    return this._element;
  }

  /**
   * Editor.js save method to extract block data from the UI
   *
   * @param {*} blockContent
   * @returns {{ text: string }}
   */
  save(blockContent) {
    return {
      text: blockContent.innerHTML,
      align: this.currentAlignType,
    };
  }

  /**
   * Editor.js validation (on save) code for this block
   * - Skips empty blocks when preserveBlank isn't enabled
   *
   * @param {*} savedData
   * @returns {boolean}
   */
  validate(savedData) {
    if (!this.userPreserveBlank) {
      return savedData.text.trim() !== '';
    }
    return true;
  }



  /**
   * Block Tunes Menu items
   *
   * @returns {[{*}]}
   */
  renderSettings() {
    return Paragraph.ALIGN_TYPES.map((align) => ({
      icon: getAlignmentIcon(align),
      label: this._api.i18n.t(align.charAt(0).toUpperCase() + align.slice(1)),
      onActivate: () => this._setAlignType(align),
      isActive: align === this.currentAlignType,
      closeOnActivate: true,
      toggle: 'align',
    }));
  }

  /**
   * Editor.js onPaste method to substitute pasted HTML
   * - Doesn't seem to work
   *
   * @param {*} event
   */
  onPaste(event) {
    this._data = this._normalizeData({
      text: event.detail.data.innerHTML,
      align: this.currentAlignType,
    });

    /**
     * We use requestAnimationFrame for performance purposes
     */
    window.requestAnimationFrame(() => {
      this._element = this._getElement();
    });
  }

  /**
   * Editor.js method to merge similar blocks on `Backspace` keypress
   *
   * @param {*} data
   */
  merge(data) {
    this._element.innerHTML = this._element.innerHTML + data.text || '';
  }
}
