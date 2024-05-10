export default class RangePicker {
    element;
    subElements = {};

    constructor({from, to}) {
        this.from = from;
        this.to = to;
        this.currentMonth = from || new Date();
        this.element = this.createElement(this.createTemplate());
        this.createSubElements();
        this.createEventListeners();
    }

    createElement(template) {
        const element = document.createElement('div');
        element.innerHTML = template;
        return element.firstChild;
    }

    createSubElements() {
        this.subElements = [...this.element.querySelectorAll('[data-element]')].reduce((acc, subElement) => {
            acc[subElement.dataset.element] = subElement;
            return acc;
        }, {});
    }

    createInputTemplate() {
        const from = this.formatDate(this.from);
        const to = this.formatDate(this.to);

        return(
            `<div class="rangepicker__input" data-element="input">
                <span data-element="from">${from}</span> -
                <span data-element="to">${to}</span>
            </div>`
        )
    }

    getLastDay(year, month) {
        const date = new Date(year, month + 1, 0);
        return date.getDate();
    }

    getStartFromDay(day) {
        return day === 0 ? 7 : day;
    };

    createButtonTemplate(date) {
        const year  = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = this.getLastDay(year, month);
      
        const buttonsHTML = Array.from({ length: lastDay }, (_, index) => {
            const day = index + 1;
            const value = new Date(year, month, day);
            const startFromStyle = day === 1 ? `style="--start-from: ${this.getStartFromDay(firstDay)}"` : '';
            return `<button type="button" class="rangepicker__cell" data-value="${value.toISOString()}" ${startFromStyle}>${day}</button>`;
        }).join('');
        return buttonsHTML;
    }

    renderHighlight = () => {
        const { from, to } = this;
    
        for (const cell of this.element.querySelectorAll('.rangepicker__cell')) {
            const value = cell.dataset.value;
            const cellDate = new Date(value);
        
            cell.classList.remove('rangepicker__selected-from');
            cell.classList.remove('rangepicker__selected-between');
            cell.classList.remove('rangepicker__selected-to');

            if (from && value === from.toISOString()) {
                cell.classList.add('rangepicker__selected-from');
            } else if (to && value === to.toISOString()) {
                cell.classList.add('rangepicker__selected-to');
            } else if (from && to && cellDate >= from && cellDate <= to) {
                cell.classList.add('rangepicker__selected-between');
            }
        }
    }

    handleSelectorClick = (e) => {
        e.stopPropagation();
        const value = e.target.dataset.value;
        
        if(value) {
            this.updateRange(value);
        }
    }

    updateRange(value) {
        const date = new Date(value);
        const isRangeComplete = this.from && this.to;
        const isRangePartial = this.from !== null && this.to === null;

        if (isRangeComplete) {
            this.resetRangeFrom(date);
        } else if (isRangePartial) {
            this.setCompleteRange(date);
        }
    }

    resetRangeFrom = (date) => {
        this.from = date;
        this.to = null;
    
        this.renderHighlight();
    };

    setCompleteRange = (date) => {
        const from = new Date(Math.min(this.from, date));
        const to = new Date(Math.max(this.from, date));
    
        this.from = from;
        this.to = to;
    
        this.toggle();
        this.updateInput();
        this.dispatchDateSelectEvent();
    };

    updateInput = () => {
        this.subElements.from.innerHTML = this.formatDate(this.from);
        this.subElements.to.innerHTML = this.formatDate(this.to);
    }

    getNextMonth = (date) => {
        const month = date.getMonth();
        const year = month === 11 ? date.getFullYear() + 1 : date.getFullYear();
        const day = 1;
    
        return new Date(year, (month + 1) % 12, day);
    };

    getLastMonth = (date) => {
        const year = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
        const month = date.getMonth() === 0 ? 11 : date.getMonth() - 1;
        const day = 1;
    
        return new Date(year, month, day);
      };
    
    handleLeftClick = () => {
        this.currentMonth = this.getLastMonth(this.currentMonth);
        
        this.updateCalendars();
        this.createSelectorTemplate();
    }
    
    handleRightClick = () => {
        this.currentMonth = this.getNextMonth(this.currentMonth);
        
        this.updateCalendars();
        this.createSelectorTemplate();
    }

    handleInputClick = () => {
        this.toggle();
    }

    toggle = () => {
        const isElementOpen = this.element.classList.toggle("rangepicker_open");
        this.createSelectorTemplate();
    
        if (isElementOpen) {
          document.addEventListener("click", this.handleWindowClick);
        } else {
          document.removeEventListener("click", this.handleWindowClick);
        }
    }

    handleWindowClick = (e) => {
        if (this.element.contains(e.target)) return;
        this.toggle();
    }

    createEventListeners = () => {
        this.subElements.input.addEventListener("click", this.handleInputClick);
        this.subElements.selector.addEventListener("click", this.handleSelectorClick);
    };
    
    destroyEventListeners = () => {
        this.subElements.input.removeEventListener("click", this.handleInputClick);
        this.subElements.selector.removeEventListener("click", this.handleSelectorClick);
    };

    updateCalendars = () => {
        const [firstCalendar, secondCalendar] = this.subElements.selector.querySelectorAll(".rangepicker__calendar");
    
        firstCalendar.outerHTML = this.createCalendarTemplate(this.currentMonth);
        secondCalendar.outerHTML = this.createCalendarTemplate(this.getNextMonth(this.currentMonth));
    };

    renderCalendars = () => {
        const currentMonth = this.currentMonth;
        const nextMonth = this.getNextMonth(this.currentMonth);

        return(`
            ${this.createCalendarTemplate(currentMonth)}
            ${this.createCalendarTemplate(nextMonth)}
        `)
    }

    createSelectorTemplate() {
        const { selector } = this.subElements;

        selector.innerHTML = `
            <div class="rangepicker__selector-arrow"></div>
            <div class="rangepicker__selector-control-left"></div>
            <div class="rangepicker__selector-control-right"></div>
            ${this.renderCalendars()}`;

        const controlLeft = selector.querySelector('.rangepicker__selector-control-left');
        const controlRight = selector.querySelector('.rangepicker__selector-control-right');

        controlLeft.addEventListener('click', () => this.handleLeftClick());
        controlRight.addEventListener('click', () => this.handleRightClick());

        this.renderHighlight();
    }

    createMonthTemplate(date) {
        const month = date.toLocaleString('ru-RU', {month: 'long'});

        return(
            `<div class="rangepicker__month-indicator">
                <time datetime="${month}">${month}</time>
            </div>`
        )
    }

    createWeekTemplate() {
        return(
            `<div class="rangepicker__day-of-week">
                <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
            </div>`
        )
    }

    createCalendarTemplate(date) {
        return(
            `<div class="rangepicker__calendar">
                ${this.createMonthTemplate(date)}
                ${this.createWeekTemplate()}
                <div class="rangepicker__date-grid">
                   ${this.createButtonTemplate(date)} 
                </div>
            </div>`
        )
    }

    createTemplate() {
        return(
            `<div class="rangepicker">
                ${this.createInputTemplate()}
                <div class="rangepicker__selector" data-element="selector"></div>
            </div>`
        )
    }

    formatDate(date) {
        return date.toLocaleDateString('ru-RU', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }

    dispatchDateSelectEvent = () => {
        const event = new CustomEvent("date-select", {
            bubbles: true, 
            detail: {
                from: this.from,
                to: this.to
            }
        });
        this.element.dispatchEvent(event);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.element.remove();
        this.destroyEventListeners();
    }
}
