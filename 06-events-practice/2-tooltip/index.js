class Tooltip {
  element;

  static #instance = null;

  constructor() {
    if(!Tooltip.#instance) {
      Tooltip.#instance = this;
    } else {
      return Tooltip.#instance;
    }
  }

  initialize() {
    this.element = this.createElement();
    this.setEventListeners();
  }

  createElement() {
    const element = document.createElement('div');
    element.className = 'tooltip';
    return element;
  }

  render(text = '') {
    this.element.textContent = text;
    document.body.append(this.element);
  }

  setEventListeners() {
    document.addEventListener('pointerover', this.handleDocumentPointerover);
    document.addEventListener('pointermove', this.handleDocumentPointermove);
    document.addEventListener('pointerout', this.handleDocumentPointerout);
  }

  destroyEventListeners() {
    document.removeEventListener('pointerover', this.handleDocumentPointerover);
    document.removeEventListener('pointermove', this.handleDocumentPointermove);
    document.removeEventListener('pointerout', this.handleDocumentPointerout);
  }

  handleDocumentPointerover = (event) => {
    if(event.target.dataset.tooltip) {
      this.render(event.target.dataset.tooltip);
    }
  }

  handleDocumentPointermove = (event) => {
    this.element.style.top = event.clientY + 'px';
    this.element.style.left = event.clientX + 'px';
  }

  handleDocumentPointerout = () => {
    this.element.remove();
  }

  destroy() {
    this.element.remove();
    this.destroyEventListeners();
  }
}

export default Tooltip;
