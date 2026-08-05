import React, { useState, useEffect, useRef } from 'react';
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
  Tag,
  ArrowLeft,
  Search,
  CheckCircle2,
  Trash2,
  RefreshCw,
  FolderPlus,
  Download,
  AlertTriangle,
  Save,
  Users,
  UserPlus,
  RotateCcw
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
  const [activeTab, setActiveTab] = useState<'courses' | 'payments' | 'questions' | 'users' | 'notifications'>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [searchQuestionQuery, setSearchQuestionQuery] = useState('');

  // Payment requests & activation codes state
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);

  // User Management State (Item 3)
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'admin'>('student');
  const [userRegisterMsg, setUserRegisterMsg] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  
  // Code Generator state
  const [genEmail, setGenEmail] = useState('');
  const [genCourseId, setGenCourseId] = useState(courses[0]?.id || '');
  const [generatedCodeResult, setGeneratedCodeResult] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Question Editing Popup Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<MockExamQuestion | null>(null);
  const [qText, setQText] = useState('');
  const [choiceA, setChoiceA] = useState('');
  const [choiceB, setChoiceB] = useState('');
  const [choiceC, setChoiceC] = useState('');
  const [choiceD, setChoiceD] = useState('');
  const [correctAns, setCorrectAns] = useState('A');
  const [explanationText, setExplanationText] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  // Course Editing Popup Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState<number>(29.99);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPlatform, setEditPlatform] = useState<'O11' | 'ODC'>('O11');
  const [editIsNew, setEditIsNew] = useState(false);
  const [courseSaveMsg, setCourseSaveMsg] = useState('');

  // CSV Import & Confirmation Modal State
  const [isConfirmImportOpen, setIsConfirmImportOpen] = useState(false);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');
  const csvFileInputRef = useRef<HTMLInputElement>(null);

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

  const fetchUsers = () => {
    fetch('/api/admin/users', { headers: getAdminHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.users) setUsersList(data.users);
        if (data && data.codes) setActivationCodes(data.codes);
      })
      .catch(() => {});
  };

  // Fetch data on load
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

    fetchUsers();

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

  // User Registration Handler (Item 3)
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) return;

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserFullName,
          role: newUserRole
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setUserRegisterMsg(`❌ ${data.error || 'Failed to register user.'}`);
      } else {
        setUserRegisterMsg(`✅ ${data.message || 'User registered successfully!'}`);
        fetchUsers();
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserFullName('');
      }
    } catch (err: any) {
      setUserRegisterMsg(`❌ Error: ${err.message || 'Network error'}`);
    }
  };

  // Code Reset Handler (Item 3)
  const handleResetUserCode = async (userEmail: string, courseId: string) => {
    if (!confirm(`Are you sure you want to reset and revoke activation code for user ${userEmail}?`)) return;
    try {
      const res = await fetch('/api/admin/users/reset-code', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ userEmail, courseId })
      });
      const data = await res.json();
      alert(data.message || 'Code reset successfully.');
      fetchUsers();
    } catch (err) {
      alert('Could not reset code.');
    }
  };

  // Open Course Edit Popup Modal
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

  // Handle Course Cover Image File Import (Local Binary Base64)
  const handleCourseImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setEditImageUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Question Diagram Image File Import (Local Binary Base64)
  const handleQuestionImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImgUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
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
      }, 1000);
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

  // Open Question Edit Modal
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQText('');
    setChoiceA('');
    setChoiceB('');
    setChoiceC('');
    setChoiceD('');
    setCorrectAns('A');
    setExplanationText('');
    setImgUrl('');
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: MockExamQuestion) => {
    setEditingQuestion(q);
    setQText(q.question);
    setChoiceA(q.choices.find((c) => c.key === 'A')?.text || '');
    setChoiceB(q.choices.find((c) => c.key === 'B')?.text || '');
    setChoiceC(q.choices.find((c) => c.key === 'C')?.text || '');
    setChoiceD(q.choices.find((c) => c.key === 'D')?.text || '');
    setCorrectAns(q.correctAnswer);
    setExplanationText(q.explanation);
    setImgUrl(q.imageUrl || '');
    setIsQuestionModalOpen(true);
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
    setIsQuestionModalOpen(false);
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

  // SAVE ALL QUESTIONS TO SUPABASE DATABASE
  const handleSaveAllQuestionsToSupabase = async (targetQuestions?: MockExamQuestion[]) => {
    const selectedCourseObj = courses.find((c) => c.id === selectedCourseId);
    const questionsToSave = targetQuestions || selectedCourseObj?.mockExam || [];
    
    setIsSavingQuestions(true);
    setCsvMessage('');

    try {
      const res = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          courseId: selectedCourseId,
          questions: questionsToSave
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCsvMessage(`❌ Save Note: ${data.error || data.message || 'Server error while saving to database.'}`);
      } else {
        setCsvMessage(`✅ ${data.message || `Successfully saved ${questionsToSave.length} questions to Supabase!`}`);
      }
    } catch (err: any) {
      setCsvMessage(`❌ Error: ${err.message || 'Network error while saving'}`);
    } finally {
      setIsSavingQuestions(false);
    }
  };

  // DOWNLOAD CSV TEMPLATE
  const handleDownloadTemplate = () => {
    const templateHeader = "Question,Question Type,Answer Option 1,Explanation 1,Answer Option 2,Explanation 2,Answer Option 3,Explanation 3,Answer Option 4,Explanation 4,Answer Option 5,Explanation 5,Answer Option 6,Explanation 6,Correct Answers,Overall Explanation,Domain\n";
    const sampleRow = '"What is an important decision for a delivery specialist regarding positioning in the organization?",multiple-choice,"Whether to be seen as a driver for improvements",,"Whether to ignore customer concerns",,"Whether to avoid all non-technical discussions",,"Whether to delegate all communication to the IT manager",,,,,,1,"Official OutSystems Explanation","OutSystems Delivery Specialist"\n';
    
    const blob = new Blob([templateHeader + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TemplateOSDump.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // FILE SELECTION CSV IMPORT & AUTOMATIC SUPABASE SYNC
  const handleCsvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      if (!csvText) return;

      const parseLineCells = (line: string) => {
        const cells: string[] = [];
        let cell = '';
        let insideQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') {
            insideQuotes = !insideQuotes;
          } else if (c === ',' && !insideQuotes) {
            cells.push(cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            cell = '';
          } else {
            cell += c;
          }
        }
        cells.push(cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        return cells;
      };

      const rawLines = csvText.split('\n').filter((l) => l.trim() !== '');
      if (rawLines.length < 2) {
        setCsvMessage('Invalid CSV file: At least 2 lines (header + data row) required.');
        return;
      }

      const headerCells = parseLineCells(rawLines[0]).map(h => h.toLowerCase());
      const newQuestions: MockExamQuestion[] = [];

      for (let i = 1; i < rawLines.length; i++) {
        const cells = parseLineCells(rawLines[i]);
        if (cells.length < 2) continue;

        const questionText = cells[0];
        if (!questionText || questionText.toLowerCase() === 'question') continue;

        const choices: { key: string; text: string }[] = [];
        let correctKey = 'A';
        let explanation = 'Official OutSystems Exam Question';

        const opt1Idx = headerCells.findIndex(h => h.includes('answer option 1') || h === 'choice a' || h === 'option a');
        const opt2Idx = headerCells.findIndex(h => h.includes('answer option 2') || h === 'choice b' || h === 'option b');
        const opt3Idx = headerCells.findIndex(h => h.includes('answer option 3') || h === 'choice c' || h === 'option c');
        const opt4Idx = headerCells.findIndex(h => h.includes('answer option 4') || h === 'choice d' || h === 'option d');
        const correctIdx = headerCells.findIndex(h => h.includes('correct answer') || h.includes('correctanswers') || h.includes('correct'));
        const expIdx = headerCells.findIndex(h => h.includes('overall explanation') || h.includes('explanation'));

        if (opt1Idx !== -1 && opt2Idx !== -1) {
          if (cells[opt1Idx]) choices.push({ key: 'A', text: cells[opt1Idx] });
          if (cells[opt2Idx]) choices.push({ key: 'B', text: cells[opt2Idx] });
          if (opt3Idx !== -1 && cells[opt3Idx]) choices.push({ key: 'C', text: cells[opt3Idx] });
          if (opt4Idx !== -1 && cells[opt4Idx]) choices.push({ key: 'D', text: cells[opt4Idx] });

          if (correctIdx !== -1 && cells[correctIdx]) {
            const rawAns = cells[correctIdx].trim();
            const num = parseInt(rawAns, 10);
            if (num === 1) correctKey = 'A';
            else if (num === 2) correctKey = 'B';
            else if (num === 3) correctKey = 'C';
            else if (num === 4) correctKey = 'D';
            else if (['A', 'B', 'C', 'D'].includes(rawAns.toUpperCase())) correctKey = rawAns.toUpperCase();
          }

          if (expIdx !== -1 && cells[expIdx]) {
            explanation = cells[expIdx];
          }
        } else {
          if (cells[1]) choices.push({ key: 'A', text: cells[1] });
          if (cells[2]) choices.push({ key: 'B', text: cells[2] });
          if (cells[3]) choices.push({ key: 'C', text: cells[3] });
          if (cells[4]) choices.push({ key: 'D', text: cells[4] });

          if (cells[5]) {
            correctKey = cells[5].trim().toUpperCase();
          }
          if (cells[6]) explanation = cells[6];
        }

        if (questionText && choices.length >= 2) {
          newQuestions.push({
            id: `csv_q_${Date.now()}_${i}`,
            question: questionText,
            choices: choices,
            correctAnswer: correctKey,
            explanation: explanation
          });
        }
      }

      if (newQuestions.length > 0) {
        // REPLACES ALL OLD QUESTIONS WITH FRESH NEW CSV QUESTIONS
        const updatedCourses = courses.map((c) => {
          if (c.id === selectedCourseId) {
            return { ...c, mockExam: newQuestions };
          }
          return c;
        });

        onUpdateCourses(updatedCourses);
        // Automatically save to Supabase
        await handleSaveAllQuestionsToSupabase(newQuestions);
      } else {
        setCsvMessage('Could not parse questions. Check CSV columns format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const filteredQuestions = (selectedCourse.mockExam || []).filter(q => 
    q.question.toLowerCase().includes(searchQuestionQuery.toLowerCase()) ||
    q.choices.some(c => c.text.toLowerCase().includes(searchQuestionQuery.toLowerCase()))
  );

  const filteredUsers = usersList.filter(u =>
    u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    (u.fullName && u.fullName.toLowerCase().includes(searchUserQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative">
      
      {/* Top Navbar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Back to Portal Home</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-bold shadow-md shadow-red-900/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                OutSystems Admin Command Center
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  LIVE SECURE SESSION
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Admin: <strong className="text-slate-200">duongrbt@gmail.com</strong> — Supabase 9-Table Database Sync Enabled
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>User Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Payments & Codes</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Question Bank</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>Alerts & API</span>
          </button>
        </div>
      </header>

      {/* Hidden File Input for CSV File Selection */}
      <input
        type="file"
        ref={csvFileInputRef}
        accept=".csv"
        className="hidden"
        onChange={handleCsvFileSelected}
      />

      {/* Main Full-Screen Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-8">

        {/* TAB 1: COURSE CATALOG MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  Course Catalog & Pricing Management
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Edit Details" on any course to open the interactive editor popup modal.
                </p>
              </div>

              <span className="text-xs font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3.5 py-1.5 rounded-xl">
                {courses.length} Active Certification Courses
              </span>
            </div>

            {/* Course Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/80 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                      <img
                        src={c.imageUrl}
                        alt={c.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'; }}
                      />
                      <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-xs font-mono font-extrabold text-sm text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/30">
                        ${c.price}
                      </div>
                      <div className="absolute bottom-2 left-2 flex gap-1.5">
                        {c.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              t.color === 'purple' ? 'bg-purple-900/80 text-purple-200 border border-purple-700' :
                              t.color === 'orange' ? 'bg-amber-900/80 text-amber-200 border border-amber-700' :
                              'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                            }`}
                          >
                            {t.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-sm text-white line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenCourseEditor(c)}
                    className="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 hover:border-blue-600 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: USER ACCOUNTS & ACCESS CODES (Item 3) */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-emerald-400" />
              User Accounts Management & Code Reset
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Registration Form */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" /> Register New Student / Admin Account
                </h3>

                {userRegisterMsg && (
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs font-bold text-emerald-400">
                    {userRegisterMsg}
                  </div>
                )}

                <form onSubmit={handleRegisterUser} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">User Email</label>
                    <input
                      type="email"
                      required
                      placeholder="student@gmail.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Account Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Assign password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Full Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="Nguyen Van A"
                      value={newUserFullName}
                      onChange={(e) => setNewUserFullName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as 'student' | 'admin')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-bold"
                    >
                      <option value="student">Student (Học viên)</option>
                      <option value="admin">Admin (Quản trị viên)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" /> Create User Account
                  </button>
                </form>
              </div>

              {/* Users Table & Code Reset Actions */}
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Registered Users ({usersList.length})
                  </h3>

                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchUserQuery}
                      onChange={(e) => setSearchUserQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const userCodes = activationCodes.filter(c => c.userEmail.toLowerCase() === u.email.toLowerCase());
                      return (
                        <div
                          key={u.id}
                          className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white">{u.email}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}>
                                  {u.role.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{u.fullName || 'No Name'}</p>
                            </div>

                            <span className="text-[10px] font-mono text-slate-500">
                              Password: <strong className="text-slate-300 font-bold">{u.password || '••••••••'}</strong>
                            </span>
                          </div>

                          {/* Codes Allocation & Reset */}
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Assigned Course Activation Codes ({userCodes.length}):
                            </span>
                            {userCodes.length > 0 ? (
                              <div className="space-y-1.5">
                                {userCodes.map((c) => {
                                  const courseObj = courses.find(cr => cr.id === c.courseId);
                                  return (
                                    <div key={c.id} className="flex items-center justify-between gap-2 text-xs bg-slate-900 p-2 rounded border border-slate-800">
                                      <div>
                                        <p className="font-bold text-blue-300">{courseObj?.title || c.courseId}</p>
                                        <p className="font-mono text-[11px] text-emerald-400">{c.code} ({c.status})</p>
                                      </div>
                                      <button
                                        onClick={() => handleResetUserCode(u.email, c.courseId)}
                                        className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer shrink-0"
                                      >
                                        <RotateCcw className="w-3 h-3 text-red-400" /> Reset Code
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-500 italic">No activation codes issued yet.</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-8">
                      No user accounts found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS & CODE GENERATOR */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-blue-400" />
              Payments & Manual Activation Code Generator
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Code Generator Form */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" /> Issue New Activation Code
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Student Email</label>
                    <input
                      type="email"
                      placeholder="student@gmail.com"
                      value={genEmail}
                      onChange={(e) => setGenEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Select Target Course</label>
                    <select
                      value={genCourseId}
                      onChange={(e) => setGenCourseId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleGenerateCode(genEmail, genCourseId)}
                    disabled={!genEmail}
                    className={`w-full font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                      genEmail
                        ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" /> Generate Code
                  </button>

                  {generatedCodeResult && (
                    <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-xl space-y-2 animate-in fade-in duration-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Generated Activation Code:
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono font-extrabold text-sm text-emerald-200 select-all">
                          {generatedCodeResult}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedCodeResult);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-700 cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Requests Table */}
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  Payment Requests ({paymentRequests.length})
                </h3>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {paymentRequests.length > 0 ? (
                    paymentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{req.userEmail}</span>
                            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">{req.courseTitle}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Requested: {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setGenEmail(req.userEmail);
                            setGenCourseId(req.courseId);
                            handleGenerateCode(req.userEmail, req.courseId);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer shrink-0"
                        >
                          Issue Code
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-8">
                      No pending payment requests yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUESTION BANK & CSV FILE IMPORTER */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2.5">
                  <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                  Question Bank & CSV File Importer
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Import CSV files from your computer or download TemplateOSDump.csv format.
                </p>
              </div>

              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-blue-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.mockExam?.length || 0} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* CSV Action Controls Box & Save Button */}
            <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-400" /> CSV Question Import & Database Sync
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target Course: <strong className="text-blue-300">{selectedCourse.title}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Download Template Button */}
                  <button
                    onClick={handleDownloadTemplate}
                    className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download CSV Template</span>
                  </button>

                  {/* Import Questions Button */}
                  <button
                    onClick={() => setIsConfirmImportOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Questions</span>
                  </button>

                  {/* PROMINENT SAVE TO SUPABASE BUTTON */}
                  <button
                    onClick={() => handleSaveAllQuestionsToSupabase()}
                    disabled={isSavingQuestions}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-white" />
                    <span>{isSavingQuestions ? 'Saving...' : 'Save to Supabase Database'}</span>
                  </button>
                </div>
              </div>

              {csvMessage && (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs font-bold text-emerald-400 animate-in fade-in">
                  {csvMessage}
                </div>
              )}
            </div>

            {/* Questions Table & Search */}
            <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700 pb-3">
                <h3 className="font-display font-bold text-xs text-slate-300">
                  Questions for <span className="text-white">{selectedCourse.title}</span> ({selectedCourse.mockExam?.length || 0})
                </h3>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter questions..."
                      value={searchQuestionQuery}
                      onChange={(e) => setSearchQuestionQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleOpenAddQuestion}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-slate-900 border border-slate-700/80 p-4 rounded-xl text-xs flex justify-between items-start gap-4 hover:border-slate-600 transition-all cursor-pointer"
                      onClick={() => handleOpenEditQuestion(q)}
                    >
                      <div className="space-y-2 flex-1">
                        <p className="font-bold text-slate-100 leading-relaxed">
                          {idx + 1}. {q.question}
                        </p>

                        {q.imageUrl && (
                          <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg inline-block">
                            <img src={q.imageUrl} alt="Diagram" className="max-h-24 object-contain rounded" />
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                          {q.choices.map((c) => (
                            <div
                              key={c.key}
                              className={`p-2 rounded-lg border ${
                                c.key === q.correctAnswer
                                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                                  : 'bg-slate-950/50 border-slate-800 text-slate-400'
                              }`}
                            >
                              <span className="font-mono font-bold mr-1.5">{c.key}.</span> {c.text}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="text-blue-400 hover:text-blue-200 p-1.5 hover:bg-slate-800 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-400 hover:text-red-200 p-1.5 hover:bg-slate-800 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-8">
                    No questions found in this course bank.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GMAIL & TELEGRAM NOTIFICATION ALERTS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2.5">
              <BellRing className="w-6 h-6 text-amber-400" />
              Dual Notification Alerts (Gmail SMTP & Telegram Bot)
            </h2>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
              {notifStatusMsg && (
                <div className="bg-blue-900/40 text-blue-300 text-xs p-4 rounded-xl border border-blue-500/50 font-bold">
                  {notifStatusMsg}
                </div>
              )}

              <form onSubmit={handleSaveNotificationSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gmail Settings */}
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 space-y-4">
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-400" /> Gmail SMTP Configuration
                    </h3>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Admin Gmail Address</label>
                      <input
                        type="email"
                        value={adminEmailSetting}
                        onChange={(e) => setAdminEmailSetting(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Gmail App Password (16 chars)</label>
                      <input
                        type="password"
                        value={gmailAppPassword}
                        onChange={(e) => setGmailAppPassword(e.target.value)}
                        placeholder="xxxx xxxx xxxx xxxx"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={testingEmail}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-blue-400" />
                      <span>{testingEmail ? 'Sending...' : 'Test Gmail Alert'}</span>
                    </button>
                  </div>

                  {/* Telegram Settings */}
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 space-y-4">
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-blue-400" /> Telegram Bot Configuration
                    </h3>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Telegram Bot Token</label>
                      <input
                        type="password"
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        placeholder="123456789:ABCdef..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Telegram Chat ID</label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="987654321"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={testingTelegram}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-blue-400" />
                      <span>{testingTelegram ? 'Sending...' : 'Test Telegram Alert'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg cursor-pointer"
                >
                  Save Notification Settings
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* POPUP MODAL 1: CONFIRMATION MODAL FOR CSV IMPORT */}
      {isConfirmImportOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center font-bold border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Confirm Question Bank Replacement</h3>
                <p className="text-xs text-slate-400">Course: <span className="text-blue-300 font-bold">{selectedCourse.title}</span></p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl text-xs text-slate-300 space-y-2 leading-relaxed">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                ⚠️ Warning: Existing Question Bank Will Be Deleted & Replaced
              </p>
              <p>
                Proceeding with CSV import will <strong className="text-white">DELETE ALL {selectedCourse.mockExam?.length || 0} existing questions</strong> for this course and populate it with fresh questions from your CSV file.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmImportOpen(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmImportOpen(false);
                  setTimeout(() => {
                    csvFileInputRef.current?.click();
                  }, 100);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Yes, Proceed & Choose CSV File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: COURSE EDIT MODAL OVERLAY */}
      {editingCourse && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Edit Course: <span className="text-blue-300">{editingCourse.title}</span>
              </h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {courseSaveMsg && (
              <div className="bg-emerald-900/40 text-emerald-300 text-xs p-3 rounded-xl border border-emerald-500/50 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {courseSaveMsg}
              </div>
            )}

            <form onSubmit={handleSaveCourseEdits} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Course Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-emerald-400 font-mono font-extrabold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Course Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Cover Image (URL or Local File Upload)</span>
                    <span className="text-[10px] text-blue-400 font-normal">Stored as Binary Base64</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://... or upload file"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 font-mono outline-none focus:border-blue-500"
                    />
                    <label className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-600 flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Local</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCourseImageFileUpload} />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Platform Tag</label>
                  <select
                    value={editPlatform}
                    onChange={(e) => setEditPlatform(e.target.value as 'O11' | 'ODC')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold outline-none focus:border-blue-500"
                  >
                    <option value="O11">O11 Platform</option>
                    <option value="ODC">ODC Platform</option>
                  </select>
                </div>
              </div>

              {/* Live Image Preview */}
              {editImageUrl && (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-2xl flex items-center gap-3">
                  <img
                    src={editImageUrl}
                    alt="Live Cover Preview"
                    className="w-20 h-14 object-cover rounded-xl border border-slate-700"
                    onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'; }}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-300">Live Cover Image Preview</span>
                    <p className="text-[10px] text-slate-500 font-mono line-clamp-1">{editImageUrl.substring(0, 60)}...</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg"
                >
                  Save & Sync to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: QUESTION EDIT POPUP MODAL OVERLAY */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                {editingQuestion ? 'Edit Question Details' : 'Add New Question'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Question Text (Đề Bài)</label>
                <textarea
                  rows={3}
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter exam question text..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 font-medium leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Question Diagram / Illustration Image (Ảnh Minh Họa Đề Bài)</span>
                  <span className="text-[10px] text-blue-400">Local Upload or URL</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    placeholder="https://... or upload local image file"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 font-mono outline-none focus:border-blue-500"
                  />
                  <label className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-600 flex items-center gap-1 cursor-pointer shrink-0">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Upload Local Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleQuestionImageFileUpload} />
                  </label>
                </div>
              </div>

              {imgUrl && (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-3">
                  <img src={imgUrl} alt="Question Illustration" className="h-16 object-contain rounded border border-slate-700" />
                  <span className="text-xs text-slate-400 font-medium">Question Diagram Preview</span>
                </div>
              )}

              {/* Choices A, B, C, D */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Choice A</label>
                  <input
                    type="text"
                    required
                    value={choiceA}
                    onChange={(e) => setChoiceA(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Choice B</label>
                  <input
                    type="text"
                    required
                    value={choiceB}
                    onChange={(e) => setChoiceB(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Choice C</label>
                  <input
                    type="text"
                    value={choiceC}
                    onChange={(e) => setChoiceC(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Choice D</label>
                  <input
                    type="text"
                    value={choiceD}
                    onChange={(e) => setChoiceD(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Correct Answer</label>
                  <select
                    value={correctAns}
                    onChange={(e) => setCorrectAns(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-emerald-400 font-bold outline-none focus:border-blue-500"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Explanation (Giải thích đáp án)</label>
                  <input
                    type="text"
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    placeholder="Enter answer explanation..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg"
                >
                  Save Question Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
