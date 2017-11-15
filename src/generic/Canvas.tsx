import * as React from 'react';

interface Props {
    redraw?: () => void;
}

interface State {
    width: number;
    height: number;
}

export class Canvas extends React.Component<Props, State> {
    private root: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    constructor(props: Props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
        };
    }
    
    render() {
        return <div className="dungeonDisplay" ref={r => this.root = r === null ? this.root : r}>
            <canvas width={this.state.width} height={this.state.height} ref={c => this.canvas = c === null ? this.canvas : c}></canvas>
        </div>;
    }

    componentDidMount() {
        let ctx = this.canvas.getContext('2d');
        if (ctx !== null)
            this.ctx = ctx;
        else
            throw 'No ctx';

        this.resizeListener = () => this.updateSize();
        window.addEventListener('resize', this.resizeListener);
    
        this.updateSize();
    }

    private resizeListener: () => void;
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
    }

	updateSize() {
		let scrollSize = this.getScrollbarSize();
        
        this.setState({
            width: this.root.offsetWidth - scrollSize.width,
            height: this.root.offsetHeight - scrollSize.height,
        })

        if (this.props.redraw !== undefined)
		    this.props.redraw();
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
            height: heightNoScroll - heightWithScroll
        }
    }
}