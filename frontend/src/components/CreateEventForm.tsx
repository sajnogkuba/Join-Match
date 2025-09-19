import { useEffect, useState } from 'react';
import StarRatingInput from "./StarRatingInput";
import Checkbox from "./Checkbox";
import axios from 'axios';
import type { SportType } from '../Api/types/SportType.ts';
import type { SportObject } from '../Api/types/SportObject.ts';

const card =
  "bg-black border border-gray-600 rounded-xl px-4 pt-2 pb-4";

export default function CreateEventForm() {
  const [level, setLevel] = useState(1);
  const [free, setFree] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [price, setPrice] = useState<number | "">(0);
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [sportObjects, setSportObjects] = useState<SportObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get<SportType[]>('http://localhost:8080/api/sport-type')
      .then(response => {
        setSportTypes(response.data);
      })
      .catch(err => {
        setError('Nie udało się pobrać wydarzeń. Spróbuj ponownie później.');
        console.error('Error fetching events:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axios.get<SportObject[]>('http://localhost:8080/api/sport-object')
      .then(response => {
        setSportObjects(response.data);
      })
      .catch(err => {
        setError('Nie udało się pobrać wydarzeń. Spróbuj ponownie później.');
        console.error('Error fetching events:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-10 px-4 mx-auto max-w-6xl">
      <h1 className='text-3xl font-bold text-white mb-3'>
        <span className='text-purple-500'>Stwórz</span> nowe wydarzenie
      </h1>
      <form className="space-y-4">
        {/* GRID: 1 / 2 / 3 kolumny */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {/* Nazwa wydarzenia */}
          <div className={card}>
            <label className="text-gray-400 text-sm mb-1 block" htmlFor="eventName">
              Nazwa wydarzenia:
            </label>
            <input
              type="text"
              id="eventName"
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              placeholder="Wpisz nazwę wydarzenia"
            />
          </div>

          {/* Sport */}
          <div className={`${card}`}>
            <label className="text-gray-400 text-sm mb-1 block" htmlFor="sport">
              Sport:
            </label>
            <select
              id="sport"
              name="sport"
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              defaultValue=""
            >
              <option value="" disabled>Wybierz sport</option>
              {sportTypes.map((sportType) => (
                <option key={sportType.id} value={sportType.id}>
                  {sportType.name}
                </option>
              ))}
            </select>
          </div>


        {/* Minimalny stopień zaawansowania */}
        <div className={card}>
          <StarRatingInput
            label="Minimalny stopień zaawansowania:"
            value={level}
            onChange={setLevel}
            max={5}
            size={30}
          />
        </div>

        {/* Bezpłatny udział */}
        <div className={`${card} flex items-center`}>
          <Checkbox
            id="isFree"
            label="Bezpłatny udział:"
            checked={free}
            onChange={(checked) => {
              setFree(checked);
              if (checked) setPrice(0);
            }}
          />
        </div>

        {/* Cena */}
        <div className={card}>
          <label className="text-gray-400 text-sm mb-1 block" htmlFor="price">
            Cena (PLN):
          </label>
          <input
            type="number"
            id="price"
            value={free ? 0 : price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            disabled={free}
            className="w-full p-2 border border-gray-300 rounded bg-gray-100
                         disabled:bg-gray-300 disabled:text-gray-500
                         disabled:border-gray-400 disabled:cursor-not-allowed"
            placeholder="Podaj cenę"
            min={0}
            step="0.01"
            inputMode="decimal"
          />
        </div>

        {/* Maks. liczba uczestników */}
        <div className={card}>
          <label className="text-gray-400 text-sm mb-1 block" htmlFor="maxParticipants">
            Maksymalna liczba uczestników:
          </label>
          <input
            type="number"
            id="maxParticipants"
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            placeholder="Np. 10"
            min={1}
            step={1}
          />
        </div>

        {/* Prywatność */}
        <div className={`${card} flex items-center`}>
          <Checkbox
            id="isPrivate"
            label="Wydarzenie prywatne:"
            checked={isPrivate}
            onChange={setIsPrivate}
          />
        </div>

        {/* Data (na md zajmie jedną kolumnę, na xl też – możesz dać col-span-2 jeśli chcesz dłuższe) */}
        <div className={`${card}`}>
          <label className="text-gray-400 text-sm mb-1 block" htmlFor="eventDate">
            Data wydarzenia:
          </label>
          <input
            type="date"
            id="eventDate"
            className="w-full p-2 border border-gray-300 rounded bg-white"
          />
        </div>

        <div className={`${card}`}>
          <label className="text-gray-400 text-sm mb-1 block" htmlFor="place">
            Miejsce:
          </label>
          <select
            id="place"
            name="place"
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            defaultValue=""
          >
            <option value="" disabled>Wybierz miejsce</option>
            {sportObjects.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.name}, {obj.city}, {obj.street} {obj.number}{obj.secondNumber ? `/${obj.secondNumber}` : ''}
              </option>
            ))}
          </select>
        </div>
    </div>

{/* Przycisk */
}
  <div className="pt-2">
    <button
      type="submit"
      className="bg-purple-600 text-white px-8 py-2 rounded hover:bg-purple-700 transition-colors w-full"
    >
      Stwórz Wydarzenie
    </button>
  </div>
</form>
</div>
)
  ;
}
