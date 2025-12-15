import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";

import {
    ShieldCheck,
    Users,
    Ticket,
    Star,
    UserCheck,
    UsersRound,
    AlertTriangle,
    Settings2,
    Dumbbell,
} from "lucide-react";

import ModeratorDashboardTab from "../components/ModeratorDashboardTab.tsx";
import ModeratorUsersTab from "../components/ModeratorUsersTab.tsx";
import ModeratorEventsTab from "../components/ModeratorEventsTab.tsx";
import ModeratorEventRatingsTab from "../components/ModeratorEventRatingsTab.tsx";
import ModeratorUserRatingsTab from "../components/ModeratorUserRatingsTab.tsx";
import ModeratorTeamsTab from "../components/ModeratorTeamsTab.tsx";
import ModeratorReportedUsersTab from "../components/ModeratorReportedUsersTab.tsx";
import ModeratorSettingsTab from "../components/ModeratorSettingsTab.tsx";
import ModeratorSportsTab from "../components/ModeratorSportsTab.tsx";
const tabs = [
    { key: "dashboard" as TabKey, label: "Dashboard", icon: <ShieldCheck className="h-4 w-4" /> },
    { key: "users" as TabKey, label: "Użytkownicy", icon: <Users className="h-4 w-4" /> },
    { key: "events" as TabKey, label: "Wydarzenia", icon: <Ticket className="h-4 w-4" /> },
    { key: "eventRatings" as TabKey, label: "Oceny wydarzenia", icon: <Star className="h-4 w-4" /> },
    { key: "userRatings" as TabKey, label: "Oceny użytkownika", icon: <UserCheck className="h-4 w-4" /> },
    { key: "teams" as TabKey, label: "Drużyny", icon: <UsersRound className="h-4 w-4" /> },
    { key: "sports" as TabKey, label: "Sporty", icon: <Dumbbell className="h-4 w-4" /> },
    {
        key: "reportedUsers" as TabKey,
        label: "Zgłoszeni użytkownicy",
        icon: <AlertTriangle className="h-4 w-4" />,
    },
    { key: "settings" as TabKey, label: "Ustawienia", icon: <Settings2 className="h-4 w-4" /> },
];

const CARD_BG = "bg-black/60";
const RING = "ring-1 ring-zinc-800";

type TabKey =
    | "dashboard"
    | "users"
    | "events"
    | "eventRatings"
    | "userRatings"
    | "teams"
    | "sports"
    | "reportedUsers"
    | "settings";

const ModeratorPanelPage: React.FC = () => {
    const navigate = useNavigate();

    // 🔐 AUTORYZACJA
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const urlTab = searchParams.get("tab") as TabKey | null;
    const [tab, setTab] = useState<TabKey>(urlTab || "dashboard");

    // 🔒 SPRAWDZENIE DOSTĘPU DO PANELU
    useEffect(() => {
        api.get("/moderator/auth/me")
            .then(() => {
                setAuthorized(true);
            })
            .catch(() => {
                setAuthorized(false);
                navigate("/");
            });
    }, [navigate]);

    const handleTabChange = (key: TabKey) => {
        setTab(key);
        setSearchParams({ tab: key });
    };

    // ⏳ LOADER – zanim backend odpowie
    if (authorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1f2632] text-white">
                Sprawdzanie uprawnień…
            </div>
        );
    }

    // ❌ zabezpieczenie po redirect
    if (authorized === false) {
        return null;
    }

    // ✅ PANEL MODERATORA
    return (
        <div className="min-h-screen bg-[#1f2632] text-zinc-300">
            {/* HEADER */}
            <header className="relative h-[160px] md:h-[200px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop)",
                    }}
                />
                <div className="absolute inset-0 bg-black/70" />

                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-6 md:px-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
                            <ShieldCheck className="h-7 w-7 text-violet-400" />
                            Panel moderatora
                        </h1>
                        <div className="mt-2 h-1 w-40 rounded-full bg-violet-600" />
                    </div>
                </div>
            </header>

            {/* BODY */}
            <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
                <div
                    className={`rounded-3xl ${CARD_BG} p-0 md:p-6 ${RING} shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]`}
                >
                    {/* TABS */}
                    <div className="px-4 pt-4 md:px-0 md:pt-0 md:pb-6">
                        <div
                            className="
                                flex gap-2 md:gap-3
                                overflow-x-auto md:overflow-visible
                                -mx-4 px-4 md:mx-0 md:px-0
                                pb-3 md:pb-0
                                sm:flex-wrap
                            "
                        >
                            {tabs.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => handleTabChange(item.key)}
                                    className={`
                                        inline-flex items-center gap-2
                                        rounded-xl border transition
                                        px-3 py-2 text-sm
                                        shrink-0
                                        ${
                                        tab === item.key
                                            ? "border-violet-600 bg-violet-600/20 text-white"
                                            : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                    }
                                    `}
                                >
                                    {item.icon}
                                    <span className="whitespace-nowrap">
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SEKCJE */}
                    {tab === "dashboard" && <ModeratorDashboardTab />}
                    {tab === "users" && <ModeratorUsersTab />}
                    {tab === "events" && <ModeratorEventsTab />}
                    {tab === "eventRatings" && <ModeratorEventRatingsTab />}
                    {tab === "userRatings" && <ModeratorUserRatingsTab />}
                    {tab === "teams" && <ModeratorTeamsTab />}
                    {tab === "sports" && <ModeratorSportsTab />}
                    {tab === "reportedUsers" && <ModeratorReportedUsersTab />}
                    {tab === "settings" && <ModeratorSettingsTab />}
                </div>
            </main>
        </div>
    );
};

export default ModeratorPanelPage;
