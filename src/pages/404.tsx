import { useRouter } from "next/router";

export default function Error404() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="font-custombold text-4xl font-bold mb-4">
        404 - Page Not Found
      </h1>
      <p className="font-custom text-xl mb-8">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <button
        className="font-custom px-4 py-2 text-xl bg-uiucorange text-white rounded hover:bg-uiucblue focus:outline-none"
        onClick={() => (window.location.href = "/")}
      >
        Go to Home
      </button>
    </div>
  );
}
