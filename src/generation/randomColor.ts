const colorChars = ['a', 'b', 'c', 'd', 'e', 'f'];

export function randomColor() {
    const r = colorChars[Math.floor(Math.random() * 6)];
    const g = colorChars[Math.floor(Math.random() * 6)];
    const b = colorChars[Math.floor(Math.random() * 6)];
    return `#${r}${g}${b}`;
}