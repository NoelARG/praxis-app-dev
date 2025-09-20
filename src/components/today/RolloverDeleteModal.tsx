import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface RolloverDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  originalDate: string;
}

export const RolloverDeleteModal: React.FC<RolloverDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  originalDate,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              Remove Rollover Task?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You're about to permanently delete a task that was planned for{' '}
              <span className="font-medium text-foreground">
                {formatDate(originalDate)}
              </span>
              .
            </p>
            
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
              <p className="text-sm font-medium text-foreground mb-1">
                Task to be removed:
              </p>
              <p className="text-sm text-muted-foreground italic">
                "{taskTitle}"
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-sm font-medium text-amber-300 mb-1">
                ⚠️ Warning
              </p>
              <p className="text-xs text-amber-200">
                Removing rollover tasks may break continuity and encourage 
                procrastination. Consider completing or rescheduling instead.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-600"
          >
            <X className="w-4 h-4 mr-2" />
            Keep Task
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
