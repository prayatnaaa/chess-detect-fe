import React from "react";
import { Chessboard } from "react-chessboard";

interface BoardProps {
  curPosition: string;
}

const Board: React.FC<BoardProps> = ({ curPosition }) => {
  return (
    <div className="chessboard">
      <Chessboard boardWidth={700} position={curPosition} />
    </div>
  );
};

export default Board;
