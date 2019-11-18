const colorChars = ['7', '8', '9', 'a', 'b', 'c', 'd'];

export function randomColor() {
    const r = colorChars[Math.floor(Math.random() * colorChars.length)];
    const g = colorChars[Math.floor(Math.random() * colorChars.length)];
    const b = colorChars[Math.floor(Math.random() * colorChars.length)];
    return `#${r}${g}${b}`;
}