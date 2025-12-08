export type SimpleUser = {
    name: string;
    email: string;
    urlOfPicture: string | null;
};

export type SidebarItemKey =
    | "Ogólne"
    | "Hasło"
    | "Znajomi"
    | "Oceny"
    | "Moje wydarzenia"
    | "Biorę udział"
    | "Odznaki"