import { useState } from "react";
import api from "../Api/axios";
import Avatar from "./Avatar";
import { Camera, Upload, X } from "lucide-react";

interface ProfileImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    userName: string;
    onPhotoUpdated: (newPhotoUrl: string) => void;
    loading?: boolean;
}

const ProfileImageModal = ({
    isOpen,
    onClose,
    imageUrl,
    userName,
    onPhotoUpdated,
    loading = false
}: ProfileImageModalProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const uploadResponse = await api.post("/images/upload/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const photoUrl = uploadResponse.data;
            await api.patch("/auth/user/photo", { photoUrl });
            onPhotoUpdated(photoUrl);
            handleClose();
        } catch {
            setError("Nie udało się przesłać zdjęcia. Spróbuj ponownie.");
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;
    const displayImage = previewUrl || imageUrl || null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
            <div className="relative w-[95%] max-w-md rounded-2xl bg-zinc-900 p-6 ring-1 ring-zinc-800 shadow-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="flex flex-col items-center space-y-4">
                    <h3 className="text-white text-lg font-semibold">Zdjęcie profilowe</h3>
                    <div className="relative">
                        <Avatar
                            src={displayImage}
                            name={userName}
                            size="lg"
                            loading={loading}
                            className="ring-4 ring-zinc-700 shadow-2xl"
                        />
                    </div>
                    <div className="w-full space-y-3">
                        <input
                            type="file"
                            id="profile-image-upload"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <label
                            htmlFor="profile-image-upload"
                            className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-zinc-600 hover:border-violet-500 px-4 py-3 text-sm text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                            <Camera size={18} />
                            Wybierz nowe zdjęcie
                        </label>
                        {selectedFile && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm text-zinc-400">
                                        Wybrano: {selectedFile.name}
                                    </span>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Upload size={16} />
                                        {uploading ? "Przesyłanie..." : "Prześlij"}
                                    </button>
                                </div>
                                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileImageModal;
