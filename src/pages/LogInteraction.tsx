import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Send,
  Upload,
  Sparkles,
  Trash2,
  Plus,
  X,
  FileCheck,
  Bot,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { RootState } from '../redux/store';
import {
  addInteraction,
  saveDraft,
  clearDraft,
  updateDraftField
} from '../redux/slices/interactionSlice';
import { updateHcpLastInteraction } from '../redux/slices/hcpSlice';
import { addMessage, setTyping } from '../redux/slices/chatSlice';
import { addNotification } from '../redux/slices/uiSlice';
import { SearchableSelect, Dropdown } from '../components/Dropdown';
import { DatePicker, TimePicker } from '../components/DatePicker';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import ChatBubble from '../components/ChatBubble';
import { MOCK_MATERIALS, MOCK_PRODUCTS } from '../utils/mockData';

export const LogInteraction: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hcpList = useSelector((state: RootState) => state.hcp.list);
  const draft = useSelector((state: RootState) => state.interaction.draft);
  const { history: chatHistory, isTyping, suggestedPrompts } = useSelector((state: RootState) => state.chat);

  const [chatInput, setChatInput] = useState('');
  const [attendeeInput, setAttendeeInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  
  // Voice note mock states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  // Dynamic samples state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [sampleQty, setSampleQty] = useState(5);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Map HCPs to dropdown format
  const hcpOptions = hcpList.map((hcp) => ({
    value: hcp.id,
    label: `${hcp.name} (${hcp.specialization} - ${hcp.hospital})`,
  }));

  const interactionTypes = [
    { value: 'In-Person', label: 'In-Person Visit' },
    { value: 'Video Call', label: 'Video Call (Zoom/Teams)' },
    { value: 'Phone Call', label: 'Phone Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Seminar', label: 'Seminar/Roundtable' },
  ];

  // Helper to handle form field changes
  const handleFieldChange = (field: keyof typeof draft, value: any) => {
    dispatch(updateDraftField({ field, value }));
  };

  // Add items list helper
  const addAttendee = () => {
    if (attendeeInput.trim() && !draft.attendees.includes(attendeeInput.trim())) {
      handleFieldChange('attendees', [...draft.attendees, attendeeInput.trim()]);
      setAttendeeInput('');
    }
  };

  const removeAttendee = (name: string) => {
    handleFieldChange('attendees', draft.attendees.filter((att) => att !== name));
  };

  const addTopic = (topic: string) => {
    if (topic.trim() && !draft.topicsDiscussed.includes(topic.trim())) {
      handleFieldChange('topicsDiscussed', [...draft.topicsDiscussed, topic.trim()]);
      setTopicInput('');
    }
  };

  const removeTopic = (topic: string) => {
    handleFieldChange('topicsDiscussed', draft.topicsDiscussed.filter((t) => t !== topic));
  };

  const toggleMaterial = (materialName: string) => {
    const isShared = draft.materialsShared.includes(materialName);
    const newMaterials = isShared
      ? draft.materialsShared.filter((m) => m !== materialName)
      : [...draft.materialsShared, materialName];
    handleFieldChange('materialsShared', newMaterials);
  };

  const addSample = () => {
    if (!selectedProduct) return;
    const existingIdx = draft.samplesDistributed.findIndex((s) => s.productName === selectedProduct);
    let updatedSamples = [...draft.samplesDistributed];
    
    if (existingIdx > -1) {
      updatedSamples[existingIdx] = {
        productName: selectedProduct,
        quantity: updatedSamples[existingIdx].quantity + Number(sampleQty),
      };
    } else {
      updatedSamples.push({ productName: selectedProduct, quantity: Number(sampleQty) });
    }
    
    handleFieldChange('samplesDistributed', updatedSamples);
    setSelectedProduct('');
  };

  const removeSample = (productName: string) => {
    handleFieldChange('samplesDistributed', draft.samplesDistributed.filter((s) => s.productName !== productName));
  };

  // voice note upload mock
  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVoiceFile(e.target.files[0]);
      handleFieldChange('voiceNoteUrl', 'mock_voice_recording.mp3');
      handleFieldChange('voiceNoteDuration', '0:42');
      dispatch(addNotification({
        title: 'Voice Note Uploaded',
        message: `File ${e.target.files[0].name} uploaded successfully. Click "Summarize Voice Note" to extract fields using AI.`,
        type: 'info',
      }));
    }
  };

  // Voice summarization mock execution
  const triggerVoiceSummarize = () => {
    if (!draft.voiceNoteUrl) {
      alert('Please upload or record a voice note first.');
      return;
    }
    
    setIsTranscribing(true);
    
    setTimeout(() => {
      setIsTranscribing(false);
      
      // Auto-populate form based on a mock voice summary from Dr. Anita Desai meeting
      const sampleDoctor = hcpList.find(h => h.id === 'hcp-2') || hcpList[1];
      
      dispatch(updateDraftField({ field: 'hcpId', value: sampleDoctor.id }));
      dispatch(updateDraftField({ field: 'hcpName', value: sampleDoctor.name }));
      dispatch(updateDraftField({ field: 'type', value: 'Video Call' }));
      dispatch(updateDraftField({ field: 'attendees', value: ['Amit Kumar (Rep)', 'Dr. Anita Desai'] }));
      dispatch(updateDraftField({ field: 'topicsDiscussed', value: ['GliclaCare Phase III Trial Summary', 'Diabetes Cardiovascular Safety'] }));
      dispatch(updateDraftField({ field: 'sentiment', value: 'Neutral' }));
      dispatch(updateDraftField({ field: 'materialsShared', value: ['GliclaCare XR Clinical Trial Summary (Phase III)'] }));
      dispatch(updateDraftField({ field: 'outcome', value: 'Discussed GliclaCare XR Phase III cardiovascular safety study. Dr. Desai was cautious and requested a digital copy of the cardiovascular outcome trial report to review.' }));
      dispatch(updateDraftField({ field: 'followUpActions', value: 'Email the full cardiovascular safety trial PDF. Schedule a video review session in 2 weeks.' }));
      dispatch(updateDraftField({ field: 'aiSuggestedFollowUps', value: ['Email cardiovascular trials report PDF', 'Follow up via call in 14 days'] }));

      dispatch(addNotification({
        title: 'Voice Note Transcribed',
        message: 'Successfully filled HCP Name, Topics, Sentiment, Outcome, and Follow Ups using Voice AI.',
        type: 'success',
      }));

      dispatch(addMessage({
        sender: 'assistant',
        text: "I've successfully processed your voice note and filled out the form on the left for Dr. Anita Desai. Please check it and hit Submit!"
      }));

    }, 2000);
  };

  // Send message to AI Assistant
  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    dispatch(addMessage({ sender: 'user', text: textToSend }));
    setChatInput('');
    dispatch(setTyping(true));

    setTimeout(() => {
      dispatch(setTyping(false));
      
      const query = textToSend.toLowerCase();
      let reply = "I'm listening. Could you please specify the details of the interaction so I can help fill the form?";
      
      if (query.includes('sharma') || query.includes('sharma today')) {
        const sharma = hcpList.find(h => h.id === 'hcp-1') || hcpList[0];
        
        // Auto fill form
        dispatch(updateDraftField({ field: 'hcpId', value: sharma.id }));
        dispatch(updateDraftField({ field: 'hcpName', value: sharma.name }));
        dispatch(updateDraftField({ field: 'type', value: 'In-Person' }));
        dispatch(updateDraftField({ field: 'attendees', value: ['Amit Kumar (Rep)', 'Dr. Ramesh Sharma'] }));
        dispatch(updateDraftField({ field: 'topicsDiscussed', value: ['CardioSart HCT Efficacy', 'Hypertension Patient Compliance'] }));
        dispatch(updateDraftField({ field: 'sentiment', value: 'Positive' }));
        dispatch(updateDraftField({ field: 'samplesDistributed', value: [{ productName: 'CardioSart HCT (Hypertension)', quantity: 20 }] }));
        dispatch(updateDraftField({ field: 'outcome', value: 'Presented CardioSart compliance studies. Dr. Sharma was pleased with the patient retention metrics and will prescribe to 10 new patients.' }));
        dispatch(updateDraftField({ field: 'followUpActions', value: 'Deliver brand brochures to clinic reception next week.' }));
        dispatch(updateDraftField({ field: 'aiSuggestedFollowUps', value: ['Deliver physical brochures', 'Confirm brochure receipt'] }));

        reply = `Certainly! I've extracted the detailing logs and auto-filled the form for **Dr. Ramesh Sharma**:
- **HCP**: Dr. Ramesh Sharma
- **Type**: In-Person Visit
- **Topics**: CardioSart HCT Efficacy
- **Sentiment**: Positive
- **Samples**: 20 CardioSart HCT items
- **Follow-up**: Deliver brochures to reception.
Please review the updated fields on the left.`;
      } 
      else if (query.includes('summarize') || query.includes('summary')) {
        reply = `Here is a summary of the current draft details:
- Doctor: ${draft.hcpName || 'Not Selected'}
- Discussion Topics: ${draft.topicsDiscussed.join(', ') || 'None'}
- Sentiment Vibe: ${draft.sentiment}
- Follow-up: ${draft.followUpActions || 'No actions noted yet'}`;
      } 
      else if (query.includes('follow') || query.includes('create follow')) {
        if (!draft.followUpActions) {
          dispatch(updateDraftField({ field: 'followUpActions', value: 'Follow up in 2 weeks to discuss sample feedback.' }));
        }
        dispatch(updateDraftField({ field: 'aiSuggestedFollowUps', value: ['Follow up call in 2 weeks', 'Check sample feedback'] }));
        reply = `I have updated the suggested follow-up chips and populated the actions field for you:
- **Actions**: "Follow up in 2 weeks to discuss sample feedback."
- **AI Chips**: Created 2 suggested action chips.`;
      }

      dispatch(addMessage({ sender: 'assistant', text: reply }));
    }, 1500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.hcpId) {
      alert('Please select a Healthcare Professional first.');
      return;
    }

    const doctor = hcpList.find(h => h.id === draft.hcpId);
    const finalDraft = {
      ...draft,
      hcpName: doctor ? doctor.name : draft.hcpName
    };

    dispatch(addInteraction(finalDraft));
    if (doctor) {
      dispatch(updateHcpLastInteraction({ id: doctor.id, date: draft.date }));
    }

    dispatch(addNotification({
      title: 'Interaction Logged',
      message: `Successfully logged meeting details with ${finalDraft.hcpName}.`,
      type: 'success',
    }));

    dispatch(clearDraft());
    navigate('/interactions');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-full items-start">
      
      {/* Left Column - Form Details (70% width on large screens) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <form onSubmit={handleFormSubmit}>
          <Card premium className="p-6 flex flex-col gap-6">
            
            {/* Header section */}
            <div className="border-b border-slate-50 pb-4 flex justify-between items-center select-none">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-brand-500" />
                  HCP Interaction Details
                </h2>
                <p className="text-xs text-slate-400 mt-1">Fill out the fields or use the AI Copilot on the right to auto-populate the details.</p>
              </div>
              <Badge variant="primary" className="text-[10px] font-bold">New Form</Badge>
            </div>

            {/* HCP searchable select */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect
                label="HCP Name (Searchable Select)"
                options={hcpOptions}
                value={draft.hcpId}
                onChange={(val) => {
                  const doc = hcpList.find(h => h.id === val);
                  handleFieldChange('hcpId', val);
                  handleFieldChange('hcpName', doc ? doc.name : '');
                }}
                placeholder="Search and select doctor name..."
              />

              <Dropdown
                label="Interaction Type"
                options={interactionTypes}
                value={draft.type}
                onChange={(val) => handleFieldChange('type', val)}
              />
            </div>

            {/* Date and time picker */}
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label="Meeting Date"
                value={draft.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
              />
              <TimePicker
                label="Meeting Time"
                value={draft.time}
                onChange={(e) => handleFieldChange('time', e.target.value)}
              />
            </div>

            {/* Attendees chip area */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-end">
                <Input
                  label="Attendees Present"
                  placeholder="Enter attendee name..."
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                  containerClassName="flex-1"
                />
                <Button type="button" variant="outline" onClick={addAttendee} className="px-3 py-2.5 h-10 select-none">
                  Add
                </Button>
              </div>
              {draft.attendees.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                  {draft.attendees.map((att, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-xs font-semibold px-2 py-0.5 rounded-md text-slate-700">
                      {att}
                      <button type="button" onClick={() => removeAttendee(att)} className="text-slate-400 hover:text-slate-655">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Topics Discussed input */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-end">
                <Input
                  label="Topics Discussed"
                  placeholder="e.g. CardioSart Efficacy, Sample Trials..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic(topicInput))}
                  containerClassName="flex-1"
                />
                <Button type="button" variant="outline" onClick={() => addTopic(topicInput)} className="px-3 py-2.5 h-10 select-none">
                  Add
                </Button>
              </div>
              
              {/* Hot suggestions */}
              <div className="flex flex-wrap gap-1">
                {['CardioSart HCT Efficacy', 'GliclaCare XR Trial Results', 'Pediatrix Multi-V Dosage', 'DermaSoothe Safety Sheet'].map((tOpt) => (
                  <button
                    key={tOpt}
                    type="button"
                    onClick={() => addTopic(tOpt)}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                  >
                    + {tOpt}
                  </button>
                ))}
              </div>

              {draft.topicsDiscussed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                  {draft.topicsDiscussed.map((topic, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-xs font-semibold px-2 py-0.5 rounded-md text-slate-700">
                      {topic}
                      <button type="button" onClick={() => removeTopic(topic)} className="text-slate-400 hover:text-slate-655">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Note Section */}
            <div className="p-4 rounded-xl border border-slate-200/60 bg-blue-50/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 text-blue-650 flex items-center justify-center shrink-0">
                  <Mic className="h-5 w-5 text-brand-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Voice Note Assistant</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">Record or upload meeting dictation to auto-fill form.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <input
                  type="file"
                  id="voice-upload"
                  accept="audio/*"
                  onChange={handleVoiceUpload}
                  className="hidden"
                />
                
                <label
                  htmlFor="voice-upload"
                  className="px-3.5 py-2 border border-slate-200 rounded-lg bg-white text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {voiceFile ? 'Change File' : 'Upload Audio'}
                </label>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerVoiceSummarize}
                  isLoading={isTranscribing}
                  className="bg-brand-500 text-white hover:bg-brand-600 hover:text-white border-brand-500 flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Summarize Voice
                </Button>
              </div>
            </div>

            {/* Materials Shared checklist */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700 select-none">Materials Shared</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50/30">
                {MOCK_MATERIALS.map((mat) => {
                  const isChecked = draft.materialsShared.includes(mat.name);
                  return (
                    <label key={mat.id} className="flex items-start gap-2.5 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMaterial(mat.name)}
                        className="rounded border-slate-300 text-brand-500 focus:ring-brand-500 mt-0.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-700 font-semibold leading-tight">{mat.name}</span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">{mat.type}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Samples Distributed */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold text-slate-700 select-none">Samples Distributed</label>
              
              <div className="flex flex-col sm:flex-row gap-2.5 items-end bg-slate-50/30 border border-slate-100 p-3.5 rounded-lg">
                <Dropdown
                  label="Select Product Sample"
                  options={MOCK_PRODUCTS.map((p) => ({ value: p.name, label: p.name }))}
                  value={selectedProduct}
                  placeholder="Select product..."
                  onChange={(val) => setSelectedProduct(val)}
                  containerClassName="flex-grow"
                />

                <Input
                  label="Quantity"
                  type="number"
                  min={1}
                  value={sampleQty}
                  onChange={(e) => setSampleQty(Number(e.target.value))}
                  containerClassName="w-24 shrink-0"
                />

                <Button type="button" onClick={addSample} variant="outline" className="px-4 py-2.5 h-10 select-none shrink-0 bg-white">
                  Add Sample
                </Button>
              </div>

              {draft.samplesDistributed.length > 0 && (
                <div className="flex flex-col gap-1.5 bg-white border border-slate-100 rounded-lg p-2 shadow-sm max-w-md">
                  {draft.samplesDistributed.map((sm, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-50 text-xs">
                      <span className="font-semibold text-slate-700">{sm.productName}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="primary" className="font-bold">{sm.quantity} units</Badge>
                        <button type="button" onClick={() => removeSample(sm.productName)} className="text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sentiment checkboxes */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700 select-none">Observed HCP Sentiment</label>
              <div className="flex gap-4">
                {['Positive', 'Neutral', 'Negative'].map((sent) => (
                  <label key={sent} className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-655 text-slate-600">
                    <input
                      type="radio"
                      name="sentiment-radio"
                      checked={draft.sentiment === sent}
                      onChange={() => handleFieldChange('sentiment', sent)}
                      className="text-brand-500 focus:ring-brand-500 h-4.5 w-4.5"
                    />
                    <Badge
                      variant={
                        sent === 'Positive'
                          ? 'sentiment-positive'
                          : sent === 'Negative'
                          ? 'sentiment-negative'
                          : 'sentiment-neutral'
                      }
                      className="cursor-pointer"
                    >
                      {sent}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>

            {/* Outcome and followups */}
            <Textarea
              label="Meeting Discussion Outcome"
              placeholder="What was detailed? What was the HCP's response?"
              value={draft.outcome}
              onChange={(e) => handleFieldChange('outcome', e.target.value)}
            />

            <Textarea
              label="Follow-up Actions Required"
              placeholder="What are the immediate follow-up steps?"
              value={draft.followUpActions}
              onChange={(e) => handleFieldChange('followUpActions', e.target.value)}
            />

            {/* AI Suggested Follow Ups Chips */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold text-slate-700 select-none flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                AI Suggested Follow Ups
              </label>

              {draft.aiSuggestedFollowUps.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 bg-brand-50/10 border border-brand-100/40 rounded-xl">
                  {draft.aiSuggestedFollowUps.map((chip, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-white border border-brand-100 text-xs font-semibold px-3 py-1 rounded-lg text-brand-655 text-brand-600 shadow-sm"
                    >
                      {chip}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = draft.aiSuggestedFollowUps.filter((c) => c !== chip);
                          handleFieldChange('aiSuggestedFollowUps', updated);
                        }}
                        className="text-brand-405 hover:text-brand-700 text-brand-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 select-none leading-none">Use chat or voice assistant to generate chips.</span>
              )}
            </div>

            {/* Button Actions Footer */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-t border-slate-100 pt-5 mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  dispatch(clearDraft());
                  dispatch(addNotification({ title: 'Draft Reset', message: 'Cleared all fields.', type: 'info' }));
                }}
                className="text-slate-400 hover:text-slate-655 hover:bg-slate-50 flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Form
              </Button>

              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    dispatch(saveDraft(draft));
                    dispatch(addNotification({ title: 'Draft Saved', message: 'Interaction details stored locally.', type: 'success' }));
                  }}
                >
                  Save Draft
                </Button>
                <Button type="submit">
                  Submit Interaction
                </Button>
              </div>
            </div>

          </Card>
        </form>
      </div>

      {/* Right Column - Sticky AI Assistant (30% width on large screens) */}
      <div className="lg:col-span-3 lg:sticky lg:top-22 flex flex-col gap-4">
        <Card premium className="h-[calc(100vh-8.5rem)] flex flex-col overflow-hidden border border-brand-100 bg-[#FFFFFF]">
          {/* Header title */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5 select-none bg-slate-50/20">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                AI Copilot Assistant
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Log interaction naturally using AI</p>
            </div>
          </div>

          {/* Conversation history area */}
          <div className="flex-grow p-4 overflow-y-auto bg-slate-50/30 flex flex-col">
            <div className="flex-grow" />
            
            {chatHistory.map((msg) => (
              <ChatBubble
                key={msg.id}
                sender={msg.sender}
                text={msg.text}
                timestamp={msg.timestamp}
              />
            ))}

            {isTyping && (
              <ChatBubble
                sender="assistant"
                text="..."
                timestamp=""
                typing
              />
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested prompts list */}
          <div className="px-4 py-2 border-t border-slate-50 flex flex-col gap-1.5 select-none bg-white">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Suggested prompts</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 px-2.5 py-1.5 rounded-lg border border-slate-200/50 text-left transition-all truncate max-w-full"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom message input field */}
          <div className="p-3 border-t border-slate-100 flex items-end gap-2 bg-white">
            <div className="relative flex-grow flex items-center bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500 rounded-xl">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage(chatInput))}
                placeholder="Describe today's meeting..."
                className="w-full bg-transparent text-xs text-slate-800 px-3.5 py-3 focus:outline-none min-h-[40px] max-h-[100px] resize-none leading-relaxed placeholder-slate-400"
              />

              <button
                type="button"
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (!isRecording) {
                    dispatch(addNotification({
                      title: 'Microphone Active',
                      message: 'Simulating mic recording... Speak now.',
                      type: 'info'
                    }));
                  }
                }}
                className={`p-2 rounded-lg mr-1.5 shrink-0 transition-colors ${
                  isRecording
                    ? 'bg-rose-50 text-rose-500 animate-pulse'
                    : 'text-slate-400 hover:text-slate-655 hover:bg-slate-200/50'
                }`}
                title="Record Speech"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            <Button
              onClick={() => handleSendMessage(chatInput)}
              className="p-3 rounded-xl shadow-soft shrink-0 !h-10.5 !w-10.5 !p-0 inline-flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="h-4.5 w-4.5" />
            </Button>
          </div>

        </Card>
      </div>

    </div>
  );
};

export default LogInteraction;
