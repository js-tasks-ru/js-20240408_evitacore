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
        super(headersConfig, {data, sorted, url})
        this.isSortLocally = isSortLocally;
        this.url = url;
        this.sortField = sorted.id ?? this.defaultSortField;
        this.sortOrder = sorted.order ?? this.defaultSortOrder;

        this.createEventListeners();
        this.placeholder = this.createElement(this.createPlaceholderTemplate());
        this.loading = this.createElement(this.createLoadingTemplate());
    }

    resetPaginationParams(id, order) {
        this.start = this.sortField === id && this.sortOrder === order ? this.start : STARTITEMS;
        this.end = this.sortField === id && this.sortOrder === order ? this.end : LOADITEMS;
    }

    async render() {
        await this.sort(this.sortField, this.sortOrder)
    }

    async sort(id, order) {
        this.resetPaginationParams(id, order)

        this.sortField = id;
		this.sortOrder = order;

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
        const element = event.target.documentElement;
        const shouldScroll = element.scrollTop + element.clientHeight >= element.scrollHeight;

        if(shouldScroll) {
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
        super.sort(id, order);
    }

    createUrl(id, order) {
        const url = new URL(this.url, BACKEND_URL);

        url.searchParams.set('_embed', 'subcategory.category');
        url.searchParams.set('_sort', id);
        url.searchParams.set('_order', order);
        url.searchParams.set('_start', this.start);
        url.searchParams.set('_end', this.end);

        return url;
    }

    async uploadNextData() {
        this.addLoader();
        const url = this.createUrl(this.sortField, this.sortOrder);
        this.data = await fetchJson(url);
        this.subElements.body.insertAdjacentHTML('beforeend', this.createTableBodyTemplate());
        this.removeLoader();
    }

    async sortOnServer(id, order) {
        const url = this.createUrl(id, order);
        this.data = await fetchJson(url);

        if(this.data.length === 0){
            this.addPlacehodler();
        } else {
            this.removePlacehodler();
        }

        this.updateBody();
        this.updateHeader(id, order);
        
    }

    addLoader() {
        this.element.append(this.loading);
        this.element.classList.add('sortable-table_loading');
    }

    removeLoader() {
        this.loading.remove();
        this.element.classList.remove('sortable-table_loading');
    }

    addPlacehodler() {
        this.element.append(this.placeholder);
        this.element.classList.add('sortable-table_empty');
    }

    removePlacehodler() {
        this.placeholder.remove();
        this.element.classList.remove('sortable-table_empty');
    }

    destroy() {
		super.destroy();
        this.destroyEventListeners();
        document.removeEventListener('scroll', this.handlerScroll);
	}
}
