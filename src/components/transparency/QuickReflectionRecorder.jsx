import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Type, Clock, Tag, Send, X, Sparkles } from 'lucide-react';
import { recordSageStance as recordReflectionAdded } from '../../Lib/sageMemoryEngine.js';

const QuickReflectionRecorder = ({ isOpen, onClose, onSave }) => {
  const [reflectionText, setReflectionText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [attachTo, setAttachTo] = useState('none');
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState(4);
  const [inputMode, setInputMode] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const emotions = [
    { id: 'confused', label: 'Confused', emoji: '🌀', color: 'text-yellow-400' },
    { id: 'growing', label: 'Growing', emoji: '🌱', color: 'text-green-400' },
    { id: 'motivated', label: 'Motivated', emoji: '🔥', color: 'text-red-400' },
    { id: 'heavy', label: 'Heavy', emoji: '🌊', color: 'text-blue-400' },
    { id: 'aware', label: 'Aware', emoji: '🧭', color: 'text-purple-400' },
    { id: 'grateful', label: 'Grateful', emoji: '✨', color: 'text-pink-400' }
  ];

  const attachOptions = [
    { value: 'none', label: 'No attachment' },
    { value: 'current_decision', label: 'Current decision process' },
    { value: 'recent_conversation', label: 'Recent conversation with Sage' },
    { value: 'life_project', label: 'General life project' }
  ];

  const reminderOptions = [
    { value: 1, label: '1 hour' },
    { value: 4, label: '4 hours' },
    { value: 8, label: '8 hours' },
    { value: 24, label: '1 day' }
  ];

  useEffect(() => {
    if (isOpen) {
      setIsExpanded(true);
      setTimeout(() => {
        const textInput = document.getElementById('reflection-input');
        if (textInput) textInput.focus();
      }, 300);
    } else {
      setIsExpanded(false);
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setReflectionText(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        setRecordingTime(0);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setRecordingTime(0);
      };
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetForm = () => {
    setReflectionText('');
    setSelectedEmotion('');
    setAttachTo('none');
    setEnableReminder(false);
    setReminderTime(4);
    setInputMode('text');
    setIsRecording(false);
    setRecordingTime(0);
    setIsSaving(false);
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setRecordingTime(0);
      recognitionRef.current.start();
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

  const handleSubmit = async () => {
    if (!reflectionText.trim()) return;
    setIsSaving(true);

    const reflection = {
      id: Date.now().toString(),
      text: reflectionText.trim(),
      emotion: selectedEmotion,
      attachedTo: attachTo,
      timestamp: new Date().toISOString(),
      inputMode,
      reminder: enableReminder ? {
        enabled: true,
        hours: reminderTime,
        scheduledFor: new Date(Date.now() + reminderTime * 60 * 60 * 1000).toISOString()
      } : null
    };

    const existingReflections = JSON.parse(localStorage.getItem('brahma-quick-reflections') || '[]');
    existingReflections.unshift(reflection);
    localStorage.setItem('brahma-quick-reflections', JSON.stringify(existingReflections));

    if (enableReminder) {
      const reminders = JSON.parse(localStorage.getItem('brahma-reminders') || '[]');
      reminders.push({
        id: `reflection-${reflection.id}`,
        type: 'reflection_followup',
        message: `Time to reflect again: "${reflection.text.substring(0, 50)}..."`,
        scheduledFor: reflection.reminder.scheduledFor,
        reflectionId: reflection.id
      });
      localStorage.setItem('brahma-reminders', JSON.stringify(reminders));
    }

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // 🔗 Tell Sage to update its own memory (automatic growth)
    recordReflectionAdded();

    onSave?.(reflection);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen && !isExpanded) return null;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ease-out ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-md w-80">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-medium text-white">Quick Reflection</h3>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4 bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setInputMode('text')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${inputMode === 'text' ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
              >
                <Type className="w-4 h-4" />
                Text
              </button>
              <button
                onClick={() => setInputMode('voice')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${inputMode === 'voice' ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
              >
                <Mic className="w-4 h-4" />
                Voice
              </button>
            </div>

            <div className="mb-4">
              {inputMode === 'text' ? (
                <textarea
                  id="reflection-input"
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="What just shifted for you?"
                  className="w-full h-24 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                />
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-300">Voice Input</span>
                    {isRecording && (
                      <span className="text-sm text-purple-400 font-mono">{formatRecordingTime(recordingTime)}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-center mb-3">
                    <button
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                      {isRecording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 text-center">{isRecording ? 'Listening... Tap to stop' : 'Tap to start speaking'}</p>

                  {reflectionText && (
                    <div className="mt-3 p-2 bg-white/5 rounded-lg">
                      <p className="text-sm text-gray-200">{reflectionText}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.id}
                    onClick={() => setSelectedEmotion(selectedEmotion === emotion.id ? '' : emotion.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${selectedEmotion === emotion.id ? 'bg-purple-500/30 text-white border border-purple-400' : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border border-white/20'}`}
                  >
                    <span>{emotion.emoji}</span>
                    <span>{emotion.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Attach to</label>
              <select
                value={attachTo}
                onChange={(e) => setAttachTo(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {attachOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">{option.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Set reminder</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableReminder}
                    onChange={(e) => setEnableReminder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {enableReminder && (
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(parseInt(e.target.value))}
                  className="w-full bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {reminderOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      Remind me in {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!reflectionText.trim() || isSaving}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Capture Reflection
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickReflectionRecorder;