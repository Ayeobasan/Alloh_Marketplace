import React from 'react';
import ReactDOM from 'react-dom/client';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

class ToastManager {
  private containerId = 'alloh-toast-container';

  private getContainer(): HTMLElement {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none';
      document.body.appendChild(container);
    }
    return container;
  }

  show(type: 'success' | 'error' | 'info' | 'warning', content: string) {
    if (typeof window === 'undefined') return;

    const container = this.getContainer();
    const toastNode = document.createElement('div');
    toastNode.className = 'pointer-events-auto';
    container.appendChild(toastNode);

    const root = ReactDOM.createRoot(toastNode);

    const removeToast = () => {
      try {
        root.unmount();
      } catch (e) {
        // Silently catch unmount errors if already unmounted
      }
      toastNode.remove();
    };

    root.render(
      <div className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/50 animate-in slide-in-from-right duration-300 font-sans">
        <div className="shrink-0 mt-0.5">
          {type === 'success' && (
            <CheckCircle2 className="text-emerald-500 animate-bounce" size={18} />
          )}
          {type === 'error' && (
            <AlertTriangle className="text-rose-500 animate-pulse" size={18} />
          )}
          {type === 'warning' && (
            <AlertTriangle className="text-amber-500 animate-pulse" size={18} />
          )}
          {type === 'info' && (
            <Info className="text-blue-500 animate-pulse" size={18} />
          )}
        </div>
        <div className="flex-1 text-sm font-semibold text-slate-800 leading-relaxed pr-2">
          {content}
        </div>
        <button
          onClick={removeToast}
          className="shrink-0 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    );

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      removeToast();
    }, 3500);
  }
}

const toastManager = new ToastManager();

export const message = {
  success: (content: string) => toastManager.show('success', content),
  error: (content: string) => toastManager.show('error', content),
  info: (content: string) => toastManager.show('info', content),
  warning: (content: string) => toastManager.show('warning', content),
};

