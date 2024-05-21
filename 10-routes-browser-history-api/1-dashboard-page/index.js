import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    element;
    subElements = {};
    components = {};

    render() {
        this.element = this.createElement(this.createTemplate());
        this.createSubElements();
        this.createComponents();
        this.renderComponents();
        this.createEventListeners();
        return this.element;
    }

    createComponents () {
        const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth() - 1));
    
        const rangePicker = new RangePicker({
            from,
            to
        });
    
        const sortableTable = new SortableTable(header, {
            url: `api/dashboard/bestsellers?_start=1&_end=21&from=${from.toISOString()}&to=${to.toISOString()}`,
            isSortLocally: false
        });
    
        const ordersChart = new ColumnChart({
            url: 'api/dashboard/orders',
            range: {
                from,
                to
            },
            label: 'orders',
            link: '#'
        });
    
        const salesChart = new ColumnChart({
            url: 'api/dashboard/sales',
            label: 'sales',
            range: {
                from,
                to
            },
            formatHeading: (data) => `$${data}`
        });
    
        const customersChart = new ColumnChart({
            url: 'api/dashboard/customers',
            label: 'customers',
            range: {
                from,
                to
            }
        });
    
        this.components = {
            rangePicker,
            sortableTable,
            ordersChart,
            salesChart,
            customersChart
        };
      }

    renderComponents () {
        for (const [key, component] of Object.entries(this.components)) {
            this.subElements[key].append(component.element);
        }
    }

    async updateComponents (from, to) {
        try {
            const data = await this.loadData(from, to);
            this.components.sortableTable.renderRows(data);
            this.components.ordersChart.update(from, to);
            this.components.salesChart.update(from, to);
            this.components.customersChart.update(from, to);
        } catch (error) {
            console.error('Error updating components:', error);
        }
    }
    
    loadData (from, to) {
        const url = new URL('api/dashboard/bestsellers', BACKEND_URL);
        
        url.searchParams.set('_start', '1');
        url.searchParams.set('_end', '21');
        url.searchParams.set('_sort', 'title');
        url.searchParams.set('_order', 'asc');
        url.searchParams.set('from', from.toISOString());
        url.searchParams.set('to', to.toISOString());
    
        return fetchJson(url);
    }

    handleDateSelect = (e) => {
        const { from, to } = e.detail;
        this.updateComponents(from, to);
    }

    createEventListeners () {
        this.components.rangePicker.element.addEventListener('date-select', this.handleDateSelect);
    }

    removeEventListeners() {
        this.components.rangePicker.element.removeEventListener('date-select', this.handleDateSelect);
    }

    createTemplate() {
        return(
            `<div class="dashboard">
            <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <div data-element="rangePicker"></div>
            </div>
            <div data-element="chartsRoot" class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
            </div>
            <h3 class="block-title">Best sellers</h3>
            <div data-element="sortableTable"></div>
        </div>`
        )
    }

    createElement(template) {
        const element = document.createElement('div');
        element.innerHTML = template;
        return element.firstElementChild;
    }

    createSubElements() {
        const elements = this.element.querySelectorAll('[data-element]');
        for (const element of elements) {
            this.subElements[element.dataset.element] = element;
        }
        return this.subElements;
    }

    remove () {
        if (this.element) {
            this.element.remove();
        }
    }
    
    destroy () {
        this.remove();
        this.removeEventListeners();
        this.subElements = {};
        this.element = null;
    
        for (const component of Object.values(this.components)) {
             component.destroy();
        }
    }
}
