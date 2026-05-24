import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { X } from 'lucide-react';

interface ModalProps {
  title?: React.ReactNode;
  open: boolean;
  onCancel: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
  centered?: boolean;
  className?: string;
  closable?: boolean;
}

interface ModalConfirmProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  okType?: 'danger' | 'primary' | string;
  onOk?: () => void | Promise<any>;
  onCancel?: () => void;
}

export const Modal: React.FC<ModalProps> & {
  confirm: (props: ModalConfirmProps) => void;
} = ({
  title,
  open,
  onCancel,
  footer,
  children,
  width = 520,
  centered = true,
  className = '',
  closable = true,
}) => {
  // Prevent scrolling on body when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out animate-in fade-in"
        onClick={onCancel}
      />

      {/* Modal box */}
      <div
        className={`relative bg-white flex flex-col shadow-2xl rounded-3xl border border-slate-100 max-h-[90vh] w-full animate-in zoom-in-95 duration-200 z-50 overflow-hidden ${className}`}
        style={{ maxWidth: `${width}px` }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-base font-extrabold text-slate-850 tracking-tight">
            {title}
          </div>
          {closable && (
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer !== undefined && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end shrink-0 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.confirm = (props: ModalConfirmProps) => {
  if (typeof window === 'undefined') return;

  const container = document.createElement('div');
  container.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden font-sans';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);

  const close = () => {
    try {
      root.unmount();
    } catch (e) {}
    container.remove();
  };

  const handleOk = async () => {
    if (props.onOk) {
      await props.onOk();
    }
    close();
  };

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    }
    close();
  };

  root.render(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out animate-in fade-in"
        onClick={handleCancel}
      />

      {/* Confirm Box */}
      <div className="relative bg-white flex flex-col shadow-2xl rounded-3xl border border-slate-100 w-full max-w-[400px] animate-in zoom-in-95 duration-200 z-50 overflow-hidden">
        {/* Body */}
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-base font-extrabold text-slate-850 tracking-tight mb-2">
            {props.title}
          </h3>
          <div className="text-sm text-slate-500 leading-relaxed">
            {props.content}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-slate-650 hover:bg-slate-100 hover:text-slate-850 text-sm font-semibold transition-colors cursor-pointer"
          >
            {props.cancelText || 'Cancel'}
          </button>
          <button
            onClick={handleOk}
            className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:scale-[1.02] cursor-pointer ${
              props.okType === 'danger'
                ? 'bg-rose-650 hover:bg-rose-700 shadow-rose-100'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
            }`}
          >
            {props.okText || 'OK'}
          </button>
        </div>
      </div>
    </>
  );
};

