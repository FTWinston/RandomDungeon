import * as React from 'react';
import './Menu.css';
import { GenerateMenu } from './GenerateMenu';

export const enum NumericProperty {
    CellsWide,
    CellsHigh,
    CellSize,
    NodeCount,
    Connectivity,
}

interface Props {
    disabled: boolean;

    cellsWide: number;
    cellsHigh: number;
    cellSize: number;
    nodeCount: number;
    connectivity: number;

    seed?: number;
    preserveSeed: boolean;
    setSeed: (val: number) => void;
    setPreserveSeed: (val: boolean) => void;

    setNumber: (property: NumericProperty, value: number) => void;
    generate: (animate: boolean) => void;
    skip: () => void;
    finish: () => void;
}

const enum SubMenu {
    Generate,
    Customize,
    Use,
}

interface State {
    show: SubMenu;
}

export class Menu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: SubMenu.Generate,
        };
    }

    render() {
        let currentMenu: JSX.Element | undefined;

        switch (this.state.show) {
            case SubMenu.Generate:
                currentMenu = (
                <GenerateMenu
                    disabled={this.props.disabled}
                    cellsWide={this.props.cellsWide}
                    cellsHigh={this.props.cellsHigh}
                    cellSize={this.props.cellSize}
                    nodeCount={this.props.nodeCount}
                    connectivity={this.props.connectivity}
                    setNumber={this.props.setNumber}
                    generate={this.props.generate}
                    skip={this.props.skip}
                    finish={this.props.finish}
                    
                    seed={this.props.seed}
                    preserveSeed={this.props.preserveSeed}
                    setSeed={this.props.setSeed}
                    setPreserveSeed={this.props.setPreserveSeed}
                />
                );
                break;
            /*
            case SubMenu.Customize:
                break;
            case SubMenu.Use:
                break;
            */
            default:
                break;
        }

        return (
            <div className="menu">
                <ul className="menu__choice">
                    {this.renderMenuSelector(SubMenu.Generate, 'Generate')}
                    {this.renderMenuSelector(SubMenu.Customize, 'Customize')}
                    {this.renderMenuSelector(SubMenu.Use, 'Use')}
                </ul>
                {currentMenu}
            </div>
        );
    }

    private renderMenuSelector(menu: SubMenu, label: string) {
        let classes = 'menu__selector';
        if (menu === this.state.show) {
            classes += ' menu__selector--active';
        }

        const click = () => this.setState({ show: menu});

        return <li className={classes} onClick={click}>{label}</li>;
    }
}
