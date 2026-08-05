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
  BookOpen,
  DollarSign,
  Tag
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
  const [activeTab, setActiveTab] = useState<'courses' | 'payments' | 'questions' | 'notifications'>('courses');
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

  // Course editing state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState<number>(29.99);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPlatform, setEditPlatform] = useState<'O11' | 'ODC'>('O11');
  const [editIsNew, setEditIsNew] = useState(false);
  const [courseSaveMsg, setCourseSaveMsg] = useState('');

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

  const getAdminHeaders = () => {
    const savedUser = localStorage.getItem('outsystems_user');
    let email = 'duongrbt@gmail.com';
    let password = '';
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.email) email = u.email;
        if (u.password) password = u.password;
      } catch (e) {}
    }
    return {
      'Content-Type': 'application/json',
      'x-admin-email': email,
      'x-admin-password': password,
    };
  };

  // Fetch payment requests & notification settings on load
  useEffect(() => {
    fetch('/api/admin/payment-requests', {
      headers: getAdminHeaders()
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.requests) setPaymentRequests(data.requests);
        if (data && data.codes) setActivationCodes(data.codes);
      })
      .catch(() => {});

    fetch('/api/admin/notification-settings', {
      headers: getAdminHeaders()
    })
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

  const handleOpenCourseEditor = (c: Course) => {
    setEditingCourse(c);
    setEditTitle(c.title);
    setEditDescription(c.description);
    setEditPrice(c.price);
    setEditImageUrl(c.imageUrl);
    const platformTag = c.tags.find(t => t.text === 'O11' || t.text === 'ODC')?.text || 'O11';
    setEditPlatform(platformTag as 'O11' | 'ODC');
    setEditIsNew(c.tags.some(t => t.text === 'NEW'));
    setCourseSaveMsg('');
  };

  const handleSaveCourseEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const updatedCourse: Course = {
      ...editingCourse,
      title: editTitle.trim(),
      description: editDescription.trim(),
      price: Number(editPrice),
      imageUrl: editImageUrl.trim(),
      tags: [
        { text: editPlatform, color: editPlatform === 'O11' ? 'purple' : 'orange' },
        ...(editIsNew ? [{ text: 'NEW', color: 'green' }] : [])
      ]
    };

    const updatedList = courses.map((c) => (c.id === editingCourse.id ? updatedCourse : c));
    onUpdateCourses(updatedList);

    try {
      const res = await fetch('/api/admin/courses/upsert', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(updatedCourse)
      });
      const data = await res.json();
      setCourseSaveMsg(data.message || 'Course updated successfully!');
    } catch (err) {
      setCourseSaveMsg('Course updated in local session.');
    } finally {
      setTimeout(() => {
        setEditingCourse(null);
        setCourseSaveMsg('');
      }, 1200);
    }
  };

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifStatusMsg('');

    try {
      const res = await fetch('/api/admin/notification-settings', {
        method: 'POST',
        headers: getAdminHeaders(),
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
      const res = await fetch('/api/admin/test-telegram', { 
        method: 'POST',
        headers: getAdminHeaders()
      });
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
      const res = await fetch('/api/admin/test-email', { 
        method: 'POST',
        headers: getAdminHeaders()
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('Could not trigger Gmail test email.');
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
      headers: getAdminHeaders(),
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
        let updatedMock = c.mockExam || [];
        if (editingQuestion) {
          updatedMock = updatedMock.map((q) => (q.id === editingQuestion.id ? newQ : q));
        } else {
          updatedMock = [newQ, ...updatedMock];
        }
        return { ...c, mockExam: updatedMock };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    setEditingQuestion(null);
    setQText('');
    setChoiceA('');
    setChoiceB('');
    setChoiceC('');
    setChoiceD('');
    setExplanationText('');
    setImgUrl('');
  };

  const handleOpenEditModal = (q: MockExamQuestion) => {
    setEditingQuestion(q);
    setQText(q.question);
    setChoiceA(q.choices.find((c) => c.key === 'A')?.text || '');
    setChoiceB(q.choices.find((c) => c.key === 'B')?.text || '');
    setChoiceC(q.choices.find((c) => c.key === 'C')?.text || '');
    setChoiceD(q.choices.find((c) => c.key === 'D')?.text || '');
    setCorrectAns(q.correctAnswer);
    setExplanationText(q.explanation);
    setImgUrl(q.imageUrl || '');
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const updatedCourses = courses.map((c) => {
      if (c.id === selectedCourseId) {
        return {
          ...c,
          mockExam: (c.mockExam || []).filter((q) => q.id !== id)
        };
      }
      return c;
    });
    onUpdateCourses(updatedCourses);
  };

  const handleImportCsv = () => {
    if (!csvContent.trim()) return;
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
                OutSystems Pro Academy — Courses, Payments, Questions & Notifications
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
            onClick={() => setActiveTab('courses')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'courses'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Course Settings</span>
          </button>

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

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* TAB 1: COURSE CATALOG MANAGEMENT */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Course Catalog Settings & Pricing
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Edit course titles, descriptions, prices, image URLs, and platform tags synced to Supabase database.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                    {courses.length} Active Courses
                  </span>
                </div>

                {/* Course List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {courses.map((c) => (
                    <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-4 items-start hover:border-blue-300 transition-all">
                      <img
                        src={c.imageUrl}
                        alt={c.title}
                        className="w-20 h-20 object-cover rounded-lg shrink-0 border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 space-y-1.5 overflow-hidden">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display font-bold text-xs text-slate-900 truncate">
                            {c.title}
                          </h4>
                          <span className="text-xs font-extrabold text-slate-950 font-mono shrink-0">
                            ${c.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                          {c.description}
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            {c.tags.find(t => t.text === 'O11' || t.text === 'ODC')?.text || 'O11'}
                          </span>
                          <button
                            onClick={() => handleOpenCourseEditor(c)}
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COURSE EDITOR MODAL / PANEL */}
              {editingCourse && (
                <div className="bg-white border-2 border-blue-500 rounded-2xl p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                      Editing: {editingCourse.title}
                    </h4>
                    <button
                      onClick={() => setEditingCourse(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {courseSaveMsg && (
                    <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200 font-bold">
                      {courseSaveMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveCourseEdits} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Course Title</label>
                        <input
                          type="text"
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium outline-none focus:border-blue-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Price ($ USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Course Description</label>
                      <textarea
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium outline-none focus:border-blue-600 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Image URL (Cover Photo)</label>
                        <input
                          type="text"
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono outline-none focus:border-blue-600"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Platform Tag</label>
                        <select
                          value={editPlatform}
                          onChange={(e) => setEditPlatform(e.target.value as 'O11' | 'ODC')}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-blue-600"
                        >
                          <option value="O11">O11 Platform</option>
                          <option value="ODC">ODC Platform</option>
                        </select>
                      </div>
                    </div>

                    {/* Image Live Preview Box */}
                    {editImageUrl && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                        <img
                          src={editImageUrl}
                          alt="Live Preview"
                          className="w-16 h-12 object-cover rounded-lg border"
                          onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'; }}
                        />
                        <span className="text-xs text-slate-500 font-medium">Live Cover Image Preview</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingCourse(null)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-xs"
                      >
                        Save Course Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAYMENTS & ACTIVATION CODE GENERATOR */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Code Generator Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-500" />
                  Manual Activation Code Generator
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="email"
                    placeholder="Student Email (e.g. student@gmail.com)"
                    value={genEmail}
                    onChange={(e) => setGenEmail(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium"
                  />

                  <select
                    value={genCourseId}
                    onChange={(e) => setGenCourseId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleGenerateCode(genEmail, genCourseId)}
                    disabled={!genEmail}
                    className={`font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                      genEmail
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" /> Generate Code
                  </button>
                </div>

                {generatedCodeResult && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Generated Activation Code:
                      </span>
                      <p className="font-mono font-bold text-sm text-emerald-950">
                        {generatedCodeResult}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCodeResult);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Requests List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Incoming Payment Requests ({paymentRequests.length})
                </h3>

                <div className="space-y-3">
                  {paymentRequests.length > 0 ? (
                    paymentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{req.userEmail}</span>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{req.courseTitle}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Requested on: {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setGenEmail(req.userEmail);
                            setGenCourseId(req.courseId);
                            handleGenerateCode(req.userEmail, req.courseId);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                          Issue Activation Code
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-4">
                      No pending payment requests yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUESTION BANK & CSV IMPORT */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Manage Exam Questions
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Select course to view, edit, or add dump questions
                    </p>
                  </div>

                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-blue-600"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.mockExam?.length || 0} questions)
                      </option>
                    ))}
                  </select>
                </div>

                {/* CSV Import */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <h4 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-600" /> Batch CSV Import Questions
                  </h4>
                  <textarea
                    rows={2}
                    placeholder='Question,"Choice A","Choice B","Choice C","Choice D","CorrectKey","Explanation"'
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none font-mono"
                  />
                  {csvMessage && <p className="text-xs font-bold text-emerald-700">{csvMessage}</p>}
                  <button
                    onClick={handleImportCsv}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-2xs cursor-pointer"
                  >
                    Import CSV Questions
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-display font-bold text-xs text-slate-700">
                      Questions for {selectedCourse.title} ({selectedCourse.mockExam?.length || 0})
                    </h4>
                    <button
                      onClick={() => {
                        setEditingQuestion(null);
                        setQText('');
                        setChoiceA('');
                        setChoiceB('');
                        setChoiceC('');
                        setChoiceD('');
                        setExplanationText('');
                        setImgUrl('');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedCourse.mockExam && selectedCourse.mockExam.length > 0 ? (
                      selectedCourse.mockExam.map((q, idx) => (
                        <div
                          key={q.id}
                          className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs flex justify-between items-start gap-3"
                        >
                          <div>
                            <p className="font-bold text-slate-900">
                              {idx + 1}. {q.question}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Correct Choice: <strong className="text-emerald-700">{q.correctAnswer}</strong>
                            </p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleOpenEditModal(q)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-4">
                        No questions in this course bank.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GMAIL & TELEGRAM NOTIFICATION SETTINGS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-amber-500" />
                  Dual Notification Settings (Gmail App Password & Telegram Bot)
                </h3>

                {notifStatusMsg && (
                  <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-xl border border-blue-200 font-bold">
                    {notifStatusMsg}
                  </div>
                )}

                <form onSubmit={handleSaveNotificationSettings} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gmail Settings */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-red-600" /> Gmail SMTP Configuration
                      </h4>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Admin Gmail Address</label>
                        <input
                          type="email"
                          value={adminEmailSetting}
                          onChange={(e) => setAdminEmailSetting(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-mono outline-none focus:border-blue-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Gmail App Password (16 chars)</label>
                        <input
                          type="password"
                          value={gmailAppPassword}
                          onChange={(e) => setGmailAppPassword(e.target.value)}
                          placeholder="xxxx xxxx xxxx xxxx"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-mono outline-none focus:border-blue-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleTestEmail}
                        disabled={testingEmail}
                        className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-600" />
                        <span>{testingEmail ? 'Sending...' : 'Test Gmail Alert'}</span>
                      </button>
                    </div>

                    {/* Telegram Settings */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-blue-500" /> Telegram Bot Configuration
                      </h4>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Telegram Bot Token</label>
                        <input
                          type="password"
                          value={telegramBotToken}
                          onChange={(e) => setTelegramBotToken(e.target.value)}
                          placeholder="123456789:ABCdef..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-mono outline-none focus:border-blue-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Telegram Chat ID</label>
                        <input
                          type="text"
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                          placeholder="987654321"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 font-mono outline-none focus:border-blue-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleTestTelegram}
                        disabled={testingTelegram}
                        className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-600" />
                        <span>{testingTelegram ? 'Sending...' : 'Test Telegram Alert'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Save Notification Settings
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
