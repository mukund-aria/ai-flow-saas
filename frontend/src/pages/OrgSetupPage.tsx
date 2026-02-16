/**
 * Org Setup Page
 *
 * Moxo-inspired animated walkthrough shown after creating a new organization.
 * Each scene has a live mini-UI animation demonstrating the product concept.
 * 4 scenes + final frame, then redirects to /home.
 *
 * Title + progress bar stay fixed. Scene content slides in from the left;
 * exiting content slides out to the right.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

// ============================================================================
// Scene Configuration
// ============================================================================

const SCENES = [
  {
    title: 'Build',
    subtitle: 'Create your process with AI or drag & drop.',
  },
  {
    title: 'Execute',
    subtitle: 'Start flows manually or through automated triggers.',
  },
  {
    title: 'Coordinate',
    subtitle: 'Monitor and manage active flows.',
  },
  {
    title: 'Assignee Experience',
    subtitle: 'Participants complete actions in a simple, guided interface.',
  },
];

const SCENE_DURATION = 9000;
const FINAL_FRAME_DURATION = 4000;
const INITIAL_DELAY = 1500;

// ============================================================================
// Scene 1: Build — AI prompt + flow generation
// ============================================================================

function BuildAnimation() {
  const [typedText, setTypedText] = useState('');
  const [showFlow, setShowFlow] = useState(false);
  const fullText = 'Create a client onboarding process';

  useEffect(() => {
    let i = 0;
    const typeTimer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(typeTimer);
        setTimeout(() => setShowFlow(true), 300);
      }
    }, 45);
    return () => clearInterval(typeTimer);
  }, []);

  const steps = [
    { label: 'Kickoff', color: 'bg-violet-500', delay: '0s' },
    { label: 'Collect Info', color: 'bg-green-500', delay: '0.15s' },
    { label: 'Review', color: 'bg-blue-500', delay: '0.3s' },
    { label: 'E-Sign', color: 'bg-pink-500', delay: '0.45s' },
    { label: 'Complete', color: 'bg-amber-500', delay: '0.6s' },
  ];

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Chat input mockup */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3 h-3 text-violet-600" />
          </div>
          <span className="text-sm text-gray-800 truncate">{typedText}</span>
          <span className="w-0.5 h-4 bg-violet-600 animate-typing-cursor flex-shrink-0" />
        </div>
      </div>

      {/* Generated flow steps */}
      {showFlow && (
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className="animate-slide-up flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2 shadow-sm"
              style={{ animationDelay: step.delay }}
            >
              <div className={`w-2 h-2 rounded-full ${step.color} flex-shrink-0`} />
              <span className="text-xs font-medium text-gray-700">{step.label}</span>
              {i < steps.length - 1 && (
                <div className="ml-auto w-4 h-px bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Scene 2: Execute — Publish + triggers
// ============================================================================

function ExecuteAnimation() {
  const [published, setPublished] = useState(false);
  const [showTriggers, setShowTriggers] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPublished(true), 800);
    const t2 = setTimeout(() => setShowTriggers(true), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const triggers = [
    { label: 'Manual', icon: '▶' },
    { label: 'Form', icon: '📋' },
    { label: 'Webhook', icon: '🔗' },
    { label: 'Schedule', icon: '📅' },
  ];

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Publish button */}
      <div className="flex justify-center mb-5">
        <button
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-500 ${
            published
              ? 'bg-green-500 text-white shadow-md shadow-green-500/20 scale-105'
              : 'bg-violet-600 text-white shadow-sm'
          }`}
        >
          {published ? 'Published' : 'Publish'}
        </button>
      </div>

      {/* Status badge */}
      {published && (
        <div className="animate-fade-in flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
            Active
          </span>
        </div>
      )}

      {/* Trigger options */}
      {showTriggers && (
        <div className="grid grid-cols-2 gap-2">
          {triggers.map((trigger, i) => (
            <div
              key={trigger.label}
              className="animate-slide-up bg-white rounded-lg border border-gray-100 px-3 py-2.5 text-center shadow-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-base mb-1">{trigger.icon}</div>
              <div className="text-xs font-medium text-gray-600">{trigger.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Scene 3: Coordinate — Dashboard with live progress
// ============================================================================

function CoordinateAnimation() {
  const flows = [
    { name: 'Client Onboarding', progress: 75, status: 'On track', statusColor: 'text-green-600 bg-green-50' },
    { name: 'Invoice Approval', progress: 40, status: '2h left', statusColor: 'text-amber-600 bg-amber-50' },
    { name: 'Employee Review', progress: 90, status: 'On track', statusColor: 'text-green-600 bg-green-50' },
  ];

  return (
    <div className="w-full max-w-xs mx-auto space-y-2.5">
      {flows.map((flow, i) => (
        <div
          key={flow.name}
          className="animate-slide-up bg-white rounded-lg border border-gray-100 px-3.5 py-3 shadow-sm"
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-800">{flow.name}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${flow.statusColor}`}>
              {flow.status}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full animate-fill-bar"
              style={{
                '--fill-to': `${flow.progress}%`,
                animationDelay: `${i * 0.2 + 0.3}s`,
              } as React.CSSProperties}
            />
          </div>
        </div>
      ))}

      {/* AI suggestion */}
      <div
        className="animate-slide-up bg-violet-50 rounded-lg border border-violet-100 px-3.5 py-2.5"
        style={{ animationDelay: '0.8s' }}
      >
        <div className="flex items-start gap-2">
          <Zap className="w-3.5 h-3.5 text-violet-600 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-violet-700 leading-relaxed">
            Invoice Approval is approaching its SLA. Consider reassigning.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Scene 4: Assignee Experience — Mobile task completion
// ============================================================================

function AssigneeAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1800);
    const t3 = setTimeout(() => setStep(3), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="w-full max-w-[200px] mx-auto">
      {/* Phone frame */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
        {/* Status bar */}
        <div className="bg-gray-50 px-3 py-1.5 flex items-center justify-between border-b border-gray-100">
          <span className="text-[9px] font-medium text-gray-400">9:41</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-1.5 bg-gray-300 rounded-sm" />
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          </div>
        </div>

        <div className="px-3 py-3 min-h-[180px]">
          {/* Notification */}
          {step >= 0 && (
            <div className="animate-slide-in-right bg-violet-50 rounded-lg px-2.5 py-2 mb-3 border border-violet-100">
              <p className="text-[10px] font-medium text-violet-800">New task assigned</p>
              <p className="text-[9px] text-violet-600 mt-0.5">Complete onboarding form</p>
            </div>
          )}

          {/* Form fields filling in */}
          {step >= 1 && (
            <div className="animate-fade-in space-y-2 mb-3">
              <div>
                <div className="text-[9px] text-gray-500 mb-0.5">Company</div>
                <div className="h-5 bg-gray-50 rounded border border-gray-200 px-1.5 flex items-center">
                  <span className="text-[10px] text-gray-700 animate-fade-in" style={{ animationDelay: '0.3s' }}>Acme Corp</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 mb-0.5">Contact</div>
                <div className="h-5 bg-gray-50 rounded border border-gray-200 px-1.5 flex items-center">
                  <span className="text-[10px] text-gray-700 animate-fade-in" style={{ animationDelay: '0.5s' }}>jane@acme.com</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit + checkmark */}
          {step >= 2 && (
            <div className="animate-fade-in">
              <button className={`w-full py-1.5 rounded-lg text-[10px] font-medium transition-all duration-500 ${
                step >= 3
                  ? 'bg-green-500 text-white'
                  : 'bg-violet-600 text-white'
              }`}>
                {step >= 3 ? 'Submitted' : 'Submit'}
              </button>
            </div>
          )}

          {step >= 3 && (
            <div className="flex justify-center mt-2.5">
              <div className="animate-check-pop w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Scene Components Map
// ============================================================================

const SCENE_ANIMATIONS = [BuildAnimation, ExecuteAnimation, CoordinateAnimation, AssigneeAnimation];

// ============================================================================
// Main Page
// ============================================================================

export function OrgSetupPage() {
  const navigate = useNavigate();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isFinal, setIsFinal] = useState(false);
  const [showScenes, setShowScenes] = useState(false);
  // Track transition state: 'enter' | 'exit' | null
  const [transition, setTransition] = useState<'enter' | 'exit' | null>(null);
  const pendingSceneRef = useRef<number | null>(null);

  // Brief pause showing only the title before scene content appears
  useEffect(() => {
    const delay = setTimeout(() => {
      setShowScenes(true);
      setTransition('enter');
    }, INITIAL_DELAY);
    return () => clearTimeout(delay);
  }, []);

  // Advance scenes with exit → enter transition
  useEffect(() => {
    if (!showScenes) return;
    const timer = setInterval(() => {
      if (sceneIndex >= SCENES.length - 1) {
        clearInterval(timer);
        return;
      }
      // Start exit animation
      setTransition('exit');
      pendingSceneRef.current = sceneIndex + 1;
      // After exit completes, switch scene and enter
      setTimeout(() => {
        setSceneIndex(pendingSceneRef.current!);
        setTransition('enter');
      }, 400);
    }, SCENE_DURATION);
    return () => clearInterval(timer);
  }, [showScenes, sceneIndex]);

  // Show final frame after last scene
  useEffect(() => {
    if (sceneIndex === SCENES.length - 1 && showScenes) {
      const timeout = setTimeout(() => setIsFinal(true), SCENE_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [sceneIndex, showScenes]);

  // Redirect after final frame
  useEffect(() => {
    if (isFinal) {
      const timeout = setTimeout(() => navigate('/home'), FINAL_FRAME_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [isFinal, navigate]);

  const totalSteps = SCENES.length + 1;
  const currentStep = isFinal ? totalSteps : sceneIndex + 1;
  const progress = showScenes ? (currentStep / totalSteps) * 100 : 5;

  // Final frame
  if (isFinal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div key="final" className="animate-scene-enter text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your organization is ready!</h1>
          <p className="mt-2 text-gray-500">Build, run, and manage human + AI workflows</p>
        </div>
      </div>
    );
  }

  const scene = SCENES[sceneIndex];
  const AnimationComponent = SCENE_ANIMATIONS[sceneIndex];
  const transitionClass = transition === 'enter'
    ? 'animate-scene-enter'
    : transition === 'exit'
      ? 'animate-scene-exit'
      : 'opacity-0';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-sm text-center">
        {/* Fixed: Title — always visible, always same position */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Setting up your organization...</h1>

        {/* Fixed: Progress bar — always visible, always same position */}
        <div className="w-full max-w-xs mx-auto h-1 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Fixed: Step dots — always visible, always same position */}
        <div className="flex justify-center gap-2 mb-8">
          {SCENES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === sceneIndex
                  ? 'bg-violet-600 w-6'
                  : i < sceneIndex
                    ? 'bg-violet-300 w-1.5'
                    : 'bg-gray-200 w-1.5'
              }`}
            />
          ))}
        </div>

        {/* Sliding content area — always reserves space to prevent layout shift */}
        <div className="min-h-[340px] overflow-hidden">
          {showScenes && (
            <div key={sceneIndex} className={transitionClass}>
              {/* Scene title + subtitle */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-violet-600">{scene.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{scene.subtitle}</p>
              </div>

              {/* Live animation */}
              <AnimationComponent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
