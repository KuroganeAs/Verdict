import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { Player } from '../types/game';
import { Avatar } from './Avatar';
import { Button } from './ui/Button';

interface DragRankerProps {
  players: Player[];
  onSubmit: (orderedIds: string[]) => void;
}

export const DragRanker: React.FC<DragRankerProps> = ({ players, onSubmit }) => {
  const [items, setItems] = useState<Player[]>(players);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);
    setItems(reorderedItems);
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'border-yellow-500/50 shadow-md shadow-yellow-500/5 text-yellow-500 font-extrabold bg-yellow-500/5';
    if (index === 1) return 'border-gray-400/50 shadow-md shadow-gray-400/5 text-gray-300 font-bold bg-gray-400/5';
    if (index === 2) return 'border-amber-600/50 shadow-md shadow-amber-600/5 text-amber-600 font-bold bg-amber-600/5';
    return 'border-[#222230] text-gray-400';
  };

  const handleSubmit = () => {
    onSubmit(items.map(p => p.id));
  };

  return (
    <div className="flex flex-col gap-6 max-w-md w-full mx-auto">
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="players-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar"
            >
              {items.map((player, index) => (
                <Draggable key={player.id} draggableId={player.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-3 bg-[#121217]/70 backdrop-blur-md border px-4 py-3 rounded-2xl transition-all duration-200
                        ${snapshot.isDragging ? 'border-[#9f7aea] bg-[#1a1a24] scale-[1.02] shadow-xl shadow-[#9f7aea]/10 dragging' : getRankColor(index)}
                      `}
                    >
                      <div {...provided.dragHandleProps} className="text-gray-500 hover:text-gray-300 cursor-grab px-1 py-2">
                        <GripVertical size={20} />
                      </div>
                      
                      <div className="flex items-center justify-center font-extrabold text-lg w-7 select-none">
                        #{index + 1}
                      </div>

                      <Avatar emoji={player.avatar} color={player.color} size="sm" />
                      
                      <div className="flex-1 font-bold text-white truncate text-base">
                        {player.name}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button variant="primary" size="lg" onClick={handleSubmit} className="w-full mt-2">
        Lock In Rankings
      </Button>
    </div>
  );
};
