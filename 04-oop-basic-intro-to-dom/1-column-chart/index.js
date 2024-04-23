export default class ColumnChart {
    element;
    chartHeight = 50;

    constructor({
        data = [],
        label = '',
        link = '',
        value = 0,
        formatHeading = value => value
    } = {}) {
        this.data = data;
        this.label = label;
        this.link = link;
        this.value = value;
        this.formatHeading = formatHeading;

        this.element = this.createElement(this.createTemplate());
    }

    createElement(template) {
        const element = document.createElement('div');

        element.innerHTML = template;

        return element.firstElementChild;
    }

    getColumnProps() {
        const maxValue = Math.max(...this.data);
        const scale = 50 / maxValue;
      
        return this.data.map(item => {
            return {
                percent: (item / maxValue * 100).toFixed(0) + '%',
                value: String(Math.floor(item * scale))
            };
        });
    }

    createLinkTemplate() {
        return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';        
    }

    createChartBodyTemplate() {
        return this.getColumnProps().map(({ value, percent}) => (
            `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
        )).join('');
    }

    createChartClasses() {
        return this.data.length ? 'column-chart' : 'column-chart column-chart_loading';
    }

    createTemplate() {
        return (`
        <div class="${this.createChartClasses()}" style="--chart-height: 50">
            <div class="column-chart__title">
                ${this.label}
                ${this.createLinkTemplate()}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
                <div data-element="body" class="column-chart__chart">
                    ${this.createChartBodyTemplate()}
                </div>
            </div>
        </div>`);
    }

    update(newData) {
        this.data = newData;
        this.element.querySelector('[data-element="body"]').innerHTML = this.createChartBodyTemplate();
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}
