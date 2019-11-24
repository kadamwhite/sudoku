import React, { useEffect, useState } from 'react';
import './App.css';

function getRange( index ) {
  if ( index < 3 ) {
    return [0, 1, 2];
  }
  if ( index < 6 ) {
    return [3, 4, 5];
  }
  return [6, 7, 8];
}

function getRow( rows, ri ) {
  return rows[ ri ];
}

function getColumn( rows, ci ) {
  return rows.map( row => row[ ci ] );
}

function getSquare( rows, ri, ci ) {
  let rowRange = getRange( ri );
  let colRange = getRange( ci );
  const square = [];
  for ( let rowIdx of rowRange ) {
    for ( let colIdx of colRange ) {
      square.push( rows[ rowIdx ][ colIdx ] );
    }
  }
  return square;
}

const n = null;
const defaultLayout = [
  [1, n, n, n, n, n, n, n, n ],
  [n, n, n, 1, n, n, 8, n, 2 ],
  [n, n, 8, 9, n, n, 6, n, n ],
  [4, n, n, 7, 6, n, n, 3, n ],
  [n, 7, n, n, n, 4, n, 2, n ],
  [n, 6, n, n, 1, 8, n, n, 7 ],
  [n, n, 1, n, n, 9, 2, n, n ],
  [2, n, 5, 6, n, 7, n, n, n ],
  [n, n, n, n, n, n, n, n, 5 ],
];

function isOriginal( rows, ri, ci ) {
  console.log( rows[ ri ][ ci ], defaultLayout[ ri ][ ci ] );
  return rows[ ri ][ ci ] === defaultLayout[ ri ][ ci ];
}

function canCellBe( rows, ri, ci, guess ) {
  if ( rows[ ri ][ ci ] === guess ) {
    return true;
  }
  for ( let num of getRow( rows, ri ) ) {
    if ( num === guess ) return false;
  }
  for ( let num of getColumn( rows, ci ) ) {
    if ( num === guess ) return false;
  }
  for ( let num of getSquare( rows, ri, ci ) ) {
    if ( num === guess ) return false;
  }
  return true;
}

function cannotCellBe( rows, ri, ci, guess ) {
  if ( rows[ ri ][ ci ] === guess ) {
    return false;
  }
  for ( let num of getRow( rows, ri ) ) {
    if ( num === guess ) return true;
  }
  for ( let num of getColumn( rows, ci ) ) {
    if ( num === guess ) return true;
  }
  for ( let num of getSquare( rows, ri, ci ) ) {
    if ( num === guess ) return true;
  }
  return false;
}

/**
 * Build list of possible values for a cell.
 *
 * @param {Array}  rows The array of cells.
 * @param {Number} ri   The index of the row.
 * @param {Number} ci   The index of the column.
 *
 * @returns {Array} The possible values for the specified cell.
 */
function computePossibilities( rows, ri, ci ) {
  const options = [];
  for ( let guess = 1; guess < 10; guess++ ) {
    if ( canCellBe( rows, ri, ci, guess ) ) {
      options.push( guess );
    }
  }
  return options;
}

/**
 * Compute the possibilities and values for the grid of cells.
 *
 * @param {Array} rows The array of cells.
 *
 * @return {Array} Computed cell data.
 */
function computeCells( rows ) {
  return rows.map( ( row, ri ) => row.map( ( cell, ci ) => {
    if ( cell ) {
      return {
        value: cell,
        possibilities: null,
        original: isOriginal( rows, ri, ci ),
      };
    }
    return {
      value: null,
      possibilities: computePossibilities( rows, ri, ci ),
      original: false,
    };
  } ) );
}

const Cell = ( { value, original, possibilities } ) => {
  const classNames = [
    original ? 'original' : '',
    possibilities ? 'guess' : '',
  ].filter( Boolean ).join( ' ' );
  return (
    <span className={ classNames }>
      { value || possibilities.join( ', ' ) }
    </span>
  );
};

function App() {
  const [ rows, setRows ] = useState( defaultLayout.map( row => [ ...row ] ) );

  function updateCell( ri, ci, value ) {
    setTimeout( () => {
      const newRows = [ ...rows ];
      newRows[ ri ][ ci ] = value;
      setRows( newRows );
    }, 500 );
  }

  const cells = computeCells( rows );

  useEffect( () => {
    for ( let ri = 0; ri < 9; ri++ ) {
      for ( let ci = 0; ci < 9; ci++ ) {
        const cell = cells[ ri ][ ci ];
        if ( cell.value || ! cell.possibilities ) {
          continue;
        }

        if ( cell.possibilities.length === 1 ) {
          updateCell( ri, ci, cell.possibilities[ 0 ] );
          return;
        }

        // No easy out; check each possibility against square's other cells.
        const square = getSquare( cells, ri, ci );
        for ( let option of cell.possibilities ) {
          let occurrences = 1;
          for ( let neighbor of square ) {
            if ( neighbor === cell || ! neighbor.possibilities ) {
              continue;
            }
            if ( neighbor.possibilities.includes( option ) ) {
              occurrences++;
            }
          }
          if ( occurrences === 1 ) {
            updateCell( ri, ci, option );
            return;
          }
        }
      }
    }
  } );

  return (
    <div className="App">
      <header className="App-header">
        <table cellSpacing={0}>
          <tbody>
            {cells.map(( row, ri ) => (
              <tr key={ ri }>
                {row.map(( cell, ci ) => (
                  <td key={ `${ ri }${ ci }` }>
                    <Cell { ...cell } />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;
