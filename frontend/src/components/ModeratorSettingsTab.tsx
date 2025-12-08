import React from "react";

const ModeratorSettingsTab: React.FC = () => {
    return (
        <section className="p-4 md:p-0">
            <h2 className="text-xl font-semibold text-white mb-2">Ustawienia panelu</h2>
            <p className="text-sm text-zinc-400">
                Konfiguracja ustawień panelu moderatora (np. powiadomienia, domyślne filtry).
            </p>
        </section>
    );
};

export default ModeratorSettingsTab;
