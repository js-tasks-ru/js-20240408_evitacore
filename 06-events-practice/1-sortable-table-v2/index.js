import SortableTableV1 from '../../05-dom-document-loading/2-sortable-table-v1/index.js';

export default class SortableTableV2 extends SortableTableV1 {
	defaultSortField = 'title';
	defaultSortOrder = 'asc';

  	constructor(headersConfig, {
		data = [],
		sorted = {},
		isSortLocally = true
  	} = {}) {
		super(headersConfig, data); 
		this.isSortLocally = isSortLocally;
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

	sort(fieldValue, orderValue) {
		if (this.isSortLocally) {
		  this.sortOnClient(fieldValue, orderValue);
		} else {
		  this.sortOnServer();
		}
	}

	sortOnClient(fieldValue, orderValue) {
		super.sort(fieldValue, orderValue);
	}

	destroy() {
		super.destroy();
		this.destroyEventListeners();
	}
}
