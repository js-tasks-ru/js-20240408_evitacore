import SortableTableV1 from '../../05-dom-document-loading/2-sortable-table-v1/index.js';

export default class SortableTableV2 extends SortableTableV1 {
	defaultSortField = 'title';
	defaultSortOrder = 'asc';

  	constructor(headersConfig, {
		data = [],
		sorted = {},
		url = ''
  	} = {}) {
		super(headersConfig, data); 
		this.url = url;
		this.sorted = sorted;
		this.sort(this.defaultSortField, this.defaultSortOrder);
		this.createEventListeners();
  	}

	createEventListeners() {
		this.subElements.header.addEventListener('pointerdown', this.handleHeaderPointerdown)
	}

	destroyEventListeners() {
		this.subElements.header.removeEventListener('pointerdown', this.handleHeaderPointerdown)
	}

	handleHeaderPointerdown = (event) => {
		const sortElement = event.target.closest('[data-sortable="true"]');
		if (!sortElement) {
			return;
		}
		const sortElementId = sortElement.dataset.id;
		const sortElementOrder = sortElement.dataset.order === 'desc' ? 'asc' : 'desc';

		this.sort(sortElementId, sortElementOrder);
	}

	destroy() {
		super.destroy();
		this.destroyEventListeners();
	}
}
