/** Creates HTMLElement with specified attributes
 * @param {Object} config Config object for element to create @param {string}
 * @param {string} config.tagName HTML tag name
 * @param {string} config.classNames List of css classes
 * @param {...[HTMLElement, HTMLElement]} config.child List of HTML elements
 * @param {HTMLElement} config.parent HTML element
 * @param {...[string, string]} config.attributes list of custom at attributes
 * 
 * @returns {HTMLElement} Created HTML element
 */

export default function create(config) {
  const {
    tagName = 'div',
    classNames = '',
    child = [],
    parent,
    attributes = [],
  } = config;
  let element = null;
  try {
    element = document.createElement(tagName);
  } catch (error) {
    throw new Error('Unable to create HTML Element! Give a proper tag name.');
  }
  if (classNames) {
    element.classList.add(...classNames.split(' '));
  }
  if (child && Array.isArray(child)) {
    child.forEach((childElement) => childElement && element.appendChild(childElement));
  } else if (child && typeof child === 'string') {
    element.innerHTML = child;
  }
  if (parent) {
    parent.appendChild(element);
  }
  if (attributes.length) {
    attributes.forEach(([attrName, attrValue]) => {
      if (attrValue === '') {
        element.setAttribute(attrName, '');
      }
      if (attrName.match(/value|id|placeholder|cols|rows|autocorrect|spellcheck/)) {
        element.setAttribute(attrName, attrValue);
      } else {
        element.dataset[attrName] = attrValue;
      }
    });
  }
  return element;
}
