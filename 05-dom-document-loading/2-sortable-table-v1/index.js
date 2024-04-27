export default class SortableTableV1 {
    subElements = {};

    constructor(headerConfig = [], data = []) {
        this.headerConfig = headerConfig;
        this.data = data;
        this.element = this.createElement(this.createTemplate());
        this.sortMarker = this.createElement(this.createSortMarkerTemplate());
        this.createSubElements();
    }

    sort(fieldValue = 'title', orderValue = 'asc') {
        const sortField = this.headerConfig.find(column => column.id === fieldValue);
        this.sortData(sortField, orderValue);
        this.updateBody();
        this.updateHeader(fieldValue, orderValue);
    }

    sortData(sortField, orderValue) {
        const field = sortField.id;
        const type = sortField.sortType;
        this.data.sort((a,b) => {
            const order = orderValue === 'asc' ? 1 : -1;
            if(type === 'string') {
                return order * a[field].localeCompare(b[field], ['ru', 'en'], { caseFirst: "upper" });
            }
            return order * a[field] - b[field];
        })
    }

    createSubElements() {
        const elements = this.element.querySelectorAll('[data-element]');
        for (const element of elements) {
            this.subElements[element.dataset.element] = element;
        }
        return this.subElements;
    }

    updateHeader(fieldValue, orderValue) {
        this.sortMarker.remove();
        const columnElement = this.subElements.header.querySelector(`[data-id=${fieldValue}]`);
        columnElement.append(this.sortMarker);
        columnElement.dataset.order = orderValue;
    }

    updateBody() {
        this.subElements.body.innerHTML = this.createTableBodyTemplate();
    }

    createElement(template) {
        const element = document.createElement('div');
        element.innerHTML = template;
        return element.firstElementChild;
    }

    createTemplate() {
        return (
            `<div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                    ${this.createTableHeaderTemplate()}
                </div>
                <div data-element="body" class="sortable-table__body">
                    ${this.createTableBodyTemplate()}
                </div>
            </div>`
        );
    }

    createTableHeaderTemplate() {
        return this.headerConfig.map(cell => (
            `<div class="sortable-table__cell" data-id="${cell.id}" data-sortable="${cell.sortable}">
                <span>${cell.title}</span>
            </div>`
        )).join('');
    }

    createTableBodyTemplate() {
        return this.data.map(item => (
            `<a href="#" class="sortable-table__row">
                ${this.createTableRowTemplate(item)}
            </a>`
        )).join('');
    }
    
    createTableRowTemplate(item) {
        return this.headerConfig.map(
            column => this.createTableColumnTemplate(column)(item[column.id])
        ).join('');
    }

    createTableColumnTemplate(column) {
        if (column.template) {
            return column.template;
        }
        return (value) => `<div class="sortable-table__cell">${value}</div>`
    }

    createSortMarkerTemplate() {
        return(
            `<span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>`
        )
    }

    destroy() {
        this.element.remove();
    }
}

