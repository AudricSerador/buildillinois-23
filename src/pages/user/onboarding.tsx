import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/auth/auth.service";
import { dietaryPreferences, allergens } from "@/components/icon_legend";
import Image from "next/image";

export default function Onboarding(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");

  useEffect(() => {
    if (user && !user.isNew) {
      router.push("/dashboard");
    }
  }, []);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleAllergenClick = (allergen: string) => {
    if (selectedAllergens.includes(allergen)) {
      setSelectedAllergens(selectedAllergens.filter((a) => a !== allergen));
    } else {
      setSelectedAllergens([...selectedAllergens, allergen]);
    }
  };

  const handleOnboardingCompletion = () => {
    if (user) {
      // Update the user object in the database
      fetch("/api/update_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          name,
          allergies,
          preferences,
          isNew: false,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            router.push("/dashboard");
          }
        });
    }
  };

  return (
    <div className="flex flex-col font-custom items-center justify-center min-h-screen">
      {step > 1 && (
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 fixed py-2 px-4 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          ←
        </button>
      )}

      {step === 1 && (
        <div>
          <h3 className="text-5xl font-custombold mb-4">What's your name?</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="mb-4 w-full p-2 text-center border border-gray-300 rounded"
          />
          <button
  onClick={handleNext}
  className="w-1/2 py-2 px-4 bg-uiucblue text-white rounded hover:bg-blue-900 fixed bottom-8 left-1/2 transform -translate-x-1/2"
>
  Next
</button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-wrap text-center justify-center">
          <h3 className="text-5xl font-custombold mb-4">
            Do you have any allergies?
          </h3>
          <div className="flex flex-wrap justify-center px-6">
            {allergens.map(({ src, label }) => (
              <button
                key={label}
                onClick={() => handleAllergenClick(label)}
                className={`inline-flex items-center justify-center rounded-full py-2 px-6 m-2 text-sm font-medium w-36 ${
                  selectedAllergens.includes(label)
                    ? "bg-uiucorange text-white"
                    : "bg-gray-200 text-gray-700"
                } transition-colors duration-200`}
              >
                <Image
                  src={src}
                  alt={label}
                  width={24}
                  height={24}
                  className="mr-2"
                />
                {label}
              </button>
            ))}
          </div>
          <button
  onClick={handleNext}
  className="w-1/2 py-2 px-4 bg-uiucblue text-white rounded hover:bg-blue-900 fixed bottom-8 left-1/2 transform -translate-x-1/2"
>
  Next
</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-5xl mb-4">What are your preferences?</h3>
          <input
            type="text"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Preferences"
            className="mb-4 w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleOnboardingCompletion}
            className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Complete Onboarding
          </button>
        </div>
      )}
    </div>
  );
}
