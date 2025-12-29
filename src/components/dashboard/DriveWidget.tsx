'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive,
  Loader2,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  Folder,
  File,
  Star,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore, useDataStore } from '@/lib/store';
import { getStarredFiles } from '@/lib/google-api';
import type { DriveFile } from '@/types/google';

// Get icon based on mime type
function getFileIcon(mimeType: string) {
  if (mimeType.includes('folder')) return Folder;
  if (mimeType.includes('document') || mimeType.includes('text')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return Presentation;
  if (mimeType.includes('image')) return ImageIcon;
  if (mimeType.includes('video')) return FileVideo;
  if (mimeType.includes('audio')) return FileAudio;
  return File;
}

// Get color based on mime type
function getFileColor(mimeType: string): string {
  if (mimeType.includes('folder')) return 'text-yellow-400 bg-yellow-500/20';
  if (mimeType.includes('document') || mimeType.includes('text'))
    return 'text-blue-400 bg-blue-500/20';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return 'text-green-400 bg-green-500/20';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return 'text-orange-400 bg-orange-500/20';
  if (mimeType.includes('image')) return 'text-pink-400 bg-pink-500/20';
  if (mimeType.includes('video')) return 'text-red-400 bg-red-500/20';
  if (mimeType.includes('audio')) return 'text-purple-400 bg-purple-500/20';
  return 'text-gray-400 bg-gray-500/20';
}

// Format file size
function formatFileSize(bytes?: string): string {
  if (!bytes) return '';
  const size = parseInt(bytes, 10);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export function DriveWidget() {
  const { accessToken } = useAuthStore();
  const { starredFiles, isLoadingFiles, setStarredFiles, setLoadingFiles } = useDataStore();

  const loadFiles = useCallback(async () => {
    if (!accessToken) return;

    setLoadingFiles(true);
    try {
      const response = await getStarredFiles(accessToken);
      setStarredFiles(response.files || []);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoadingFiles(false);
    }
  }, [accessToken, setStarredFiles, setLoadingFiles]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return (
    <GlassCard className="h-full flex flex-col" glow="pink">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-500/20">
            <HardDrive className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Drive</h2>
            <p className="text-xs text-white/50 flex items-center gap-1">
              <Star className="w-3 h-3" /> Arquivos fixados
            </p>
          </div>
        </div>

        <span className="text-2xl font-bold text-white/80">{starredFiles.length}</span>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2">
        {isLoadingFiles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
          </div>
        ) : starredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-white/40">
            <Star className="w-10 h-10 mb-2" />
            <p className="text-sm">Nenhum arquivo fixado</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {starredFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.mimeType);
              const colorClass = getFileColor(file.mimeType);

              return (
                <motion.a
                  key={file.id}
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group glass-subtle rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <FileIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 truncate group-hover:text-white transition-colors">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40">
                        {formatRelativeTime(file.modifiedTime)}
                      </span>
                      {file.size && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="text-xs text-white/40">{formatFileSize(file.size)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
                </motion.a>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}

