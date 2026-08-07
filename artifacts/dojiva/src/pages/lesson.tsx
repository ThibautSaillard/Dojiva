import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetLesson, getGetLessonQueryKey, useCompleteLesson, useGetProgress, getGetProgressQueryKey, getListWorldsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CandleChart } from "@/components/CandleChart";

function ChartQuizChart({ chart }: { chart: string }) {
  let candles: { o: number; h: number; l: number; c: number }[] = [];
  try {
    const parsed = JSON.parse(chart);
    if (Array.isArray(parsed)) candles = parsed;
  } catch {
    return null;
  }
  if (!candles.length) return null;
  return <CandleChart candles={candles} />;
}
import { PremiumGate } from "@/components/PremiumGate";
import { ArrowRight, X, Check, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Lesson() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  
  const lessonId = parseInt(id || "0", 10);
  const { data: lesson, isLoading } = useGetLesson(lessonId, { query: { enabled: !!lessonId, queryKey: getGetLessonQueryKey(lessonId) } });
  const { data: progress } = useGetProgress();
  const queryClient = useQueryClient();

  const completeLesson = useCompleteLesson({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWorldsQueryKey() });
        setTimeout(() => setLocation("/academie"), 1500);
      }
    }
  });

  if (isLoading || !lesson || !progress) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!lesson.free && !progress.premium) {
    return <PremiumGate />;
  }

  const currentStep = lesson.steps[stepIndex];
  const isLastStep = stepIndex === lesson.steps.length - 1;
  const progressPercent = ((stepIndex) / lesson.steps.length) * 100;

  const handleAction = () => {
    if (feedback !== null) {
      // Move to next step or complete
      if (isLastStep) {
        completeLesson.mutate({
          id: lessonId,
          data: { score, total: lesson.steps.filter(s => s.type !== "info").length }
        });
      } else {
        setStepIndex(stepIndex + 1);
        setSelectedOption(null);
        setFeedback(null);
      }
    } else {
      // Validate answer
      if (currentStep.type === "info") {
        if (isLastStep) {
          completeLesson.mutate({
            id: lessonId,
            data: { score, total: lesson.steps.filter(s => s.type !== "info").length }
          });
        } else {
          setStepIndex(stepIndex + 1);
        }
      } else {
        if (selectedOption === currentStep.correctIndex) {
          setFeedback("correct");
          setScore(score + 1);
        } else {
          setFeedback("wrong");
        }
      }
    }
  };

  if (completeLesson.isPending || completeLesson.isSuccess) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-6">
          <Check className="w-12 h-12 text-success" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Bien joué.</h2>
        <p className="text-xl text-muted-foreground text-success">+{lesson.xpReward} XP gagnés</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans text-foreground">
      <header className="px-6 py-4 flex items-center gap-4">
        <button onClick={() => setLocation("/academie")} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col justify-center">
        <div className="mb-10 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">{currentStep.prompt}</h2>
          {currentStep.body && (
            <p className="text-lg text-muted-foreground whitespace-pre-wrap">{currentStep.body}</p>
          )}
        </div>

        {currentStep.type === "chart-quiz" && currentStep.chart && (
          <div className="mb-8 p-4 rounded-xl bg-card border border-border">
            <ChartQuizChart chart={currentStep.chart} />
          </div>
        )}

        {(currentStep.type === "quiz" || currentStep.type === "chart-quiz") && currentStep.options && (
          <div className="space-y-3">
            {currentStep.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = feedback && i === currentStep.correctIndex;
              const isWrongSelected = feedback === "wrong" && isSelected;

              return (
                <button
                  key={i}
                  disabled={feedback !== null}
                  onClick={() => setSelectedOption(i)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                    isCorrect ? "border-success bg-success/10 text-success" :
                    isWrongSelected ? "border-destructive bg-destructive/10 text-destructive" :
                    isSelected ? "border-primary bg-primary/10" :
                    "border-border bg-card hover:border-primary/50",
                    feedback !== null && !isCorrect && !isWrongSelected ? "opacity-50" : ""
                  )}
                >
                  <span className="font-semibold text-lg">{opt}</span>
                  {isCorrect && <Check className="w-5 h-5" />}
                  {isWrongSelected && <X className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        )}
      </main>

      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-4 sm:p-6 border-t transition-colors",
        feedback === "correct" ? "bg-success/10 border-success/20" :
        feedback === "wrong" ? "bg-destructive/10 border-destructive/20" :
        "bg-background border-border"
      )}>
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            {feedback === "correct" && (
              <div>
                <div className="text-xl font-bold text-success flex items-center gap-2 mb-1">
                  <Check className="w-6 h-6" /> Exactement.
                </div>
                {currentStep.explanation && <p className="text-sm text-success/80">{currentStep.explanation}</p>}
              </div>
            )}
            {feedback === "wrong" && (
              <div>
                <div className="text-xl font-bold text-destructive flex items-center gap-2 mb-1">
                  <X className="w-6 h-6" /> Pas grave. Regarde pourquoi.
                </div>
                {currentStep.explanation && <p className="text-sm text-destructive/80">{currentStep.explanation}</p>}
              </div>
            )}
          </div>
          
          <button
            onClick={handleAction}
            disabled={currentStep.type !== "info" && selectedOption === null}
            className={cn(
              "py-4 px-8 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50",
              feedback === "correct" ? "bg-success text-success-foreground" :
              feedback === "wrong" ? "bg-destructive text-destructive-foreground" :
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {feedback !== null ? "Continuer" : "Valider"}
            {feedback !== null && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
