import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/layout/auth.service";
import { dietaryPreferences, allergens, locationPreferences } from "@/components/icon_legend";
import Image from "next/image";
import Select from 'react-select';
import { generateRecommendations } from "@/utils/create_recommendation";

const dietaryGoalOptions = [
  { value: "bulk", label: "I want to bulk/build muscle" },
  { value: "lose_weight", label: "I want to lose weight/get leaner" },
  { value: "eat_healthy", label: "I want to eat healthy in general" },
  { value: "other", label: "Other/None" },
];

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

const StepLayout = ({ children, step, handleBack, fadeClass }: { children: React.ReactNode; step: number; handleBack: () => void, fadeClass: string }) => (
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
    <div className={`transition-container ${fadeClass}`}>
      {children}
    </div>
  </div>
);

export default function Onboarding(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0); // Start at step 0 for the welcome screen
  const [name, setName] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<{ value: string; label: string } | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [showWelcomeText, setShowWelcomeText] = useState(false);
  const [showAdditionalText, setShowAdditionalText] = useState(false);

  useEffect(() => {
    if (user && !user.isNew) {
      router.push("/user/dashboard");
    } else if (!user) {
      router.push("/login");
    } else {
      setTimeout(() => {
        setShowWelcomeText(true);
        setTimeout(() => {
          setShowAdditionalText(true);
          setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
              setStep(1);
              setIsFading(false);
            }, 300); // Duration should match the CSS transition duration
          }, 2000); // Show the additional text for 1 second
        }, 3000); // Delay before showing the additional text
      }, 100); // Delay before showing the welcome text
    }
  }, [user]);

  const handleNext = () => {
    setIsFading(true);
    setTimeout(() => {
      setStep(step + 1);
      setIsFading(false);
    }, 300); // Duration should match the CSS transition duration
  };

  const handleBack = () => {
    setIsFading(true);
    setTimeout(() => {
      setStep(step - 1);
      setIsFading(false);
    }, 300); // Duration should match the CSS transition duration
  };

  const handleToggle = (selectedItems: string[], setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setSelectedItems(
      selectedItems.includes(item)
        ? selectedItems.filter((i) => i !== item)
        : [...selectedItems, item]
    );
  };

  const handleOnboardingCompletion = async () => {
    if (user) {
      const response = await fetch("/api/user/update_user", {
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
          locations: selectedLocations.join(','),
          goal: selectedGoal ? selectedGoal.value : null,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        generateRecommendations(user.id);
        router.push("/user/dashboard");
      } else {
        console.error(data.error);
      }
    } else {
      console.error("User not found");
    }
  };

  return (
    <StepLayout step={step} handleBack={handleBack} fadeClass={isFading ? 'fade-out' : 'fade-in'}>
      {step === 0 && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className={`text-6xl font-custombold text-center mb-4 transition-opacity duration-1000 ${showWelcomeText ? 'opacity-100' : 'opacity-0'}`}>
            Welcome to <span className="text-secondary">IllinEats!</span>
          </h1>
          <h2 className={`text-4xl font-semibold text-center mt-2 transition-opacity duration-1000 ${showAdditionalText ? 'opacity-100' : 'opacity-0'}`}>
            Let&apos;s answer a couple questions.
          </h2>
        </div>
      )}
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
          <p className="w-full text-center">Don&apos;t see your food allergy? Please let us know in the feedback form!</p>
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
          <p className="w-full text-center">Don&apos;t see your dietary restriction? Please let us know in the feedback form!</p>
          <BackButton step={step} handleBack={handleBack} />
          <StepButton onClick={handleNext} text="Next" />
        </div>
      )}

      {step == 4 && (
        <div className="flex flex-wrap text-center justify-center">
          <h3 className="text-5xl w-full text-center font-custombold mb-4">Any location preferences?</h3>
          <div className="flex flex-wrap justify-center">
            {locationPreferences.map(({ src, label }) => (
              <button
                key={label}
                onClick={() => handleToggle(selectedLocations, setSelectedLocations, label)}
                className={`flex flex-col items-center justify-center border border-gray-300 rounded m-2 w-40 h-40 ${selectedLocations.includes(label) ? "bg-uiucorange text-white" : "bg-gray-200 text-gray-700"} transition-colors duration-200`}
              >
                <Image src={src} alt={label} width={72} height={72} className="mb-2" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <BackButton step={step} handleBack={handleBack} />
          <StepButton onClick={handleNext} text="Next" />
        </div>
      )}

      {step == 5 && (
        <div className="flex flex-wrap text-center justify-center">
          <h3 className="text-5xl w-full text-center font-custombold mb-4">What are your goals?</h3>
          <p className="w-full text-center">We&apos;ll use this information to recommend meals that align with your goals.</p>
          <Select 
            options={dietaryGoalOptions}
            onChange={(option) => setSelectedGoal(option)}
            value={selectedGoal}
            placeholder="Select a goal"
            className="w-full max-w-xs mx-auto mt-4"
          />
          <BackButton step={step} handleBack={handleBack} />
          <StepButton onClick={handleOnboardingCompletion} text="Finish" disabled={!selectedGoal} />
        </div>
      )}
    </StepLayout>
  );
}
