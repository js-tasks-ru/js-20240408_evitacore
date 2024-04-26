export default class NotificationMessage {
    element;

    static lastShowComponent;

    constructor(
        message = '',
        {
            duration = 1000,
            type = 'success'
        } = {}
    ) {
        this.timerID = '';
        this.message = message;
        this.type = type;
        this.duration = duration;
        this.element = this.createElement(this.createTemplate());
    }

    show(container = document.body) {
        if(NotificationMessage.lastShowComponent) {
             NotificationMessage.lastShowComponent.destroy();
         }
         NotificationMessage.lastShowComponent = this;
 
         container.appendChild(this.element);
         
         this.timerID = setTimeout(() => {
             this.remove();
         }, this.duration)
     }

    createElement(template) {
        const element = document.createElement('div');
        element.innerHTML = template;
        return element.firstElementChild;
    }

    createTemplate() {
        return(
            `<div class="notification ${this.type}" style="--value:${(this.duration / 1000).toFixed(0)}s">
                <div class="timer"></div>
                <div class="inner-wrapper">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.message}
                    </div>
                </div>
            </div>`
        )
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        clearTimeout(this.timerID)
        this.remove();
    }

}
