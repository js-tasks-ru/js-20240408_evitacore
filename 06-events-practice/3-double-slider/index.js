export default class DoubleSlider {
    element;
    currentThumb;
    subElements = {};

    constructor({
        min = 20,
        max = 100,
        formatValue = value => value,
        selected = {}
     } = {}) {
        this.min = min;
        this.max = max;
        this.formatValue = formatValue;
        this.from = selected?.from || this.min;
        this.to = selected?.to || this.max;
        this.element = this.createElement(this.createTemplate());
        this.createSubElements();
        this.setEventListeners();
    }

    createSubElements() {
        const elements = this.element.querySelectorAll('[data-element]');
        for (const element of elements) {
            this.subElements[element.dataset.element] = element;
        }
    }

    createElement(template) {
        const element = document.createElement('div');
        element.innerHTML = template;
        return element.firstChild;
    }

    calculatePercentPosition(thumbValue, direction) {
        const total = this.max - this.min;
        const value = direction === 'from' ? thumbValue - this.min : this.max - thumbValue;
        return Math.round(value / total * 100);
    }

    setEventListeners() {
        document.addEventListener('pointerdown', this.handleDocumentPointerdown);
    }

    handleDocumentPointerdown = (event) => {
        event.preventDefault();
        this.currentThumb = event.target.dataset.element;
        document.addEventListener('pointermove', this.handleDocumentPointermove);
        document.addEventListener('pointerup', this.handleDocumentPointerup);
    }

    handleDocumentPointermove = (event) => {
        const {left, width} = this.subElements.slider.getBoundingClientRect();
        const value = (event.clientX - left) * (this.max - this.min) / width + this.min;
        
        if (this.currentThumb === 'thumbLeft') {
            this.from = Math.round(Math.max(this.min, Math.min(this.to, value)));
            this.subElements.from.textContent = this.formatValue(this.from);
            const left = this.calculatePercentPosition(this.from, 'from');
            this.subElements.progress.style.left = left + '%';
            this.subElements.thumbLeft.style.left = left + '%';
        } else if (this.currentThumb === 'thumbRight') {
            this.to = Math.round(Math.min(this.max, Math.max(this.from, value)));
            this.subElements.to.textContent = this.formatValue(this.to);
            const right = this.calculatePercentPosition(this.to, 'to');
            this.subElements.thumbRight.style.right = right + '%';
            this.subElements.progress.style.right = right + '%';
        }
    }

    handleDocumentPointerup = () => {
        this.dispatchRangeSelectEvent();
        document.removeEventListener('pointermove', this.handleDocumentPointermove); 
        document.removeEventListener('pointerup', this.handleDocumentPointerup);
    }

    createTemplate() {
        const left = this.calculatePercentPosition(this.from, 'from');
        const right = this.calculatePercentPosition(this.to, 'to');

        return(
            `<div class="range-slider">
                <span data-element="from">${this.formatValue(this.from)}</span>
                <div data-element="slider" class="range-slider__inner">
                    <span data-element="progress" class="range-slider__progress" style="left: ${left}%; right: ${right}%"></span>
                    <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: ${left}%"></span>
                    <span data-element="thumbRight" class="range-slider__thumb-right" style="right: ${right}%"></span>
                </div>
                <span data-element="to">${this.formatValue(this.to)}</span>
            </div>`
        )
    }

    dispatchRangeSelectEvent() {
        const event = new CustomEvent("range-select", { 
            detail: {
                from: this.from,
                to: this.to
            }
        });
        this.element.dispatchEvent(event);
    }

    destroyEventListeners() {
        document.removeEventListener('pointerdown', this.handleDocumentPointerdown);
        document.removeEventListener('pointermove', this.handleDocumentPointermove);
        document.removeEventListener('pointerup', this.handleDocumentPointerup);
    }

    destroy() {
        this.element.remove();
        this.destroyEventListeners();
    }
}
