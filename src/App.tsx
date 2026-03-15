/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Cpu, 
  Settings, 
  ChevronRight, 
  Search, 
  Layout, 
  MessageSquare,
  Zap,
  ShieldCheck,
  Activity,
  Code2,
  Gavel,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { TUTORIAL_DATA, Lesson } from './constants';
import { askAiTutor, generateCodeSnippet, ChatMessage } from './services/geminiService';
import { Diagram } from './components/Diagram';

export default function App() {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(TUTORIAL_DATA[0].lessons[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('opsmaster_progress');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('opsmaster_progress', JSON.stringify(Array.from(completedLessons)));
  }, [completedLessons]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const toggleComplete = () => {
    if (!activeLesson) return;
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(activeLesson.id)) {
      newCompleted.delete(activeLesson.id);
    } else {
      newCompleted.add(activeLesson.id);
    }
    setCompletedLessons(newCompleted);
  };

  const handleQuizOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    // If all answers are correct, mark lesson as completed
    const allCorrect = activeLesson.quiz?.every((q, idx) => quizAnswers[idx] === q.correctAnswer);
    if (allCorrect) {
      setCompletedLessons(prev => new Set([...prev, activeLesson.id]));
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const getPrecedingConcepts = () => {
    if (!activeLesson) return "";
    let concepts = [];
    for (const module of TUTORIAL_DATA) {
      for (const lesson of module.lessons) {
        if (lesson.id === activeLesson.id) {
          return concepts.join("\n\n");
        }
        concepts.push(`Lesson: ${lesson.title}\nDescription: ${lesson.description}`);
      }
    }
    return concepts.join("\n\n");
  };

  useEffect(() => {
    resetQuiz();
    // We no longer reset chat history when changing lessons to maintain context
  }, [activeLesson?.id]);

  const totalLessons = TUTORIAL_DATA.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progress = Math.round((completedLessons.size / totalLessons) * 100);

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || !activeLesson) return;

    const question = userQuestion;
    setUserQuestion('');
    setIsAiLoading(true);
    
    try {
      const preceding = getPrecedingConcepts();
      const response = await askAiTutor(question, activeLesson.content, preceding, chatHistory);
      
      const newHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', parts: [{ text: question }] },
        { role: 'model', parts: [{ text: response || "" }] }
      ];
      
      setChatHistory(newHistory);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "Error connecting to AI tutor." }] }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!activeLesson) return;

    const question = userQuestion.trim() || `Generate a practical code example for ${activeLesson.title}`;
    setUserQuestion('');
    setIsAiLoading(true);
    
    try {
      const preceding = getPrecedingConcepts();
      const response = await generateCodeSnippet(question, activeLesson.content, preceding, chatHistory);
      
      const newHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', parts: [{ text: `[Code Request] ${question}` }] },
        { role: 'model', parts: [{ text: response || "" }] }
      ];
      
      setChatHistory(newHistory);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "Error generating code snippet." }] }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-200 flex flex-col bg-white shadow-sm z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/30">
              <Zap size={22} fill="currentColor" />
            </div>
            <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-800">OpsMaster</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search concepts..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          {TUTORIAL_DATA.map((module, mIdx) => {
            const colors = ['text-cyan-600', 'text-indigo-600', 'text-emerald-600', 'text-rose-600', 'text-amber-600'];
            const bgColors = ['bg-cyan-50', 'bg-indigo-50', 'bg-emerald-50', 'bg-rose-50', 'bg-amber-50'];
            const colorClass = colors[mIdx % colors.length];
            const bgColorClass = bgColors[mIdx % bgColors.length];
            
            const getModuleIcon = (index: number) => {
              switch (index) {
                case 0: return Gavel;
                case 1: return BookOpen;
                case 2: return Cpu;
                case 3: return Activity;
                case 4: return Zap;
                default: return Layout;
              }
            };
            const Icon = getModuleIcon(mIdx);
            
            const moduleCompletedCount = module.lessons.filter(l => completedLessons.has(l.id)).length;
            const moduleTotalCount = module.lessons.length;
            const moduleProgress = Math.round((moduleCompletedCount / moduleTotalCount) * 100);

            return (
              <div key={module.id} className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 rounded-full ${colorClass.replace('text', 'bg')}`} />
                    <div className={`p-1 rounded-md ${bgColorClass} ${colorClass}`}>
                      <Icon size={12} />
                    </div>
                    <h3 className={`text-[11px] font-bold uppercase tracking-wider opacity-60`}>
                      {module.title}
                    </h3>
                  </div>
                  {moduleProgress > 0 && (
                    <span className={`text-[10px] font-bold ${colorClass}`}>
                      {moduleProgress}%
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(lesson);
                        setUserQuestion('');
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all group ${
                        activeLesson?.id === lesson.id 
                          ? `${bgColorClass} ${colorClass} font-semibold shadow-sm` 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          activeLesson?.id === lesson.id ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-white'
                        }`}>
                          {completedLessons.has(lesson.id) ? (
                            <ShieldCheck size={14} className="text-emerald-500" />
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full ${activeLesson?.id === lesson.id ? colorClass.replace('text', 'bg') : 'bg-slate-300'}`} />
                          )}
                        </div>
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <ChevronRight size={14} className={`transition-transform ${activeLesson?.id === lesson.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-brand-500" />
              <span>Overall Progress</span>
            </div>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-brand-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)]"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="bg-slate-100 px-2 py-1 rounded-md">{activeLesson?.category}</span>
              <ChevronRight size={12} />
              <span className="text-slate-900 font-bold">{activeLesson?.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {activeLesson && (
              <button 
                onClick={toggleComplete}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-full transition-all shadow-sm ${
                  completedLessons.has(activeLesson.id) 
                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-500'
                }`}
              >
                {completedLessons.has(activeLesson.id) ? (
                  <><ShieldCheck size={16} /> Completed</>
                ) : (
                  'Mark as Done'
                )}
              </button>
            )}
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-8 py-16 space-y-16">
            {activeLesson ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={activeLesson.id}
                className="space-y-16"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-brand-100 text-brand-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {activeLesson.difficulty}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-400 font-medium">15 min read</span>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                    {activeLesson.title}
                  </h2>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                    {activeLesson.description}
                  </p>
                </div>

                {activeLesson.diagram && (
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/10 to-emerald-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                      <Diagram 
                        type={activeLesson.diagram.type} 
                        mermaid={activeLesson.diagram.mermaid}
                        data={activeLesson.diagram.data} 
                      />
                    </div>
                  </div>
                )}

                <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-600 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-2xl prose-pre:p-6">
                  <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
                </div>

                {activeLesson.videoUrl && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                        <Activity size={18} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-slate-900">Video Tutorial</h3>
                    </div>
                    <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-lg">
                      <iframe
                        src={activeLesson.videoUrl}
                        title={activeLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Hands-on Simulation / Code Area */}
                <div className="bg-slate-900 text-slate-100 p-8 rounded-3xl font-mono text-sm space-y-6 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-white/10 rounded-lg">
                        <Terminal size={16} className="text-brand-400" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Interactive Lab</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/30" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/30" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                    </div>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <div className="flex gap-3">
                      <span className="text-brand-400 font-bold">$</span>
                      <p className="text-slate-100">ops-cli init --module {activeLesson.id}</p>
                    </div>
                    <p className="text-slate-400 pl-6">Initializing {activeLesson.title} environment...</p>
                    <p className="text-emerald-400 pl-6">✓ Environment ready.</p>
                    <div className="flex gap-3">
                      <span className="text-brand-400 font-bold">$</span>
                      <motion.div 
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-2 h-5 bg-brand-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Code Examples Section */}
                {activeLesson.codeExamples && activeLesson.codeExamples.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                        <Code2 size={18} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-slate-900">Practical Code Examples</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {activeLesson.codeExamples.map((example, idx) => (
                        <div key={idx} className="bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-xl">
                          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{example.title}</span>
                              <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 text-[9px] font-bold rounded uppercase">{example.language}</span>
                            </div>
                            <button 
                              onClick={() => handleCopy(example.code, idx)}
                              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-lg"
                            >
                              {copiedIndex === idx ? (
                                <><Check size={12} className="text-emerald-400" /> Copied</>
                              ) : (
                                <><Copy size={12} /> Copy Code</>
                              )}
                            </button>
                          </div>
                          <pre className="p-6 overflow-x-auto custom-scrollbar">
                            <code className="text-xs text-slate-300 leading-relaxed">
                              {example.code}
                            </code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiz Section */}
                {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                  <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] space-y-10 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                        <Layout size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-bold text-slate-900">Knowledge Check</h3>
                        <p className="text-sm text-slate-500">Test your understanding of the concepts</p>
                      </div>
                    </div>
                    
                    <div className="space-y-12">
                      {activeLesson.quiz.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-6">
                          <p className="text-xl font-bold text-slate-800 leading-tight">
                            <span className="text-brand-500 mr-2">{qIdx + 1}.</span>
                            {q.question}
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = quizAnswers[qIdx] === oIdx;
                              const isCorrect = q.correctAnswer === oIdx;
                              const showFeedback = quizSubmitted;
                              
                              let style = 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-brand-500 hover:shadow-md';
                              
                              if (showFeedback) {
                                if (isCorrect) {
                                  style = 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm';
                                } else if (isSelected && !isCorrect) {
                                  style = 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm';
                                }
                              } else if (isSelected) {
                                style = 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleQuizOptionSelect(qIdx, oIdx)}
                                  disabled={quizSubmitted}
                                  className={`p-5 text-left text-sm font-medium border-2 rounded-2xl transition-all flex items-center justify-between group ${style}`}
                                >
                                  <span>{opt}</span>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-current border-transparent' : 'border-slate-300 group-hover:border-current'
                                  }`}>
                                    {showFeedback && isCorrect && <ShieldCheck size={14} className="text-white" />}
                                    {isSelected && !showFeedback && <div className="w-2 h-2 bg-white rounded-full" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      {!quizSubmitted ? (
                        <button
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length < activeLesson.quiz.length}
                          className="px-10 py-4 bg-brand-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-brand-500/30 hover:bg-brand-600 disabled:opacity-30 transition-all"
                        >
                          Check My Answers
                        </button>
                      ) : (
                        <button
                          onClick={resetQuiz}
                          className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all"
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                <div className="w-24 h-24 bg-brand-50 text-brand-500 rounded-[2rem] flex items-center justify-center shadow-inner">
                  <BookOpen size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-bold text-slate-900">Ready to start?</h3>
                  <p className="text-slate-500">Select a lesson from the sidebar to begin your journey.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Tutor Panel */}
        <div className="h-[400px] border-t border-slate-200 bg-white flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20">
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <MessageSquare size={16} />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900">AI Tutor Guidance</span>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Powered by Gemini 3.1 Pro</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {chatHistory.length > 0 && (
                <button 
                  onClick={clearChat}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                >
                  Clear Chat
                </button>
              )}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-500 uppercase tracking-widest">
                  <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-current rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-current rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-current rounded-full" />
                  </div>
                  Thinking...
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/30">
              {chatHistory.length > 0 ? (
                <div className="space-y-8">
                  {chatHistory.map((msg, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                        msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-brand-500 text-white'
                      }`}>
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </div>
                      <div className={`max-w-[75%] p-5 rounded-2xl text-sm shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none prose prose-sm prose-slate'
                      }`}>
                        {msg.role === 'user' ? (
                          msg.parts[0].text
                        ) : (
                          <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-sm text-slate-400 max-w-xs">Ask a question about {activeLesson?.title || 'this lesson'} to get personalized guidance.</p>
                </div>
              )}
            </div>
            
            <div className="w-[400px] border-l border-slate-100 p-8 bg-white">
              <form onSubmit={handleAiAsk} className="h-full flex flex-col gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {[
                    { label: 'Explain', icon: BookOpen, prompt: 'Can you explain this concept in simpler terms?' },
                    { label: 'Example', icon: Zap, prompt: 'Give me a real-world example of this.' },
                    { label: 'Analogy', icon: MessageSquare, prompt: 'Give me an analogy to help me remember this.' }
                  ].map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setUserQuestion(action.prompt)}
                      className="flex-shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-slate-100"
                    >
                      <action.icon size={10} />
                      {action.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 relative">
                  <textarea 
                    placeholder="Ask anything... (e.g., 'Explain this like I'm 5')"
                    className="w-full h-full bg-slate-50 border-none rounded-2xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none transition-all placeholder:text-slate-400"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    type="submit"
                    disabled={isAiLoading || !userQuestion.trim()}
                    className="bg-brand-500 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-500/25 hover:bg-brand-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} />
                    Send Message
                  </button>
                  <button 
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={isAiLoading}
                    className="bg-slate-100 text-slate-600 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Code2 size={16} />
                    Generate Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
