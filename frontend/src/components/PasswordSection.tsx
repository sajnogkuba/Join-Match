import { useState } from "react";
import api from "../Api/axios";
import { Check } from "lucide-react";

const PasswordSection = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const passwordsMatch =
        newPassword.length > 0 &&
        confirmPassword.length > 0 &&
        newPassword === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!passwordsMatch) {
            setErrorMsg("Nowe hasła nie są takie same.");
            return;
        }

        setSubmitting(true);
        try {
            await api.patch("/auth/changePass", {
                oldPassword: oldPassword,
                newPassword: newPassword
            });
            setSuccessMsg("Hasło zostało zmienione.");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            setErrorMsg("Nie udało się zmienić hasła.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="space-y-6 max-w-md">
            <h3 className="text-white text-xl font-semibold">Zmień hasło</h3>
            <p className="text-sm text-zinc-400">
                Wprowadź swoje stare hasło i ustaw nowe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-zinc-300">Stare hasło</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="mt-1 w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-zinc-300">Nowe hasło</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-zinc-300">Powtórz nowe hasło</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 ${
                            confirmPassword.length === 0
                                ? "bg-zinc-800 border-zinc-700 focus:ring-violet-600"
                                : passwordsMatch
                                    ? "bg-zinc-800 border-green-600 focus:ring-green-600"
                                    : "bg-zinc-800 border-red-600 focus:ring-red-600"
                        }`}
                        placeholder="••••••••"
                        required
                    />
                    {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="text-xs text-red-400 mt-1">
                            Hasła muszą być identyczne.
                        </p>
                    )}
                    {confirmPassword.length > 0 && passwordsMatch && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                            <Check size={14} /> Hasła pasują.
                        </p>
                    )}
                </div>

                {errorMsg && (
                    <p className="rounded-lg bg-red-500/10 text-red-300 px-3 py-2 text-sm">
                        {errorMsg}
                    </p>
                )}
                {successMsg && (
                    <p className="rounded-lg bg-green-500/10 text-green-400 px-3 py-2 text-sm">
                        {successMsg}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={
                        submitting ||
                        !oldPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        !passwordsMatch
                    }
                    className="w-full rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? "Zapisywanie…" : "Zapisz nowe hasło"}
                </button>
            </form>
        </section>
    );
};

export default PasswordSection;
