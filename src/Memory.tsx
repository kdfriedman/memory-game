import { useState, useEffect } from 'react';
import { Item, COLORS, MATCHING_COLOR_MAP, SQUARE } from './memoryTypes.ts';

export const Memory = () => {
  // square matching colors
  const RED = 'red';
  const PURPLE = 'purple';
  const ORANGE = 'orange';
  const YELLOW = 'yellow';
  const BLUE = 'blue';
  const GREEN = 'green';
  // square default color
  const WHITE = 'white';

  const sortByOrder = (items: SQUARE[]) => {
    items.sort((a: Item, b: Item) => a.sortOrder - b.sortOrder);
    return items;
  };

  const randomlyAssignMatchingColor = (
    COLORS: COLORS,
    MATCHING_COLOR_MAP: MATCHING_COLOR_MAP
  ): string => {
    const randomColorIndex = Math.floor(Math.random() * COLORS.length);
    const matchingColor = COLORS[randomColorIndex];
    if (MATCHING_COLOR_MAP[matchingColor].count < 2) {
      MATCHING_COLOR_MAP[matchingColor].count++;
      return matchingColor;
    }
    return randomlyAssignMatchingColor(COLORS, MATCHING_COLOR_MAP);
  };

  const generateSquares = () => {
    const squares = [];
    const MATCHING_COLOR_MAP = {
      [RED]: { count: 0 },
      [PURPLE]: { count: 0 },
      [ORANGE]: { count: 0 },
      [YELLOW]: { count: 0 },
      [BLUE]: { count: 0 },
      [GREEN]: { count: 0 },
    };
    const COLORS: COLORS = [RED, PURPLE, ORANGE, YELLOW, BLUE, GREEN];

    for (let i = 0; i < 12; i++) {
      const matchingColor = randomlyAssignMatchingColor(
        COLORS,
        MATCHING_COLOR_MAP
      );
      const squareConfig = {
        id: i + 1,
        defaultColor: WHITE,
        matchingColor,
        isMatched: false,
        sortOrder: i + 1,
        isActive: false,
      };
      squares.push(squareConfig);
    }
    return squares;
  };
  const squares = generateSquares();
  const [selectionOne, setSelectionOne] = useState(false);
  const [selectionTwo, setSelectionTwo] = useState(false);
  const [memorySqaures, setMemorySquares] = useState<SQUARE[]>(squares);
  const [invalidMatch, setInvalidMatch] = useState('');
  const [isWinner, setIsWinner] = useState('');
  const [isSleeping, setIsSleeping] = useState(false);

  useEffect(() => {
    if (selectionOne && selectionTwo) {
      const result = handleMatch();
      result
        .then(() => {
          setSelectionOne(false);
          setSelectionTwo(false);
        })
        .catch((err) => {
          console.error(err);
          setSelectionOne(false);
          setSelectionTwo(false);
        });
    }
  }, [selectionOne, selectionTwo]);

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const resetTheGame = () => {
    setInvalidMatch('');
    setIsWinner('');
    setSelectionOne(false);
    setSelectionTwo(false);
    setMemorySquares(() => squares);
  };

  const handleMatch = async () => {
    setIsSleeping(true);
    await sleep(750);
    setIsSleeping(false);
    setMemorySquares((squares) => {
      const clonedSquares: SQUARE[] = structuredClone(squares);
      const inactiveSquares = clonedSquares.filter(
        (square) => !square.isActive
      );
      const activeSquares = clonedSquares.filter((square) => square.isActive);
      const [activeSquareOne, activeSquareTwo] = activeSquares;
      if (activeSquareOne.matchingColor === activeSquareTwo.matchingColor) {
        activeSquareOne.isMatched = true;
        activeSquareTwo.isMatched = true;
      } else {
        activeSquareOne.defaultColor = WHITE;
        activeSquareTwo.defaultColor = WHITE;
        setInvalidMatch('Sorry, that is an invalid match. Please try again!');
      }
      const isWinner = [...activeSquares, ...inactiveSquares].every(
        (sq) => sq.isMatched
      );
      if (isWinner) {
        setIsWinner("You've won the game! Nice job!");
      }
      activeSquareOne.isActive = false;
      activeSquareTwo.isActive = false;
      return sortByOrder([
        ...inactiveSquares,
        activeSquareOne,
        activeSquareTwo,
      ]);
    });
  };

  const handleSqSelection = async (e: React.SyntheticEvent<EventTarget>) => {
    setInvalidMatch('');
    if (!(e.target instanceof HTMLElement)) {
      return;
    }
    const selectedSqMatchingColor = e.target?.dataset?.matchingColor;
    const selectedSqIdString = e.target.dataset.id as string;
    const selectedSqId = parseInt(selectedSqIdString);
    if (!selectionOne) {
      setMemorySquares((squares) => {
        const clonedSquares: SQUARE[] = structuredClone(squares);
        const unSelectedSquares = clonedSquares.filter(
          (square) => square.id !== selectedSqId
        );
        const selectedSquare = clonedSquares.find(
          (sq) => sq.id === selectedSqId
        );
        if (!selectedSquare) return squares;
        selectedSquare.defaultColor = selectedSqMatchingColor as string;
        selectedSquare.isActive = true;
        return sortByOrder([...unSelectedSquares, selectedSquare]);
      });
      setSelectionOne(true);
    }

    if (selectionOne && !selectionTwo) {
      setMemorySquares((squares) => {
        const clonedSquares: SQUARE[] = structuredClone(squares);
        const inactiveSquares = clonedSquares.filter(
          (square) => square.id !== selectedSqId && !square.isActive
        );
        const selectedSquareOne = clonedSquares.find((sq) => sq.isActive);
        const selectedSquareTwo = clonedSquares.find(
          (sq) => sq.id === selectedSqId
        );
        if (!selectedSquareTwo || !selectedSquareOne) return squares;
        selectedSquareTwo.defaultColor = selectedSqMatchingColor as string;
        selectedSquareTwo.isActive = true;
        return sortByOrder([
          ...inactiveSquares,
          selectedSquareOne,
          selectedSquareTwo,
        ]);
      });
      setSelectionTwo(true);
    }
  };

  return (
    <>
      {invalidMatch && (
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'left',
            marginBottom: '1rem',
          }}
        >
          {invalidMatch}
        </div>
      )}
      {isWinner && (
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'left',
            marginBottom: '1rem',
          }}
        >
          {isWinner}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'left' }}>
        <button disabled={isSleeping} onClick={resetTheGame}>
          Reset the game
        </button>
      </div>
      <div className="memory-parent-container">
        {memorySqaures.map(({ id, defaultColor, matchingColor, sortOrder }) => {
          return (
            <div
              onClick={handleSqSelection}
              key={id}
              style={{
                backgroundColor: defaultColor,
              }}
              data-id={id}
              data-matching-color={matchingColor}
              data-sort-order={sortOrder}
            ></div>
          );
        })}
      </div>
    </>
  );
};
