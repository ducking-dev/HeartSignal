'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ControlsBarProps {
  onReset: () => void;
  onSave?: () => void;
  onShare?: () => void;
  disabled?: boolean;
}

export function ControlsBar({ 
  onReset, 
  onSave, 
  onShare, 
  disabled = false 
}: ControlsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex items-center justify-center space-x-3"
    >
      {/* 다시 시도 */}
      <Button
        onClick={onReset}
        disabled={disabled}
        variant="outline"
        size="lg"
        className="flex items-center space-x-2 px-6 py-3 rounded-full border-2 hover:bg-gray-50 transition-all duration-200"
      >
        <RotateCcw className="w-4 h-4" />
        <span>다시 시도</span>
      </Button>

      {/* 결과 저장 (선택적) */}
      {onSave && (
        <Button
          onClick={onSave}
          disabled={disabled}
          variant="outline"
          size="lg"
          className="flex items-center space-x-2 px-6 py-3 rounded-full border-2 hover:bg-gray-50 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          <span>결과 저장</span>
        </Button>
      )}

      {/* 공유하기 (선택적) */}
      {onShare && (
        <Button
          onClick={onShare}
          disabled={disabled}
          size="lg"
          className="flex items-center space-x-2 px-6 py-3 rounded-full bg-[#E95877] hover:bg-[#F26B88] text-white transition-all duration-200"
        >
          <Share2 className="w-4 h-4" />
          <span>공유하기</span>
        </Button>
      )}
    </motion.div>
  );
}
