import * as React from 'react';
import { FunctionComponent, useMemo } from 'react';

interface Props {
    className?: string;
    inputClassName?: string;
    label: string;
    min: number;
    max: number;
    value: number;
    onChange?: (val: number) => void;
    onChangeComplete?: () => void;
    disabled?: boolean;
}

export const RangeInput: FunctionComponent<Props> = props => {
    const {onChange, onChangeComplete} = props;

    const changeHandler = useMemo(() => {
        if (onChange === undefined) {
            return undefined;
        }
        return (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.valueAsNumber)
    }, [onChange]);

    const changeCompleteHandler = useMemo(() => {
        if (onChangeComplete === undefined) {
            return undefined;
        }
        return () => onChangeComplete();
    }, [onChangeComplete]);

    return (
        <label className={props.className}>{props.label}
            <input
                type="range"
                className={props.inputClassName}
                min={props.min}
                max={props.max}
                value={props.value}
                onChange={changeHandler}
                onMouseUp={changeCompleteHandler}
                onTouchEnd={changeCompleteHandler}
                disabled={props.disabled}
            />
        </label>
    );
}
