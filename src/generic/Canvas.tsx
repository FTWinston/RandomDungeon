import * as React from 'react';

interface FixedProps {
    width: number;
    height: number;
    className?: string;
}

export class FixedCanvas extends React.Component<FixedProps, {}> {
    public ctx: CanvasRenderingContext2D;
    private root: HTMLDivElement;
    private canvas: HTMLCanvasElement;

    constructor(props: FixedProps) {
        super(props);

        this.state = {
            width: props.width === undefined ? 0 : props.width,
            height: props.height === undefined ? 0 : props.height,
        };
    }
    
    render() {
        return (
            <div className={this.props.className} ref={r => this.root = r === null ? this.root : r}>
                <canvas
                    width={this.props.width}
                    height={this.props.height}
                    ref={c => this.canvas = c === null ? this.canvas : c}
                />
            </div>
        );
    }
    
    componentDidMount() {
        this.updateCtx();
    }

    componentDidUpdate(prevProps: FixedProps, prevState: {}) {
        this.updateCtx();
    }

    private updateCtx() {
        let ctx = this.canvas.getContext('2d');

        if (ctx !== null) {
            this.ctx = ctx;
        } else {
            throw 'No ctx';
        }
    }
}

interface ResponsiveProps {
    className?: string;
    sizeChanged?: (width: number, height: number) => void;
}

interface ResponsiveState {
    width: number;
    height: number;
}

export class ResponsiveCanvas extends React.Component<ResponsiveProps, ResponsiveState> {
    public ctx: CanvasRenderingContext2D;
    private root: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private resizeListener?: () => void;

    constructor(props: ResponsiveProps) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
        };
    }
    
    render() {
        return (
            <div className={this.props.className} ref={r => this.root = r === null ? this.root : r}>
                <canvas
                    width={this.state.width}
                    height={this.state.height}
                    ref={c => this.canvas = c === null ? this.canvas : c}
                />
            </div>
        );
    }

    componentDidMount() {
        this.updateCtx();

        this.resizeListener = () => this.updateSize();
        window.addEventListener('resize', this.resizeListener);
    
        this.updateSize();
    }
    
    componentWillUnmount() {
        if (this.resizeListener !== undefined) {
            window.removeEventListener('resize', this.resizeListener);
        }
    }

    componentDidUpdate(prevProps: FixedProps, prevState: {}) {
        this.updateCtx();
    }

    updateSize() {
        let scrollSize = this.getScrollbarSize();
        let width = this.root.offsetWidth - scrollSize.width;
        let height = this.root.offsetHeight - scrollSize.height;

        this.setState({
            width: width,
            height: height,
        });

        if (this.props.sizeChanged !== undefined) {
            this.props.sizeChanged(width, height);
        }
    }

    private updateCtx() {
        let ctx = this.canvas.getContext('2d');

        if (ctx !== null) {
            this.ctx = ctx;
        } else {
            throw 'No ctx';
        }
    }

    private getScrollbarSize() {
        let outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.height = '100px';
        outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps

        document.body.appendChild(outer);

        let widthNoScroll = outer.offsetWidth;
        let heightNoScroll = outer.offsetHeight;

        // force scrollbars
        outer.style.overflow = 'scroll';

        // add innerdiv
        let inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '100%';
        outer.appendChild(inner);

        let widthWithScroll = inner.offsetWidth;
        let heightWithScroll = inner.offsetHeight;

        // remove divs
        (outer.parentNode as HTMLElement).removeChild(outer);

        return {
            width: widthNoScroll - widthWithScroll,
            height: heightNoScroll - heightWithScroll,
        };
    }
}