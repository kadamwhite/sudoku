import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

const options = {
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
  7: true,
  8: true,
  9: true,
};

function getRange( index ) {
  if ( index < 3 ) {
    return [0, 1, 2];
  }
  if ( index < 6 ) {
    return [3, 4, 5];
  }
  return [6, 7, 8];
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
  return rows[ ri ][ ci ] === defaultLayout[ ri ][ ci ];
}

function App() {
  const [rows, setRows] = useState( defaultLayout );

  /**
   * Build list of possible values for a cell
   *
   * @param {Number|null} cell A known cell, or null
   * @param {Number}      ri   The index of the row
   * @param {Number}      ci   The index of the column
   */
  function computeGuess( cell, ri, ci ) {
    const available = {
      ...options,
    };
    for ( let num of rows[ ri ] ) {
      if ( num ) {
        available[ num ] = false;
      }
    }
    for ( let row of rows ) {
      if ( row[ ci ] ) {
        available[ row[ ci ] ] = false;
      }
    }
    for ( let num of getSquare( rows, ri, ci ) ) {
      if ( num ) {
        available[ num ] = false;
      }
    }
    return Object.keys( available ).reduce( ( guesses, num ) => {
      if ( available[num] ) {
        return guesses.concat( num );
      }
      return guesses;
    }, [] ).join( ', ' );
  }
  return (
    <div className="App">
      <header className="App-header">
        <table cellSpacing={0}>
          {rows.map(( row, ri ) => (
            <tr>{row.map(( cell, ci ) => (
              <td>{ cell ? (
                <span className={
                  isOriginal( rows, ri, ci ) ? 'original' : null
                }>{ cell }</span>
              ) : (
                <span className="guess">{ computeGuess( cell, ri, ci ) }</span>
              )}</td>
            ))}</tr>
          ))}
        </table>
      </header>
    </div>
  );
}

export default App;
