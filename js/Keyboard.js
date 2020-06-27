/* eslint-disable no-param-reassign */
/* eslint-disable import/extensions */

import * as storage from './storage.js';
import create from './utils/create.js';
import language from './layouts/index.js';
import Key from './Key.js';

const main = create({
  tagName: 'div',
  classNames: 'main',
  child: [
    create({
      tagName: 'h1',
      classNames: 'title',
      child: "Michał Kukiełka's Virtual Keyboard",
    }),
    create({
      tagName: 'h3',
      classNames: 'subtitle',
      child: 'Windows keyboard...',
    }),
    create({
      tagName: 'p',
      classNames: 'hint',
      child: 'Use left <kbd>Control</kbd> + <kbd>Alt</kbd> to switch language.',
    }),
  ],
});

const placeholderDiv = create({
  tagName: 'div',
});
const placeholderDiv2 = create({
  tagName: 'div',
});

export default class Keyboard {
  constructor(rowsOrder) {
    this.rowsOrder = rowsOrder;
    this.keysPressed = {};
    this.isCaps = false;
  }

  init(languageCode) {
    this.keyBase = language[languageCode];
    this.output = create({
      tagName: 'textarea',
      classNames: 'output',
      parent: main,
      attributes: [
        ['placeholder', 'Type something...'],
        ['rows', 5],
        ['cols', 160],
        ['spellcheck', false],
        ['autocorrect', 'off'],
      ],
    });
    this.container = create({
      tagName: 'div',
      classNames: 'keyboard',
      parent: main,
      attributes: [
        ['language', languageCode],
      ],
    });
    document.body.prepend(placeholderDiv);
    document.body.prepend(main);
    document.body.prepend(placeholderDiv2);
    return this;
  }

  generateLayout() {
    this.keyButtons = [];
    this.rowsOrder.forEach((row, index) => {
      const rowElement = create({
        tagName: 'div',
        classNames: 'keyboard_row',
        parent: this.container,
        attributes: [
          ['row', index + 1],
        ],
      });
      row.forEach((code) => {
        const keyObj = this.keyBase.find((key) => key.code === code);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowElement.appendChild(keyButton.div);
        }
      });
    });
    document.addEventListener('keydown', this.handleEvent.bind(this));
    document.addEventListener('keyup', this.handleEvent.bind(this));
    this.container.onmousedown = this.preHandleEvent.bind(this);
    this.container.onmouseup = this.preHandleEvent.bind(this);
  }

  preHandleEvent(e) {
    e.stopPropagation();
    const keyDiv = e.target.closest('.keyboard_key');
    if (!keyDiv) {
      return;
    };
    const { dataset: { code } } = keyDiv;
    keyDiv.addEventListener('mouseleave', this.resetButtonState.bind(this));
    this.handleEvent({ code, type: e.type });
  }

  resetButtonState({ target: { dataset: { code } } }) {
    const keyObj = this.keyButtons.find((key) => key.code === code);
    keyObj.div.classList.remove('active');
    keyObj.div.removeEventListener('mouseleave', this.resetButtonState.bind(this));
  }

  handleEvent(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    const { code, type } = e;
    const keyObj = this.keyButtons.find((key) => key.code === code);
    if (!keyObj) {
      return;
    };
    this.output.focus();
    if (type.match(/keydown|mousedown/)) {
      if (type.match(/key/)) {
        e.preventDefault();
      }
      if (code.match(/Shift/)) {
        this.shiftKey = true;
      }
      if (this.shiftKey) {
        this.switchUpperCase(true);
      }
      keyObj.div.classList.add('active');

      if (code.match(/CapsLock/) && !this.isCaps) {
        this.isCaps = true;
        this.switchUpperCase(true);
      } else if (code.match(/CapsLock/) && this.isCaps) {
        this.isCaps = false;
        this.switchUpperCase(false);
        keyObj.div.classList.remove('active');
      }
      if (code.match(/Control/)) {
        this.ctrlKey = true;
      }
      if (code.match(/Alt/)) {
        this.altKey = true;
      }
      if (code.match(/Control/) && this.altKey) {
        this.switchLanguage();
      }
      if (code.match(/Alt/) && this.ctrlKey) {
        this.switchLanguage();
      }
      if (!this.isCaps) {
        this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
      } else if (this.isCaps) {
        if (this.shiftKey) {
          this.printToOutput(keyObj, keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        } else {
          this.printToOutput(keyObj, !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        }
      }
    } else if (type.match(/keyup|mouseup/)) {
      if (code.match(/Shift/)) {
        this.shiftKey = false;
        this.switchUpperCase(false);
      }
      if (code.match(/Control/)) {
        this.ctrlKey = false;
      }
      if (code.match(/Alt/)) {
        this.altKey = false;
      }
      if (!code.match(/CapsLock/)) {
        keyObj.div.classList.remove('active');
      }
    }
  }

  switchLanguage() {
    const languageAbbr = Object.keys(language);
    let languageID = languageAbbr.indexOf(this.container.dataset.language);
    this.keyBase = languageID + 1 < languageAbbr.length ? language[languageAbbr[languageID += 1]]
      : language[languageAbbr[languageID -= 1]];
    this.container.dataset.language = languageAbbr[languageID];
    storage.set('kbLang', languageAbbr[languageID]);
    this.keyButtons.forEach((button) => {
      const keyObj = this.keyBase.find((key) => key.code === button.code);
      if (!keyObj) {
        return;
      }
      button.shift = keyObj.shift;
      button.small = keyObj.small;
      if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)) {
        button.sub.innerHTML = keyObj.shift;
      } else {
        button.sub.innerHTML = '';
      }
      button.letter.innerHTML = keyObj.small;
    });
    if (this.isCaps) {
      this.switchUpperCase(true);
    }
  }

  switchUpperCase(isUpper) {
    if (isUpper) {
      this.keyButtons.forEach((button) => {
        if (button.sub.innerHTML) {
          if (this.shiftKey) {
            button.sub.classList.add('sub-active');
            button.letter.classList.add('sub');
          }
        }
        if (!button.isFnKey && this.isCaps && !this.shiftKey && !button.sub.innerHTML) {
          button.letter.classList.add('shifted');
        } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
          button.letter.classList.remove('shifted');
        } else if (!button.isFnKey && !button.sub.innerHTML) {
          button.letter.classList.add('shifted');
        }
      });
    } else {
      this.keyButtons.forEach((button) => {
        if (button.sub.innerHTML && !button.isFnKey) {
          button.sub.classList.remove('sub-active');
          button.letter.classList.remove('sub');
          if (!this.isCaps) {
            button.letter.classList.remove('shifted');
          } else if (!this.isCaps) {
            button.letter.classList.add('shifted');
          }
        } else if (!button.isFnKey) {
          if (this.isCaps) {
            button.letter.classList.add('shifted');
          } else {
            button.letter.classList.remove('shifted');
          }
        }
      });
    }
  }

  printToOutput(keyObj, symbol) {
    let cursorPositon = this.output.selectionStart;
    const left = this.output.value.slice(0, cursorPositon);
    const right = this.output.value.slice(cursorPositon);
    const fnButtonHandler = {
      Tab: () => {
        this.output.value = `${left}\t${right}`;
        cursorPositon += 1;
      },
      ArrowLeft: () => {
        cursorPositon = cursorPositon - 1 >= 0 ? cursorPositon - 1 : 0;
      },
      ArrowRight: () => {
        cursorPositon += 1;
      },
      ArrowUp: () => {
        const positionFromLeft = left.match(/(\n).*$(?!\1)/g) || [[1]];
        cursorPositon -= positionFromLeft[0].length;
      },
      ArrowDown: () => {
        const positionFromLeft = right.match(/^.*(\n).*(?!\1)/) || [[1]];
        cursorPositon += positionFromLeft[0].length + 1;
      },
      Enter: () => {
        this.output.value = `${left}\n${right}`;
        cursorPositon += 1;
      },
      Delete: () => {
        this.output.value = `${left}${right.slice(1)}`;
      },
      Backspace: () => {
        this.output.value = `${left.slice(0, -1)}${right}`;
        cursorPositon -= 1;
      },
      Space: () => {
        this.output.value = `${left} ${right}`;
        cursorPositon += 1;
      },
    };
    if (fnButtonHandler[keyObj.code]) {
      fnButtonHandler[keyObj.code]();
    } else if (!keyObj.isFnKey) {
      cursorPositon += 1;
      this.output.value = `${left}${symbol || ''}${right}`;
    }
    this.output.setSelectionRange(cursorPositon, cursorPositon);
  }
}
