import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Send,
  Upload,
  Sparkles,
  Trash2,
  Plus,
  X,
  Bot,
  RefreshCw
} from 'lucide-react';
import { RootState, AppDispatch } from '../redux/store';
import {
  createInteractionThunk,
  clearDraft,
  updateDraftField,
  fetchInteractionsThunk
} from '../redux/slices/interactionSlice';
import { fetchHcpsThunk, createHcpThunk } from '../redux/slices/hcpSlice';
import { addMessage, processNotesThunk } from '../redux/slices/chatSlice';
import { addNotification } from '../redux/slices/uiSlice';
import { SearchableSelect, Dropdown } from '../components/Dropdown';
import { DatePicker, TimePicker } from '../components/DatePicker';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import ChatBubble from '../components/ChatBubble';
import Modal from '../components/Modal';


export const LogInteraction: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const hcpList = useSelector((state: RootState) => state.hcp.list);
  const draft = useSelector((state: RootState) => state.interaction.draft);
  const { history: chatHistory, isTyping, suggestedPrompts } = useSelector((state: RootState) => state.chat);
  const latestAiCard = [...chatHistory].reverse().find(msg => msg.isAiCard && msg.aiCardData?.success);

  const [chatInput, setChatInput] = useState('');
  const [attendeeInput, setAttendeeInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [materialInput, setMaterialInput] = useState('');
  
  // Voice note states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (isTyping || isTranscribing) {
      setLoadingStep(0);
      const timer = setInterval(() => {
        setLoadingStep(prev => (prev < 5 ? prev + 1 : prev));
      }, 750);
      return () => clearInterval(timer);
    } else {
      setLoadingStep(0);
    }
  }, [isTyping, isTranscribing]);


  // States for Add Doctor Modal
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [newHcpData, setNewHcpData] = useState({
    name: '',
    specialization: 'Cardiology',
    hospital: '',
    city: 'New Delhi',
    email: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
    notes: '',
  });
  const [hcpErrors, setHcpErrors] = useState<Record<string, string>>({});
  const [isHcpSubmitting, setIsHcpSubmitting] = useState(false);

  const SPECIALIZATIONS = ['Cardiology', 'Endocrinology', 'Pediatrics', 'Dermatology', 'Neurology', 'Oncology', 'General Medicine'];
  const CITIES = ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];

  const handleAddHcpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newHcpData.name.trim()) newErrors.name = 'Doctor name is required';
    if (!newHcpData.hospital.trim()) newErrors.hospital = 'Hospital name is required';
    if (!newHcpData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(newHcpData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!newHcpData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setHcpErrors(newErrors);
      return;
    }

    setHcpErrors({});
    setIsHcpSubmitting(true);

    try {
      await dispatch(createHcpThunk({
        name: newHcpData.name,
        specialization: newHcpData.specialization,
        hospital: newHcpData.hospital,
        city: newHcpData.city,
        email: newHcpData.email,
        phone: newHcpData.phone,
        status: newHcpData.status,
      })).unwrap();

      dispatch(addNotification({
        title: 'Doctor Added',
        message: `${newHcpData.name} has been added to target CRM list.`,
        type: 'success'
      }));

      // Reset and Close
      setNewHcpData({
        name: '',
        specialization: 'Cardiology',
        hospital: '',
        city: 'New Delhi',
        email: '',
        phone: '',
        status: 'Active',
        notes: '',
      });
      setIsAddDoctorModalOpen(false);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let errorMsg = 'Failed to create Healthcare Professional.';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map(d => d.msg).join(', ');
      } else if (err.message) {
        errorMsg = err.message;
      }
      setHcpErrors({ apiError: errorMsg });
    } finally {
      setIsHcpSubmitting(false);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // AI Filled highlighting states
  const [aiFilledFields, setAiFilledFields] = useState<Record<string, boolean>>({
    hcpId: false,
    date: false,
    type: false,
    topicsDiscussed: false,
    sentiment: false,
    materialsShared: false,
    samplesDistributed: false,
    followUpActions: false,
    outcome: false,
  });

  const renderAiHighlightWrapper = (fieldKey: keyof typeof aiFilledFields, label: string, children: React.ReactNode) => {
    const isFilled = aiFilledFields[fieldKey];
    return (
      <div className={`w-full p-2 rounded-xl transition-all duration-300 flex flex-col gap-1.5 ${
        isFilled 
          ? 'bg-emerald-50/30 border-2 border-emerald-500 shadow-sm' 
          : 'border border-transparent'
      }`}>
        <div className="flex justify-between items-center h-4 select-none">
          {label && (
            <label className="text-xs font-bold text-slate-700">
              {label}
            </label>
          )}
          {isFilled && (
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-250">
              <span>🤖 AI Filled</span>
            </span>
          )}
        </div>
        {children}
      </div>
    );
  };

  const addSampleRow = () => {
    handleFieldChange('samplesDistributed', [...draft.samplesDistributed, { productName: '', quantity: 5 }]);
    setAiFilledFields(prev => ({ ...prev, samplesDistributed: false }));
  };

  const updateSampleRow = (index: number, field: 'productName' | 'quantity', value: any) => {
    const updated = draft.samplesDistributed.map((sm, i) => {
      if (i === index) {
        return { ...sm, [field]: value };
      }
      return sm;
    });
    handleFieldChange('samplesDistributed', updated);
    setAiFilledFields(prev => ({ ...prev, samplesDistributed: false }));
  };

  const removeSampleRow = (index: number) => {
    const updated = draft.samplesDistributed.filter((_, i) => i !== index);
    handleFieldChange('samplesDistributed', updated);
    setAiFilledFields(prev => ({ ...prev, samplesDistributed: false }));
  };

  // Sync data on mount
  useEffect(() => {
    dispatch(fetchHcpsThunk());
    dispatch(fetchInteractionsThunk());
  }, [dispatch]);

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




  // voice note upload helper
  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVoiceFile(e.target.files[0]);
      handleFieldChange('voiceNoteUrl', 'mock_voice_recording.mp3');
      handleFieldChange('voiceNoteDuration', '0:42');
      dispatch(addNotification({
        title: 'Voice Note Uploaded',
        message: `File ${e.target.files[0].name} uploaded successfully. Click "Summarize Voice" to analyze with AI.`,
        type: 'info',
      }));
    }
  };

  // Voice summarization via FastAPI agent
  const triggerVoiceSummarize = async () => {
    if (!draft.voiceNoteUrl) {
      alert('Please upload or record a voice note first.');
      return;
    }
    
    setIsTranscribing(true);
    
    // Choose a doctor to mock details for the transcript
    const activeDoctor = hcpList[0] || { email: 'ramesh.sharma@fortis.com', name: 'Dr. Ramesh Sharma' };
    const transcriptionText = `Meeting Dictation transcript: Today I met ${activeDoctor.name} at their clinic. Their email is ${activeDoctor.email}. We discussed CardioSart patient compliance and efficacy studies. Doctor expressed a very positive sentiment regarding patient retention numbers and requested 20 samples. I promised to deliver follow up brochures to clinic reception.`;

    dispatch(addNotification({
      title: 'Transcribing Audio',
      message: 'Processing speech audio to text and executing CRM AI Agent...',
      type: 'info',
    }));

    try {
      const res = await dispatch(processNotesThunk(transcriptionText)).unwrap();
      const parsed = res.result?.parsed_data || {};
      const hasErrors = res.result?.errors && res.result.errors.length > 0;
      if (!hasErrors) {
        setAiFilledFields({
          hcpId: !!(res.matchedHcp || res.result?.hcp_id),
          date: !!parsed.meeting_date,
          type: !!parsed.interaction_type,
          topicsDiscussed: !!parsed.topics_discussed,
          sentiment: !!parsed.sentiment,
          materialsShared: !!parsed.materials_shared,
          samplesDistributed: !!(parsed.samples_distributed || transcriptionText.toLowerCase().includes('sample')),
          followUpActions: !!parsed.follow_up_actions,
          outcome: !!(parsed.discussion_outcome || parsed.topics_discussed),
        });
        
        // AI analysis complete — form populated. Do NOT save or redirect.
      }
      dispatch(addNotification({
        title: 'AI Processing Complete',
        message: `Successfully processed transcript for ${activeDoctor.name}.`,
        type: 'success',
      }));
    } catch (err: any) {
      dispatch(addNotification({
        title: 'AI Processing Error',
        message: err.message || 'Error occurred while running AI note analysis.',
        type: 'warning',
      }));
    } finally {
      setIsTranscribing(false);
    }
  };

  // Send note to AI Agent API
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    dispatch(addMessage({ sender: 'user', text: textToSend }));
    setChatInput('');

    try {
      const res = await dispatch(processNotesThunk(textToSend)).unwrap();
      const parsed = res.result?.parsed_data || {};
      const hasErrors = res.result?.errors && res.result.errors.length > 0;
      if (!hasErrors) {
        setAiFilledFields({
          hcpId: !!(res.matchedHcp || res.result?.hcp_id),
          date: !!parsed.meeting_date,
          type: !!parsed.interaction_type,
          topicsDiscussed: !!parsed.topics_discussed,
          sentiment: !!parsed.sentiment,
          materialsShared: !!parsed.materials_shared,
          samplesDistributed: !!(parsed.samples_distributed || textToSend.toLowerCase().includes('sample')),
          followUpActions: !!parsed.follow_up_actions,
          outcome: !!(parsed.discussion_outcome || parsed.topics_discussed),
        });
        // AI analysis complete — form populated. Do NOT save or redirect.
      }
    } catch (err) {
      console.error('Failed to process CRM notes:', err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.hcpId) {
      alert('Please select a Healthcare Professional first.');
      return;
    }

    const doctor = hcpList.find((h) => h.id === draft.hcpId);
    const finalDraft = {
      ...draft,
      hcpName: doctor ? doctor.name : draft.hcpName,
    };

    try {
      const newInteraction = await dispatch(createInteractionThunk(finalDraft)).unwrap();

      sessionStorage.setItem('newlyCreatedInteractionId', String(newInteraction.id));

      dispatch(addNotification({
        title: '✓ Interaction Saved Successfully',
        message: `Interaction with ${finalDraft.hcpName} has been logged and added to history.`,
        type: 'success',
      }));

      // Refresh the interactions list in the background
      dispatch(fetchInteractionsThunk() as any);

      // Clear AI highlight state so the form shows as clean
      setAiFilledFields({
        hcpId: false, date: false, type: false, topicsDiscussed: false,
        sentiment: false, materialsShared: false, samplesDistributed: false,
        followUpActions: false, outcome: false,
      });

      // Do NOT navigate away — user stays on Log Interaction page.
      // Reset draft so they can log another interaction if desired.
      dispatch(clearDraft());
    } catch (err: any) {
      alert(err.message || 'Failed to save interaction');
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header section (Full Width) */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex justify-between items-center select-none">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brand-500" />
            HCP Interaction Details
          </h2>
          <p className="text-xs text-slate-400 mt-1">Fill out the fields or use the AI Copilot on the right to auto-populate the details.</p>
        </div>
        <Badge variant="primary" className="text-[10px] font-bold">New Form</Badge>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* Left Column - Form Details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-6">

            {/* Section 1: Meeting & Doctor Details */}
            <div className="border border-slate-150 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 select-none">
                <Sparkles className="h-4 w-4 text-brand-500" />
                1. Doctor & Meeting Logistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderAiHighlightWrapper('hcpId', 'Doctor Name', (
                  <SearchableSelect
                    options={hcpOptions}
                    value={draft.hcpId}
                    onChange={(val) => {
                      const doc = hcpList.find(h => h.id === val);
                      handleFieldChange('hcpId', val);
                      handleFieldChange('hcpName', doc ? doc.name : '');
                      setAiFilledFields(prev => ({ ...prev, hcpId: false }));
                    }}
                    placeholder="Search and select doctor name..."
                  />
                ))}

                {renderAiHighlightWrapper('type', 'Interaction Type', (
                  <Dropdown
                    options={interactionTypes}
                    value={draft.type}
                    onChange={(val) => {
                      handleFieldChange('type', val);
                      setAiFilledFields(prev => ({ ...prev, type: false }));
                    }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {renderAiHighlightWrapper('date', 'Meeting Date', (
                  <DatePicker
                    value={draft.date}
                    onChange={(e) => {
                      handleFieldChange('date', e.target.value);
                      setAiFilledFields(prev => ({ ...prev, date: false }));
                    }}
                  />
                ))}
                
                <div className="w-full p-2 border border-transparent">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 select-none">Meeting Time</label>
                  <TimePicker
                    value={draft.time}
                    onChange={(e) => handleFieldChange('time', e.target.value)}
                  />
                </div>
              </div>

              <div className="p-2">
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
                  <div className="flex flex-wrap gap-1.5 p-2 mt-2 bg-slate-50 border border-slate-100 rounded-lg">
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
            </div>

            {/* Section 2: Discussion & Outcome */}
            <div className="border border-slate-150 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 select-none">
                <Mic className="h-4 w-4 text-brand-500" />
                2. Discussion Topics & Outcome
              </h3>

              {renderAiHighlightWrapper('topicsDiscussed', 'Topics Discussed', (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-end">
                    <Input
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
                  
                  {/* Suggested topics from AI (dynamic) — shown only when AI has populated topics */}
                  {aiFilledFields.topicsDiscussed && draft.topicsDiscussed.length > 0 && (
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span>🤖</span> AI extracted the topics below. Edit freely.
                    </p>
                  )}

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
              ))}

              {renderAiHighlightWrapper('outcome', 'Meeting Discussion Outcome', (
                <Textarea
                  placeholder="What was detailed? What was the HCP's response?"
                  value={draft.outcome}
                  onChange={(e) => {
                    handleFieldChange('outcome', e.target.value);
                    setAiFilledFields(prev => ({ ...prev, outcome: false }));
                  }}
                />
              ))}

              {renderAiHighlightWrapper('sentiment', 'Observed HCP Sentiment', (
                <div className="flex gap-4">
                  {['Positive', 'Neutral', 'Negative'].map((sent) => (
                    <label key={sent} className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                      <input
                        type="radio"
                        name="sentiment-radio"
                        checked={draft.sentiment === sent}
                        onChange={() => {
                          handleFieldChange('sentiment', sent);
                          setAiFilledFields(prev => ({ ...prev, sentiment: false }));
                        }}
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
              ))}
            </div>

            {/* Section 3: Product Detailings, Materials & Samples */}
            <div className="border border-slate-150 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 select-none">
                <Upload className="h-4 w-4 text-brand-500" />
                3. Product Detailing, Materials & Samples
              </h3>

              {renderAiHighlightWrapper('materialsShared', 'Materials Shared', (
                <div className="flex flex-col gap-3">
                  {/* AI-extracted materials shown as removable tags */}
                  {draft.materialsShared.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3 border border-slate-100 rounded-lg bg-slate-50/30">
                      {draft.materialsShared.map((mat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-white border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-md text-blue-700"
                        >
                          {mat}
                          <button
                            type="button"
                            onClick={() => handleFieldChange('materialsShared', draft.materialsShared.filter((_, i) => i !== idx))}
                            className="text-blue-300 hover:text-blue-600 ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add custom material */}
                  <div className="flex gap-2 items-end">
                    <Input
                      placeholder="Add material e.g. Journal Publication, Safety Bulletin…"
                      value={materialInput}
                      onChange={(e) => setMaterialInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = materialInput.trim();
                          if (val && !draft.materialsShared.includes(val)) {
                            handleFieldChange('materialsShared', [...draft.materialsShared, val]);
                            setMaterialInput('');
                          }
                        }
                      }}
                      containerClassName="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const val = materialInput.trim();
                        if (val && !draft.materialsShared.includes(val)) {
                          handleFieldChange('materialsShared', [...draft.materialsShared, val]);
                          setMaterialInput('');
                        }
                      }}
                      className="px-3 py-2.5 h-10 select-none"
                    >
                      Add
                    </Button>
                  </div>

                  {draft.materialsShared.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No materials added yet. Use AI Copilot or type above.</span>
                  )}
                </div>
              ))}

              {renderAiHighlightWrapper('samplesDistributed', 'Samples Distributed', (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                    <button
                      type="button"
                      onClick={addSampleRow}
                      className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1 border border-brand-200 hover:border-brand-300 bg-brand-50/20 px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Sample
                    </button>
                  </div>

                  {draft.samplesDistributed.length > 0 ? (
                    <div className="flex flex-col gap-3 border border-slate-100 rounded-lg p-3 bg-slate-50/10">
                      {draft.samplesDistributed.map((sm, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-end bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                        <div className="flex-grow min-w-0 w-full sm:w-auto">
                            <Input
                              label="Product Name"
                              placeholder="e.g. CardioPrime, NeuroCare…"
                              value={sm.productName}
                              onChange={(e) => updateSampleRow(index, 'productName', e.target.value)}
                            />
                          </div>

                          <div className="w-24 shrink-0">
                            <Input
                              label="Quantity"
                              type="number"
                              min={1}
                              value={sm.quantity}
                              onChange={(e) => updateSampleRow(index, 'quantity', Number(e.target.value))}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeSampleRow(index)}
                            className="h-10 px-3 py-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg flex items-center justify-center transition-all shrink-0 font-semibold text-xs select-none"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic bg-slate-50/20 py-3 text-center border border-dashed border-slate-200 rounded-lg select-none">No samples distributed. Click "+ Add Sample" to log samples.</span>
                  )}
                </div>
              ))}
            </div>

            {/* Section 4: Next Steps & Voice Note Assistant */}
            <div className="border border-slate-150 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 select-none">
                <Bot className="h-4 w-4 text-brand-500" />
                4. Follow-up & Voice note Assistant
              </h3>

              {renderAiHighlightWrapper('followUpActions', 'Follow-up Actions Required', (
                <Textarea
                  placeholder="What are the immediate follow-up steps?"
                  value={draft.followUpActions}
                  onChange={(e) => {
                    handleFieldChange('followUpActions', e.target.value);
                    setAiFilledFields(prev => ({ ...prev, followUpActions: false }));
                  }}
                />
              ))}

              {/* AI Suggested Follow Ups Chips */}
              <div className="flex flex-col gap-2.5 p-2 select-none">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                  AI Suggested Follow Ups
                </label>

                {draft.aiSuggestedFollowUps.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 bg-brand-50/10 border border-brand-100/40 rounded-xl">
                    {draft.aiSuggestedFollowUps.map((chip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-white border border-brand-100 text-xs font-semibold px-3 py-1 rounded-lg text-brand-600 shadow-sm"
                      >
                        {chip}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = draft.aiSuggestedFollowUps.filter((c) => c !== chip);
                            handleFieldChange('aiSuggestedFollowUps', updated);
                          }}
                          className="text-brand-400 hover:text-brand-700 animate-fade-in"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 select-none italic leading-none">No follow-up suggestions generated. Use Copilot to analyze meeting text first.</span>
                )}
              </div>

              {/* Voice Note Assistant Block */}
              <div className="p-4 rounded-xl border border-slate-200/60 bg-blue-50/10 flex flex-col sm:flex-row gap-4 items-center justify-between mt-2 select-none">
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
            </div>

            {/* Button Actions Footer */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-wrap justify-between items-center gap-3 mt-2 select-none">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    dispatch(clearDraft());
                    setAiFilledFields({
                      hcpId: false, date: false, type: false, topicsDiscussed: false,
                      sentiment: false, materialsShared: false, samplesDistributed: false,
                      followUpActions: false, outcome: false,
                    });
                  }}
                  className="text-slate-450 hover:text-slate-655 hover:bg-slate-50 flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset Form
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/interactions')}
                  className="flex items-center gap-1 text-slate-600"
                >
                  View History
                </Button>
              </div>

              <Button type="submit" className="flex items-center gap-1.5">
                Save Interaction
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Right Column — AI Copilot */}
      <div className="lg:col-span-3 flex flex-col gap-0 rounded-xl overflow-hidden border border-slate-100 shadow-soft bg-white">

        {/* ── Panel Header ── */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800 leading-none">AI Copilot</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Describe your meeting — AI fills the form</p>
          </div>
          {(latestAiCard && latestAiCard.aiCardData?.success) && (
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200 shrink-0 select-none">
              ✓ Analysis Ready
            </span>
          )}
        </div>

        {/* ── Processing loader (shown while analyzing) ── */}
        {(isTranscribing || isTyping) && (
          <div className="mx-4 mt-4 p-4 bg-blue-50/60 border border-blue-100 rounded-xl flex flex-col gap-3 select-none">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Analyzing Notes</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                Processing
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { text: 'Reading meeting notes…', step: 0 },
                { text: 'Identifying doctor…',    step: 1 },
                { text: 'Extracting topics…',     step: 2 },
                { text: 'Analyzing sentiment…',   step: 3 },
                { text: 'Generating summary…',    step: 4 },
              ].map((item) => {
                const isDone    = loadingStep > item.step;
                const isCurrent = loadingStep === item.step;
                return (
                  <div key={item.step} className="flex items-center gap-2 text-xs">
                    {isDone ? (
                      <span className="text-emerald-500 font-bold text-sm leading-none">✓</span>
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
                    )}
                    <span className={isDone ? 'text-slate-700 font-semibold' : isCurrent ? 'text-blue-600 font-semibold' : 'text-slate-400'}>
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-1.5 pt-2 border-t border-blue-100">
              <div className="h-2.5 bg-blue-200/60 rounded-full w-5/6 animate-pulse" />
              <div className="h-2.5 bg-blue-200/60 rounded-full w-3/4 animate-pulse" />
              <div className="h-2.5 bg-blue-200/60 rounded-full w-4/6 animate-pulse" />
            </div>
          </div>
        )}

        {/* ── AI Results (shown after analysis) ── */}
        {latestAiCard && latestAiCard.aiCardData && !isTyping && !isTranscribing && (
          <div className="flex flex-col divide-y divide-slate-50">

            {/* Processing Status */}
            <div className="px-4 py-3 bg-white">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Processing Status</p>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { label: 'Doctor Identified',  ok: !!(latestAiCard.aiCardData.doctorName) },
                  { label: 'Interaction Type',   ok: !!(latestAiCard.aiCardData.interactionType) },
                  { label: 'Sentiment Detected', ok: !!(latestAiCard.aiCardData.sentiment) },
                  { label: 'Topics Extracted',   ok: !!(latestAiCard.aiCardData.topics?.length) },
                  { label: 'Materials Noted',    ok: !!(latestAiCard.aiCardData.materialsShared?.length) },
                  { label: 'Samples Identified', ok: !!(latestAiCard.aiCardData.samplesDistributed?.filter(s => s.productName?.trim()).length) },
                  { label: 'Follow-up Generated',ok: !!(latestAiCard.aiCardData.followUpActionsList?.length) },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className={`font-bold text-[10px] ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {ok ? '✓ Found' : '— Not found'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Information */}
            <div className="px-4 py-3 bg-slate-50/40">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Extracted Information</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Doctor</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[55%] truncate">
                    {latestAiCard.aiCardData.doctorName || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Hospital</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[55%] truncate">
                    {latestAiCard.aiCardData.hospital || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Type</span>
                  <span className="text-slate-800 font-semibold">
                    {latestAiCard.aiCardData.interactionType || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Date</span>
                  <span className="text-slate-800 font-semibold">
                    {latestAiCard.aiCardData.meetingDate || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Sentiment</span>
                  <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                    latestAiCard.aiCardData.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' :
                    latestAiCard.aiCardData.sentiment === 'Negative' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {latestAiCard.aiCardData.sentiment || 'Neutral'}
                  </span>
                </div>
              </div>
            </div>

            {/* Topics */}
            {(latestAiCard.aiCardData.topics && latestAiCard.aiCardData.topics.length > 0) && (
              <div className="px-4 py-3 bg-white">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Topics Discussed</p>
                <div className="flex flex-wrap gap-1.5">
                  {latestAiCard.aiCardData.topics.map((t, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {(latestAiCard.aiCardData.materialsShared && latestAiCard.aiCardData.materialsShared.length > 0) && (
              <div className="px-4 py-3 bg-slate-50/40">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Materials Shared</p>
                <div className="flex flex-wrap gap-1.5">
                  {latestAiCard.aiCardData.materialsShared.map((m, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Samples */}
            {(() => {
              const validSamples = (latestAiCard.aiCardData.samplesDistributed || [])
                .filter(s => s.productName && s.productName.trim() && s.productName.trim().toLowerCase() !== 'null');
              return validSamples.length > 0 ? (
                <div className="px-4 py-3 bg-white">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Samples Distributed</p>
                  <div className="flex flex-col gap-1.5">
                    {validSamples.map((sm, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                        <span className="text-xs font-semibold text-slate-700">{sm.productName}</span>
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded-md">
                          × {sm.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Follow-up Actions */}
            {(latestAiCard.aiCardData.followUpActionsList && latestAiCard.aiCardData.followUpActionsList.length > 0) && (
              <div className="px-4 py-3 bg-slate-50/40">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested Follow-ups</p>
                <div className="flex flex-col gap-1.5">
                  {latestAiCard.aiCardData.followUpActionsList.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                      <span className="text-emerald-500 font-bold shrink-0 mt-px">→</span>
                      <span className="leading-snug">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {latestAiCard.aiCardData.outcome && (
              <div className="px-4 py-3 bg-white">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Meeting Summary</p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed italic bg-slate-50 border border-slate-100 rounded-lg p-3">
                  "{latestAiCard.aiCardData.outcome}"
                </p>
              </div>
            )}

          </div>
        )}

        {/* ── Conversation history (only when no AI card active) ── */}
        {!latestAiCard && (
          <div className="flex-grow px-4 py-3 overflow-y-auto flex flex-col gap-2 min-h-[120px] max-h-64">
            <div className="flex-grow" />
            {chatHistory.map((msg) => (
              <ChatBubble
                key={msg.id}
                sender={msg.sender}
                text={msg.text}
                timestamp={msg.timestamp}
                isAiCard={msg.isAiCard}
                aiCardData={msg.aiCardData}
                onCreateHcp={() => {
                  if (msg.aiCardData?.missingEmail) {
                    setNewHcpData(prev => ({ ...prev, email: msg.aiCardData?.missingEmail || '' }));
                  }
                  setIsAddDoctorModalOpen(true);
                }}
                onSelectHcp={(hcpId, hcpName) => {
                  dispatch(updateDraftField({ field: 'hcpId', value: hcpId }));
                  dispatch(updateDraftField({ field: 'hcpName', value: hcpName }));
                  setAiFilledFields(prev => ({ ...prev, hcpId: true }));
                  dispatch(addNotification({
                    title: 'Doctor Selected',
                    message: `${hcpName} has been auto-filled into the form.`,
                    type: 'success',
                  }));
                }}
              />
            ))}
            {isTyping && (
              <ChatBubble sender="assistant" text="..." timestamp="" typing />
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* ── Suggested Prompts ── */}
        {!latestAiCard && !isTyping && !isTranscribing && (
          <div className="px-4 py-2 border-t border-slate-50 bg-white select-none">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Try saying…</p>
            <div className="flex flex-col gap-1">
              {suggestedPrompts.slice(0, 2).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[10px] font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 active:scale-95 px-3 py-2 rounded-lg border border-slate-100 text-left transition-all leading-snug"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Meeting Notes Input + Generate Button (always visible at bottom) ── */}
        <div className="border-t border-slate-100 bg-white p-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Meeting Notes</p>
            <button
              type="button"
              onClick={() => {
                setIsRecording(!isRecording);
                if (!isRecording) {
                  dispatch(addNotification({
                    title: 'Microphone Active',
                    message: 'Speak now — voice will be transcribed.',
                    type: 'info',
                  }));
                }
              }}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                isRecording
                  ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
              title="Record voice"
            >
              <Mic className="h-3 w-3" />
              {isRecording ? 'Recording…' : 'Voice'}
            </button>
          </div>

          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage(chatInput))}
            placeholder="Describe your meeting naturally…&#10;e.g. Met Dr. Sharma at Apollo. Discussed NeuroCalm efficacy. Positive response. Gave 10 samples."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-brand-300 resize-none leading-relaxed placeholder-slate-400 transition-all min-h-[90px]"
          />

          <Button
            onClick={() => handleSendMessage(chatInput)}
            disabled={!chatInput.trim() || isTranscribing || isTyping}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            className="w-full text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-1.5"
          >
            {isTyping || isTranscribing ? 'Analyzing…' : 'Generate Analysis'}
          </Button>

          {latestAiCard && (
            <button
              type="button"
              onClick={() => dispatch(clearDraft())}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 text-center transition-colors"
            >
              Clear analysis & start over
            </button>
          )}
        </div>

      </div>

      </div>{/* End Grid container */}

      {/* Add HCP Modal */}
      <Modal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        title="Add New Healthcare Professional"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddDoctorModalOpen(false)} disabled={isHcpSubmitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddHcpSubmit} isLoading={isHcpSubmitting}>
              Save Doctor
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddHcpSubmit} className="flex flex-col gap-4">
          {hcpErrors.apiError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold">
              {hcpErrors.apiError}
            </div>
          )}
          <Input
            label="Doctor Name"
            placeholder="Dr. Rajesh Koothrappali"
            value={newHcpData.name}
            onChange={(e) => setNewHcpData({ ...newHcpData, name: e.target.value })}
            error={hcpErrors.name}
          />

          <div className="grid grid-cols-2 gap-4">
            <Dropdown
              label="Specialization"
              options={SPECIALIZATIONS.map(s => ({ value: s, label: s }))}
              value={newHcpData.specialization}
              onChange={(val) => setNewHcpData({ ...newHcpData, specialization: val })}
            />

            <div className="relative">
              <Input
                label="City"
                placeholder="e.g. Pune"
                value={newHcpData.city}
                onChange={(e) => setNewHcpData({ ...newHcpData, city: e.target.value })}
                list="log-cities-list-datalist"
                error={hcpErrors.city}
              />
              <datalist id="log-cities-list-datalist">
                {CITIES.map(c => (
                  <option key={c} value={c} />
                ))}
                <option value="Mumbai" />
                <option value="New Delhi" />
                <option value="Bangalore" />
                <option value="Chennai" />
                <option value="Hyderabad" />
                <option value="Kolkata" />
                <option value="Pune" />
                <option value="Goa" />
                <option value="Jaipur" />
                <option value="Ahmedabad" />
              </datalist>
            </div>
          </div>

          <Input
            label="Hospital / Clinic Name"
            placeholder="Apollo Speciality Clinic"
            value={newHcpData.hospital}
            onChange={(e) => setNewHcpData({ ...newHcpData, hospital: e.target.value })}
            error={hcpErrors.hospital}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="rajesh.k@apollo.com"
              value={newHcpData.email}
              onChange={(e) => setNewHcpData({ ...newHcpData, email: e.target.value })}
              error={hcpErrors.email}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={newHcpData.phone}
              onChange={(e) => setNewHcpData({ ...newHcpData, phone: e.target.value })}
              error={hcpErrors.phone}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Account Status</label>
            <div className="flex gap-4">
              {['Active', 'Pending', 'Inactive'].map((st) => (
                <label key={st} className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                  <input
                    type="radio"
                    name="modal-status"
                    checked={newHcpData.status === st}
                    onChange={() => setNewHcpData({ ...newHcpData, status: st as any })}
                    className="text-brand-500 focus:ring-brand-500"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Relationship Notes</label>
            <textarea
              placeholder="Provide context e.g., preferences, best call times, general feedback..."
              value={newHcpData.notes}
              onChange={(e) => setNewHcpData({ ...newHcpData, notes: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px] resize-y text-slate-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LogInteraction;

