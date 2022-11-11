import { useState } from "react";
import type { FormEvent } from "react";

type Specs = {
  length: number;
  securityLevel: number;
};

const UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const SYMBOLS = "!@#$%^&*()<>,.?/[]{}-=_+|/";
const NUMBERS = "0123456789";

function generatePassword({ length, securityLevel }: Specs) {
  const ops = length;
  let password = "";

  if (securityLevel >= 1) {
    for (let i = 0; i < ops; i++) {
      password +=
        LOWERCASE_LETTERS[Math.floor(Math.random() * LOWERCASE_LETTERS.length)];
    }
  }
  if (securityLevel >= 2) {
    for (let i = 0; i < ops; i++) {
      password +=
        UPPERCASE_LETTERS[Math.floor(Math.random() * UPPERCASE_LETTERS.length)];
    }
  }
  if (securityLevel >= 3) {
    for (let i = 0; i < ops; i++) {
      password += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    }
  }
  if (securityLevel >= 4) {
    for (let i = 0; i < ops; i++) {
      password += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }
  }

  const startIndex = Math.floor(Math.random() * (password.length - length));
  console.log({ startIndex, password: password.length });
  return password
    .split("")
    .sort(() => (Math.random() > 0.5 ? 1 : -1))
    .join("")
    .substring(startIndex, startIndex + length);
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const value = window.localStorage.getItem(key);

    if (!value) window.localStorage.setItem(key, JSON.stringify(initialValue));

    return value ? (JSON.parse(value) as T) : initialValue;
  });

  const setData = (data: T) => {
    setValue(data);
    window.localStorage.setItem(key, JSON.stringify(data));
  };

  return {
    data: value,
    setData,
  };
}

export default function HomeCard() {
  const [securityLevel, setSecurityLevel] = useState<number>(1);
  const [length, setLength] = useState<number>(3);
  const [password, setPassword] = useState<string>("password");
  const [show, setShow] = useState<boolean>(false);

  const { data: prevPasswords, setData } = useLocalStorage<string[]>(
    "passwords",
    []
  );

  const handleValidation = (stringValue: string) => {
    console.log({ stringValue });
    if (stringValue.length === 0) {
      setLength(0);
      return;
    }
    if (isNaN(Number(stringValue))) return;
    setLength(Number(stringValue));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPassword(generatePassword({ length, securityLevel }));

    const newPrevPasswords = [...prevPasswords, password];

    setData(newPrevPasswords);
  };

  const handleBadge = () => {
    setShow(true);

    setTimeout(() => {
      setShow(false);
    }, 1000);
  };

  return (
    <div className="p-3 max-w-[700px] w-full rounded-xl bg-slate-300 border-opacity-40 border-black shadow-md">
      <h1 className="text-4xl text-center mb-4 font-bold">
        GENERA TU CONTRASEÑA
      </h1>
      <div className="flex gap-3 flex-col-reverse md:flex-row">
        <div className="flex flex-col justify-between md:max-w-[30%] gap-3">
          <div>
            <h2 className="font-semibold">CONTRASEÑAS PREVIAS:</h2>
            <ul className="overflow-y-auto max-h-full">
              {prevPasswords.length === 0 && (
                <p className="">Aun no generaste ninguna contraseña</p>
              )}
              {prevPasswords.map((p) => (
                <li
                  key={p}
                  className="border border-black rounded my-1 px-1 cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(p)}
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <button
            className="bg-red-600 text-white p-2 rounded"
            onClick={() => setData([])}
          >
            Borrar contraseñas
          </button>
        </div>
        <div className="flex-grow">
          <form
            className="w-full max-w-[450px] mx-auto flex flex-col gap-3"
            onSubmit={handleSubmit}
          >
            <div className="flex w-full justify-center items-center border border-black border-opacity-30 rounded p-3">
              <label className="w-[90%] text-xl font-semibold">
                CANTIDAD DE CARACTERES:
              </label>
              <input
                type="text"
                value={length}
                onChange={(e) => handleValidation(e.currentTarget.value)}
                className="w-[20%] p-2 rounded-lg text-center font-semibold"
              />
            </div>
            <div className="flex flex-col gap-3 border border-black border-opacity-30 rounded p-3">
              <label className="w-[90%] text-xl font-semibold">
                NIVEL DE SEGURIDAD:
              </label>
              <input
                type="range"
                className="w-full p-2"
                value={securityLevel}
                onChange={(e) =>
                  setSecurityLevel(e.currentTarget.valueAsNumber)
                }
                min={1}
                max={5}
              />
            </div>
            <input
              type="submit"
              value="GENERAR"
              className="p-3 rounded-lg bg-slate-500 shadow-md text-white font-semibold text-lg"
            />
          </form>
          <div className="text-3xl p-2 mt-2 mx-auto max-w-[450px] bg-white rounded-xl flex justify-between items-center relative">
            <div></div>
            <p className="">{password}</p>
            <img
              src="copy.png"
              className="h-7 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(password);
                handleBadge();
              }}
            />
            <div
              className="absolute text-sm bg-slate-200 py-1 px-2 rounded-3xl right-[-10px] top-[-20px] transition"
              hidden={!show}
            >
              <h4>copiado</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
