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
    setupTrasformControls,
    cleanTransformControls,
    addOptionToDropdown,
    removeALlOptionsFromDropdown,
    setupVertexControls
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
    value.id = id + "-value";

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

function removeALlOptionsFromDropdown(id : string) {
    const select = document.getElementById(id) as HTMLSelectElement;
    if (!select) {
        throw new Error("Could not find dropdown with id:" + id);
    }

    select.innerHTML = '';
}

function setupTrasformControls(callbacks : TransformationCallbacks) {
    const container = document.createElement("div");
    container.id = "transform-control-group";

    const controls = document.getElementById('controls');
    if (!controls) {
        throw new Error("Could not find controls");
    }

    controls.appendChild(container);

    chaderUI.setHeader('Basic Transformation', 'transform-control-group');

    chaderUI.setupSlider('tx', 'Translate-x', { value: 0, min: -15, max: 15, slide: (value) => { 
        callbacks.onTranslateX?.(value);
    }, step: 0.01}, 'transform-control-group');
    chaderUI.setupSlider('ty', 'Translate-y', { value: 0, min: -15, max: 15, slide: (value) => { 
        callbacks.onTranslateY?.(value);
    }, step: 0.01}, 'transform-control-group');
    chaderUI.setupSlider('sx', 'Scale-x', { value: 1, min: -10, max: 10, slide: (value) => { 
        callbacks.onScaleX?.(value);
    }, step: 0.01}, 'transform-control-group');
    chaderUI.setupSlider('sy', 'Scale-y', { value: 1, min: -10, max: 10, slide: (value) => { 
        callbacks.onScaleY?.(value);
    }, step: 0.01}, 'transform-control-group');
    chaderUI.setupSlider('angle', 'Rotation Angle', { value: 0, min: 0, max: 360, slide: (value) => {
        callbacks.onRotate?.(value);
    }}, 'transform-control-group');
}

function cleanTransformControls() {
    const controls = document.getElementById('transform-control-group');
    if (!controls) {
        return;
    }

    controls.remove();
}

function setupVertexControls (ocVertexColorChange : (color : string) => void) {
    setHeader("Vertex Controls", "controls");

    const selectedVertex = document.createElement("span");
    selectedVertex.innerText = "Selected Vertex: None";
    selectedVertex.id = "selected-vertex";

    const controls = document.getElementById("controls");
    controls?.appendChild(selectedVertex);

    const colorPickerContainer = document.createElement("div");
    colorPickerContainer.id = "color-picker-container";
    controls?.appendChild(colorPickerContainer);

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.id = "vertex-color";
    colorPicker.value = "#93D8E3";

    const colorLabel = document.createElement("label");
    colorLabel.htmlFor = "vertex-color";
    colorLabel.innerText = "Vertex Color";

    colorPickerContainer.appendChild(colorLabel);
    colorPickerContainer.appendChild(colorPicker);

    colorPicker.addEventListener("change", (event) => {
        const colorPicker = event.target as HTMLInputElement;
        ocVertexColorChange(colorPicker.value);
    });
}