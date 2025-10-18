interface AvatarProps {
    src: string | null;
    name: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    loading?: boolean;
}

const Avatar = ({ 
    src, 
    name, 
    size = "sm",
    className = "",
    loading = false
}: AvatarProps) => {
    const sizeClasses = {
        sm: "h-12 w-12 text-lg",
        md: "h-24 w-24 text-4xl", 
        lg: "h-48 w-48 text-6xl"
    };

    const baseClasses = "rounded-full object-cover ring-2 ring-zinc-700 flex items-center justify-center font-semibold text-white bg-gradient-to-br from-violet-600 to-purple-700";

    // Show loading state
    if (loading) {
        return (
            <div className={`${baseClasses} ${sizeClasses[size]} ${className} animate-pulse bg-zinc-700`}>
                <div className="w-1/2 h-1/2 bg-zinc-600 rounded-full"></div>
            </div>
        );
    }

    if (src) {
        return (
            <img 
                src={src} 
                alt={`${name} avatar`} 
                className={`${baseClasses} ${sizeClasses[size]} ${className}`}
            />
        );
    }

    const firstLetter = name.charAt(0).toUpperCase();

    return (
        <div className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
            {firstLetter}
        </div>
    );
};

export default Avatar;
