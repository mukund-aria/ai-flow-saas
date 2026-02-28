import { useState } from 'react';
import { Folder as FolderIcon, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Folder } from '@/lib/api';

interface MoveToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: Folder[];
  currentFolderId?: string | null;
  onMove: (folderId: string | null) => void;
}

export function MoveToFolderDialog({ open, onOpenChange, folders, currentFolderId, onMove }: MoveToFolderDialogProps) {
  const [selected, setSelected] = useState<string | null>(currentFolderId ?? null);

  const handleMove = () => {
    onMove(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move to Folder</DialogTitle>
          <DialogDescription>Select a destination folder for this template.</DialogDescription>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {/* Root (no folder) option */}
          <button
            onClick={() => setSelected(null)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
              selected === null ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FolderIcon size={16} className={selected === null ? 'text-violet-500' : 'text-gray-400'} />
            <span className="flex-1 text-left">Root (No folder)</span>
            {selected === null && <Check size={16} className="text-violet-600" />}
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelected(folder.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                selected === folder.id ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FolderIcon size={16} className={selected === folder.id ? 'text-violet-500' : 'text-gray-400'} />
              <span className="flex-1 text-left">{folder.name}</span>
              <span className="text-xs text-gray-400">{folder.templateCount}</span>
              {selected === folder.id && <Check size={16} className="text-violet-600" />}
            </button>
          ))}

          {folders.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No folders yet. Create one first.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove}>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
