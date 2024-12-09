export const navItems = [
    {
        name: "Dashboard",
        icon: "/assets/icons/dashboard.svg",
        url: "/",
    },
    {
        name: "Documents",
        icon: "/assets/icons/documents.svg",
        url: "/documents",
    },
    {
        name: "Images",
        icon: "/assets/icons/images.svg",
        url: "/images",
    },
    {
        name: "Media",
        icon: "/assets/icons/video.svg",
        url: "/media",
    },
    {
        name: "Others",
        icon: "/assets/icons/others.svg",
        url: "/others",
    },
];

export const avatarPlaceHolderUrl = "https://static.vecteezy.com/system/resources/thumbnails/027/951/137/small/stylish-spectacles-guy-3d-avatar-character-illustrations-png.png";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export type FileType = "image" | "video" | "audio" | "document" | "other";