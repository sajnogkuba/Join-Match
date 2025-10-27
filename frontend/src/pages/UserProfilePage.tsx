import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Api/axios";
import type { UsersResponse } from "../Api/types/User";
import { UserPlus, UserMinus } from "lucide-react";

interface FriendStatus {
  isFriend: boolean;
  pendingRequestId?: number;
}

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>({
    isFriend: false,
  });

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !id) return;

    api
      .get("/auth/user", { params: { token } })
      .then(({ data }) => setCurrentUserId(data.id))
      .catch(() => setErrorMsg("Nie udało się pobrać danych użytkownika."));

    api
      .get(`/auth/user/${id}`)
      .then(({ data }) => setUser(data))
      .catch(() => setErrorMsg("Nie udało się pobrać profilu."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!currentUserId || !id) return;
    api
      .get(`/friends/${currentUserId}`)
      .then(({ data }) => {
        const isFriend = data.some((f: any) => f.id === parseInt(id ?? "0"));
        setFriendStatus({ isFriend });
      })
      .catch(() => console.warn("Nie udało się sprawdzić statusu znajomości"));
  }, [currentUserId, id]);

  const handleAddFriend = async () => {
    if (!currentUserId || !id) return;
    try {
      await api.post("/friends/request", {
        senderId: currentUserId,
        receiverId: parseInt(id ?? "0"),
      });
      setFriendStatus({ isFriend: false, pendingRequestId: -1 });
    } catch {
      setErrorMsg("Nie udało się wysłać zaproszenia.");
    }
  };

  const handleRemoveFriend = async () => {
    if (!currentUserId || !id) return;
    try {
      const res = await api.get(`/friends/${currentUserId}`);
      const friendship = res.data.find(
        (f: any) => f.id === parseInt(id ?? "0")
      );
      if (friendship) {
        await api.delete(`/friends/${friendship.friendshipId}`);
        setFriendStatus({ isFriend: false });
      }
    } catch {
      setErrorMsg("Nie udało się usunąć znajomego.");
    }
  };

  if (loading) return <div className="p-10 text-center text-zinc-400">Ładowanie profilu...</div>;
  if (errorMsg) return <div className="p-10 text-center text-red-400">{errorMsg}</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1f2632] text-zinc-300">
      <header className="relative h-[180px] md:h-[220px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1600&auto=format&fit=crop)",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-6 md:px-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white">
              Profil użytkownika
            </h1>
            <div className="mt-2 h-1 w-32 rounded-full bg-violet-600" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="rounded-3xl bg-black/60 p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-zinc-800 flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center md:w-1/3 text-center">
            <img
              src={user.urlOfPicture || "https://placehold.co/200x200"}
              alt={user.name}
              className="w-40 h-40 rounded-full object-cover border-4 border-violet-600 mb-4"
            />
            <h2 className="text-xl font-semibold text-white">{user.name}</h2>
            <p className="text-sm text-zinc-400">{user.email}</p>

            <div className="mt-6 flex flex-col gap-3 w-full">
              {!friendStatus.isFriend && friendStatus.pendingRequestId !== -1 && (
                <button
                  onClick={handleAddFriend}
                  className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition"
                >
                  <UserPlus size={18} /> Dodaj do znajomych
                </button>
              )}
              {friendStatus.pendingRequestId === -1 && (
                <p className="text-green-400 font-medium">
                  Zaproszenie wysłane!
                </p>
              )}
              {friendStatus.isFriend && (
                <button
                  onClick={handleRemoveFriend}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                >
                  <UserMinus size={18} /> Usuń znajomego
                </button>
              )}
            </div>
          </div>

          {/* Dane użytkownika */}
          <div className="flex-1 space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">O użytkowniku</h3>
              <p className="text-zinc-400">
                Data urodzenia:{" "}
                {new Date(user.dateOfBirth).toLocaleDateString("pl-PL")}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Sporty i poziomy</h3>
              {user.sports.length ? (
                <ul className="space-y-3">
                  {user.sports.map((sport) => (
                    <li
                      key={sport.id}
                      className="flex items-center justify-between bg-zinc-800/50 px-4 py-2 rounded-lg"
                    >
                      <span>{sport.name}</span>
                      <span className="text-violet-400 font-medium">
                        {sport.level || "brak danych"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500 text-sm">Brak dodanych sportów.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;