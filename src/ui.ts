export interface SliderOptions {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    slide? : (value : number) => void;
    change? : (value : number) => void;
}


const container = document.getElementById("controls");
if (!container) {
    throw new Error("Could not find container");
}

export const chaderUI = {
    setupSlider,
    setHeader
}

function setupSlider(id : string, title : string, options : SliderOptions) {
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

function setHeader(title : string) {
    const header = document.createElement("h2");
    header.innerText = title;

    container?.appendChild(header);
}