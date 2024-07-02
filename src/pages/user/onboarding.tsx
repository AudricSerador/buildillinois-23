import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/auth/auth.service";
import { dietaryPreferences, allergens } from "@/components/icon_legend";
import Image from "next/image";

const StepButton = ({ onClick, text, disabled }: { onClick: () => void; text: string; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-primary fixed w-1/3 max-w-48 rounded-full bottom-8 right-8 ${disabled ? "btn-disabled opacity-50 cursor-not-allowed" : ""}`}
  >
    {text}
  </button>
);

const BackButton = ({ step, handleBack }: { step: number; handleBack: () => void }) => {
  return (
    <>
      {step > 1 && (
        <button
          onClick={handleBack}
          className="btn btn-secondary fixed w-1/3 rounded-full max-w-48 z-50 bottom-8 left-8"
        >
          Back
        </button>
      )}
    </>
  );
};

const StepLayout = ({ children, step, handleBack }: { children: React.ReactNode; step: number; handleBack: () => void }) => (
  <div className="flex flex-col font-custom items-center justify-center min-h-screen">
    <div className="w-full flex items-center justify-center h-16 mt-4 top-0 fixed">
      <ul className="steps">
        <li className={`step ${step >= 1 && "step-primary"}`}>Name</li>
        <li className={`step ${step >= 2 && "step-primary"}`}>Allergens</li>
        <li className={`step ${step >= 3 && "step-primary"}`}>Restrictions</li>
        <li className={`step ${step >= 4 && "step-primary"}`}>Location</li>
        <li className={`step ${step >= 5 && "step-primary"}`}>Goals</li>
        <li className="step">Finish</li>
      </ul>
    </div>
    {children}
  </div>
);

export default function Onboarding(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  useEffect(() => {
    if (user && !user.isNew) {
      router.push("/user/dashboard");
    } else if (!user) {
      router.push("/login");
    }
  }, [user]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleToggle = (selectedItems: string[], setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setSelectedItems(
      selectedItems.includes(item)
        ? selectedItems.filter((i) => i !== item)
        : [...selectedItems, item]
    );
  };

  const handleOnboardingCompletion = () => {
    if (user) {
      fetch("/api/user/update_user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          name,
          allergies: selectedAllergens.join(','),
          preferences: selectedPreferences.join(','),
          isNew: false,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            router.push("/user/dashboard");
          } else {
            console.error(data.error);
          }
        });
    } else {
      console.error("User not found");
    }
  };

  return (
    <StepLayout step={step} handleBack={handleBack}>
      {step === 1 && (
        <div className="flex flex-wrap text-center justify-center px-6">
          <h3 className="text-5xl text-center font-custombold mb-4">What is your name?</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="mb-4 w-full p-2 text-center border border-gray-300 rounded"
          />
          <StepButton onClick={handleNext} text="Next" disabled={!name} />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-wrap text-center justify-center">
          <h3 className="text-5xl font-custombold mb-4">Do you have any allergies?</h3>
          <div className="flex flex-wrap justify-center px-6">
            {allergens.map(({ src, label }) => (
              <button
                key={label}
                onClick={() => handleToggle(selectedAllergens, setSelectedAllergens, label)}
                className={`inline-flex items-center justify-center rounded-full py-2 px-6 m-2 text-sm font-medium w-36 ${selectedAllergens.includes(label) ? "bg-uiucorange text-white" : "bg-clouddark text-gray-700"} transition-colors duration-200`}
              >
                <Image src={src} alt={label} width={24} height={24} className="mr-2" />
                {label}
              </button>
            ))}
          </div>
          <BackButton step={step} handleBack={handleBack} />
          <StepButton onClick={handleNext} text="Next" />
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-wrap text-center justify-center">
          <h3 className="text-5xl w-full text-center font-custombold mb-4">Do you have any dietary restrictions?</h3>
          <div className="flex flex-wrap justify-center">
            {dietaryPreferences.map(({ src, label }) => (
              <button
                key={label}
                onClick={() => handleToggle(selectedPreferences, setSelectedPreferences, label)}
                className={`flex flex-col items-center justify-center border border-gray-300 rounded m-2 w-40 h-40 ${selectedPreferences.includes(label) ? "bg-uiucorange text-white" : "bg-gray-200 text-gray-700"} transition-colors duration-200`}
              >
                <Image src={src} alt={label} width={72} height={72} className="mb-2" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <BackButton step={step} handleBack={handleBack} />
          <StepButton onClick={handleOnboardingCompletion} text="Finish" />
        </div>
      )}
    </StepLayout>
  );
}
