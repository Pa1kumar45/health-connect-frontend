/**
 * TimeBlockSelector Component
 * 
 * Interactive component for selecting 15-minute time slots grouped by 2-hour blocks.
 * Used in both doctor availability settings and patient appointment booking.
 * 
 * Features:
 * - 6 collapsible time blocks (9-11, 11-1, 1-3, 3-5, 5-7, 7-9)
 * - Each block shows 8 15-minute slots
 * - Toggle individual slots on/off
 * - Visual feedback for selected/available slots
 * - Expandable/collapsible interface
 * - Dark mode support
 * 
 * @component
 * @param {Array} selectedSlots - Array of slot numbers currently selected
 * @param {Function} onSlotToggle - Callback when slot is toggled (slotNumber)
 * @param {boolean} readOnly - If true, slots cannot be toggled
 * @param {string} mode - 'select' for doctor settings, 'view' for patient booking
 * 
 * @example
 * return (
 *   <TimeBlockSelector
 *     selectedSlots={[1, 2, 3, 9, 10]}
 *     onSlotToggle={(slotNumber) => handleToggle(slotNumber)}
 *     mode="select"
 *   />
 * )
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { TIME_BLOCKS, getSlotsForBlock, formatTime12Hour, TimeSlot } from '../utils/timeSlots';

interface TimeBlockSelectorProps {
  selectedSlots: number[];
  onSlotToggle: (slotNumber: number) => void;
  readOnly?: boolean;
  mode?: 'select' | 'view';
  availableSlots?: number[]; // For patient view - only show these slots
}

const TimeBlockSelector: React.FC<TimeBlockSelectorProps> = ({
  selectedSlots,
  onSlotToggle,
  readOnly = false,
  mode = 'select',
  availableSlots
}) => {
  // Track which blocks are expanded (all collapsed by default)
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());

  /**
   * Toggle block expansion
   */
  const toggleBlock = (blockIndex: number) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockIndex)) {
      newExpanded.delete(blockIndex);
    } else {
      newExpanded.add(blockIndex);
    }
    setExpandedBlocks(newExpanded);
  };

  /**
   * Check if a slot is selected
   */
  const isSlotSelected = (slotNumber: number): boolean => {
    return selectedSlots.includes(slotNumber);
  };

  /**
   * Get count of selected slots in a block
   */
  const getBlockSelectedCount = (blockIndex: number): number => {
    const blockSlots = getSlotsForBlock(blockIndex);
    return blockSlots.filter(slot => isSlotSelected(slot.slotNumber)).length;
  };

  /**
   * Filter slots based on availableSlots prop (for patient view)
   * If availableSlots is provided, only show those slots
   */
  const getFilteredSlotsForBlock = (blockIndex: number): TimeSlot[] => {
    const blockSlots = getSlotsForBlock(blockIndex);
    
    // If availableSlots is provided (patient view), filter to show only available ones
    if (availableSlots && availableSlots.length > 0) {
      return blockSlots.filter(slot => availableSlots.includes(slot.slotNumber));
    }
    
    // Otherwise show all slots (doctor setting availability)
    return blockSlots;
  };

  return (
    <div className="space-y-3">
      {TIME_BLOCKS.map((block, blockIndex) => {
        const isExpanded = expandedBlocks.has(blockIndex);
        const blockSlots = getFilteredSlotsForBlock(blockIndex);
        const selectedCount = getBlockSelectedCount(blockIndex);
        const hasSlots = selectedCount > 0;
        
        // For patient view, hide blocks with no available slots
        if (availableSlots && blockSlots.length === 0) {
          return null;
        }

        return (
          <div
            key={blockIndex}
            className={`border rounded-lg overflow-hidden transition-all ${
              hasSlots
                ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50'
            }`}
          >
            {/* Block Header - Always visible */}
            <button
              type="button"
              onClick={() => toggleBlock(blockIndex)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock size={18} className={hasSlots ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
                <span className="font-medium text-gray-900 dark:text-white">
                  {block.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Show slot count */}
                {(hasSlots || (availableSlots && blockSlots.length > 0)) && (
                  <span className="text-sm px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                    {availableSlots ? `${blockSlots.length}` : selectedCount} slot{(availableSlots ? blockSlots.length : selectedCount) !== 1 ? 's' : ''}
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                )}
              </div>
            </button>

            {/* Expanded Slots - Only when expanded */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t dark:border-gray-600">
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {blockSlots.map((slot: TimeSlot) => {
                    const isSelected = isSlotSelected(slot.slotNumber);
                    return (
                      <button
                        key={slot.slotNumber}
                        type="button"
                        onClick={() => !readOnly && onSlotToggle(slot.slotNumber)}
                        disabled={readOnly && !isSelected}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                            : readOnly
                            ? 'bg-gray-100 dark:bg-gray-600/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600/70'
                        }`}
                      >
                        <div className="text-xs">
                          {formatTime12Hour(slot.startTime)}
                        </div>
                        <div className="text-xs opacity-75">
                          {formatTime12Hour(slot.endTime)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Helper text */}
      {mode === 'select' && !readOnly && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 Click on a time block to expand and select individual 15-minute slots. 
            Only selected slots will be available for patient booking.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeBlockSelector;
