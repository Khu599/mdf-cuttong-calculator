import React, { useState, useEffect, useRef } from 'react';
import { ProjectData, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  X,
  Save,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface ProjectStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: ProjectData;
  onLoadProject: (project: ProjectData) => void;
  lang: Language;
}

const STORAGE_KEY = 'furniture_cutting_saved_projects_v1';

export const ProjectStorageModal: React.FC<ProjectStorageModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onLoadProject,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [savedProjects, setSavedProjects] = useState<ProjectData[]>([]);
  const [projectTitleInput, setProjectTitleInput] = useState<string>(currentProject.title || '');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved projects on mount or modal open
  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setSavedProjects(parsed);
          }
        }
      } catch (err) {
        console.error('Error loading projects from localStorage', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    const updatedTitle = projectTitleInput.trim() || currentProject.title || 'Untitled Furniture Project';
    const updatedProject: ProjectData = {
      ...currentProject,
      title: updatedTitle,
      date: new Date().toISOString().split('T')[0],
    };

    const existingIndex = savedProjects.findIndex((p) => p.id === updatedProject.id);
    let nextProjects: ProjectData[] = [];

    if (existingIndex >= 0) {
      nextProjects = [...savedProjects];
      nextProjects[existingIndex] = updatedProject;
    } else {
      nextProjects = [updatedProject, ...savedProjects];
    }

    setSavedProjects(nextProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));

    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2500);
  };

  const handleDelete = (id: string) => {
    const next = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentProject.title.replace(/\s+/g, '_')}_project.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && parsed.pieces && parsed.material) {
          onLoadProject(parsed);
          onClose();
        } else {
          alert(lang === 'ur' ? 'غلط فارمیٹ کی فائل ہے۔' : 'Invalid JSON project format.');
        }
      } catch (err) {
        alert(lang === 'ur' ? 'فائل لوڈ کرنے میں خرابی واقع ہوئی ہے۔' : 'Error reading JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {lang === 'ur' ? 'پروجیکٹ مینیجر و فائل محفوظ کریں' : 'Project Manager & Saved Quotes'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Save Current Project Box */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>{lang === 'ur' ? 'موجودہ پروجیکٹ محفوظ کریں' : 'Save Current Project'}</span>
              {savedSuccessMsg && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'ur' ? 'محفوظ کر لیا گیا!' : 'Saved successfully!'}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={lang === 'ur' ? 'پروجیکٹ کا نام درج کریں' : 'Project title'}
                value={projectTitleInput}
                onChange={(e) => setProjectTitleInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveCurrent}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.saveProject}</span>
              </button>
            </div>
          </div>

          {/* Export / Import JSON Box */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.exportJson}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.importJson}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Saved Projects List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300">
              {lang === 'ur' ? 'براؤزر میں محفوظ پروجیکٹس' : 'Saved Projects in Browser'}
            </h4>

            {savedProjects.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                {lang === 'ur' ? 'ابھی کوئی محفوظ شدہ پروجیکٹ موجود نہیں ہے۔' : 'No saved projects found in this browser.'}
              </p>
            ) : (
              <div className="space-y-2">
                {savedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">{p.title}</h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono-num">
                        <span>{p.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.pieces.length} {lang === 'ur' ? 'پیسز' : 'parts'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-400">{p.material.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadProject(p);
                          onClose();
                        }}
                        className="px-3 py-1 text-xs font-semibold rounded bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                      >
                        {lang === 'ur' ? 'کھولیں' : 'Open'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
