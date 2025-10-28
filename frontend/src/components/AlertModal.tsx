import { X } from "lucide-react";
import { useEffect } from "react";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    variant?: "error" | "warning" | "info" | "success";
}

const AlertModal = ({
    isOpen,
    onClose,
    title,
    message,
    variant = "warning"
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
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;

