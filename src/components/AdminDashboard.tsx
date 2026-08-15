import React, { useState, useEffect, useRef } from 'react';
import { Course, MockExamQuestion, PaymentRequest, ActivationCode, ExamSet } from '../types';
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
  RotateCcw,
  FolderUp,
  FolderInput,
  Zap,
  AlertCircle
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
  const [activeTab, setActiveTab] = useState<'courses' | 'payments' | 'questions' | 'users' | 'notifications' | 'bulk_import'>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [searchQuestionQuery, setSearchQuestionQuery] = useState('');

  // Bulk Import Folder State
  const [bulkCourseId, setBulkCourseId] = useState<string>(courses[0]?.id || '');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkStatusMsg, setBulkStatusMsg] = useState('');
  const [bulkParsedSets, setBulkParsedSets] = useState<ExamSet[]>([]);
  const [bulkParsedQuestions, setBulkParsedQuestions] = useState<MockExamQuestion[]>([]);
  const [bulkImgCount, setBulkImgCount] = useState(0);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');
  const [bulkErrorMsg, setBulkErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const bulkFolderInputRef = useRef<HTMLInputElement>(null);

  // Exam Set Management State (Screenshot 1 & Screenshot 2)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [setFormTitle, setSetFormTitle] = useState('Dump 01');
  const [setFormDesc, setSetFormDesc] = useState('');
  const [setFormDuration, setSetFormDuration] = useState<number>(90);
  const [setFormPassing, setSetFormPassing] = useState<number>(70);
  const [setFormRandomize, setSetFormRandomize] = useState<boolean>(false);
  const [csvImportMode, setCsvImportMode] = useState<'replace_all' | 'target_set'>('replace_all');

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
  const [editPreviewLimit, setEditPreviewLimit] = useState<number>(10);
  const [courseSaveMsg, setCourseSaveMsg] = useState('');

  // Create New Course Popup Modal State
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState<number>(19.99);
  const [newCourseImageUrl, setNewCourseImageUrl] = useState('');
  const [newCoursePlatform, setNewCoursePlatform] = useState<'O11' | 'ODC'>('O11');
  const [newCourseIsNew, setNewCourseIsNew] = useState(false);
  const [newCoursePreviewLimit, setNewCoursePreviewLimit] = useState<number>(10);
  const [createCourseMsg, setCreateCourseMsg] = useState('');

  // CSV Import & Confirmation Modal State
  const [isConfirmImportOpen, setIsConfirmImportOpen] = useState(false);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Notification Settings State
  const [adminEmailSetting, setAdminEmailSetting] = useState('');
  const [gmailAppPassword, setGmailAppPassword] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [notifStatusMsg, setNotifStatusMsg] = useState('');
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // Code Edit Modal State (CRUD - Update & Delete)
  const [isEditCodeModalOpen, setIsEditCodeModalOpen] = useState(false);
  const [editingCodeObj, setEditingCodeObj] = useState<ActivationCode | null>(null);
  const [editCodeStr, setEditCodeStr] = useState('');
  const [editCodeEmail, setEditCodeEmail] = useState('');
  const [editCodeCourseId, setEditCodeCourseId] = useState('');
  const [codeSearchQuery, setCodeSearchQuery] = useState('');
  const [sendingMailCodeId, setSendingMailCodeId] = useState<string | null>(null);

  // Send Email with Activation Code to Student (Item 2)
  const handleSendCodeEmail = async (codeObj: ActivationCode) => {
    setSendingMailCodeId(codeObj.id);
    try {
      const res = await fetch('/api/admin/codes/send-email', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          code: codeObj.code,
          email: codeObj.userEmail,
          courseId: codeObj.courseId
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`❌ Send Mail Error: ${data.error || 'Failed to send email.'}`);
      } else {
        alert(`✅ ${data.message || `Đã gửi mã kích hoạt ${codeObj.code} thành công tới ${codeObj.userEmail}!`}`);
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message || 'Could not send email.'}`);
    } finally {
      setSendingMailCodeId(null);
    }
  };

  // Re-Generate Code & Send Automatic Email (Item 2)
  const handleRegenerateCode = async (codeObj: ActivationCode) => {
    if (!confirm(`Bạn có chắc chắn muốn TẠO MỚI mã code cho học viên "${codeObj.userEmail}"?\n(Mã cũ ${codeObj.code} sẽ bị thay thế bằng mã mới)`)) return;

    try {
      const res = await fetch('/api/admin/codes/regenerate', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          id: codeObj.id,
          oldCode: codeObj.code,
          email: codeObj.userEmail,
          courseId: codeObj.courseId
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`❌ Regenerate Error: ${data.error || 'Failed to regenerate code.'}`);
      } else {
        const newCode = data.newCode;
        setActivationCodes(prev => prev.map(c => c.id === codeObj.id ? { ...c, code: newCode } : c));
        alert(`✅ ${data.message || `Đã cấp mã mới (${newCode}) và gửi email tới ${codeObj.userEmail}!`}`);
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message || 'Could not regenerate code.'}`);
    }
  };

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
          if (data.emailApiKey) setEmailApiKey(data.emailApiKey);
        }
      })
      .catch(() => {});
  }, [courses]);

  // Alphabetical A -> Z sorted courses list
  const sortedCourses = [...courses].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

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
  // Delete User Handler (Item 1)
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE user "${email}"?`)) return;
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ userId, email })
      });
      const data = await res.json();
      alert(data.message || 'User deleted successfully.');
      fetchUsers();
    } catch (err) {
      alert('Could not delete user.');
    }
  };

  // Toggle User Status Active/Inactive Handler (Item 1)
  const handleToggleUserStatus = async (userId: string, email: string, currentStatus: string) => {
    const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
    try {
      const res = await fetch('/api/admin/users/toggle-status', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ userId, email, newStatus })
      });
      const data = await res.json();
      alert(data.message || `User status updated to ${newStatus}.`);
      fetchUsers();
    } catch (err) {
      alert('Could not update user status.');
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
    setEditPreviewLimit(c.previewLimit && c.previewLimit > 0 ? c.previewLimit : 10);
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
      previewLimit: Number(editPreviewLimit) || 10,
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
      if (!res.ok || !data.success) {
        setCourseSaveMsg(`❌ Database Note: ${data.error || data.message || 'Server error while saving to database.'}`);
      } else {
        setCourseSaveMsg(`✅ ${data.message || 'Course updated successfully in database!'}`);
      }
    } catch (err: any) {
      setCourseSaveMsg(`❌ Error: ${err.message || 'Could not connect to server.'}`);
    } finally {
      setTimeout(() => {
        setEditingCourse(null);
        setCourseSaveMsg('');
      }, 1500);
    }
  };

  // Create New Course Handler
  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const customId = 'course_custom_' + Date.now();
    const newCourse: Course = {
      id: customId,
      title: newCourseTitle.trim(),
      description: newCourseDescription.trim() || 'Complete verified practice tests and exam dump questions.',
      price: Number(newCoursePrice),
      imageUrl: newCourseImageUrl.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      previewLimit: Number(newCoursePreviewLimit) || 10,
      tags: [
        { text: newCoursePlatform, color: newCoursePlatform === 'O11' ? 'purple' : 'orange' },
        ...(newCourseIsNew ? [{ text: 'NEW', color: 'green' }] : [])
      ],
      previewQuestions: [],
      mockExam: [],
      examSets: []
    };

    onUpdateCourses([...courses, newCourse]);

    try {
      const res = await fetch('/api/admin/courses/upsert', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(newCourse)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCreateCourseMsg(`❌ Database Note: ${data.error || 'Saved to session.'}`);
      } else {
        setCreateCourseMsg(`✅ Khóa học "${newCourseTitle}" đã được tạo thành công!`);
      }
    } catch (err: any) {
      setCreateCourseMsg(`✅ Khóa học "${newCourseTitle}" đã được tạo thành công!`);
    } finally {
      setTimeout(() => {
        setIsCreateCourseModalOpen(false);
        setNewCourseTitle('');
        setNewCourseDescription('');
        setNewCoursePrice(19.99);
        setNewCourseImageUrl('');
        setNewCoursePlatform('O11');
        setNewCourseIsNew(false);
        setCreateCourseMsg('');
      }, 1200);
    }
  };

  // Delete Course Handler
  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN khóa học "${courseTitle}"?\n(Hành động này sẽ xóa khóa học khỏi danh sách hiển thị và CSDL)`)) return;

    const updatedList = courses.filter(c => c.id !== courseId);
    onUpdateCourses(updatedList);

    try {
      const res = await fetch('/api/admin/courses/delete', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ courseId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message || `Đã xóa khóa học "${courseTitle}" thành công!`}`);
      } else {
        alert(`❌ Delete Error: ${data.error || 'Could not delete course from database.'}`);
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message || 'Could not connect to server.'}`);
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
          emailApiKey: emailApiKey
        })
      });

      const data = await res.json();
      setNotifStatusMsg(data.message || 'Notification settings saved successfully!');
    } catch (err) {
      setNotifStatusMsg('Saved settings to local session.');
    }
  };

  // --------------------------------------------------------------------------
  // BULK FOLDER IMPORT LOGIC (CSV-First + HTML Image Enrichment)
  // --------------------------------------------------------------------------
  const processFolderFiles = async (filesList: File[] | FileList) => {
    setBulkProcessing(true);
    setBulkStatusMsg('Đang đọc và quét các file trong thư mục...');
    setBulkErrorMsg('');
    setBulkSuccessMsg('');
    setBulkParsedQuestions([]);
    setBulkParsedSets([]);

    try {
      const filesArr = Array.from(filesList);

      // Auto-detect course ID from folder name if available
      const samplePath = (filesArr[0] as any)?.webkitRelativePath || '';
      if (samplePath) {
        const folderName = samplePath.split('/')[0].toLowerCase();
        const matchedCourse = courses.find(c => {
          const t = c.title.toLowerCase();
          const id = c.id.toLowerCase();
          return t.includes(folderName) || id.includes(folderName) || 
            (folderName.includes('agentic') && t.includes('agentic')) ||
            (folderName.includes('traditional') && t.includes('traditional')) ||
            (folderName.includes('reactive') && t.includes('reactive')) ||
            (folderName.includes('mobile') && t.includes('mobile')) ||
            (folderName.includes('delivery') && t.includes('delivery')) ||
            (folderName.includes('security') && t.includes('security')) ||
            (folderName.includes('techlead') && t.includes('techlead')) ||
            (folderName.includes('front-end') && t.includes('front-end')) ||
            (folderName.includes('platform') && t.includes('platform')) ||
            (folderName.includes('web specialist') && t.includes('web specialist'));
        });
        if (matchedCourse) {
          setBulkCourseId(matchedCourse.id);
        }
      }

      const csvFiles = filesArr.filter(f => /\.csv$/i.test(f.name));
      const htmlFiles = filesArr.filter(f => /\.(html?|htm)$/i.test(f.name));
      const imgFiles = filesArr.filter(f => /\.(png|jpe?g|gif|svg|webp)$/i.test(f.name));

      if (csvFiles.length === 0 && htmlFiles.length === 0) {
        setBulkErrorMsg('Không tìm thấy file .csv hoặc .html nào trong thư mục đã chọn.');
        setBulkProcessing(false);
        return;
      }

      // Step 1: Convert & compress image files to lightweight Base64 (max 900px, quality 0.75)
      setBulkStatusMsg(`Đang đọc & tối ưu hóa nén ${imgFiles.length} file hình ảnh sơ đồ sang mã nhúng Base64...`);
      const imageMap: Record<string, string> = {};

      const compressImageFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const maxW = 900;
              const maxH = 900;

              if (width > maxW || height > maxH) {
                if (width / height > maxW / maxH) {
                  height = Math.round((height * maxW) / width);
                  width = maxW;
                } else {
                  width = Math.round((width * maxH) / height);
                  height = maxH;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.75));
              } else {
                resolve(e.target?.result as string || '');
              }
            };
            img.onerror = () => resolve(e.target?.result as string || '');
            img.src = e.target?.result as string;
          };
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      };

      for (const imgFile of imgFiles) {
        const base64 = await compressImageFile(imgFile);
        if (base64) {
          imageMap[imgFile.name.toLowerCase()] = base64;
          const relPath = (imgFile as any).webkitRelativePath;
          if (relPath) {
            imageMap[relPath.toLowerCase()] = base64;
            const parts = relPath.split('/');
            if (parts.length > 1) {
              imageMap[parts.slice(1).join('/').toLowerCase()] = base64;
            }
          }
        }
      }

      // Step 2: Build Question Text -> Base64 Image Map from HTML files
      setBulkStatusMsg(`Đang quét ${htmlFiles.length} file HTML để bóc tách các sơ đồ hình ảnh...`);
      const htmlImageMap: Record<string, string> = {};
      const parser = new DOMParser();

      for (const htmlFile of htmlFiles) {
        const htmlContent = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsText(htmlFile);
        });

        const doc = parser.parseFromString(htmlContent, 'text/html');
        const questionNodes = Array.from(doc.querySelectorAll('.result-pane--question-result-pane-wrapper--2bGiz, [class*="question-result-pane-wrapper"], #question-prompt'));

        questionNodes.forEach(node => {
          const promptEl = node.querySelector('#question-prompt, [id^="question-prompt"], .result-pane--question-format--PBvdY') || node;
          const imgEl = node.querySelector('img') || promptEl.querySelector('img');
          const questionText = promptEl.textContent?.replace(/\s+/g, ' ').trim();

          if (imgEl && questionText) {
            const rawSrc = imgEl.getAttribute('src') || '';
            const fileNameOnly = rawSrc.split(/[/\\]/).pop()?.toLowerCase() || '';
            const foundBase64 = imageMap[fileNameOnly] || imageMap[rawSrc.toLowerCase()];
            if (foundBase64) {
              const cleanKey = questionText.toLowerCase();
              htmlImageMap[cleanKey] = foundBase64;
              htmlImageMap[cleanKey.substring(0, 60)] = foundBase64;
            }
          }
        });
      }

      // Step 3: Parse CSV Files as Primary Question Bank Source (1.csv, 2.csv, 3.csv...)
      const parsedSetsArr: ExamSet[] = [];
      const allQsArr: MockExamQuestion[] = [];
      let totalImgAttached = 0;

      const parseCsvLine = (line: string) => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') {
            if (inQuotes && line[i+1] === '"') { cur += '"'; i++; }
            else { inQuotes = !inQuotes; }
          } else if (c === ',' && !inQuotes) {
            result.push(cur.trim()); cur = '';
          } else { cur += c; }
        }
        result.push(cur.trim());
        return result;
      };

      if (csvFiles.length > 0) {
        setBulkStatusMsg(`Đang trích xuất dữ liệu chuẩn 4 đáp án A-B-C-D từ ${csvFiles.length} file CSV (1.csv, 2.csv...)...`);

        // Sort CSV files numerically (1.csv, 2.csv, 3.csv...)
        csvFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        for (let sIdx = 0; sIdx < csvFiles.length; sIdx++) {
          const csvFile = csvFiles[sIdx];
          const csvContent = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsText(csvFile);
          });

          const lines = csvContent.split(/\r?\n/).filter(l => l.trim() !== '');
          if (lines.length <= 1) continue;

          let setTitle = `Dump 0${sIdx + 1}`;
          const fname = csvFile.name.toLowerCase();
          if (fname.includes('1.csv')) setTitle = 'Dump 01';
          else if (fname.includes('2.csv')) setTitle = 'Dump 02';
          else if (fname.includes('3.csv')) setTitle = 'Dump 03';
          else if (fname.includes('4.csv')) setTitle = 'Dump 04';
          else if (fname.includes('5.csv')) setTitle = 'Dump 05';
          else if (fname.includes('6.csv')) setTitle = 'Dump 06';

          const setQs: MockExamQuestion[] = [];

          // Detect column indices from header row
          const headerCells = parseCsvLine(lines[0]).map(h => h.toLowerCase());
          let qIdxCol = 0;
          let opt1Col = 2;
          let opt2Col = 4;
          let opt3Col = 6;
          let opt4Col = 8;
          let correctCol = 14;
          let expCol = 15;

          headerCells.forEach((h, colIdx) => {
            if (h === 'question') qIdxCol = colIdx;
            else if (h.includes('option 1')) opt1Col = colIdx;
            else if (h.includes('option 2')) opt2Col = colIdx;
            else if (h.includes('option 3')) opt3Col = colIdx;
            else if (h.includes('option 4')) opt4Col = colIdx;
            else if (h.includes('correct')) correctCol = colIdx;
            else if (h.includes('explanation')) expCol = colIdx;
          });

          for (let i = 1; i < lines.length; i++) {
            const cells = parseCsvLine(lines[i]);
            if (cells.length < 3) continue;

            const qText = cells[qIdxCol] || cells[0];
            const optA = cells[opt1Col] || cells[2] || '';
            const optB = cells[opt2Col] || cells[4] || '';
            const optC = cells[opt3Col] || cells[6] || '';
            const optD = cells[opt4Col] || cells[8] || '';

            const rawCorrect = cells[correctCol] || cells[14] || cells[5] || '1';
            let correctKey = 'A';
            const rUpper = rawCorrect.trim().toUpperCase();
            if (rUpper === '1' || rUpper === 'A') correctKey = 'A';
            else if (rUpper === '2' || rUpper === 'B') correctKey = 'B';
            else if (rUpper === '3' || rUpper === 'C') correctKey = 'C';
            else if (rUpper === '4' || rUpper === 'D') correctKey = 'D';

            const explanation = cells[expCol] || cells[15] || 'Official OutSystems Exam Question';

            const choices: { key: string; text: string }[] = [];
            if (optA) choices.push({ key: 'A', text: optA });
            if (optB) choices.push({ key: 'B', text: optB });
            if (optC) choices.push({ key: 'C', text: optC });
            if (optD) choices.push({ key: 'D', text: optD });

            if (qText && choices.length >= 2) {
              const cleanKey = qText.replace(/\s+/g, ' ').trim().toLowerCase();
              const prefixKey = cleanKey.substring(0, 60);
              const imageUrl = htmlImageMap[cleanKey] || htmlImageMap[prefixKey] || undefined;

              if (imageUrl) totalImgAttached++;

              const qObj: MockExamQuestion = {
                id: `q_csv_${sIdx+1}_${i}`,
                question: qText,
                choices: choices,
                correctAnswer: correctKey,
                explanation: explanation,
                imageUrl: imageUrl
              };
              setQs.push(qObj);
              allQsArr.push(qObj);
            }
          }

          if (setQs.length > 0) {
            parsedSetsArr.push({
              id: `set-csv-${sIdx+1}`,
              title: setTitle,
              description: `Bài kiểm tra thực hành ${setTitle}`,
              durationMinutes: 90,
              passingScorePct: 70,
              randomizeQuestions: false,
              questions: setQs
            });
          }
        }
      }

      setBulkParsedSets(parsedSetsArr);
      setBulkParsedQuestions(allQsArr);
      setBulkImgCount(totalImgAttached);

      if (allQsArr.length > 0) {
        setBulkSuccessMsg(`🎉 PHÂN TÍCH CSV & NỔI ẢNH SƠ ĐỒ HOÀN TẤT! Đã bóc tách thành công ${allQsArr.length} câu hỏi chuẩn 4 đáp án A-B-C-D thuộc ${parsedSetsArr.length} bộ đề (đã ghép ${totalImgAttached} sơ đồ ảnh). Hãy bấm nút "⚡ REPLACE ENTIRE QUESTION BANK" bên dưới để hoàn tất lưu lên hệ thống!`);
      } else {
        setBulkErrorMsg('Phân tích hoàn tất nhưng không tìm thấy câu hỏi hợp lệ trong các file CSV.');
      }
    } catch (err: any) {
      setBulkErrorMsg(`Lỗi khi đọc thư mục: ${err.message}`);
    } finally {
      setBulkProcessing(false);
      setBulkStatusMsg('');
    }
  };

  const handleDropFolder = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const files: File[] = [];
    const readEntry = async (entry: any) => {
      if (entry.isFile) {
        await new Promise<void>((resolve) => {
          entry.file((f: File) => {
            files.push(f);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const entries = await new Promise<any[]>((resolve) => {
          dirReader.readEntries((results: any[]) => resolve(results));
        });
        for (const child of entries) {
          await readEntry(child);
        }
      }
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) {
        await readEntry(entry);
      } else if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }

    if (files.length > 0) {
      processFolderFiles(files);
    } else if (e.dataTransfer.files.length > 0) {
      processFolderFiles(e.dataTransfer.files);
    }
  };

  const handleExecuteBulkReplace = async () => {
    if (bulkParsedQuestions.length === 0) {
      setBulkErrorMsg('Chưa có câu hỏi nào được phân tích từ thư mục.');
      return;
    }

    setBulkProcessing(true);
    setBulkStatusMsg('Đang lưu và đồng bộ toàn bộ Ngân hàng câu hỏi mới lên Cơ sở dữ liệu Supabase...');
    setBulkSuccessMsg('');
    setBulkErrorMsg('');

    try {
      const res = await fetch('/api/admin/questions/bulk-replace-course', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          courseId: bulkCourseId,
          examSets: bulkParsedSets,
          questions: bulkParsedQuestions
        })
      });

      const resText = await res.text();
      let data: any;
      try {
        data = JSON.parse(resText);
      } catch (parseErr) {
        if (res.status === 413 || resText.toLowerCase().includes('too large')) {
          throw new Error('Dung lượng hình ảnh câu hỏi vượt quá giới hạn máy chủ (413 Payload Too Large). Vui lòng tải lại thư mục để áp dụng bộ nén ảnh tự động.');
        }
        throw new Error(`Máy chủ phản hồi trang lỗi HTML (Mã HTTP ${res.status}). Vui lòng kiểm tra lại quyền Admin hoặc kết nối mạng.`);
      }

      if (data.success) {
        const targetCourse = courses.find(c => c.id === bulkCourseId);
        const courseTitle = targetCourse ? targetCourse.title : bulkCourseId;

        setBulkSuccessMsg(`✅ THÀNH CÔNG RỰC RỠ! ${data.message || `Đã thay thế toàn bộ Ngân hàng câu hỏi (${bulkParsedQuestions.length} câu) cho khóa học "${courseTitle}" lên Supabase!`}`);

        if (targetCourse) {
          targetCourse.mockExam = bulkParsedQuestions;
          targetCourse.examSets = bulkParsedSets;
          onUpdateCourses([...courses]);
        }
      } else {
        setBulkErrorMsg(data.error || 'Lỗi khi lưu câu hỏi lên máy chủ.');
      }
    } catch (err: any) {
      setBulkErrorMsg(`Lỗi kết nối: ${err.message}`);
    } finally {
      setBulkProcessing(false);
      setBulkStatusMsg('');
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
    // Generate 6-12 uppercase alphanumeric code without spaces, e.g. OS025NABQVC9
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomPart = '';
    for (let i = 0; i < 10; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `OS${randomPart}`;

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

  // Delete Activation Code Handler (CRUD - Delete)
  const handleDeleteCode = async (codeId: string, codeStr: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE activation code "${codeStr}"?`)) return;
    try {
      const res = await fetch('/api/admin/codes/delete', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ id: codeId, code: codeStr })
      });
      const data = await res.json();
      alert(data.message || 'Code deleted successfully.');
      setActivationCodes(prev => prev.filter(c => c.id !== codeId && c.code !== codeStr));
    } catch (err) {
      alert('Could not delete code.');
    }
  };

  // Open Edit Activation Code Modal (CRUD - Update)
  const handleOpenEditCodeModal = (codeItem: ActivationCode) => {
    setEditingCodeObj(codeItem);
    setEditCodeStr(codeItem.code);
    setEditCodeEmail(codeItem.userEmail);
    setEditCodeCourseId(codeItem.courseId);
    setEditCodeStatus((codeItem.status as any) || 'active');
    setIsEditCodeModalOpen(true);
  };

  // Save Edited Activation Code (CRUD - Update)
  const handleSaveEditedCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCodeObj || !editCodeStr.trim() || !editCodeEmail.trim()) return;

    try {
      const res = await fetch('/api/admin/codes/update', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          id: editingCodeObj.id,
          oldCode: editingCodeObj.code,
          code: editCodeStr.trim().toUpperCase(),
          userEmail: editCodeEmail.trim().toLowerCase(),
          courseId: editCodeCourseId,
          status: editCodeStatus
        })
      });
      const data = await res.json();
      alert(data.message || 'Code updated successfully!');
      setIsEditCodeModalOpen(false);

      setActivationCodes(prev => prev.map(c => (c.id === editingCodeObj.id || c.code === editingCodeObj.code) ? {
        ...c,
        code: editCodeStr.trim().toUpperCase(),
        userEmail: editCodeEmail.trim().toLowerCase(),
        courseId: editCodeCourseId,
        status: editCodeStatus as any
      } : c));
    } catch (err) {
      alert('Could not update code.');
    }
  };

  // Helper to ensure course has at least 1 exam set
  const getCourseExamSets = (c: Course): ExamSet[] => {
    if (c.examSets && c.examSets.length > 0) return c.examSets;
    return [
      {
        id: 'set-1',
        title: 'Dump 01',
        description: 'Bài kiểm tra thực hành Dump 01',
        durationMinutes: 90,
        passingScorePct: 70,
        randomizeQuestions: false,
        questions: c.mockExam || []
      }
    ];
  };

  const saveExamSetsToBackend = async (cId: string, setsToSave: ExamSet[]) => {
    try {
      await fetch('/api/admin/courses/sets/update', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          courseId: cId,
          examSets: setsToSave
        })
      });
    } catch (e) {
      console.warn('Save exam sets note:', e);
    }
  };

  const handleAddExamSet = () => {
    const currentCourse = courses.find((c) => c.id === selectedCourseId);
    if (!currentCourse) return;
    const currentSets = getCourseExamSets(currentCourse);

    if (currentSets.length >= 6) {
      alert('Tối đa 6 bộ đề thi thực hành cho mỗi khóa học!');
      return;
    }

    const setNum = currentSets.length + 1;
    const newSet: ExamSet = {
      id: `set-${Date.now()}`,
      title: `Dump 0${setNum}`,
      description: `Mô tả bài kiểm tra thực hành Dump 0${setNum} cho học viên`,
      durationMinutes: 90,
      passingScorePct: 70,
      randomizeQuestions: false,
      questions: []
    };

    const updatedSets = [...currentSets, newSet];
    const updatedCourses = courses.map((c) => {
      if (c.id === selectedCourseId) {
        return { ...c, examSets: updatedSets };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    saveExamSetsToBackend(selectedCourseId, updatedSets);
  };

  const handleOpenEditExamSet = (s: ExamSet) => {
    setSelectedSetId(s.id);
    setSetFormTitle(s.title);
    setSetFormDesc(s.description || '');
    setSetFormDuration(s.durationMinutes || 90);
    setSetFormPassing(s.passingScorePct || 70);
    setSetFormRandomize(Boolean(s.randomizeQuestions));
  };

  const handleSaveSetSettings = () => {
    if (!selectedSetId) return;
    const currentCourse = courses.find((c) => c.id === selectedCourseId);
    if (!currentCourse) return;
    const currentSets = getCourseExamSets(currentCourse);

    const updatedSets = currentSets.map((s) => {
      if (s.id === selectedSetId) {
        return {
          ...s,
          title: setFormTitle,
          description: setFormDesc,
          durationMinutes: Number(setFormDuration),
          passingScorePct: Number(setFormPassing),
          randomizeQuestions: setFormRandomize
        };
      }
      return s;
    });

    const updatedCourses = courses.map((c) => {
      if (c.id === selectedCourseId) {
        return { ...c, examSets: updatedSets };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    saveExamSetsToBackend(selectedCourseId, updatedSets);
    alert('Đã lưu cấu hình bài kiểm tra thực hành thành công!');
  };

  const handleDeleteExamSet = (setId: string) => {
    const currentCourse = courses.find((c) => c.id === selectedCourseId);
    if (!currentCourse) return;
    const currentSets = getCourseExamSets(currentCourse);

    if (currentSets.length <= 1) {
      alert('Phải giữ lại ít nhất 1 bộ đề thi cho khóa học!');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa bộ đề thi này?')) return;

    const updatedSets = currentSets.filter((s) => s.id !== setId);
    const updatedCourses = courses.map((c) => {
      if (c.id === selectedCourseId) {
        return { ...c, examSets: updatedSets };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    saveExamSetsToBackend(selectedCourseId, updatedSets);
    if (selectedSetId === setId) setSelectedSetId(null);
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

    const currentCourse = courses.find((c) => c.id === selectedCourseId);
    if (!currentCourse) return;
    const currentSets = getCourseExamSets(currentCourse);
    const activeSetId = selectedSetId || currentSets[0].id;

    const updatedSets = currentSets.map((s) => {
      if (s.id === activeSetId) {
        let updatedQs = s.questions || [];
        if (editingQuestion) {
          updatedQs = updatedQs.map((q) => (q.id === editingQuestion.id ? newQ : q));
        } else {
          updatedQs = [newQ, ...updatedQs];
        }
        return { ...s, questions: updatedQs };
      }
      return s;
    });

    const allQuestions = updatedSets.flatMap(s => s.questions);
    const updatedCourses = courses.map((c) => {
      if (c.id === selectedCourseId) {
        return { ...c, mockExam: allQuestions, examSets: updatedSets };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    setIsQuestionModalOpen(false);
    saveExamSetsToBackend(selectedCourseId, updatedSets);
    handleSaveAllQuestionsToSupabase(allQuestions);
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    let finalMockQuestions: MockExamQuestion[] = [];
    const updatedCourses = courses.map((c) => {
      if (c.id === selectedCourseId) {
        finalMockQuestions = (c.mockExam || []).filter((q) => q.id !== id);
        return {
          ...c,
          mockExam: finalMockQuestions
        };
      }
      return c;
    });
    onUpdateCourses(updatedCourses);
    handleSaveAllQuestionsToSupabase(finalMockQuestions);
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

        // Find correct answer column accurately
        let correctIdx = headerCells.findIndex(h => h.trim() === 'correct answers' || h.trim() === 'correct answer' || h.trim() === 'correct');
        if (correctIdx === -1) {
          correctIdx = headerCells.findIndex(h => h.includes('correct'));
        }

        // Find Overall Explanation column accurately (MUST NOT match "Explanation 1", "Explanation 2", etc.)
        let expIdx = headerCells.findIndex(h => h.trim() === 'overall explanation' || h.trim() === 'overall_explanation');
        if (expIdx === -1) {
          expIdx = headerCells.findIndex(h => h.includes('overall explanation'));
        }
        if (expIdx === -1) {
          expIdx = headerCells.findIndex(h => h.trim() === 'explanation');
        }
        if (expIdx === -1) {
          expIdx = headerCells.findIndex(h => h.includes('explanation') && !/\d+$/.test(h.trim()));
        }

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
          // Standard Udemy 16-column layout fallback:
          // Col 0: Question, Col 2: Option 1, Col 4: Option 2, Col 6: Option 3, Col 8: Option 4, Col 14: Correct Answers, Col 15: Overall Explanation
          if (cells[2] && cells[4]) {
            if (cells[2]) choices.push({ key: 'A', text: cells[2] });
            if (cells[4]) choices.push({ key: 'B', text: cells[4] });
            if (cells[6]) choices.push({ key: 'C', text: cells[6] });
            if (cells[8]) choices.push({ key: 'D', text: cells[8] });

            if (cells[14]) {
              const rawAns = cells[14].trim();
              const num = parseInt(rawAns, 10);
              if (num === 1) correctKey = 'A';
              else if (num === 2) correctKey = 'B';
              else if (num === 3) correctKey = 'C';
              else if (num === 4) correctKey = 'D';
              else if (['A', 'B', 'C', 'D'].includes(rawAns.toUpperCase())) correctKey = rawAns.toUpperCase();
            }
            if (cells[15]) explanation = cells[15];
          } else {
            if (cells[1]) choices.push({ key: 'A', text: cells[1] });
            if (cells[2]) choices.push({ key: 'B', text: cells[2] });
            if (cells[3]) choices.push({ key: 'C', text: cells[3] });
            if (cells[4]) choices.push({ key: 'D', text: cells[4] });

            if (cells[5]) {
              const rawAns = cells[5].trim();
              const num = parseInt(rawAns, 10);
              if (num === 1) correctKey = 'A';
              else if (num === 2) correctKey = 'B';
              else if (num === 3) correctKey = 'C';
              else if (num === 4) correctKey = 'D';
              else if (['A', 'B', 'C', 'D'].includes(rawAns.toUpperCase())) correctKey = rawAns.toUpperCase();
            }
            if (cells[6]) explanation = cells[6];
          }
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
        const currentCourse = courses.find((c) => c.id === selectedCourseId);
        if (!currentCourse) return;

        const currentSets = getCourseExamSets(currentCourse);
        const activeSetId = selectedSetId || currentSets[0].id;
        const activeSetObj = currentSets.find(s => s.id === activeSetId) || currentSets[0];

        const updatedSets = currentSets.map((s) => {
          if (s.id === activeSetId) {
            return { ...s, questions: newQuestions };
          }
          return s;
        });

        const allQs = updatedSets.flatMap(s => s.questions);
        const updatedCourses = courses.map((c) => {
          if (c.id === selectedCourseId) {
            return { ...c, mockExam: allQs, examSets: updatedSets };
          }
          return c;
        });

        onUpdateCourses(updatedCourses);
        await saveExamSetsToBackend(selectedCourseId, updatedSets);
        await handleSaveAllQuestionsToSupabase(allQs);
        setCsvMessage(`✅ Đã thay thế ${newQuestions.length} câu hỏi mới vào bộ đề "${activeSetObj.title}"!`);
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

          <button
            onClick={() => setActiveTab('bulk_import')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bulk_import'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderUp className="w-4 h-4 text-amber-400" />
            <span>Bulk Import Question</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  Course Catalog & Pricing Management
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Quản lý danh sách 11+ khóa học chứng chỉ OutSystems, chỉnh sửa thông tin hoặc tạo khóa học mới.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreateCourseModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                >
                  <Plus className="w-4 h-4" /> Thêm Khóa Học Mới
                </button>

                <span className="text-xs font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3.5 py-2.5 rounded-xl shrink-0">
                  {courses.length} Active Certification Courses
                </span>
              </div>
            </div>

            {/* Course Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCourses.map((c) => (
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

                  {/* Actions: Edit Details & Delete Course */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenCourseEditor(c)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 hover:border-blue-600 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Details
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(c.id, c.title)}
                      className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 hover:border-red-600 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105"
                      title="Xóa khóa học này khỏi hệ thống"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" /> Xóa
                    </button>
                  </div>
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
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  u.status === 'inactive' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {(u.status || 'active').toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{u.fullName || 'No Name'}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.email, u.status || 'active')}
                                className="text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 cursor-pointer"
                              >
                                {u.status === 'inactive' ? 'Set Active' : 'Set Inactive'}
                              </button>

                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  className="text-[10px] font-bold bg-red-950/80 hover:bg-red-900 text-red-300 px-2.5 py-1 rounded border border-red-800 cursor-pointer flex items-center gap-1"
                                  title="Delete User Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
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
                      {sortedCourses.map((c) => (
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

              {/* Right Side Column: Issued Codes Table & Payment Requests Table */}
              <div className="lg:col-span-2 space-y-6">

                {/* 1. Issued Activation Codes Table (CRUD - Read, Search, Update, Delete) */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      Generated & Active Codes ({activationCodes.length})
                    </h3>

                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-xs">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by code, email, course..."
                        value={codeSearchQuery}
                        onChange={(e) => setCodeSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {activationCodes.filter(c => {
                      if (!codeSearchQuery.trim()) return true;
                      const q = codeSearchQuery.trim().toLowerCase();
                      const courseObj = courses.find(cr => cr.id === c.courseId);
                      return c.userEmail.toLowerCase().includes(q) || 
                             c.code.toLowerCase().includes(q) || 
                             (courseObj && courseObj.title.toLowerCase().includes(q));
                    }).length > 0 ? (
                      activationCodes.filter(c => {
                        if (!codeSearchQuery.trim()) return true;
                        const q = codeSearchQuery.trim().toLowerCase();
                        const courseObj = courses.find(cr => cr.id === c.courseId);
                        return c.userEmail.toLowerCase().includes(q) || 
                               c.code.toLowerCase().includes(q) || 
                               (courseObj && courseObj.title.toLowerCase().includes(q));
                      }).map((c) => {
                        const courseObj = courses.find(cr => cr.id === c.courseId);
                        return (
                          <div
                            key={c.id}
                            className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white">{c.userEmail}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  c.status === 'revoked'
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {(c.status || 'active').toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-blue-300 font-medium">
                                {courseObj?.title || c.courseId}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs font-extrabold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 select-all">
                                  {c.code}
                                </p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(c.code);
                                    alert(`Copied activation code ${c.code} to clipboard!`);
                                  }}
                                  className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 cursor-pointer flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3 text-blue-400" /> Copy
                                </button>
                              </div>
                            </div>

                            {/* Actions: Re-Generate Code, Send Mail, Delete */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleRegenerateCode(c)}
                                className="bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                                title="Tạo lại mã kích hoạt mới"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Re-Generate Code
                              </button>

                              <button
                                onClick={() => handleSendCodeEmail(c)}
                                disabled={sendingMailCodeId === c.id}
                                className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                                title="Gửi mã code tới email học viên"
                              >
                                <Send className="w-3.5 h-3.5 text-emerald-400" /> {sendingMailCodeId === c.id ? 'Sending...' : 'Send Mail'}
                              </button>

                              <button
                                onClick={() => handleDeleteCode(c.id, c.code)}
                                className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                                title="Delete Code Record"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-500 italic text-center py-6">
                        No activation codes found matching your query.
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Payment Requests Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-lg">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    Payment Requests ({paymentRequests.length})
                  </h3>

                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
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
                      <p className="text-xs text-slate-500 italic text-center py-6">
                        No pending payment requests yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUESTION BANK & EXAM SETS (Up to 6 sets per course) */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2.5">
                  <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                  Question Bank & Exam Sets Manager
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Quản lý tối đa 6 bộ đề thi thực hành (Dump 01 - 06) và Cấu hình Thời lượng, Điểm đạt, CSV Import.
                </p>
              </div>

              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedSetId(null);
                }}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-blue-500 cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({getCourseExamSets(c).length} Bộ đề)
                  </option>
                ))}
              </select>
            </div>

            {/* SCREENSHOT 1 VIEW: OVERVIEW OF EXAM SETS FOR COURSE (When selectedSetId === null) */}
            {selectedSetId === null ? (
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      Chương trình giảng dạy — Các bài kiểm tra thực hành
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Tối đa 6 bộ đề thi thực hành cho từng khóa học ({getCourseExamSets(selectedCourse).length}/6 bộ đề đã tạo).
                    </p>
                  </div>

                  <span className="text-xs font-mono bg-purple-950/80 border border-purple-800 text-purple-300 font-bold px-3 py-1 rounded-full">
                    {getCourseExamSets(selectedCourse).length} / 6 Dumps
                  </span>
                </div>

                {/* Exam Sets List (Screenshot 1 Match) */}
                <div className="space-y-3">
                  {getCourseExamSets(selectedCourse).map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="bg-slate-900 border border-slate-700/90 hover:border-purple-500/60 p-4 rounded-xl flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          ✓
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            Bài kiểm tra thực hành {idx + 1}: {s.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span>{s.questions?.length || 0} câu hỏi</span>
                            <span>•</span>
                            <span>{s.durationMinutes || 90} phút</span>
                            <span>•</span>
                            <span>Đạt {s.passingScorePct || 70}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditExamSet(s)}
                          className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-purple-300" />
                          <span>Lập kế hoạch (Chỉnh sửa)</span>
                        </button>

                        {getCourseExamSets(selectedCourse).length > 1 && (
                          <button
                            onClick={() => handleDeleteExamSet(s.id)}
                            className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold p-1.5 rounded-lg cursor-pointer transition-colors"
                            title="Xóa bộ đề thi"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Button: + Mục trong khung chương trình (Add Exam Set) */}
                  <button
                    onClick={handleAddExamSet}
                    disabled={getCourseExamSets(selectedCourse).length >= 6}
                    className="w-full sm:w-auto bg-purple-950/40 hover:bg-purple-900/60 border-2 border-purple-600/60 text-purple-300 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2"
                  >
                    <Plus className="w-4 h-4 text-purple-400" />
                    <span>+ Mục trong khung chương trình (Thêm bộ đề thi)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* SCREENSHOT 2 VIEW: EXAM SET PLANNER & CONFIGURATION */
              <div className="space-y-6">
                {/* Back button link */}
                <button
                  onClick={() => setSelectedSetId(null)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 cursor-pointer bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại chương trình giảng dạy</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Question List for this Set */}
                  <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-4 lg:col-span-1">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                      <div>
                        <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                          <span>Câu hỏi</span>
                          <span className="text-xs text-purple-300 font-mono">
                            ({(getCourseExamSets(selectedCourse).find(s => s.id === selectedSetId)?.questions || []).length})
                          </span>
                        </h3>
                      </div>

                      <button
                        onClick={handleOpenAddQuestion}
                        className="w-7 h-7 bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md"
                        title="Thêm câu hỏi mới vào bộ đề này"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                      {(getCourseExamSets(selectedCourse).find(s => s.id === selectedSetId)?.questions || []).length > 0 ? (
                        (getCourseExamSets(selectedCourse).find(s => s.id === selectedSetId)?.questions || []).map((q, idx) => (
                          <div
                            key={q.id}
                            onClick={() => handleOpenEditQuestion(q)}
                            className="bg-slate-900 border border-slate-700 hover:border-purple-500/60 p-3 rounded-xl text-xs flex items-center justify-between gap-3 cursor-pointer group"
                          >
                            <p className="font-medium text-slate-300 group-hover:text-white line-clamp-2">
                              {idx + 1}. {q.question}
                            </p>
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenEditQuestion(q)}
                                className="text-slate-400 hover:text-blue-400 p-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="text-slate-400 hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500 text-xs italic space-y-2">
                          <p>Chưa có câu hỏi nào trong bộ đề này.</p>
                          <button
                            onClick={handleOpenAddQuestion}
                            className="text-purple-400 hover:underline font-bold"
                          >
                            + Thêm câu hỏi đầu tiên
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Set Settings Form (Screenshot 2 Match) & CSV Import */}
                  <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-5 lg:col-span-2">
                    <h3 className="font-display font-extrabold text-base text-white border-b border-slate-700 pb-3">
                      Lập kế hoạch cho bài kiểm tra thực hành
                    </h3>

                    {/* CSV IMPORT BAR EMBEDDED INSIDE THIS SPECIFIC EXAM SET */}
                    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="font-display font-bold text-xs text-white flex items-center gap-2">
                            <Upload className="w-4 h-4 text-purple-400" /> CSV Import câu hỏi cho bộ đề này
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Thao tác này sẽ <strong className="text-amber-300">thay thế (replace) toàn bộ câu hỏi hiện tại</strong> của bộ đề bằng file CSV.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Mẫu CSV</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => csvFileInputRef.current?.click()}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Import Questions (CSV)</span>
                          </button>
                        </div>
                      </div>

                      {csvMessage && (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs font-bold text-emerald-400 animate-in fade-in">
                          {csvMessage}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Tiêu đề */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Tiêu đề</label>
                        <input
                          type="text"
                          required
                          value={setFormTitle}
                          onChange={(e) => setSetFormTitle(e.target.value)}
                          placeholder="e.g. Dump 06"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 font-bold"
                        />
                      </div>

                      {/* Mô tả */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span>Mô tả</span>
                          <span className="text-[10px] text-slate-500">Không bắt buộc</span>
                        </label>
                        <textarea
                          rows={3}
                          value={setFormDesc}
                          onChange={(e) => setSetFormDesc(e.target.value)}
                          placeholder="Mô tả bài kiểm tra thực hành này cho học viên..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-purple-500 leading-relaxed"
                        />
                      </div>

                      {/* Thời lượng & Điểm đạt */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Thời lượng (phút)</label>
                          <input
                            type="number"
                            min="1"
                            max="300"
                            required
                            value={setFormDuration}
                            onChange={(e) => setSetFormDuration(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono font-bold outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Điểm đạt tối thiểu (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            required
                            value={setFormPassing}
                            onChange={(e) => setSetFormPassing(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-emerald-400 font-mono font-bold outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      {/* Sắp xếp ngẫu nhiên câu hỏi & câu trả lời */}
                      <div className="flex items-center justify-between bg-slate-900 border border-slate-700 p-4 rounded-xl">
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Sắp xếp ngẫu nhiên thứ tự câu hỏi và câu trả lời
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Xáo trộn câu hỏi mỗi lần học viên bắt đầu làm đề thi.
                          </span>
                        </div>

                        <input
                          type="checkbox"
                          checked={setFormRandomize}
                          onChange={(e) => setSetFormRandomize(e.target.checked)}
                          className="w-5 h-5 accent-purple-600 rounded cursor-pointer shrink-0"
                        />
                      </div>

                      {/* Nút Lưu */}
                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={handleSaveSetSettings}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-lg transition-all cursor-pointer"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  {/* Resend Email API Settings */}
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-400" /> Resend API Email Service
                      </h3>
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        HTTPS Port 443
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Resend API Key (re_...) hoặc Brevo API Key (xkeysib-...)</span>
                        <div className="flex items-center gap-2">
                          <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 underline font-bold">
                            Resend ↗
                          </a>
                          <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 underline font-bold">
                            Brevo ↗
                          </a>
                        </div>
                      </label>
                      <input
                        type="password"
                        required
                        value={emailApiKey}
                        onChange={(e) => setEmailApiKey(e.target.value)}
                        placeholder="e.g. re_123456789... hoặc xkeysib-..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-emerald-400 font-mono outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Admin Email Address (Sender / Recipient)</span>
                        <span className="text-[10px] text-slate-500">Email gửi & nhận thông báo</span>
                      </label>
                      <input
                        type="email"
                        value={adminEmailSetting}
                        onChange={(e) => setAdminEmailSetting(e.target.value)}
                        placeholder="e.g. duongrbt@gmail.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Gmail App Password (Mật khẩu ứng dụng 16 ký tự)</span>
                        <span className="text-[10px] text-amber-400">Dùng nếu gửi qua Gmail SMTP</span>
                      </label>
                      <input
                        type="password"
                        value={gmailAppPassword}
                        onChange={(e) => setGmailAppPassword(e.target.value)}
                        placeholder="e.g. abcd efgh ijkl mnop (16 ký tự)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-amber-300 font-mono outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
                      <p className="font-bold text-slate-200">💡 Hướng dẫn chọn phương thức gửi mail phù hợp:</p>
                      <p>• <strong className="text-emerald-300">Cách 1 — Brevo Free (Khuyên dùng nhất):</strong> Đăng ký tại <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noreferrer" className="underline text-emerald-400">brevo.com</a>, dán API Key (<code>xkeysib-...</code>) vào ô trên. Không cần domain, gửi được tới MỌI email học viên tức thì!</p>
                      <p>• <strong className="text-blue-300">Cách 2 — Resend Free:</strong> Dán API Key (<code>re_...</code>) từ <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="underline text-blue-400">resend.com</a>. Nếu chưa verify Domain thì chỉ gửi về email admin ({adminEmailSetting}).</p>
                      <p>• <strong className="text-amber-300">Cách 3 — Gmail SMTP:</strong> Điền Mật khẩu ứng dụng 16 ký tự lấy từ Google Account. Gửi qua SMTP Port 587.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={testingEmail}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{testingEmail ? 'Sending...' : 'Test Resend Notification'}</span>
                    </button>
                  </div>

                  {/* Telegram Settings */}
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 space-y-4">
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-400" /> Telegram Bot Configuration
                    </h3>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Bot Token</label>
                      <input
                        type="text"
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        placeholder="e.g. 123456789:ABCdefGHIjklMNO..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Chat ID</label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="e.g. 987654321"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={testingTelegram}
                      className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-400" />
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

        {/* TAB 6: BULK IMPORT QUESTION BANK (HTML + IMAGES FOLDER IMPORT) */}
        {activeTab === 'bulk_import' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2.5">
                  <FolderUp className="w-6 h-6 text-amber-400" />
                  Bulk Import Question Bank (Folder HTML + Sơ Đồ Ảnh)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Import 1 lần duy nhất toàn bộ thư mục khóa học chứa file .html, file .csv và thư mục sơ đồ ảnh (.files).
                </p>
              </div>
            </div>

            {/* Step 1: Select Target Course & Drag-Drop Folder Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Config & Selection */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    1. Chọn Khóa Học Cần Thay Thế Ngân Hàng Câu Hỏi:
                  </label>
                  <select
                    value={bulkCourseId}
                    onChange={(e) => setBulkCourseId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-bold outline-none focus:border-amber-500 shadow-inner"
                  >
                    {sortedCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.mockExam?.length || 0} câu hiện tại)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-slate-700/80 pt-4 space-y-3">
                  <span className="text-xs font-bold text-slate-200 block">
                    2. Chọn Hoặc Kéo Thả Thư Mục Khóa Học:
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => bulkFolderInputRef.current?.click()}
                    disabled={bulkProcessing}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <FolderInput className="w-4 h-4" />
                    <span>Chọn Thư Mục Từ Máy Tính</span>
                  </button>

                  <input
                    type="file"
                    ref={bulkFolderInputRef}
                    // @ts-ignore
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        processFolderFiles(e.target.files);
                      }
                    }}
                  />

                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    💡 Chọn thư mục khóa học (ví dụ: <strong className="text-amber-300">AI Agentic</strong>, <strong className="text-amber-300">Architecture O11</strong>...) trong ổ đĩa của bạn. Hệ thống sẽ tự động quét các file .html, .csv và ảnh trong folder .files.
                  </p>
                </div>
              </div>

              {/* Right Column: Big Drag & Drop Zone */}
              <div className="lg:col-span-2">
                <div
                  onDrop={handleDropFolder}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  className={`h-full min-h-[260px] border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                    isDragOver
                      ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                      : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <FolderUp className={`w-16 h-16 mb-4 transition-transform ${isDragOver ? 'text-amber-400 scale-110 animate-bounce' : 'text-slate-500'}`} />
                  <h3 className="font-display font-bold text-base text-white">
                    Kéo & Thả Cả Thư Mục Khóa Học Vào Đây
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    (Drag & drop the entire course directory containing .html files and .files image folders)
                  </p>
                  <span className="inline-block mt-4 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-[11px] font-mono text-amber-300">
                    Hỗ trợ đọc đồng bộ HTML, CSV & Ảnh Sơ Đồ Base64
                  </span>
                </div>
              </div>
            </div>

            {/* Status Notifications */}
            {bulkStatusMsg && (
              <div className="bg-amber-900/30 border border-amber-500/40 p-4 rounded-xl text-xs text-amber-200 font-medium flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
                <span>{bulkStatusMsg}</span>
              </div>
            )}

            {bulkErrorMsg && (
              <div className="bg-rose-900/40 border border-rose-500/50 p-4 rounded-xl text-xs text-rose-200 font-bold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{bulkErrorMsg}</span>
              </div>
            )}

            {bulkSuccessMsg && (
              <div className="bg-emerald-900/40 border border-emerald-500/50 p-4 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            {/* Step 2: Parsed Result Summary & Confirmation Box */}
            {bulkParsedQuestions.length > 0 && (
              <div className="bg-slate-800 border border-amber-500/50 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      Kết Quả Phân Tích Thư Mục Đề Thi
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Xem lại tổng quan các bộ đề đã trích xuất trước khi tiến hành ghi đè thay thế ngân hàng câu hỏi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteBulkReplace}
                    disabled={bulkProcessing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 shrink-0"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>⚡ REPLACE ENTIRE QUESTION BANK</span>
                  </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Khóa Học Mục Tiêu</span>
                    <strong className="text-xs text-amber-400 truncate block mt-1">
                      {sortedCourses.find(c => c.id === bulkCourseId)?.title || bulkCourseId}
                    </strong>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Số Bộ Đề (Sets)</span>
                    <strong className="text-base text-white font-black block mt-1">
                      {bulkParsedSets.length} Bộ Đề
                    </strong>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Tổng Số Câu Hỏi</span>
                    <strong className="text-base text-emerald-400 font-black block mt-1">
                      {bulkParsedQuestions.length} Câu
                    </strong>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Ảnh Sơ Đồ Đã Nhúng</span>
                    <strong className="text-base text-blue-400 font-black block mt-1">
                      {bulkImgCount} Sơ Đồ
                    </strong>
                  </div>
                </div>

                {/* Parsed Sets Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">
                    Danh Sách Các Bộ Đề Đã Phát Hiện:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bulkParsedSets.map((set, i) => (
                      <div key={set.id || i} className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl flex items-center justify-between">
                        <div>
                          <strong className="text-xs text-white block">{set.title}</strong>
                          <span className="text-[11px] text-slate-400">{set.questions.length} câu hỏi trắc nghiệm</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          READY
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

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

              <div className="space-y-1">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Số Lượng Câu Hỏi Preview (Preview Limit)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={editPreviewLimit}
                    onChange={(e) => setEditPreviewLimit(Number(e.target.value))}
                    placeholder="e.g. 10"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-blue-400 font-mono font-bold outline-none focus:border-blue-500"
                  />
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

      {/* EDIT ACTIVATION CODE MODAL (CRUD - Update) */}
      {isEditCodeModalOpen && editingCodeObj && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                Edit Activation Code Details
              </h3>
              <button
                onClick={() => setIsEditCodeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedCode} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Activation Code String</label>
                <input
                  type="text"
                  required
                  value={editCodeStr}
                  onChange={(e) => setEditCodeStr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-mono font-bold text-emerald-400 outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Student Email</label>
                <input
                  type="email"
                  required
                  value={editCodeEmail}
                  onChange={(e) => setEditCodeEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Target Course</label>
                <select
                  value={editCodeCourseId}
                  onChange={(e) => setEditCodeCourseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-medium"
                >
                  {sortedCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Activation Code Status</label>
                <select
                  value={editCodeStatus}
                  onChange={(e) => setEditCodeStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-emerald-400 font-bold outline-none focus:border-blue-500"
                >
                  <option value="active">ACTIVE (Allowed for Practice Test)</option>
                  <option value="revoked">REVOKED (Blocked Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditCodeModalOpen(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Code Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW COURSE MODAL */}
      {isCreateCourseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Thêm Khóa Học Chứng Chỉ Mới
              </h3>
              <button
                onClick={() => setIsCreateCourseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createCourseMsg && (
              <div className="bg-blue-900/40 text-blue-300 text-xs p-3 rounded-xl border border-blue-500/50 font-bold">
                {createCourseMsg}
              </div>
            )}

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Tên Khóa Học (Course Title)</label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. OutSystems DevOps Specialist (O11)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Mô Tả Khóa Học (Description)</label>
                <textarea
                  rows={3}
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  placeholder="Complete verified practice tests and exam dump questions for OutSystems..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Giá Khóa Học ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newCoursePrice}
                    onChange={(e) => setNewCoursePrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Nền Tảng (Platform Tag)</label>
                  <select
                    value={newCoursePlatform}
                    onChange={(e) => setNewCoursePlatform(e.target.value as 'O11' | 'ODC')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-bold outline-none focus:border-emerald-500"
                  >
                    <option value="O11">O11 (OutSystems 11)</option>
                    <option value="ODC">ODC (OutSystems Developer Cloud)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Số Câu Preview Miễn Phí</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newCoursePreviewLimit}
                    onChange={(e) => setNewCoursePreviewLimit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-blue-400 font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Ảnh Bìa Khóa Học (Cover Image URL)</span>
                  <span className="text-[10px] text-blue-400">Local File Upload or URL</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCourseImageUrl}
                    onChange={(e) => setNewCourseImageUrl(e.target.value)}
                    placeholder="https://... hoặc chọn file từ máy tính"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 font-mono outline-none focus:border-emerald-500"
                  />
                  <label className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-3 py-3 rounded-xl border border-slate-600 flex items-center gap-1.5 cursor-pointer shrink-0">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) setNewCourseImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 p-3.5 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-white block">Gắn Thẻ "NEW" Nổi Bật</span>
                  <span className="text-[11px] text-slate-400">Hiển thị huy hiệu NEW màu xanh lá nổi bật trên khóa học.</span>
                </div>
                <input
                  type="checkbox"
                  checked={newCourseIsNew}
                  onChange={(e) => setNewCourseIsNew(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCreateCourseModalOpen(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tạo Khóa Học Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
