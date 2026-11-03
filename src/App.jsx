import React, { useState, useEffect, useCallback } from 'react';
import Testimonials from './Testimonials';
import { 
  Menu, X, ArrowRight, CheckCircle2, Users, Target, 
  Shield, Globe, Mail, Phone, 
  MapPin, PlayCircle, Send, ChevronDown, ArrowUpRight, ArrowLeft, Loader2, CalendarCheck
} from 'lucide-react';

// --- FIREBASE INITIALIZATION ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- GOOGLE SHEETS / APPS SCRIPT URL ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwweqVtSx-VwBIq1_ui9zg_CDt19957zraNdB6du80vWmisgqJ1Z5wE_uWbsH7kwW8K/exec";

// --- SELF-CONTAINED CONSTANTS ---
const PRIMARY_COLOR = "#2596be"; 
const ACCENT_COLOR = "#dca54c"; 
const BG_NAVY = "#0B1320"; 
const FALLBACK_EVENT_IMAGE = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070"; // Beautiful seminar placeholder

const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/amazement-titus-mba-2a58aa147/",
  whatsapp: "https://whatsapp.com/channel/0029Vb6jK6cElah0YRRVSH2B",
  youtube: "https://www.youtube.com/@unfoldingcapacity9351",
  instagram: "https://www.instagram.com/unfoldingcapacity/"
};

// --- INTELLIGENT IMAGE AUTO-CORRECTOR ---
const getValidImageUrl = (url) => {
  if (!url || url.trim() === "") return FALLBACK_EVENT_IMAGE; 
  
  try {
    // 1. Auto-correct Postimages (postimg.cc) wrong links to direct image links
    if (url.includes('postimg.cc') && !url.includes('i.postimg.cc')) {
      const match = url.match(/postimg\.cc\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://i.postimg.cc/${match[1]}.jpg`; // Forces it to the direct image format
      }
    }
    
    // 2. Retain Google Drive auto-correction just in case
    if (url.includes('drive.google.com')) {
      const driveRegex = /\/d\/([a-zA-Z0-9_-]+)/;
      const match = url.match(driveRegex);
      let fileId = match ? match[1] : null;
      
      if (!fileId && url.includes('id=')) {
        const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
        fileId = idMatch ? idMatch[1] : null;
      }

      if (fileId) {
        let directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        const resourceKeyMatch = url.match(/resourcekey=([a-zA-Z0-9_-]+)/);
        if (resourceKeyMatch) {
          directUrl += `&resourcekey=${resourceKeyMatch[1]}`;
        }
        return directUrl;
      }
    }
  } catch (error) {
    console.error("Image URL parsing error:", error);
  }
  
  return url; // Return normal url if it's already valid (e.g. unsplash, imgur, your own website)
};

// --- INLINE SVG ICONS ---
const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
);
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.98.58 3.82 1.57 5.38L2 22l4.81-1.57c1.52.93 3.29 1.48 5.2 1.48 5.52 0 10-4.47 10-10s-4.48-10-10-10zm5.41 14.36c-.23.66-1.34 1.25-1.93 1.34-.52.08-1.18.15-3.34-.74-2.61-1.08-4.28-3.77-4.41-3.95-.13-.18-1.05-1.4-1.05-2.67 0-1.27.66-1.89.89-2.14.23-.25.5-.31.67-.31.17 0 .34 0 .49.01.16.01.37-.06.57.43.21.53.72 1.76.78 1.89.07.13.11.28.02.46-.08.18-.13.3-.26.43-.13.14-.28.31-.39.42-.13.14-.26.29-.11.55.15.26.66 1.1 1.43 1.78.99.88 1.8 1.14 2.06 1.28.26.13.41.11.56-.06.15-.17.65-.75.82-1.01.17-.26.34-.22.58-.13.24.09 1.5.71 1.76.84.26.13.43.2.49.31.06.12.06.66-.17 1.32z"/></svg>
);

// --- ANIMATED BRAND LOGO ---
const BrandLogo = ({ className = "h-10 w-auto", scrollY = 0 }) => {
  const flapAngle = Math.sin(scrollY * 0.008) * 40; 
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ perspective: '600px' }}>
      <svg viewBox="0 0 240 330" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
        <g style={{ transform: `rotateY(${flapAngle}deg)`, transformOrigin: '222px 50%' }}>
          <path d="M220 98C150 40 50 20 20 80C-10 140 40 180 40 180C40 180 0 220 20 280C40 330 130 330 180 290C210 260 220 230 220 230V98Z" fill={PRIMARY_COLOR}/>
          <text x="65" y="150" fill="white" fontSize="70" fontFamily="'Playfair Display', serif" fontWeight="800" fontStyle="italic">U</text>
          <text x="80" y="250" fill="white" fontSize="70" fontFamily="'Playfair Display', serif" fontWeight="800" fontStyle="italic">C</text>
        </g>
        <rect x="222" y="100" width="14" height="150" fill="#cbd5e1" rx="7" />
      </svg>
    </div>
  );
};

// --- DYNAMIC SEQUENTIAL EVENT POPUP MANAGER ---
const EventPopupManager = ({ events, onBookNow }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [delay, setDelay] = useState(2500); 

  useEffect(() => {
    if (!events || events.length === 0 || currentIndex >= events.length) return;

    const currentEvent = events[currentIndex];
    
    // Check if user dismissed THIS specific event recently
    const dismissed = sessionStorage.getItem(`dismissed_popup_v8_${currentEvent.title}`);
    
    const now = new Date();
    const startDate = currentEvent.startDate ? new Date(currentEvent.startDate) : new Date(0);
    const endDate = currentEvent.endDate ? new Date(currentEvent.endDate) : new Date(8640000000000000);
    const isWithinDateRange = now >= startDate && now <= endDate;

    const isActive = currentEvent.active === true || 
                     String(currentEvent.active).toLowerCase() === 'true' || 
                     String(currentEvent.active).toLowerCase() === 'yes';

    if (isActive && isWithinDateRange && !dismissed) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [events, currentIndex, delay]);

  const handleDismiss = () => {
    const currentEvent = events[currentIndex];
    sessionStorage.setItem(`dismissed_popup_v8_${currentEvent.title}`, 'true');
    setIsVisible(false);
    
    setDelay(10000); 
    setCurrentIndex(prev => prev + 1);
  };

  if (!isVisible || currentIndex >= events.length) return null;

  const currentEvent = events[currentIndex];
  // Automatically correct the image URL using the intelligent function
  const displayImage = getValidImageUrl(currentEvent.imageUrl);

  return (
    <div className="fixed bottom-6 right-6 z-[150] w-full max-w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="relative h-40 bg-[#0B1320] border-b border-slate-100">
        <img 
          src={displayImage} 
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = FALLBACK_EVENT_IMAGE; // Safe fallback if the link is broken
          }}
          className="w-full h-full object-cover opacity-90" 
          alt="Event Poster" 
        />
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-white/70 hover:text-white bg-black/40 rounded-full p-1.5 backdrop-blur-md transition-all">
          <X size={16} strokeWidth={2.5} />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <span className="bg-[#dca54c] text-[#0B1320] text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-1 inline-block shadow-sm">Upcoming Program</span>
        </div>
      </div>
      <div className="p-6">
        <h4 className="text-xl font-serif font-bold text-[#0B1320] mb-2 leading-tight">{currentEvent.title}</h4>
        {currentEvent.dateText && <p className="text-sm font-semibold text-[#2596be] mb-3 flex items-center gap-1.5"><CalendarCheck size={14}/> {currentEvent.dateText}</p>}
        <p className="text-sm text-slate-500 font-light mb-6 line-clamp-3">{currentEvent.description}</p>
        <button 
          onClick={() => { handleDismiss(); onBookNow(currentEvent.title); }} 
          className="w-full py-3.5 bg-[#0B1320] text-white font-bold uppercase tracking-[0.1em] text-[10px] rounded-xl flex items-center justify-center hover:bg-[#dca54c] transition-colors group shadow-md"
        >
          Secure Your Seat <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={14} />
        </button>
      </div>
    </div>
  );
};

// --- LEGAL POLICIES PAGE ---
const LegalPage = ({ onBack, section }) => {
  useEffect(() => {
    if (section) {
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) {
          const offset = 120;
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [section]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#dca54c]/30 selection:text-slate-900">
      <nav className="fixed top-0 w-full z-[100] bg-white/95 backdrop-blur-xl shadow-sm py-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onBack}>
            <BrandLogo className="h-10 w-auto" scrollY={0} />
            <div className="flex flex-col justify-center h-10">
              <span className="text-[19px] font-bold tracking-tight leading-none text-[#0B1320] group-hover:text-[#2596be] transition-colors">UNFOLDING</span>
              <span className="text-[8.5px] tracking-[0.45em] font-bold uppercase leading-none mt-1 text-[#2596be]">CAPACITY</span>
            </div>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-[#0B1320] transition-colors bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-white">
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </nav>

      <section className="pt-48 pb-32 max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <span className="text-[#dca54c] font-bold uppercase tracking-[0.2em] text-xs mb-6 block">Legal Documentation</span>
          <h1 className="text-4xl lg:text-[4.5rem] font-serif leading-[1.05] text-[#0B1320] tracking-tight">Policies & Terms</h1>
        </div>

        <div className="bg-white p-10 lg:p-16 rounded-[2rem] shadow-sm border border-slate-100">
          <div id="privacy" className="mb-20">
            <h2 className="text-3xl font-serif text-[#0B1320] mb-8 border-b border-slate-100 pb-4">Privacy Policy</h2>
            <div className="prose prose-slate max-w-none font-light leading-relaxed text-slate-600 space-y-6">
              <p><strong>Effective Date:</strong> {new Date().getFullYear()}</p>
              <p>At Unfolding Capacity, we are committed to protecting the privacy and confidentiality of our clients, masterclass attendees, and website visitors. This Privacy Policy outlines how we collect, use, and safeguard your personal information.</p>
              <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Information We Collect</h4>
              <p>We may collect personal information such as your name, email address, phone number, and organizational details when you submit an inquiry, register for The Leadership MasterClass, or subscribe to our communications.</p>
              <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Your Information</h4>
              <p>Your information is used strictly to provide consulting services, facilitate masterclass registrations, communicate strategic insights, and improve our digital offerings. We do not sell or rent your personal data to third parties.</p>
              <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Data Security</h4>
              <p>We implement robust, industry-standard security measures to ensure that your personal and organizational data is protected against unauthorized access, alteration, or disclosure.</p>
            </div>
          </div>

          <div id="terms">
            <h2 className="text-3xl font-serif text-[#0B1320] mb-8 border-b border-slate-100 pb-4">Terms of Service</h2>
            <div className="prose prose-slate max-w-none font-light leading-relaxed text-slate-600 space-y-6">
              <p>Welcome to Unfolding Capacity. By accessing our website or engaging our services, you agree to comply with the following Terms of Service.</p>
              <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Engagement of Services</h4>
              <p>All consulting, coaching, and masterclass engagements are subject to specific agreements outlined during client onboarding. Unfolding Capacity reserves the right to accept or decline partnership requests based on strategic alignment.</p>
              <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Intellectual Property</h4>
              <p>All methodologies, frameworks, articles, and masterclass materials provided by Unfolding Capacity are the exclusive intellectual property of the firm. They may not be reproduced, distributed, or utilized for commercial purposes without explicit written consent.</p>
              <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Limitation of Liability</h4>
              <p>While we strive to provide profound strategic guidance, Unfolding Capacity is not liable for specific business outcomes or organizational results resulting from the implementation of our advice.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- DEDICATED FOUNDER PAGE ---
const FounderPage = ({ onBack }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#dca54c]/30 selection:text-slate-900">
      <nav className="fixed top-0 w-full z-[100] bg-white/95 backdrop-blur-xl shadow-sm py-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onBack}>
            <BrandLogo className="h-10 w-auto" scrollY={0} />
            <div className="flex flex-col justify-center h-10">
              <span className="text-[19px] font-bold tracking-tight leading-none text-[#0B1320] group-hover:text-[#2596be] transition-colors">UNFOLDING</span>
              <span className="text-[8.5px] tracking-[0.45em] font-bold uppercase leading-none mt-1 text-[#2596be]">CAPACITY</span>
            </div>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-[#0B1320] transition-colors bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-white">
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </nav>

      <section className="pt-48 pb-32 max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <span className="text-[#dca54c] font-bold uppercase tracking-[0.2em] text-xs mb-6 block">Lead Strategist & Founder</span>
          <h1 className="text-5xl lg:text-[5.5rem] font-serif leading-[1.05] text-[#0B1320] tracking-tight">Amazement Nemaungane</h1>
        </div>
        
        <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative">
          <img src="https://unfoldingcapacity.com/assets/founder2.jpg?q=80&w=1974" className="w-full h-full object-cover" alt="Amazement Nemaungane" />
        </div>

        <div className="prose prose-lg prose-slate max-w-none space-y-10 font-light leading-relaxed text-slate-600">
          <p className="text-3xl lg:text-4xl text-[#0B1320] font-serif leading-snug mb-16 text-center italic px-4 lg:px-12">
            "True capacity is not merely the ability to do more, but the strategic capability to do what matters with profound clarity and impact."
          </p>
          <div className="space-y-8 text-lg lg:text-xl px-2 lg:px-8">
            <p>
              Amazement Nemaungane is a distinguished leadership practitioner and strategic consultant with over 15 years of experience in driving transformative change. His work focuses on the intersection of human potential and institutional effectiveness, guiding organizations through complex transitions and growth phases.
            </p>
            <p>
              Recognizing early in his career that organizational failures rarely stem from a lack of vision—but rather from a deficit in execution capacity—Amazement founded Unfolding Capacity. His mandate is to equip leaders, from corporate executives to public sector officials, with the adaptive frameworks required to thrive in an increasingly volatile global landscape.
            </p>
            <p>
              As the host and curator of The Leadership MasterClass, Amazement convenes thought leaders from academia, health, and business to cross-pollinate ideas and forge sustainable strategies. His approach combines rigorous systemic analysis with deep, empathetic coaching, ensuring that transformation is not just theoretical, but embedded into the very culture of the institutions he partners with.
            </p>
          </div>
          
          <div className="pt-20 mt-20 border-t border-slate-100 flex flex-col items-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-8 font-bold">Connect Directly</p>
            <div className="flex gap-4">
               <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center hover:bg-[#2596be] hover:border-[#2596be] transition-all duration-300 text-slate-400 hover:text-white shadow-sm hover:shadow-md hover:-translate-y-1"><LinkedinIcon /></a>
               <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="h-14 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center px-8 gap-3 hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-300 text-slate-500 hover:text-white shadow-sm hover:shadow-md hover:-translate-y-1 group">
                 <WhatsAppIcon />
                 <span className="text-sm font-semibold tracking-wide">Join WhatsApp Community</span>
               </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- MAIN APPLICATION ENTRY ---
const App = () => {
  // Navigation & UI State
  const [currentView, setCurrentView] = useState('home'); 
  const [legalSection, setLegalSection] = useState(null);
  
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Backend & User State
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', service: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Dynamic Events Configuration State Array
  const [eventsList, setEventsList] = useState([]);
  
  // Comprehensive Booking Form State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingEventTitle, setBookingEventTitle] = useState('The Leadership MasterClass'); 
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    seats: '1',
    interest: '',
    dietRestrictions: 'No',
    dietDetails: '',
    foodPreference: 'No Preference',
    specialRequests: ''
  });

  // 1. Fetch Dynamic Event Configuration from Google Sheets
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL + "?action=getEvent"); 
        const data = await response.json();
        
        if (data && !data.error) {
          setEventsList(Array.isArray(data) ? data : [data]);
        } else {
          console.log("No active events found or Sheet not fully configured yet.");
          setEventsList([]); // Set to empty so nothing shows
        }
      } catch (error) {
        console.log("Error fetching events. Event popups disabled.");
        setEventsList([]); // Removed the dummy fallback data entirely!
      }
    };
    
    if (GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE") {
      fetchEventData();
    }
  }, []);

  // 2. Secure Backend Authentication Initialization
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 3. Automatically inject the beautiful SVG Favicon
  useEffect(() => {
    const svgFavicon = `
      <svg viewBox="0 0 240 330" xmlns="http://www.w3.org/2000/svg">
        <path d="M220 98C150 40 50 20 20 80C-10 140 40 180 40 180C40 180 0 220 20 280C40 330 130 330 180 290C210 260 220 230 220 230V98Z" fill="%232596be"/>
        <text x="65" y="150" fill="white" font-size="70" font-family="serif" font-weight="800" font-style="italic">U</text>
        <text x="80" y="250" fill="white" font-size="70" font-family="serif" font-weight="800" font-style="italic">C</text>
        <rect x="222" y="100" width="14" height="150" fill="%23cbd5e1" rx="7" />
      </svg>
    `.trim().replace(/\n/g, '').replace(/\s+/g, ' ');

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = `data:image/svg+xml;utf8,${svgFavicon}`;
  }, []);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    setIsScrolled(currentScrollY > 50);
    
    if (currentView !== 'home') return;

    const sections = ['home', 'about', 'services', 'masterclass', 'founder', 'contact'];
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom >= 200) {
          setActiveSection(section);
          break;
        }
      }
    }
  }, [currentView]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const openLegal = (sectionId) => {
    setCurrentView('legal');
    setLegalSection(sectionId);
  };

  const handleBookNowOpen = (title = 'The Leadership MasterClass') => {
    setBookingEventTitle(title);
    setIsBookingModalOpen(true);
  };

  // --- DATABASE & EXCEPTION-SAFE SUBMISSION HANDLERS ---
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE" || !GOOGLE_SCRIPT_URL.startsWith("http")) {
      alert("Configuration Notice: Please replace the Google Apps Script URL in the code to connect the form.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (user && db) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'inquiries'), {
          ...formData, type: 'contact_inquiry', createdAt: serverTimestamp()
        });
      }

      const payload = {
        formType: 'contact',
        name: formData.name,
        email: formData.email,
        service: formData.service,
        message: formData.message,
        timestamp: new Date().toLocaleString()
      };

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', 
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        });
      } catch (fetchErr) {
        console.error("Google Script Fetch Exception:", fetchErr);
      }
      
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', service: '', message: '' });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("There was an issue sending your inquiry. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.name || !bookingData.email) return;

    if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE" || !GOOGLE_SCRIPT_URL.startsWith("http")) {
      alert("Configuration Notice: Please replace the Google Apps Script URL in the code to connect the form.");
      return;
    }
    
    setIsBooking(true);
    try {
      if (user && db) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'masterclass_bookings'), {
          ...bookingData, eventTitle: bookingEventTitle, type: 'masterclass_booking', createdAt: serverTimestamp()
        });
      }

      const payload = {
        formType: 'booking',
        eventTitle: bookingEventTitle,
        ...bookingData,
        timestamp: new Date().toLocaleString()
      };

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        });
      } catch (fetchErr) {
        console.error("Google Script Fetch Exception:", fetchErr);
      }
      
      setBookingSuccess(true);
    } catch (error) {
      console.error("Error securing booking:", error);
      alert("There was an issue securing your booking. Please try again or email us directly.");
    } finally {
      setIsBooking(false);
    }
  };

  const navLinks = [
  { name: 'Home', id: 'home' },
  { name: 'Our Story', id: 'about' },
  { name: 'Services', id: 'services' },
  { name: 'Our Clients & Partners', id: 'partners' },
  { name: 'Testimonials', id: 'testimonials', page: true },
  { name: 'Founder', id: 'founder' },
  { name: 'Contact', id: 'contact' },
];

  if (currentView === 'testimonials') {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Outfit', sans-serif; }
      `}</style>
      <Testimonials onBack={() => setCurrentView('home')} />
    </>
  );
}

  if (currentView === 'founder') {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap'); .font-serif { font-family: 'Playfair Display', serif; } .font-sans { font-family: 'Outfit', sans-serif; }`}</style>
        <FounderPage onBack={() => setCurrentView('home')} />
      </>
    );
  }

  if (currentView === 'legal') {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap'); .font-serif { font-family: 'Playfair Display', serif; } .font-sans { font-family: 'Outfit', sans-serif; }`}</style>
        <LegalPage section={legalSection} onBack={() => setCurrentView('home')} />
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Outfit', sans-serif; }
        
        /* Custom scrollbar for modal */
        .modal-scroll::-webkit-scrollbar { width: 6px; }
        .modal-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px;}
        .modal-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px;}
        .modal-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#dca54c]/30 selection:text-slate-900 overflow-x-hidden relative">
        
        {/* Dynamic Event Popup Sequence Manager */}
        <EventPopupManager events={eventsList} onBookNow={handleBookNowOpen} />

        {/* YouTube Video Modal */}
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0B1320]/95 backdrop-blur-md p-4 lg:p-10 animate-in fade-in duration-300">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-6 right-6 lg:top-10 lg:right-10 text-white/70 hover:text-white transition-colors z-10">
              <X size={36} strokeWidth={1.5} />
            </button>
            <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/10">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/lxoaRSjPwLw?autoplay=1" 
                title="Leadership MasterClass" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Advanced Comprehensive Booking Modal */}
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0B1320]/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 lg:p-10 max-w-xl w-full relative max-h-[90vh] overflow-y-auto modal-scroll animate-in slide-in-from-bottom-8">
              <button onClick={() => setIsBookingModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 p-2 rounded-full">
                <X size={20}/>
              </button>
              
              {!bookingSuccess ? (
                <>
                  <div className="mb-6 pr-8">
                    <span className="text-[#2596be] font-bold uppercase tracking-[0.2em] text-[10px] mb-2 block">Secure Registration</span>
                    <h3 className="text-3xl font-serif text-[#0B1320] leading-tight">{bookingEventTitle}</h3>
                    <p className="text-xs text-slate-500 mt-2 font-light">Please complete all fields to secure your seat for the upcoming executive session.</p>
                  </div>
                  
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    {/* Guest Information */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Guest Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Title, Full Name & Surname *</label>
                          <input type="text" required value={bookingData.name} onChange={e => setBookingData({...bookingData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white transition-colors" placeholder="e.g. Dr. Jane Doe" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email Address *</label>
                            <input type="email" required value={bookingData.email} onChange={e => setBookingData({...bookingData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white transition-colors" />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Phone Number *</label>
                            <input type="tel" required value={bookingData.phone} onChange={e => setBookingData({...bookingData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white transition-colors" placeholder="+27..." />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seats & Leadership Interest */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Program Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Seats *</label>
                          <div className="relative">
                            <select required value={bookingData.seats} onChange={e => setBookingData({...bookingData, seats: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white appearance-none text-slate-700">
                              <option value="1">1 Seat</option>
                              <option value="2">2 Seats</option>
                              <option value="3">3 Seats</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Leadership Interest *</label>
                          <div className="relative">
                            <select required value={bookingData.interest} onChange={e => setBookingData({...bookingData, interest: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white appearance-none text-slate-700">
                              <option value="" disabled>Select primary topic...</option>
                              <option value="Strategic Vision and Planning">Strategic Vision and Planning</option>
                              <option value="Change Management and Innovation">Change Management and Innovation</option>
                              <option value="Team Dynamics and High-Performance Cultures">Team Dynamics & High-Performance</option>
                              <option value="Emotional Intelligence and Conflict Resolution">Emotional Intelligence & Conflict</option>
                              <option value="Digital Transformation and Technology Leadership">Digital Transformation</option>
                              <option value="Financial Acumen for Executives">Financial Acumen for Executives</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meal Preferences */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Meal Preferences</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Dietary Restrictions? *</label>
                            <div className="flex gap-4 mt-2">
                              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="radio" name="dietRestrictions" value="Yes" checked={bookingData.dietRestrictions === 'Yes'} onChange={e => setBookingData({...bookingData, dietRestrictions: e.target.value})} className="accent-[#2596be]" /> Yes
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="radio" name="dietRestrictions" value="No" checked={bookingData.dietRestrictions === 'No'} onChange={e => setBookingData({...bookingData, dietRestrictions: e.target.value, dietDetails: ''})} className="accent-[#2596be]" /> No
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Food Preference *</label>
                            <div className="relative">
                              <select required value={bookingData.foodPreference} onChange={e => setBookingData({...bookingData, foodPreference: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white appearance-none text-slate-700">
                                <option value="No Preference">No Preference</option>
                                <option value="Vegetarian">Vegetarian</option>
                                <option value="Vegan">Vegan</option>
                                <option value="Gluten-Free">Gluten-Free</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                          </div>
                        </div>

                        {bookingData.dietRestrictions === 'Yes' && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Please specify allergies/restrictions *</label>
                            <input type="text" required value={bookingData.dietDetails} onChange={e => setBookingData({...bookingData, dietDetails: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white transition-colors" placeholder="e.g. Nut allergy, Dairy free..." />
                          </div>
                        )}
                        
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Any special requests? (Optional)</label>
                          <textarea value={bookingData.specialRequests} onChange={e => setBookingData({...bookingData, specialRequests: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white transition-colors resize-none" rows="2" placeholder="Accessibility needs, etc." />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button type="submit" disabled={isBooking} className="w-full py-4 bg-[#0B1320] text-white font-bold uppercase tracking-[0.1em] text-xs rounded-xl flex items-center justify-center hover:bg-[#dca54c] transition-colors shadow-lg disabled:opacity-70 group">
                        {isBooking ? <Loader2 className="animate-spin" size={18} /> : (
                          <>Confirm RSVP <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} /></>
                        )}
                      </button>
                      <p className="text-center text-[10px] text-slate-400 mt-3 font-light">By submitting this RSVP, you agree to our terms and privacy policy.</p>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center flex flex-col items-center animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-[#dca54c]/10 text-[#dca54c] rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CalendarCheck size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-serif text-[#0B1320] mb-3">RSVP Confirmed</h3>
                  <p className="text-sm text-slate-500 font-light mb-10 leading-relaxed max-w-sm">Thank you, {bookingData.name.split(' ')[0] || 'Guest'}. Your seat for the session has been successfully reserved. Our team will email you the agenda and onboarding details shortly.</p>
                  <button 
                    onClick={() => { 
                      setIsBookingModalOpen(false); 
                      setBookingSuccess(false); 
                      // Reset form
                      setBookingData({ name: '', email: '', phone: '', seats: '1', interest: '', dietRestrictions: 'No', dietDetails: '', foodPreference: 'No Preference', specialRequests: ''}); 
                    }} 
                    className="w-full py-4 bg-slate-50 border border-slate-200 text-[#0B1320] font-bold uppercase tracking-[0.1em] text-xs rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm py-4 border-b border-slate-100' : 'bg-transparent py-8'}`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo('home')}>
              <BrandLogo className="h-10 w-auto" scrollY={scrollY} />
              <div className="flex flex-col justify-center h-10">
                <span className={`text-[19px] font-bold tracking-tight leading-none transition-colors duration-300 ${isScrolled ? 'text-[#0B1320]' : 'text-white'}`}>UNFOLDING</span>
                <span className={`text-[8.5px] tracking-[0.45em] font-bold uppercase leading-none mt-1 transition-colors duration-300 ${isScrolled ? 'text-[#2596be]' : 'text-white/70'}`}>CAPACITY</span>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-10">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => link.page
  ? (setCurrentView('testimonials'), window.scrollTo({ top: 0, behavior: 'smooth' }))
  : scrollTo(link.id)
}
                  className={`text-[13px] font-medium tracking-wide transition-all duration-300 relative py-2 ${
                    activeSection === link.id 
                      ? (isScrolled ? 'text-[#2596be]' : 'text-[#dca54c]') 
                      : (isScrolled ? 'text-slate-600 hover:text-[#0B1320]' : 'text-white/80 hover:text-white')
                  }`}
                >
                  {link.name}
                  {activeSection === link.id && (
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isScrolled ? 'bg-[#2596be]' : 'bg-[#dca54c]'}`} />
                  )}
                </button>
              ))}
              <button 
                onClick={() => scrollTo('contact')} 
                className={`px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                  isScrolled 
                    ? 'bg-[#0B1320] text-white hover:bg-[#2596be]' 
                    : 'bg-white text-[#0B1320] hover:bg-[#dca54c] hover:text-white'
                }`}
              >
                Partner With Us
              </button>
            </div>
            
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28} className={isScrolled ? 'text-slate-900' : 'text-white'} /> : <Menu size={28} className={isScrolled ? 'text-slate-900' : 'text-white'} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-white/95 backdrop-blur-2xl z-[150] flex flex-col p-8 lg:hidden animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-16">
                <BrandLogo className="h-10 w-auto" scrollY={0} />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors"><X size={24} /></button>
              </div>
              <div className="flex flex-col space-y-8 px-4">
                {[...navLinks].map((link) => (
                 <button
  key={link.id}
  onClick={() => {
    setMobileMenuOpen(false);
    if (link.page) {
      setCurrentView('testimonials');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollTo(link.id);
    }
  }}
  className="text-3xl font-serif text-left border-b border-slate-100 pb-4 text-slate-800 hover:text-[#2596be] transition-colors"
>
                    {link.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section id="home" className="relative w-full min-h-[85vh] flex flex-col justify-center overflow-hidden pt-28 lg:pt-32 pb-16" style={{ backgroundColor: BG_NAVY }}>
          <div className="absolute inset-0 z-0 flex">
            <div className="w-full lg:w-[65%] bg-gradient-to-r from-[#0B1320] via-[#0B1320]/95 to-transparent z-10" />
            <div className="absolute top-0 right-0 w-full lg:w-3/4 h-full bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070')] bg-cover bg-center opacity-30 mix-blend-screen" />
          </div>
          
          <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 w-full mt-10 lg:mt-0">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full mb-10 text-white/90 text-[10px] uppercase font-bold tracking-[0.25em] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#dca54c] animate-pulse" />
                Strategic Leadership Partner
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] mb-8 tracking-tight">
                Unlocking Human <br/> Potential.<br/>
                <span className="text-[#dca54c] italic font-medium">Transforming Leadership.</span>
              </h1>
              
              <p className="text-lg text-slate-300 mb-12 leading-relaxed font-light max-w-lg">
                Unfolding Capacity partners with leaders and institutions to develop the vital capabilities required to thrive in complexity, lead with purpose, and deliver sustainable impact.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <button onClick={() => scrollTo('services')} className="px-8 py-4 bg-[#dca54c] text-[#0B1320] rounded-full font-bold tracking-wide flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group text-sm">
                  Explore Our Services <ArrowRight className="ml-3 group-hover:translate-x-1.5 transition-transform" size={18} />
                </button>
                <button onClick={() => scrollTo('contact')} className="px-8 py-4 bg-transparent text-white border border-white/30 rounded-full font-semibold tracking-wide transition-all duration-300 hover:bg-white hover:text-[#0B1320] text-sm">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer z-20 text-white/50 hover:text-white transition-colors p-2" onClick={() => scrollTo('about')}>
            <ChevronDown size={32} strokeWidth={1.5} />
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-xl group aspect-[4/5]">
               <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084" className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" alt="Collaboration" />
               <div className="absolute inset-0 bg-[#2596be]/10 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0" />
            </div>
            <div className="pl-0 lg:pl-6">
              <span className="text-[#2596be] font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Our Philosophy</span>
              <h2 className="text-4xl lg:text-5xl font-serif text-[#0B1320] mb-8 leading-[1.15] tracking-tight">Unfolding capacity is the <span className="text-[#dca54c] italic">bridge</span> between potential & performance.</h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed font-light">Unfolding Capacity was established out of a deep recognition that many organisations do not fail due to a lack of vision, but due to limited leadership and organizational capability to execute that vision.</p>
              
              <div className="space-y-6 mb-12">
                {["Grounding work in intentional development.", "Activating latent systems & structures.", "Transforming institutional mindset."].map((point, i) => (
                  <div key={i} className="flex items-start gap-4 text-[#0B1320] font-medium">
                    <div className="mt-1"><CheckCircle2 size={20} className="text-[#2596be]" strokeWidth={2} /></div>
                    <span className="text-lg">{point}</span>
                  </div>
                ))}
              </div>
              
              <button onClick={() => setCurrentView('founder')} className="text-[#0B1320] font-bold flex items-center gap-3 hover:gap-5 transition-all text-sm uppercase tracking-[0.1em] border-b-2 border-transparent hover:border-[#0B1320] pb-1 inline-flex group">
                Meet our Lead Practitioner <ArrowRight size={18} className="text-[#dca54c] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mb-12 text-left">
              <span className="text-[#2596be] font-bold uppercase tracking-[0.2em] text-xs mb-4 block">What We Do</span>
              <h3 className="text-4xl lg:text-5xl font-serif mb-6 tracking-tight text-[#0B1320]">Our Core Capacity Pillars</h3>
              <p className="text-slate-500 text-lg font-light leading-relaxed max-w-2xl">Tailored, high-impact solutions designed to strengthen the core of your leadership and institutional framework.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Leadership Development", icon: <Users size={24} strokeWidth={1.5} />, desc: "Equipping adaptive and values-based leaders for the future.", list: ["Executive Programmes", "Values-Based Training"] },
                { title: "Organisational Consulting", icon: <Target size={24} strokeWidth={1.5} />, desc: "Aligning deep strategy with agile execution capability.", list: ["Strategy Alignment", "Change Management"] },
                { title: "Coaching & Mentorship", icon: <Shield size={24} strokeWidth={1.5} />, desc: "Providing strategic guidance through modern complexity.", list: ["Executive Coaching", "Growth Acceleration"] },
                { title: "Thought Leadership", icon: <Globe size={24} strokeWidth={1.5} />, desc: "Curating high-level dialogues that shape the future.", list: ["Sector Dialogues", "Global MasterClasses"] }
              ].map((pillar, i) => (
                <div key={i} className="bg-white p-8 rounded-[1.5rem] border border-slate-100 hover:shadow-[0_10px_40px_-10px_rgba(37,150,190,0.1)] transition-all duration-300 group hover:-translate-y-1">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#0B1320] mb-8 group-hover:bg-[#2596be] group-hover:text-white transition-colors duration-300 border border-slate-100">{pillar.icon}</div>
                  <h4 className="text-lg font-bold mb-3 font-serif text-[#0B1320]">{pillar.title}</h4>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed font-light">{pillar.desc}</p>
                  <ul className="text-sm text-slate-600 space-y-3 pt-6 border-t border-slate-50">
                    {pillar.list.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#dca54c]" /> 
                        <span className="font-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

 
{/* Our Clients & Partners Section */}
<section
  id="partners"
  className="py-24 lg:py-28 bg-white border-y border-slate-100 overflow-hidden"
>
  <div className="max-w-7xl mx-auto px-6 lg:px-12">

    {/* Section Introduction */}
    <div className="max-w-3xl mx-auto text-center mb-16">

      <span className="inline-flex items-center gap-2 text-[#2596be] font-bold uppercase tracking-[0.22em] text-xs mb-5">
        <span className="w-7 h-[2px] bg-[#dca54c]" />
        Working Together
        <span className="w-7 h-[2px] bg-[#dca54c]" />
      </span>

      <h3 className="text-4xl lg:text-5xl font-serif mb-6 tracking-tight text-[#0B1320]">
        Our Clients <span className="text-[#2596be]">&</span> Partners
      </h3>

      <p className="text-slate-500 text-base lg:text-lg font-light leading-relaxed max-w-2xl mx-auto">
        Building meaningful relationships with organisations that share
        our commitment to leadership, learning, transformation and
        sustainable development.
      </p>

      <div className="w-20 h-1 rounded-full bg-[#dca54c] mx-auto mt-8" />
    </div>

  </div>

  {/* Partner Logo Carousel */}
  <div className="logo-marquee">
    <div className="logo-track">

      {/* First set of logos */}
      <div className="logo-group">
        {[
          { src: "/partners/bb-group-logo.png", alt: "BB Motor Group" },
          { src: "/partners/richfield-logo.png", alt: "Richfield" },
          { src: "/partners/curro-logo.jpg", alt: "Curro" },
          { src: "/partners/absa-logo.jpg", alt: "Absa" },
          { src: "/partners/do-light-logo.png", alt: "Do Light Transport" },
          { src: "/partners/old-mutual-logo.png", alt: "Old Mutual" },
          { src: "/partners/harman-nethononda-attorneys.jpg", alt: "Harman Nethononda Attorneys" },
          { src: "/partners/department-basic-education-logo.jpg", alt: "Department of Basic Education" },
          { src: "/partners/apostolic-faith-mission-logo.png", alt: "Apostolic Faith Mission of South Africa" }
        ].map((logo) => (
          <div className="logo-card" key={logo.src}>
            <img
              src={logo.src}
              alt={logo.alt}
              loading="eager"
            />
          </div>
        ))}
      </div>

      {/* Duplicate set for seamless animation */}
      <div className="logo-group" aria-hidden="true">
        {[
          { src: "/partners/bb-group-logo.png", alt: "BB Motor Group" },
          { src: "/partners/richfield-logo.png", alt: "Richfield" },
          { src: "/partners/curro-logo.jpg", alt: "Curro" },
          { src: "/partners/absa-logo.jpg", alt: "Absa" },
          { src: "/partners/do-light-logo.png", alt: "Do Light Transport" },
          { src: "/partners/old-mutual-logo.png", alt: "Old Mutual" },
          { src: "/partners/harman-nethononda-attorneys.jpg", alt: "Harman Nethononda Attorneys" },
          { src: "/partners/department-basic-education-logo.jpg", alt: "Department of Basic Education" },
          { src: "/partners/apostolic-faith-mission-logo.png", alt: "Apostolic Faith Mission of South Africa" }
        ].map((logo) => (
          <div className="logo-card" key={logo.src}>
            <img
              src={logo.src}
              alt=""
              loading="eager"
            />
          </div>
        ))}
      </div>

    </div>
  </div>

  {/* Closing Statement */}
  <div className="max-w-3xl mx-auto px-6 text-center mt-14">
    <p className="text-sm text-slate-400 font-medium tracking-wide">
      Stronger together. Creating lasting impact through collaboration.
    </p>
  </div>

</section>





        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-[#2596be] font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Voices & Experiences</span>
              <h3 className="text-4xl lg:text-5xl font-serif mb-5 tracking-tight text-[#0B1320]">Testimonials</h3>
              <p className="text-slate-500 text-lg font-light leading-relaxed">Reflections from people who have experienced our leadership development work.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[#dca54c] text-3xl font-serif mb-4">“</div>
                <p className="text-slate-600 leading-relaxed font-light mb-6">The Leadership MasterClass was a valuable and engaging learning experience.</p>
                <h4 className="font-bold text-[#0B1320]">Dr Eddie Nedzingahe</h4>
                <p className="text-xs text-slate-500 mt-1">Leader at the Department of Basic Education (DBE)</p>
              </article>
              <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[#dca54c] text-3xl font-serif mb-4">“</div>
                <p className="text-slate-600 leading-relaxed font-light mb-6">I would like to commend you for an outstanding presentation. It was well-researched, clearly articulated, and highly engaging.</p>
                <h4 className="font-bold text-[#0B1320]">Leadership MasterClass Attendee</h4>
              </article>
              <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-[#dca54c] text-3xl font-serif mb-4">“</div>
                <p className="text-slate-600 leading-relaxed font-light mb-6">Following leadership and learner empowerment sessions, our Grade 12 pass rate improved from 56% to 92%.</p>
                <h4 className="font-bold text-[#0B1320]">School Principal</h4>
                <p className="text-xs text-slate-500 mt-1">Soutpansberg West Circuit</p>
              </article>
            </div>
            
<div className="text-center mt-12">
  <button
    onClick={() => {
      setCurrentView('testimonials');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }}
    className="inline-flex items-center gap-3 bg-[#0B1320] hover:bg-[#2596be] text-white px-8 py-4 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg hover:-translate-y-1"
  >
    Read More Testimonials
    <ArrowRight size={18} />
  </button>
</div>

          </div>
        </section>

        {/* Founder Section */}
        <section id="founder" className="py-20 text-white overflow-hidden relative" style={{ backgroundColor: BG_NAVY }}>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2596be]/5 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#dca54c]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src="https://unfoldingcapacity.com/assets/founder1.jpg?q=80&w=1974" className="w-full object-cover aspect-[4/5] grayscale hover:grayscale-0 transition-all duration-700 ease-out" alt="Amazement Nemaungane" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white text-[#0B1320] p-8 rounded-3xl shadow-xl border border-slate-100">
                <p className="text-5xl font-serif font-bold text-[#2596be]">15+</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-2">Years of Impact</p>
              </div>
            </div>
            
            <div className="lg:col-span-7 lg:pl-12 mt-10 lg:mt-0">
              <span className="text-[#dca54c] font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Lead Strategist & Founder</span>
              <h3 className="text-4xl lg:text-5xl font-serif mb-8 leading-[1.1] text-white tracking-tight">Amazement Nemaungane</h3>
              <p className="text-lg lg:text-xl text-slate-300 mb-10 font-light leading-relaxed max-w-2xl">
                A renowned leadership practitioner intrinsically committed to building the capacity required for meaningful, lasting transformation across complex systems and entire nations.
              </p>
              
              <button onClick={() => setCurrentView('founder')} className="flex items-center gap-3 text-[#0B1320] font-bold uppercase tracking-[0.1em] text-xs transition-all duration-300 group mb-14 bg-[#dca54c] hover:bg-white px-6 py-3.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Discover the Journey <ArrowUpRight size={16} className="transition-transform" />
              </button>
              
              <div className="w-full h-px bg-white/10 mb-10" />
              
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-5 font-bold">Connect & Join The Community</p>
              <div className="flex flex-wrap gap-4">
                 <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#2596be] transition-all duration-300 text-slate-300 hover:text-white hover:-translate-y-0.5"><LinkedinIcon /></a>
                 <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#2596be] transition-all duration-300 text-slate-300 hover:text-white hover:-translate-y-0.5"><InstagramIcon /></a>
                 <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#2596be] transition-all duration-300 text-slate-300 hover:text-white hover:-translate-y-0.5"><YoutubeIcon /></a>
                 
                 <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="h-12 bg-[#25D366]/10 border border-[#25D366]/30 rounded-full flex items-center justify-center px-6 gap-2 hover:bg-[#25D366] transition-all duration-300 text-[#25D366] hover:text-[#0B1320] hover:-translate-y-0.5 group">
                   <WhatsAppIcon />
                   <span className="text-xs font-bold tracking-wide">Join WhatsApp Group</span>
                 </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section Wired to Backend */}
        <section id="contact" className="py-20 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <span className="text-[#2596be] font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Get In Touch</span>
              <h2 className="text-4xl lg:text-5xl font-serif mb-8 leading-[1.1] text-[#0B1320] tracking-tight">Let's shape the <br/><span className="text-[#dca54c] italic">future</span> together.</h2>
              <p className="text-lg text-slate-500 mb-12 leading-relaxed font-light max-w-md">Whether seeking executive training, strategic consulting, or partnership opportunities, we are ready to help unlock your organization's potential.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-[#0B1320] group-hover:bg-[#0B1320] group-hover:text-white transition-all duration-300"><Mail size={20} strokeWidth={1.5} /></div>
                  <div>
                    <h4 className="font-bold text-[#0B1320] mb-0.5">Email Us</h4>
                    <p className="text-slate-500 font-light text-sm">info@unfoldingcapacity.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-[#0B1320] group-hover:bg-[#0B1320] group-hover:text-white transition-all duration-300"><Phone size={20} strokeWidth={1.5} /></div>
                  <div>
                    <h4 className="font-bold text-[#0B1320] mb-0.5">Call Us</h4>
                    <p className="text-slate-500 font-light text-sm">+27 81 035 0664</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-[#0B1320] group-hover:bg-[#0B1320] group-hover:text-white transition-all duration-300"><MapPin size={20} strokeWidth={1.5} /></div>
                  <div>
                    <h4 className="font-bold text-[#0B1320] mb-0.5">Location</h4>
                    <p className="text-slate-500 font-light text-sm">Pretoria, Gauteng, South Africa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Backend Form Card */}
            <div className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-lg border border-slate-100 h-fit relative overflow-hidden">
              {submitSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-[#2596be]/10 text-[#2596be] rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-serif text-[#0B1320] mb-4">Message Sent Successfully</h3>
                  <p className="text-slate-500 font-light mb-8 leading-relaxed">
                    Thank you for reaching out. Your inquiry has been securely delivered to our team. We will review your message and connect with you shortly.
                  </p>
                  <div className="w-full pt-8 border-t border-slate-100">
                    <p className="text-sm text-slate-400 mb-4 font-light">Would you like to send another inquiry?</p>
                    <button 
                      onClick={() => setSubmitSuccess(false)} 
                      className="w-full sm:w-auto px-8 py-4 bg-slate-50 text-[#0B1320] font-bold uppercase tracking-[0.1em] text-xs rounded-xl flex items-center justify-center hover:bg-slate-100 border border-slate-200 transition-colors shadow-sm mx-auto"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-6 animate-in fade-in" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Full Name</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white focus:ring-1 focus:ring-[#2596be] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Email Address</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white focus:ring-1 focus:ring-[#2596be] transition-all" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Service of Interest</label>
                    <div className="relative">
                      <select required value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white focus:ring-1 focus:ring-[#2596be] transition-all appearance-none text-slate-700">
                        <option value="" disabled>Select a service...</option>
                        <option value="leadership">Leadership Development</option>
                        <option value="consulting">Organisational Consulting</option>
                        <option value="coaching">Coaching & Mentorship</option>
                        <option value="masterclass">The Leadership MasterClass</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Your Message</label>
                    <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="How can we help your organization?" rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2596be] focus:bg-white focus:ring-1 focus:ring-[#2596be] transition-all resize-none" />
                  </div>

                  <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-[#0B1320] text-white font-bold uppercase tracking-[0.1em] text-xs rounded-xl flex items-center justify-center hover:bg-[#2596be] transition-colors duration-300 shadow-md mt-4 disabled:opacity-70 group">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                      <>Send Inquiry <Send className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={16} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Corporate, Rich Footer */}
        <footer className="text-white pt-24 pb-10" style={{ backgroundColor: BG_NAVY }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
              <div className="lg:col-span-2 pr-0 lg:pr-10">
                <div className="flex items-center gap-4 mb-8">
                  <BrandLogo className="h-8 w-auto" scrollY={0} />
                  <div className="flex flex-col justify-center">
                    <span className="text-lg font-bold tracking-tight leading-none text-white">UNFOLDING</span>
                    <span className="text-[7.5px] tracking-[0.4em] font-bold uppercase leading-none text-[#dca54c] mt-1">CAPACITY</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm font-light">
                  We do not just develop leaders. We cultivate the profound capacity required to transform systems, institutions, and nations.
                </p>
                <div className="flex gap-4">
                  <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#2596be] transition-colors duration-300 text-slate-400 hover:text-white"><LinkedinIcon /></a>
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#2596be] transition-colors duration-300 text-slate-400 hover:text-white"><InstagramIcon /></a>
                  <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#2596be] transition-colors duration-300 text-slate-400 hover:text-white"><YoutubeIcon /></a>
                  <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#25D366]/30 flex items-center justify-center hover:bg-[#25D366] transition-colors duration-300 text-[#25D366] hover:text-[#0B1320]"><WhatsAppIcon /></a>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Navigation</h4>
                <ul className="space-y-3">
                  {navLinks.map((link) => (
                    <li key={`footer-${link.id}`}>
                      <button onClick={() => scrollTo(link.id)} className="text-slate-400 hover:text-[#dca54c] transition-colors text-sm font-light">
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Contact Information</h4>
                <ul className="space-y-3 text-slate-400 text-sm font-light">
                  <li className="flex items-start gap-3"><MapPin size={16} className="text-[#2596be] shrink-0 mt-0.5" /> Pretoria, Gauteng, RSA</li>
                  <li className="flex items-center gap-3"><Phone size={16} className="text-[#2596be] shrink-0" /> +27 81 035 0664</li>
                  <li className="flex items-center gap-3"><Mail size={16} className="text-[#2596be] shrink-0" /> <a href="mailto:info@unfoldingcapacity.com" className="hover:text-white transition-colors">info@unfoldingcapacity.com</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] text-slate-500 font-light tracking-[0.1em] uppercase">© {new Date().getFullYear()} UNFOLDING CAPACITY. ALL RIGHTS RESERVED.</p>
              <div className="flex gap-6 text-[10px] text-slate-500 font-light tracking-[0.1em] uppercase">
                <button onClick={() => openLegal('privacy')} className="hover:text-[#dca54c] transition-colors">Privacy Policy</button>
                <button onClick={() => openLegal('terms')} className="hover:text-[#dca54c] transition-colors">Terms of Service</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default App;