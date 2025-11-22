import React from "react";

const ModeratorReportedUsersTab: React.FC = () => {
    return (
        <section className="p-4 md:p-0">
            <h2 className="text-xl font-semibold text-white mb-2">Zgłoszeni użytkownicy</h2>
            <p className="text-sm text-zinc-400">
                Lista zgłoszonych użytkowników z możliwością podglądu i podjęcia działań.
            </p>
        </section>
    );
};

export default ModeratorReportedUsersTab;
