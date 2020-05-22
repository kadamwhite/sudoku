import React, { useCallback, useEffect, useState } from 'react';
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

const _ = null;
// Permit injecting a layout via localStorage
let storedLayout = localStorage.getItem( 'layout' );
storedLayout = storedLayout ? JSON.parse( storedLayout ) : null;
const defaultLayout = storedLayout || [
  [1, _, _, _, _, _, _, _, _ ],
  [_, _, _, 1, _, 6, 8, _, 2 ],
  [_, _, 8, 9, _, _, 6, _, _ ],
  [4, _, _, 7, 6, _, _, 3, _ ],
  [_, 7, _, _, _, 4, _, 2, _ ],
  [_, 6, _, _, 1, 8, _, _, 7 ],
  [_, _, 1, _, _, 9, 2, _, _ ],
  [2, _, 5, 6, _, 7, _, _, _ ],
  [_, _, _, _, _, _, _, _, 5 ],
];

function isOriginal( rows, ri, ci ) {
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

function complete( set ) {
  for ( let i = 0; i < set.length; i++ ) {
    if ( ! set[ i ] || ! set[ i ].value ) {
      return false;
    }
  }
  return true;
}

const valid = set => (
  set.map( cell => `${ cell.value }` ).sort().join( '' ) === '123456789'
);

function optionUniqueInSet( cell, neighbors, option ) {
  for ( let neighbor of neighbors ) {
    if ( neighbor === cell || neighbor.value === option || ! neighbor.possibilities ) {
      continue;
    }
    if ( neighbor.possibilities.includes( option ) ) {
      return false;
    }
  }
  return true;
}

const Cell = ( { value, original, possibilities, onClick } ) => {
  const classNames = [
    original ? 'original' : '',
    possibilities ? 'guess' : '',
  ].filter( Boolean ).join( ' ' );
  return (
    <button type="button" onClick={ onClick }>
      <span className={ classNames }>
        { value || possibilities.join( ', ' ) }
      </span>
    </button>
  );
};

const ValidationCell = ( { set } ) => {
  if ( ! complete( set ) ) {
    return (
      <td className="validation" />
    );
  }
  const isValid = valid( set );
  return (
    <td className={ `validation ${ isValid ? 'valid' : 'invalid' }` }>
      { isValid ? '\u2713' : '\u2A2F' }
    </td>
  );
}

function isComplete( rows ) {
  for ( let row of rows ) {
    for ( let cell of row ) {
      if ( cell === null || cell.value === null ) {
        return false;
      }
    }
  }
  return true;
}

function random( arr ) {
  const idx = Math.floor( Math.random() * arr.length );
  return arr[ idx ];
}

const clone = arr => arr.map( subArr => [ ...subArr ] );

function App() {
  const [ rows, setRows ] = useState( clone( defaultLayout ) );
  const [ showGuessButton, outOfOptions ] = useState( false );
  const [ beforeGuess, saveSnapshot ] = useState( null );

  const updateCell = useCallback( ( ri, ci, value ) => {
    setTimeout( () => {
      const newRows = [ ...rows ];
      newRows[ ri ][ ci ] = +value;
      setRows( newRows );
    }, 50 );
  }, [ rows, setRows ] );

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

        // No easy out; exhaustively check each possibility.
        for ( let option of cell.possibilities ) {
          if ( optionUniqueInSet( cell, getSquare( cells, ri, ci ), option ) ) {
            updateCell( ri, ci, option );
            return;
          }
        }
      }
    }
    outOfOptions(true);
  }, [ cells, updateCell ] );

  return (
    <div className="App">
      <header className="App-header">
        <table cellSpacing={0}>
          <tbody>
            {cells.map(( row, ri ) => (
              <tr key={ ri }>
                {row.map(( cell, ci ) => (
                  <td key={ `${ ri }${ ci }` }>
                    <Cell
                      { ...cell }
                      onClick={ () => {
                        const guess = window.prompt( 'Guess?' );
                        updateCell( ri, ci, guess );
                      } }
                    />
                  </td>
                ))}
                <ValidationCell set={ row } />
              </tr>
            ))}
            <tr>
              { rows[0].map( ( _, ci ) => (
                <ValidationCell set={ getColumn( cells, ci ) } key={ `col${ ci }valid` } />
              ) ) }
            </tr>
          </tbody>
        </table>
        { beforeGuess ? ( 
          <button type="button" onClick={ () => {
            // If we get to this again, we've failed; reset!
            setRows( beforeGuess );
            saveSnapshot( null );
          } }>Reset</button>
         ) : (
          ! isComplete( cells ) && showGuessButton ? (
            <button type="button" onClick={ () => {
              const unknownCells = cells.reduce( ( options, row, ri ) => {
                row.forEach( ( cell, ci ) => {
                  if ( cell.value ) {
                    return;
                  }
                  options.push( [ cell, ri, ci ] );
                } );
                return options;
              }, [] );
              const [ cell, ri, ci ] = random( unknownCells );

              // Try it!
              saveSnapshot( clone( rows ) );
              updateCell( ri, ci, random( cell.possibilities ) );
              outOfOptions( false );
            } }>Guess!</button>
          ) : null
        ) }
      </header>
    </div>
  );
}

export default App;
