import React, { useState, useEffect } from 'react';
import { Course, MockExamQuestion, PaymentRequest, ActivationCode } from '../types';
import {
  X,
  Upload,
  Plus,
  Edit2,
  Key,
  Mail,
  FileSpreadsheet,
  Image as ImageIcon,
  Copy,
  Check,
  Shield,
  Sparkles,
  BellRing,
  Send,
  Lock,
  MessageSquare
} from 'lucide-react';

interface AdminDashboardProps {
  courses: Course[];
  onClose: () => void;
  onUpdateCourses: (courses: Course[]) => void;
}

export default function AdminDashboard({
  courses,
  onClose,
  onUpdateCourses,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'questions' | 'notifications'>('payments');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  
  // Payment requests & activation codes state
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);
  
  // Code Generator state
  const [genEmail, setGenEmail] = useState('');
  const [genCourseId, setGenCourseId] = useState(courses[0]?.id || '');
  const [generatedCodeResult, setGeneratedCodeResult] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Question editing modal state
  const [editingQuestion, setEditingQuestion] = useState<MockExamQuestion | null>(null);
  const [qText, setQText] = useState('');
  const [choiceA, setChoiceA] = useState('');
  const [choiceB, setChoiceB] = useState('');
  const [choiceC, setChoiceC] = useState('');
  const [choiceD, setChoiceD] = useState('');
  const [correctAns, setCorrectAns] = useState('A');
  const [explanationText, setExplanationText] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  // CSV Import state
  const [csvContent, setCsvContent] = useState('');
  const [csvMessage, setCsvMessage] = useState('');

  // Notification Settings State
  const [adminEmailSetting, setAdminEmailSetting] = useState('duongrbt@gmail.com');
  const [gmailAppPassword, setGmailAppPassword] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [notifStatusMsg, setNotifStatusMsg] = useState('');
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // Fetch payment requests & notification settings on load
  useEffect(() => {
    fetch('/api/admin/payment-requests')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.requests) setPaymentRequests(data.requests);
        if (data && data.codes) setActivationCodes(data.codes);
      })
      .catch(() => {});

    fetch('/api/admin/notification-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.adminEmail) setAdminEmailSetting(data.adminEmail);
          if (data.gmailAppPassword) setGmailAppPassword(data.gmailAppPassword);
          if (data.telegramBotToken) setTelegramBotToken(data.telegramBotToken);
          if (data.telegramChatId) setTelegramChatId(data.telegramChatId);
        }
      })
      .catch(() => {});
  }, [courses]);

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifStatusMsg('');

    try {
      const res = await fetch('/api/admin/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: adminEmailSetting,
          gmailAppPassword: gmailAppPassword,
          telegramBotToken: telegramBotToken,
          telegramChatId: telegramChatId,
        })
      });

      const data = await res.json();
      setNotifStatusMsg(data.message || 'Notification settings saved successfully!');
    } catch (err) {
      setNotifStatusMsg('Saved settings to local session.');
    }
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    try {
      const res = await fetch('/api/admin/test-telegram', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('Could not trigger Telegram test alert.');
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('Could not trigger Email test alert.');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleGenerateCode = (email: string, cId: string) => {
    const course = courses.find((c) => c.id === cId);
    const prefix = course?.title.toLowerCase().includes('odc') ? 'OUT-ODC' : 'OUT-REACTIVE';
    const randomHash = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newCode = `${prefix}-90D-${randomHash}`;

    const newCodeObj: ActivationCode = {
      id: 'code_' + Date.now(),
      code: newCode,
      userEmail: email.trim().toLowerCase(),
      courseId: cId,
      status: 'active',
      failedAttempts: 0,
      createdAt: new Date().toISOString()
    };

    setActivationCodes((prev) => [newCodeObj, ...prev]);
    setGeneratedCodeResult(newCode);

    fetch('/api/admin/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCodeObj)
    }).catch(() => {});
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || !choiceA || !choiceB) return;

    const newQ: MockExamQuestion = {
      id: editingQuestion ? editingQuestion.id : 'q_' + Date.now(),
      question: qText,
      choices: [
        { key: 'A', text: choiceA },
        { key: 'B', text: choiceB },
        { key: 'C', text: choiceC || 'N/A' },
        { key: 'D', text: choiceD || 'N/A' }
      ],
      correctAnswer: correctAns,
      explanation: explanationText,
      imageUrl: imgUrl || undefined
    };

    const updatedCourses = courses.map((c) => {
      if (c.id === selectedCourseId) {
        const existingExam = c.mockExam || [];
        let newExam = [];
        if (editingQuestion) {
          newExam = existingExam.map((item) => (item.id === editingQuestion.id ? newQ : item));
        } else {
          newExam = [...existingExam, newQ];
        }
        return { ...c, mockExam: newExam };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    setEditingQuestion(null);
    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setQText('');
    setChoiceA('');
    setChoiceB('');
    setChoiceC('');
    setChoiceD('');
    setCorrectAns('A');
    setExplanationText('');
    setImgUrl('');
  };

  const handleImportCSV = () => {
    if (!csvContent) return;

    const lines = csvContent.split('\n').filter((l) => l.trim() !== '');
    const newQuestions: MockExamQuestion[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length >= 4) {
        newQuestions.push({
          id: `csv_q_${Date.now()}_${idx}`,
          question: parts[0].replace(/^"|"$/g, ''),
          choices: [
            { key: 'A', text: parts[1]?.replace(/^"|"$/g, '') || '' },
            { key: 'B', text: parts[2]?.replace(/^"|"$/g, '') || '' },
            { key: 'C', text: parts[3]?.replace(/^"|"$/g, '') || '' },
            { key: 'D', text: parts[4]?.replace(/^"|"$/g, '') || '' }
          ],
          correctAnswer: parts[5]?.trim().toUpperCase() || 'A',
          explanation: parts[6]?.replace(/^"|"$/g, '') || 'Imported via CSV Bank'
        });
      }
    });

    if (newQuestions.length > 0) {
      const updatedCourses = courses.map((c) => {
        if (c.id === selectedCourseId) {
          return { ...c, mockExam: [...(c.mockExam || []), ...newQuestions] };
        }
        return c;
      });

      onUpdateCourses(updatedCourses);
      setCsvMessage(`Successfully imported ${newQuestions.length} questions into selected course!`);
      setCsvContent('');
    } else {
      setCsvMessage('Could not parse CSV.');
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-bold">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-white">
                Admin Management Dashboard
              </h2>
              <p className="text-xs text-slate-400">
                OutSystems Pro Academy — User Accounts, Payments & Notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 pt-3 border-b border-slate-200 flex gap-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Payments & Code Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'questions'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Question Bank & CSV Import</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'notifications'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BellRing className="w-4 h-4 text-amber-500" />
            <span>Gmail & Telegram Settings</span>
          </button>
        </div>

        {/* TAB 1: PAYMENTS & CODE GENERATOR */}
        {activeTab === 'payments' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Generate Code Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                Generate & Assign Activation Code for User
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="email"
                  placeholder="User Gmail (e.g. student@gmail.com)"
                  value={genEmail}
                  onChange={(e) => setGenEmail(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
                <select
                  value={genCourseId}
                  onChange={(e) => setGenCourseId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (${c.price})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleGenerateCode(genEmail || 'student@gmail.com', genCourseId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Activation Code</span>
                </button>
              </div>

              {generatedCodeResult && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-900 font-bold">Generated Code:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCodeResult);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-lg font-extrabold text-emerald-900 tracking-wider">
                    {generatedCodeResult}
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                    Send this code to <strong>{genEmail || 'student'}</strong> via Gmail along with login URL: <span className="font-mono text-emerald-900 font-bold">https://outsystems-pro-academy.onrender.com</span>
                  </p>
                </div>
              )}
            </div>

            {/* Pending Requests List */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                User Payment Requests
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">User Email</th>
                      <th className="p-3">Course Requested</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentRequests.length > 0 ? (
                      paymentRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{req.userEmail}</td>
                          <td className="p-3 text-slate-600">{req.courseTitle}</td>
                          <td className="p-3 font-bold text-emerald-700">${req.amount}</td>
                          <td className="p-3">
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">
                              {req.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setGenEmail(req.userEmail);
                                setGenCourseId(req.courseId);
                                handleGenerateCode(req.userEmail, req.courseId);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer"
                            >
                              Generate Code & Mail
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          No pending payment requests right now.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Generated Codes Registry */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                Active Codes Registry ({activationCodes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activationCodes.map((ac) => (
                  <div key={ac.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-mono font-bold text-blue-900">
                      <span>{ac.code}</span>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${
                        ac.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {ac.status}
                      </span>
                    </div>
                    <div className="text-slate-500 font-medium truncate">Email: {ac.userEmail}</div>
                    <div className="text-[10px] text-slate-400">Failed attempts: {ac.failedAttempts}/5</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: QUESTION BANK & CSV IMPORT */}
        {activeTab === 'questions' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div>
                <label className="text-xs font-bold text-slate-700">Select Target Course:</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="mt-1 block w-full md:w-80 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.mockExam?.length || 0} Questions)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  resetQuestionForm();
                  setEditingQuestion({
                    id: '',
                    question: '',
                    choices: [],
                    correctAnswer: 'A',
                    explanation: ''
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question Manually</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h4 className="font-display font-bold text-xs uppercase text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Quick CSV Batch Import
              </h4>
              {csvMessage && (
                <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">{csvMessage}</p>
              )}
              <textarea
                rows={3}
                placeholder='"Question Text","Choice A","Choice B","Choice C","Choice D","CorrectKey (A/B/C/D)","Explanation"'
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 outline-none"
              />
              <button
                onClick={handleImportCSV}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Import CSV Questions
              </button>
            </div>

            {editingQuestion && (
              <form onSubmit={handleSaveQuestion} className="bg-white border-2 border-blue-500 rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    {editingQuestion.id ? 'Edit Question' : 'Add New Question'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Question Text</label>
                  <textarea
                    rows={2}
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Choice A</label>
                    <input
                      type="text"
                      value={choiceA}
                      onChange={(e) => setChoiceA(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Choice B</label>
                    <input
                      type="text"
                      value={choiceB}
                      onChange={(e) => setChoiceB(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Choice C</label>
                    <input
                      type="text"
                      value={choiceC}
                      onChange={(e) => setChoiceC(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Choice D</label>
                    <input
                      type="text"
                      value={choiceD}
                      onChange={(e) => setChoiceD(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Correct Choice Key</label>
                    <select
                      value={correctAns}
                      onChange={(e) => setCorrectAns(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Diagram / Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://... image diagram link"
                      value={imgUrl}
                      onChange={(e) => setImgUrl(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Explanation</label>
                  <textarea
                    rows={2}
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Save Question
                </button>
              </form>
            )}

            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm text-slate-900">
                Existing Questions ({selectedCourse.mockExam?.length || 0})
              </h4>

              <div className="space-y-3">
                {selectedCourse.mockExam && selectedCourse.mockExam.length > 0 ? (
                  selectedCourse.mockExam.map((q, idx) => (
                    <div key={q.id || idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900">
                          {idx + 1}. {q.question}
                        </span>
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setQText(q.question);
                            setChoiceA(q.choices[0]?.text || '');
                            setChoiceB(q.choices[1]?.text || '');
                            setChoiceC(q.choices[2]?.text || '');
                            setChoiceD(q.choices[3]?.text || '');
                            setCorrectAns(q.correctAnswer);
                            setExplanationText(q.explanation || '');
                            setImgUrl(q.imageUrl || '');
                          }}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>

                      {q.imageUrl && (
                        <div className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" /> Has Diagram Image Attached
                        </div>
                      )}

                      <div className="text-slate-600">Correct Answer: <strong className="text-emerald-700">{q.correctAnswer}</strong></div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl">
                    No questions in this course yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: GMAIL APP PASSWORD & TELEGRAM SETTINGS */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleSaveNotificationSettings} className="p-6 overflow-y-auto flex-1 space-y-6">
            {notifStatusMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs p-3.5 rounded-xl">
                ✓ {notifStatusMsg}
              </div>
            )}

            {/* Gmail Configuration */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-600" />
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    1. Gmail SMTP Notification Settings
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>{testingEmail ? 'Sending Test...' : 'Test Gmail Alert'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Admin Gmail Email</label>
                  <input
                    type="email"
                    placeholder="duongrbt@gmail.com"
                    value={adminEmailSetting}
                    onChange={(e) => setAdminEmailSetting(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Gmail App Password (16 characters)</label>
                  <input
                    type="password"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={gmailAppPassword}
                    onChange={(e) => setGmailAppPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Generated from Google Account -&gt; Security -&gt; 2-Step Verification -&gt; App Passwords.
                  </p>
                </div>
              </div>
            </div>

            {/* Telegram Configuration */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    2. Telegram Bot Notification Settings
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>{testingTelegram ? 'Sending Test...' : 'Test Telegram Alert'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Telegram Bot Token</label>
                  <input
                    type="text"
                    placeholder="123456789:ABCdefGhIJKlmNoPQ..."
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Created via @BotFather on Telegram.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Telegram Chat ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 987654321"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Your personal Telegram ID (get via @userinfobot).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Save Notification Parameters</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
