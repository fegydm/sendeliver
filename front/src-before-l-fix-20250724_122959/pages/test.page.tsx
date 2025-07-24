import React, { useState, useRef, useEffect } from 'react';

const TestPage: React.FC = () => {
    const [textLeft, setTextLeft] = useState('');
    const [textRight, setTextRight] = useState('↵');
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);
    const [hasFocused, setHasFocused] = useState(false);
    const [isFirstClick, setIsFirstClick] = useState(true);
    const [isRightSide, setIsRightSide] = useState(false);
    const [wasDeleting, setWasDeleting] = useState(false);
    const textareaRef = useRef<hTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current && cursorPosition !== null) {
            textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [cursorPosition]);

    useEffect(() => {
        if (isFirstClick && hasFocused && textareaRef.current) {
            const symbolIndex = textLeft.length;
            setCursorPosition(symbolIndex);
            setIsRightSide(false);
            setIsFirstClick(false);
        }
    }, [hasFocused, isFirstClick, textLeft.length]);

    const handleChange = (event: React.ChangeEvent<hTMLTextAreaElement>) => {
        const { value, selectionStart } = event.target;
        const symbolIndex = value.indexOf('↵');
        const isDeleting = value.length < (textLeft + textRight).length;
        
        if (wasDeleting) {
            setWasDeleting(false);
            setTextLeft(value.slice(0, symbolIndex));
            return;
        }
        
        // If trying to type after the symbol (in right state)
        if (isRightSide && symbolIndex !== value.length - 1) {
            const newText = value.slice(symbolIndex + 1);
            setTextLeft(value.slice(0, symbolIndex) + newText);
            setIsRightSide(false);
            const newPosition = value.slice(0, symbolIndex).length + newText.length;
            setCursorPosition(newPosition);
            return;
        }

        if (selectionStart <= symbolIndex) {
            setTextLeft(value.slice(0, symbolIndex));
            setIsRightSide(false);
        } else if (!isDeleting) {
            setIsRightSide(true);
        }
        setCursorPosition(selectionStart);
    };

    const handleFocus = () => {
        if (!hasFocused) {
            setHasFocused(true);
        }
    };

    const handleClick = (event: React.MouseEvent<hTMLTextAreaElement>) => {
        const clickPosition = event.currentTarget.selectionStart;
        const symbolIndex = textLeft.length;

        if (!hasFocused || isFirstClick) {
            setHasFocused(true);
        } else {
            if (clickPosition > symbolIndex) {
                setCursorPosition(symbolIndex + 1);
                setIsRightSide(true);
            } else {
                setCursorPosition(clickPosition);
                setIsRightSide(false);
            }
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<hTMLTextAreaElement>) => {
        const symbolIndex = textLeft.length;
        const currentPosition = event.currentTarget.selectionStart;

        if (event.key === 'Delete' && currentPosition === symbolIndex) {
            event.preventDefault();  // Prevent default delete behavior when cursor is just before symbol
            setIsRightSide(false);
            return;
        }

        if (event.key === 'Delete' || event.key === 'Backspace') {
            if (currentPosition <= symbolIndex) {
                setIsRightSide(false);
                setWasDeleting(true);
            }
            return;
        }

        // Handle arrow keys
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            setTimeout(() => {
                if (textareaRef.current) {
                    const newPosition = textareaRef.current.selectionStart;
                    const totalLength = textLeft.length + textRight.length;
                    
                    // If arrow down or at the end of text, force right side
                    if (event.key === 'ArrowDown' || newPosition === totalLength) {
                        setCursorPosition(totalLength);
                        setIsRightSide(true);
                    }
                    // If arrow up or at the start of text, force left side
                    else if (event.key === 'ArrowUp' || newPosition === 0) {
                        setCursorPosition(0);
                        setIsRightSide(false);
                    }
                    else {
                        setCursorPosition(newPosition);
                        setIsRightSide(newPosition > symbolIndex);
                    }
                }
            }, 0);
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            
            if (isRightSide) {
                alert('Action A - sending text');
            } else {
                setTextLeft(
                    textLeft.slice(0, currentPosition) + '\n' + textLeft.slice(currentPosition)
                );
                setCursorPosition(currentPosition + 1);
            }
        }
    };

    const isTextEmpty = textLeft === '' && !hasFocused;

    return (
        <div>
            <h1>Test Page</h1>
            <textarea
                ref={textareaRef}
                value={isTextEmpty ? '' : textLeft + textRight}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                onFocus={handleFocus}
                onClick={handleClick}
                placeholder={isTextEmpty ? 'Click to start typing...' : ''}
                data-right-side={isRightSide}
            />
            <p>Cursor Position: {cursorPosition}</p>
            <p>Side: {isRightSide ? 'Right' : 'Left'}</p>
        </div>
    );
};

export default TestPage;