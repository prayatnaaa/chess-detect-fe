import React from "react";
import { Chessboard } from "react-chessboard";

interface BoardProps {
  curPosition: string;
}

const Board: React.FC<BoardProps> = ({ curPosition }) => {
  return <Chessboard boardWidth={560} position={curPosition} />;
};

export default Board;
