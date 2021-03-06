export default function ToggleButton(
    icon: string,
    tooltip: string,
    get: () => boolean,
    toggle: () => void,
    update?: (
        callback: (v: boolean) => void
    ) => void
): HTMLButtonElement {
    const button = document.createElement("button")

    button.setAttribute("data-title", tooltip)

    if (icon) {
        const img = new Image()
        img.src = `res/icons/${icon}.svg`

        button.appendChild(img)
    }

    button.classList.toggle("active", get())
    button.addEventListener("click", () => {
        toggle()
    })

    if (update) {
        update((v: boolean) => {
            button.classList.toggle("active", v)
        })
    }

    return button
}
