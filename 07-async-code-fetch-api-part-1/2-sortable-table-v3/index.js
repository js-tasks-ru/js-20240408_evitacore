import fetchJson from './utils/fetch-json.js';
import SortableTableV2 from '../../06-events-practice/1-sortable-table-v2/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const STARTITEMS = 0;
const LOADITEMS = 30;

export default class SortableTableV3 extends SortableTableV2 {
    start = STARTITEMS;
    end = LOADITEMS;

    constructor(headersConfig, {
        data = [],
        sorted = {},
        isSortLocally = false,
        url = ''
    } = {}) {
        super(headersConfig, {data, sorted, isSortLocally})
        this.isSortLocally = isSortLocally;
        this.url = url;
        this.id = sorted.id ?? this.defaultSortField;
        this.order = sorted.order ?? this.defaultSortOrder;

        this.render();
        this.createEventListeners();
        this.placeholder = this.createElement(this.createPlaceholderTemplate());
        this.loading = this.createElement(this.createLoadingTemplate());
    }

    async render() {
        if(this.isSortLocally){
            this.sortOnClient(this.id, this.order)
        }
        await this.sortOnServer(this.id, this.order)
    }

    async sort(id, order) {
        if (this.subElements.body.children.length == 0) {
            return;
        }

        if (this.isSortLocally) {
            this.sortOnClient(id, order);
          } else {
            await this.sortOnServer(id, order);
          }
    }

    createEventListeners() {
        super.createEventListeners();
        document.addEventListener('scroll', this.handlerScroll);
    }

    handlerScroll = (event) => {
        if(event.target.documentElement.scrollTop + event.target.documentElement.clientHeight >= event.target.documentElement.scrollHeight) {
            this.start += LOADITEMS;
            this.end += LOADITEMS;
            this.uploadNextData();
        }
    }

    createLoadingTemplate() {
        return(`<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`);
    }

    createPlaceholderTemplate() {
        return(`
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
                <p>No products satisfies your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
        </div>`)
    }

    sortOnClient(id, order) {
        super.sortOnClient(id, order);
    }

    createUrl(id, order) {
        this.start = this.id === id && this.order === order ? this.start : STARTITEMS;
        this.end = this.id === id && this.order === order ? this.end : LOADITEMS;
        this.id = id;
        this.order = order;
        const url = new URL(this.url, BACKEND_URL);
        url.searchParams.set('_embed', 'subcategory.category');
        url.searchParams.set('_sort', id);
        url.searchParams.set('_order', order);
        url.searchParams.set('_start', this.start);
        url.searchParams.set('_end', this.end);
        return url;
    }

    async uploadNextData() {
        this.element.append(this.loading);
        this.element.classList.add('sortable-table_loading');
        const url = this.createUrl(this.id, this.order);
        this.data = await fetchJson(url);
        this.subElements.body.insertAdjacentHTML('beforeend', this.createTableBodyTemplate());
        this.loading.remove();
        this.element.classList.remove('sortable-table_loading');
    }

    async sortOnServer(id, order) {
        const url = this.createUrl(id, order);
        this.data = await fetchJson(url);
        if(this.data.length){
            this.element.append(this.placeholder);
            this.element.classList.add('sortable-table_empty');
        }
        this.placeholder.remove();
        this.element.classList.remove('sortable-table_empty');
        this.updateBody();
        this.updateHeader(id, order);
        
    }

    destroy() {
		super.destroy();
        this.destroyEventListeners();
        document.removeEventListener('scroll', this.handlerScroll);
	}
}
