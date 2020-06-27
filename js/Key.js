import create from './utils/create.js';

export default class Key {
  constructor({ small, shift, code }) {
    this.small = small;
    this.shift = shift;
    this.code = code;
    this.isFnKey = Boolean(small.match(/ctrl|alt|shift|tab|backspace|delete|enter|capslock|win|\u2190|\u2192|\u2191|\u2193/));
    if (shift && shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
      this.sub = create({
        tagName: 'div',
        classNames: 'sub',
        child: this.shift,
      });
    } else {
      this.sub = create(
        {
          tagName: 'div',
          classNames: 'sub',
          child: '',
        },
      );
    }
    this.letter = create({
      tagName: 'div',
      classNames: 'letter',
      child: small,
    });
    this.div = create({
      tagName: 'div',
      classNames: 'keyboard_key',
      child: [this.sub, this.letter],
      attributes: [
        ['code', this.code],
      ],
    });
  }
}
