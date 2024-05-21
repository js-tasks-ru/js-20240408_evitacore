export default class SortableList {
    draggingElement;
    placeholderElement;
    shiftX;

    constructor({ items = [] }) {
        this.items = items;
        this.element = this.createElement(items);
        this.createEventListeners();
    }

    createElement(items) {
        const element = document.createElement('ul');
        element.className = 'sortable-list';

        items.map(item => {
            item.classList.add('sortable-list__item');
        });

        element.append(...items);
        return element;
    }

    handlePointerDown = (e) => {
        const element = e.target.closest('.sortable-list__item');
        const { deleteHandle, grabHandle } = e.target?.dataset;

        if (element) {
            e.preventDefault();
            if (grabHandle === '') {
                this.startDragging(element, e);
            }

            if (deleteHandle === '') {
                element.remove();
            }
        }
    }

    startDragging(element, e) {
        this.draggingElement = element;
        this.placeholderElement = this.createPlaceholderElement();

        element.classList.add('sortable-list__item_dragging');
        element.style.width = `${this.element.offsetWidth}px`;

        this.shiftX = e.clientX - element.getBoundingClientRect().left;

        this.element.insertBefore(this.placeholderElement, element.nextSibling);
        this.element.appendChild(element);

        this.moveElementAt(e.pageX, e.pageY);

        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('pointerup', this.handlePointerUp);
    }

    moveElementAt(pageX, pageY) {
        this.draggingElement.style['pointer-events'] = 'none';

        const left = pageX - window.scrollX - this.shiftX;
        const top = pageY - window.scrollY - this.draggingElement.offsetHeight / 2;

        this.draggingElement.style.left = `${left}px`;
        this.draggingElement.style.top = `${top}px`;
    }

    handlePointerMove = (e) => {
        this.moveElementAt(e.pageX, e.pageY);
        const placeholderIndex = [...this.element.children].indexOf(this.placeholderElement);
        const closestElement = document.elementFromPoint(e.clientX, e.clientY).closest('.sortable-list__item');
        if (closestElement && closestElement !== this.draggingElement) {
            const closestIndex = [...this.element.children].indexOf(closestElement);
            if (placeholderIndex > closestIndex) {
                this.element.insertBefore(this.placeholderElement, closestElement);
            } else {
                this.element.insertBefore(this.placeholderElement, closestElement.nextSibling);
            }
        }
    }

    handlePointerUp = () => {
        document.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('pointerup', this.handlePointerUp);

        this.draggingElement.classList.remove('sortable-list__item_dragging');
        this.draggingElement.style['pointer-events'] = 'all';
        this.draggingElement.style.left = '';
        this.draggingElement.style.top = '';
        this.element.insertBefore(this.draggingElement, this.placeholderElement);
        this.placeholderElement.remove();

        this.draggingElement = null;
        this.placeholderElement = null;
        this.shiftX = null;
    }

    createPlaceholderElement() {
        const element = document.createElement('li');
        element.className = 'sortable-list__placeholder';
        element.style.width = `${this.draggingElement.offsetWidth}px`;
        element.style.height = `${this.draggingElement.offsetHeight}px`;
        return element;
    }

    createEventListeners() {
        this.element.addEventListener('pointerdown', this.handlePointerDown);
    }

    destroyEventListeners() {
        this.element.removeEventListener('pointerdown', this.handlePointerDown);
        document.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('pointerup', this.handlePointerUp);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.element.remove();
        this.destroyEventListeners();
    }
}