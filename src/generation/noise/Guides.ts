interface GenerationGuide2D {
    name: string;
    getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) => number;
}

class Guides {
    static guides2d: GenerationGuide2D[] = [
        {
            name: 'Raised center',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) => { 
                let halfWidth = width / 2;
                let xFactor = (x - offsetFactorX) / halfWidth;
                
                let halfHeight = height / 2;
                let yFactor = (y - offsetFactorY) / halfHeight;

                return 1 - Math.sqrt(xFactor * xFactor + yFactor * yFactor);
            },
        },
        {
            name: 'Lowered center',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) => { 
                let halfWidth = width / 2;
                let xFactor = (x - offsetFactorX) / halfWidth;
                
                let halfHeight = height / 2;
                let yFactor = (y - offsetFactorY) / halfHeight;

                return Math.sqrt(xFactor * xFactor + yFactor * yFactor);
            },
        },
        {
            name: 'Gradient, increasing west to east',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) =>
                x / width,
        },
        {
            name: 'Gradient, increasing east to west',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) =>
                (width - x) / width,
        },
        {
            name: 'Gradient, increasing north to south',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) =>
                y / height,
        },
        {
            name: 'Gradient, increasing south to north',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) =>
                (height - y) / height,
        },
        {
            name: 'Gradient, increasing northwest to southeast',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) =>
                x / width * offsetFactorX + y / height * offsetFactorY,
        },
        {
            name: 'Gradient, increasing northeast to southwest',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) =>
                (width - x) / width * offsetFactorX + y / height * offsetFactorY,
        },
        {
            name: 'Gradient, increasing southwest to northeast',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) =>
                x / width * offsetFactorX + (height - y) / height * offsetFactorY,
        },
        {
            name: 'Gradient, increasing southeast to northwest',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) =>
                (width - x) / width * offsetFactorX + (height - y) / height * offsetFactorY,
        },
        {
            name: 'North-south peak',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) => {
                let hw = width * offsetFactorX;
                return x <= hw
                    ? x / hw
                    : (width - x) / hw;
            },
        },
        {
            name: 'North-south dip',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) => {
                let hw = width * offsetFactorX;
                return x <= hw
                    ? 1 - x / hw
                    : 1 - (width - x) / hw;
            },
        },
        {
            name: 'East-west peak',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) => {
                let hh = height * offsetFactorY;
                return y <= hh
                    ? y / hh
                    : (height - y) / hh;
            },
        },
        {
            name: 'East-west dip',
            getValue: (x: number, y: number, width: number, height: number, offsetFactorX: number, offsetFactorY: number) => {
                let hh = height * offsetFactorY;
                return y <= hh
                    ? 1 - y / hh
                    : 1 - (height - y) / hh;
            },
        }
    ];
}