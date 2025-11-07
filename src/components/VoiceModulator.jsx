// src/components/VoiceModulator.jsx (ENHANCED FINAL SCROLLABLE VERSION)

import React, { useEffect } from 'react';
import { X, Mic, Sliders, Zap, Volume, Headset } from 'lucide-react';

const VoiceModulator = ({ isOpen, onClose }) => {
    const [voiceModel, setVoiceModel] = React.useState('Brahma-2.1');
    const [tonality, setTonality] = React.useState('Empathetic');
    const [latency, setLatency] = React.useState(200);
    const [whisperMode, setWhisperMode] = React.useState(false);
    const [callByName, setCallByName] = React.useState(true);

    useEffect(() => {
        const settings = JSON.parse(localStorage.getItem("sage_voice_settings"));
        if (settings) {
            setVoiceModel(settings.voiceModel || 'Brahma-2.1');
            setTonality(settings.tonality || 'Empathetic');
            setLatency(settings.latency || 200);
            setWhisperMode(settings.whisperMode || false);
            setCallByName(settings.callByName ?? true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("sage_voice_settings", JSON.stringify({
            voiceModel,
            tonality,
            latency,
            whisperMode,
            callByName
        }));
    }, [voiceModel, tonality, latency, whisperMode, callByName]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-900 border border-purple-700/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-purple-700/50 bg-purple-900/30">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-400" /> Voice Modulator
                    </h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 128px)' }}>
                    <Section title="Voice Model & Persona">
                        <SelectRow label="Current Model" value={voiceModel} onChange={setVoiceModel} options={['Brahma-2.1', 'Brahma-1.0 (Low Latency)', 'Custom User Voice']} />
                        <SelectRow label="Tonality Profile" value={tonality} onChange={setTonality} options={['Empathetic', 'Analytical', 'Slightly Playful', 'Muted/Neutral']} />
                    </Section>

                    <Section title="Performance & Latency">
                        <SliderRow label="Latency Tolerance" value={latency} onChange={setLatency} min={100} max={500} step={50} unit="ms" desc="Lower latency prioritizes speed; higher tolerance improves voice quality." />
                        <ToggleRow label="Enable Low-Bandwidth Mode" value={false} onChange={() => console.log("Low-Bandwidth Toggle")} />
                    </Section>

                    <Section title="Whisper Mode (Privacy)">
                        <ToggleRow label="Whisper Mode Enabled" value={whisperMode} onChange={() => setWhisperMode(v => !v)} desc="If enabled, voice responses will be quieter and utilize a neural whisper model when ambient noise is detected." />
                        <ToggleRow label="Call User by Name" value={callByName} onChange={() => setCallByName(v => !v)} desc="Adds your name when Sage responds aloud. Example: 'Yes, Eric?' instead of just 'Yes.'" />
                        <button onClick={() => alert("Calibrating Whisper Profile...")} className="mt-3 w-full py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-white text-sm flex items-center justify-center gap-2">
                            <Mic className="w-4 h-4" /> Calibrate Whisper Profile
                        </button>
                    </Section>

                    <Section title="Output Volume & EQ" icon={Volume}>
                        <SliderRow label="Volume Level" value={80} onChange={() => {}} min={0} max={100} step={1} unit="%" desc="Overall output volume relative to system settings." />
                        <SelectRow label="Acoustic Profile" value="Standard" onChange={() => {}} options={['Standard', 'Headphones (Enhanced Bass)', 'Room Speakers (Clear Voice)']} />
                    </Section>

                    <Section title="Input Recognition Settings" icon={Headset}>
                        <ToggleRow label="Text Ears Sensitivity (Auto-Dictation)" value={true} onChange={() => {}} desc="Adjusts how aggressively Brahma detects dictation intent from ambient speech." />
                        <SelectRow label="Active Language Model" value="en-US" onChange={() => {}} options={['en-US', 'en-GB', 'es-US', 'fr-FR']} />
                    </Section>
                </div>

                <div className="px-6 py-4 border-t border-purple-700/50 flex justify-end">
                    <button onClick={onClose} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition">
                        Apply & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Components
function Section({ title, children, icon: Icon = Sliders }) {
    return (
        <section className="pb-4 border-b border-white/5 last:border-b-0">
            <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                <Icon className="w-4 h-4" /> {title}
            </h3>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

function ToggleRow({ label, value, onChange, desc }) {
    return (
        <div className="flex flex-col p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between">
                <span className="text-sm text-white">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={value} onChange={() => onChange(!value)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
            </div>
            {desc && <p className="text-xs text-gray-400 mt-1">{desc}</p>}
        </div>
    );
}

function SliderRow({ label, value, onChange, min, max, step, unit, desc }) {
    return (
        <div className="space-y-1 p-3 bg-white/5 border border-white/10 rounded-lg">
            <label className="text-sm text-white block">{label}</label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-purple-900 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-400 flex justify-between pt-1">
                <span className="max-w-[70%]">{desc}</span>
                <span className="font-medium text-white">{value}{unit}</span>
            </div>
        </div>
    );
}

function SelectRow({ label, value, onChange, options }) {
    return (
        <div className="space-y-1">
            <label className="text-sm text-white block">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 border border-white/10 rounded-lg px-3 py-2 text-sm w-full bg-white/10 text-white"
            >
                {options.map(opt => (
                    <option key={opt} value={opt} className="bg-gray-800 text-white">{opt}</option>
                ))}
            </select>
        </div>
    );
}

export default VoiceModulator;