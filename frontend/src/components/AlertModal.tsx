import { X } from "lucide-react";
import { useEffect } from "react";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    variant?: "error" | "warning" | "info" | "success";
    showConfirm?: boolean;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    showTextInput?: boolean;
    textInputLabel?: string;
    textInputPlaceholder?: string;
    textInputValue?: string;
    onTextInputChange?: (value: string) => void;
    textInputRequired?: boolean;
}

const AlertModal = ({
    isOpen,
    onClose,
    title,
    message,
    variant = "warning",
    showConfirm = false,
    onConfirm,
    confirmText = "Potwierdź",
    cancelText = "Anuluj",
    isLoading = false,
    showTextInput = false,
    textInputLabel,
    textInputPlaceholder,
    textInputValue = "",
    onTextInputChange,
    textInputRequired = false
}: AlertModalProps) => {
    useEffect(() => {
        if (isOpen) {
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === "Escape") onClose();
            };
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const bgColor =
        variant === "error"
            ? "bg-red-500/10 border-red-500"
            : variant === "success"
            ? "bg-green-500/10 border-green-500"
            : variant === "info"
            ? "bg-blue-500/10 border-blue-500"
            : "bg-amber-500/10 border-amber-500";


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={`relative w-full max-w-md rounded-2xl bg-zinc-900 p-6 ring-1 ring-zinc-800 shadow-2xl ${bgColor}`}
            >
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-white text-lg font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                        <X size={20} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>
                <p className="text-zinc-300 mb-6">{message}</p>
                
                {showTextInput && (
                    <div className="mb-6">
                        {textInputLabel && (
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                {textInputLabel}
                                {textInputRequired && <span className="text-red-400 ml-1">*</span>}
                            </label>
                        )}
                        <textarea
                            value={textInputValue}
                            onChange={(e) => onTextInputChange?.(e.target.value)}
                            placeholder={textInputPlaceholder}
                            rows={3}
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-white placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                        />
                    </div>
                )}

                <div className={`flex ${showConfirm ? 'justify-end gap-2' : 'justify-end'}`}>
                    {showConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading || (showTextInput && textInputRequired && !textInputValue?.trim())}
                                className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    variant === "error"
                                        ? "bg-red-600 hover:bg-red-500"
                                        : variant === "success"
                                        ? "bg-green-600 hover:bg-green-500"
                                        : variant === "info"
                                        ? "bg-blue-600 hover:bg-blue-500"
                                        : "bg-violet-600 hover:bg-violet-500"
                                }`}
                            >
                                {isLoading ? "Przetwarzanie..." : confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors"
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertModal;

