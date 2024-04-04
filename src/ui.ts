export interface SliderOptions {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    slide? : (value : number) => void;
    change? : (value : number) => void;
}

export interface TransformationCallbacks {
    onTranslateX? : (value : number) => void;
    onTranslateY? : (value : number) => void;
    onRotate? : (value : number) => void;
    onScaleX? : (value : number) => void;
    onScaleY? : (value : number) => void;
}


export const chaderUI = {
    setupSlider,
    setHeader,
    setDropdown,
    setupTrasformControls
}

function setupSlider(id : string, title : string, options : SliderOptions, containerId : string) {

    const container = document.getElementById(containerId);
    if (!container) {
        throw new Error("Could not find container :" + containerId);
    }

    const label = document.createElement("label");
    label.htmlFor = id;
    label.innerText = title;
    label.className = "control-label";
    container?.appendChild(label);

    const sliderContainer = document.createElement("div");
    sliderContainer.className = "control-slider-container";

    const slider = document.createElement("input");
    const value = document.createElement("span");

    slider.type = "range";
    slider.id = id;
    slider.className = "control-slider";
    slider.min = (options.min || 0).toString();
    slider.max = (options.max || 100).toString();
    slider.step = (options.step || 1).toString();
    slider.value = (options.value || 0).toString();
    slider.oninput = () => {
        if(options.slide) {
            value.innerText = slider.value;
            options.slide(parseFloat(slider.value));
        }
    }
    slider.onchange = () => {
        if(options.change) {
            value.innerText = slider.value;
            options.change(parseFloat(slider.value));
        }
    }

    value.innerText = slider.value;

    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(value);

    container?.appendChild(sliderContainer);
}   

function setHeader(title : string, containerId : string, id? : string) {

    const container = document.getElementById(containerId);
    if (!container) {
        throw new Error("Could not find container:" + containerId);
    }

    const header = document.createElement("h2");
    header.innerText = title;

    container?.appendChild(header);
}

function setDropdown(id : string, title : string, options : string[], containerId : string, callback : (value : string) => void){

    const container = document.getElementById(containerId);
    if (!container) {
        throw new Error("Could not find container:" + containerId);
    }

    const label = document.createElement("label");
    label.htmlFor = id;
    label.innerText = title;

    const select = document.createElement("select");
    select.id = id;

    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.text = option;
        select.appendChild(optionElement);
    });

    select.addEventListener('change', (event) => {
        const selectElement = event.target as HTMLSelectElement;
        callback(selectElement.value);
    });

    label.appendChild(select);
    container.appendChild(label);
}

function addOptionToDropdown(id : string, option : string) {
    const select = document.getElementById(id) as HTMLSelectElement;
    if (!select) {
        throw new Error("Could not find dropdown with id:" + id);
    }

    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.text = option;
    select.appendChild(optionElement);
}

function setupTrasformControls(callbacks : TransformationCallbacks) {
    chaderUI.setHeader('Basic Transformation', 'controls');

    chaderUI.setupSlider('tx', 'Position-x', { value: 0, min: -15, max: 15, slide: (value) => { 
        callbacks.onTranslateX?.(value);
    }, step: 0.01}, 'controls');
    chaderUI.setupSlider('ty', 'Position-y', { value: 0, min: -15, max: 15, slide: (value) => { 
        callbacks.onTranslateY?.(value);
    }, step: 0.01}, 'controls');
    chaderUI.setupSlider('sx', 'Scale-x', { value: 1, min: -10, max: 10, slide: (value) => { 
        callbacks.onScaleX?.(value);
    }, step: 0.01}, 'controls');
    chaderUI.setupSlider('sy', 'Scale-y', { value: 1, min: -10, max: 10, slide: (value) => { 
        callbacks.onScaleY?.(value);
    }, step: 0.01}, 'controls');
    chaderUI.setupSlider('angle', 'Angle', { value: 0, min: 0, max: 360, slide: (value) => {
        callbacks.onRotate?.(value);
    }}, 'controls');
}